/**
 * @module IntegrationGatekeeper
 * @description Enforces the P2 Minimal Real Integration Gate lifecycle with adversarial hardening.
 * Manages states from DESIGNED to REVOKED_OR_CLOSED, validates HITL receipts,
 * recursively scans nested/encoded payloads for secret leakage, enforces SSRF & redirect boundaries,
 * tracks request nonces against replay attacks, monitors call/cost budgets,
 * and trips the FDIR safe mode kill switch on any anomaly.
 */

import crypto from 'node:crypto';
import { EpistemicEvidenceEngine, calculateSha256 } from '../sdd/epistemic-evidence-engine.js';

export const INTEGRATION_STATES = {
  DESIGNED: 'DESIGNED',
  CONTRACT_REVIEW: 'CONTRACT_REVIEW',
  PROVIDER_APPROVED: 'PROVIDER_APPROVED',
  CREDENTIALS_STAGED: 'CREDENTIALS_STAGED',
  SANDBOX_READY: 'SANDBOX_READY',
  HITL_EXECUTION_APPROVED: 'HITL_EXECUTION_APPROVED',
  CANARY_RUNNING: 'CANARY_RUNNING',
  CANARY_VERIFIED: 'CANARY_VERIFIED',
  REVOKED_OR_CLOSED: 'REVOKED_OR_CLOSED'
};

export const SENSITIVE_FORBIDDEN_PATTERNS = [
  /password/i,
  /secret/i,
  /bearer\s+[a-zA-Z0-9_\-\.]+/i,
  /private_key/i,
  /credit_card/i,
  /cvv/i,
  /ssn/i
];

export const FORBIDDEN_SSRF_HOSTS = [
  '127.0.0.1',
  'localhost',
  '::1',
  '0.0.0.0',
  '169.254.169.254', // AWS/GCP/Azure Cloud Metadata Service
  'metadata.google.internal'
];

export class IntegrationGatekeeper {
  constructor(options = {}) {
    this.activeIntegrations = new Map();
    this.fdirSafeModeTripped = false;
    this.trippedReason = null;
    this.consumedNonces = new Set();
    this.callCounters = new Map(); // integrationId -> { calls, costUsd }
  }

  /**
   * Evaluates a state transition for an Integration Contract
   * @param {Object} contract Current integration contract
   * @param {string} targetState Desired target state
   * @param {Object} context Receipts, execution payload, etc.
   * @returns {Object} Updated contract state and validation envelope
   */
  evaluateStateTransition(contract, targetState, context = {}) {
    if (this.fdirSafeModeTripped) {
      throw new Error(`INTEGRATION_BLOCKED [FDIR_SAFE_MODE]: All real integrations are frozen due to tripped kill switch (${this.trippedReason})`);
    }

    if (!contract || !contract.integration_id) {
      throw new Error('Invalid integration contract provided');
    }

    const currentState = contract.state;

    // Transition: DESIGNED -> CONTRACT_REVIEW
    if (currentState === INTEGRATION_STATES.DESIGNED && targetState === INTEGRATION_STATES.CONTRACT_REVIEW) {
      this._validateContractStructure(contract);
      return { ...contract, state: INTEGRATION_STATES.CONTRACT_REVIEW };
    }

    // Transition: CONTRACT_REVIEW -> PROVIDER_APPROVED (Requires Human Receipt)
    if (currentState === INTEGRATION_STATES.CONTRACT_REVIEW && targetState === INTEGRATION_STATES.PROVIDER_APPROVED) {
      this._validateHitlReceipt(context.hitlReceipt, 'PROVIDER_APPROVED', contract);
      return { ...contract, state: INTEGRATION_STATES.PROVIDER_APPROVED, provider_hitl_receipt_id: context.hitlReceipt.receipt_id };
    }

    // Transition: PROVIDER_APPROVED -> CREDENTIALS_STAGED (Requires Scoped Credential Receipt)
    if (currentState === INTEGRATION_STATES.PROVIDER_APPROVED && targetState === INTEGRATION_STATES.CREDENTIALS_STAGED) {
      this._validateHitlReceipt(context.hitlReceipt, 'CREDENTIALS_STAGED', contract);
      this._validateCredentialScope(contract.credential_scope);
      return { ...contract, state: INTEGRATION_STATES.CREDENTIALS_STAGED, credentials_staged_at: new Date().toISOString() };
    }

    // Transition: CREDENTIALS_STAGED -> SANDBOX_READY
    if (currentState === INTEGRATION_STATES.CREDENTIALS_STAGED && targetState === INTEGRATION_STATES.SANDBOX_READY) {
      if (contract.environment === 'PRODUCTION') {
        throw new Error('INTEGRATION_BLOCKED: Production environments are strictly prohibited in P2.');
      }
      return { ...contract, state: INTEGRATION_STATES.SANDBOX_READY };
    }

    // Transition: SANDBOX_READY -> HITL_EXECUTION_APPROVED (Requires Final Human Launch Receipt)
    if (currentState === INTEGRATION_STATES.SANDBOX_READY && targetState === INTEGRATION_STATES.HITL_EXECUTION_APPROVED) {
      this._validateHitlReceipt(context.hitlReceipt, 'HITL_EXECUTION_APPROVED', contract);
      return { ...contract, state: INTEGRATION_STATES.HITL_EXECUTION_APPROVED };
    }

    // Transition: HITL_EXECUTION_APPROVED -> CANARY_RUNNING
    if (currentState === INTEGRATION_STATES.HITL_EXECUTION_APPROVED && targetState === INTEGRATION_STATES.CANARY_RUNNING) {
      return { ...contract, state: INTEGRATION_STATES.CANARY_RUNNING, canary_started_at: new Date().toISOString() };
    }

    // Transition: CANARY_RUNNING -> CANARY_VERIFIED
    if (currentState === INTEGRATION_STATES.CANARY_RUNNING && targetState === INTEGRATION_STATES.CANARY_VERIFIED) {
      if (!context.canaryExecutionResult || context.canaryExecutionResult.success !== true) {
        throw new Error('CANARY_FAILED: Execution result was unsuccessful or missing evidence.');
      }
      return { ...contract, state: INTEGRATION_STATES.CANARY_VERIFIED, canary_verified_at: new Date().toISOString() };
    }

    // Transition to REVOKED_OR_CLOSED (Can happen from any state)
    if (targetState === INTEGRATION_STATES.REVOKED_OR_CLOSED) {
      return {
        ...contract,
        state: INTEGRATION_STATES.REVOKED_OR_CLOSED,
        closed_at: new Date().toISOString(),
        closure_reason: context.reason || 'Normal completed lifecycle closure'
      };
    }

    throw new Error(`INVALID_INTEGRATION_TRANSITION: Cannot transition from ${currentState} to ${targetState}`);
  }

  /**
   * Recursively scans objects, strings, base64 data, and URL encoded strings for prohibited tokens/secrets
   * @param {*} data Payload chunk
   * @param {Array<string>} forbiddenTokens Custom forbidden tokens
   */
  deepScanForSecretLeakage(data, forbiddenTokens = []) {
    if (data === null || data === undefined) return;

    if (typeof data === 'string') {
      // 1. Direct Regex check
      for (const pattern of SENSITIVE_FORBIDDEN_PATTERNS) {
        if (pattern.test(data)) {
          throw new Error(`DATA_LEAKAGE_DETECTED: Sensitive pattern '${pattern.source}' found in string payload.`);
        }
      }

      // 2. Custom forbidden tokens
      for (const token of forbiddenTokens) {
        if (data.includes(token)) {
          throw new Error(`FORBIDDEN_DATA_VIOLATION: Forbidden token '${token}' detected in payload.`);
        }
      }

      // 3. Check for base64 encoded strings
      if (/^[A-Za-z0-9+/=]{16,}$/.test(data.trim())) {
        try {
          const decoded = Buffer.from(data, 'base64').toString('utf8');
          if (/[\x20-\x7E]{4,}/.test(decoded)) {
            this.deepScanForSecretLeakage(decoded, forbiddenTokens);
          }
        } catch {
          // not valid base64, proceed
        }
      }

      // 4. Check for URL-encoded strings
      if (data.includes('%')) {
        try {
          const urlDecoded = decodeURIComponent(data);
          if (urlDecoded !== data) {
            this.deepScanForSecretLeakage(urlDecoded, forbiddenTokens);
          }
        } catch {
          // not URL encoded, proceed
        }
      }
    } else if (Array.isArray(data)) {
      for (const item of data) {
        this.deepScanForSecretLeakage(item, forbiddenTokens);
      }
    } else if (typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        this.deepScanForSecretLeakage(key, forbiddenTokens);
        this.deepScanForSecretLeakage(value, forbiddenTokens);
      }
    }
  }

  /**
   * Validates outgoing request payload with SSRF protection, anti-replay, and deep secret scanning
   * @param {Object} contract Integration contract
   * @param {Object} requestPayload Outgoing payload data
   * @param {string} destinationUrl Destination URL
   * @param {Object} options Metadata like nonce and timestamp
   */
  validateOutgoingCall(contract, requestPayload = {}, destinationUrl = '', options = {}) {
    if (this.fdirSafeModeTripped) {
      throw new Error(`CALL_BLOCKED [FDIR_SAFE_MODE]: ${this.trippedReason}`);
    }

    // 1. SSRF & Destination Allowlist Validation
    try {
      const parsedUrl = new URL(destinationUrl);
      
      // Block SSRF loopback & cloud metadata hosts
      if (FORBIDDEN_SSRF_HOSTS.includes(parsedUrl.hostname.toLowerCase())) {
        this.tripFdirKillSwitch(`SSRF attempt detected against forbidden host: ${parsedUrl.hostname}`);
        throw new Error(`CALL_BLOCKED [SSRF_DETECTED]: Destination ${parsedUrl.hostname} is a prohibited loopback/metadata target.`);
      }

      // Enforce Allowlist
      const allowlist = contract.network_policy?.destination_allowlist || [];
      const isAllowed = allowlist.some(allowed => destinationUrl.startsWith(allowed));
      if (!isAllowed) {
        this.tripFdirKillSwitch(`Destination URL ${destinationUrl} not in allowlist [${allowlist.join(', ')}]`);
        throw new Error(`CALL_BLOCKED [DESTINATION_DISALLOWED]: Destination ${destinationUrl} is not permitted.`);
      }
    } catch (e) {
      if (e.message.startsWith('CALL_BLOCKED')) throw e;
      this.tripFdirKillSwitch(`Malformed destination URL: ${destinationUrl}`);
      throw new Error(`CALL_BLOCKED [MALFORMED_URL]: ${e.message}`);
    }

    // 2. Anti-Replay Nonce Validation
    if (options.nonce) {
      if (this.consumedNonces.has(options.nonce)) {
        this.tripFdirKillSwitch(`Replay attack detected: Nonce '${options.nonce}' was already consumed.`);
        throw new Error(`CALL_BLOCKED [NONCE_REPLAY_ATTACK]: Nonce '${options.nonce}' has already been used.`);
      }
      this.consumedNonces.add(options.nonce);
    }

    // 3. Credential Expiry Check
    if (contract.credential_scope?.expires_at) {
      const expiry = new Date(contract.credential_scope.expires_at).getTime();
      const now = options.timestamp ? new Date(options.timestamp).getTime() : Date.now();
      if (expiry <= now) {
        this.tripFdirKillSwitch('Staged credentials have expired. Calling halted.');
        throw new Error('CALL_BLOCKED [CREDENTIALS_EXPIRED]: Staged integration credentials have expired.');
      }
    }

    // 4. Deep Recursive Secret & Forbidden Data Scan
    try {
      this.deepScanForSecretLeakage(requestPayload, contract.forbidden_data || []);
    } catch (leakErr) {
      this.tripFdirKillSwitch(leakErr.message);
      throw new Error(`CALL_BLOCKED [DATA_LEAKAGE_PREVENTED]: ${leakErr.message}`);
    }

    // 5. Payload Size Limitation
    const payloadStr = typeof requestPayload === 'string' ? requestPayload : JSON.stringify(requestPayload);
    const maxBytes = contract.allowed_payload_schema?.max_body_bytes || 65536;
    const bodyBytes = Buffer.byteLength(payloadStr, 'utf8');
    if (bodyBytes > maxBytes) {
      throw new Error(`CALL_BLOCKED [PAYLOAD_SIZE_EXCEEDED]: Payload size (${bodyBytes} bytes) exceeds limit (${maxBytes} bytes).`);
    }

    return { valid: true, payloadBytes: bodyBytes, destinationUrl };
  }

  /**
   * Validates redirect target (e.g. 301/302 Location header) against SSRF & Allowlist
   * @param {Object} contract Integration contract
   * @param {string} redirectLocation Location header from response
   */
  validateRedirect(contract, redirectLocation) {
    if (!redirectLocation) {
      throw new Error('REDIRECT_BLOCKED: Empty redirect location');
    }

    try {
      const parsed = new URL(redirectLocation);
      if (FORBIDDEN_SSRF_HOSTS.includes(parsed.hostname.toLowerCase())) {
        this.tripFdirKillSwitch(`Redirect to prohibited SSRF host '${parsed.hostname}' intercepted.`);
        throw new Error(`REDIRECT_BLOCKED [SSRF_REDIRECT]: Redirect to ${parsed.hostname} is forbidden.`);
      }

      const allowlist = contract.network_policy?.destination_allowlist || [];
      const isAllowed = allowlist.some(allowed => redirectLocation.startsWith(allowed));
      if (!isAllowed) {
        this.tripFdirKillSwitch(`Open redirect to untrusted target '${redirectLocation}' blocked.`);
        throw new Error(`REDIRECT_BLOCKED [UNTRUSTED_REDIRECT]: Redirect target ${redirectLocation} is not in allowlist.`);
      }

      return { valid: true, redirectLocation };
    } catch (e) {
      if (e.message.startsWith('REDIRECT_BLOCKED')) throw e;
      this.tripFdirKillSwitch(`Invalid redirect URL: ${redirectLocation}`);
      throw new Error(`REDIRECT_BLOCKED [INVALID_REDIRECT_URL]: ${e.message}`);
    }
  }

  /**
   * Records call consumption and validates against hard budget limits
   * @param {Object} contract Integration contract
   * @param {number} costUsd Cost of call in USD
   * @param {number} durationMs Call duration in ms
   */
  recordCallAndBudget(contract, costUsd = 0, durationMs = 0) {
    const id = contract.integration_id;
    const current = this.callCounters.get(id) || { calls: 0, costUsd: 0 };
    current.calls += 1;
    current.costUsd += costUsd;
    this.callCounters.set(id, current);

    const maxCalls = contract.call_budget?.max_calls || 10;
    const maxCost = contract.call_budget?.max_cost_usd || 1.0;

    if (current.calls > maxCalls) {
      this.tripFdirKillSwitch(`Call budget exceeded: ${current.calls}/${maxCalls} calls.`);
      throw new Error(`BUDGET_BREACH [MAX_CALLS_EXCEEDED]: ${current.calls} calls executed (max: ${maxCalls}).`);
    }

    if (current.costUsd > maxCost) {
      this.tripFdirKillSwitch(`Cost budget exceeded: $${current.costUsd.toFixed(4)} / max $${maxCost.toFixed(4)}`);
      throw new Error(`BUDGET_BREACH [MAX_COST_EXCEEDED]: Cost $${current.costUsd.toFixed(4)} exceeds limit $${maxCost.toFixed(4)}.`);
    }

    return {
      callsConsumed: current.calls,
      callsRemaining: Math.max(0, maxCalls - current.calls),
      costConsumedUsd: current.costUsd,
      costRemainingUsd: Math.max(0, maxCost - current.costUsd)
    };
  }

  /**
   * Validates incoming response payload against truncation and corruption
   * @param {string|Object} rawBody Incoming body
   * @param {Object} headers HTTP response headers
   */
  validateIncomingResponse(rawBody, headers = {}) {
    const bodyStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);

    if (headers['content-length']) {
      const expectedLength = parseInt(headers['content-length'], 10);
      const actualLength = Buffer.byteLength(bodyStr, 'utf8');
      if (actualLength < expectedLength) {
        throw new Error(`RESPONSE_CORRUPTED [TRUNCATION_DETECTED]: Expected ${expectedLength} bytes but received ${actualLength} bytes.`);
      }
    }

    try {
      if (headers['content-type']?.includes('application/json') || typeof rawBody === 'string') {
        JSON.parse(bodyStr);
      }
    } catch (e) {
      throw new Error(`RESPONSE_CORRUPTED [MALFORMED_JSON]: ${e.message}`);
    }

    return { valid: true, byteLength: Buffer.byteLength(bodyStr, 'utf8') };
  }

  /**
   * Trips the FDIR Kill Switch, halting all real integrations immediately
   * @param {string} reason Diagnostic explanation
   * @returns {Object} FDIR incident event receipt
   */
  tripFdirKillSwitch(reason = 'Manual operator kill switch triggered') {
    this.fdirSafeModeTripped = true;
    this.trippedReason = reason;

    const incidentReceipt = EpistemicEvidenceEngine.createReceipt({
      mission_id: 'MIS-FDIR-INCIDENT',
      task_id: 'TSK-KILL-SWITCH-TRIP',
      status: 'VERIFIED',
      category: 'SECURITY_AUDIT',
      execution_context: {
        command: 'eos.fdir.trip',
        cwd_hash: calculateSha256(process.cwd()),
        exit_code: 0,
        duration_ms: 5
      },
      provenance: {
        stdout_sha256: calculateSha256(reason),
        stderr_sha256: calculateSha256(''),
        artifact_refs: []
      },
      assertions: [
        {
          id: 'AST-FDIR-KILL-SWITCH',
          statement: `FDIR Safe Mode tripped: ${reason}. All external mutations and integrations frozen.`,
          status: 'PASS'
        }
      ]
    });

    return {
      tripped: true,
      reason,
      incident_receipt: incidentReceipt
    };
  }

  _validateContractStructure(contract) {
    if (!contract.provider || !contract.endpoint || !contract.call_budget || !contract.network_policy) {
      throw new Error('INVALID_CONTRACT_STRUCTURE: Missing required top-level integration blocks.');
    }
    if (contract.environment === 'PRODUCTION') {
      throw new Error('INVALID_ENVIRONMENT: Production environments are prohibited in P2.');
    }
  }

  _validateHitlReceipt(receipt, gateId, contract) {
    if (!receipt || !receipt.receipt_id || !receipt.receipt_id.startsWith('HITL-')) {
      throw new Error(`MISSING_HITL_RECEIPT: Gate '${gateId}' requires explicit Human Director approval receipt.`);
    }
    if (receipt.decision !== 'approve') {
      throw new Error(`HITL_REJECTED: Human Director rejected gate '${gateId}'.`);
    }
    if (receipt.scope?.integration_id && receipt.scope.integration_id !== contract.integration_id) {
      throw new Error(`HITL_SCOPE_MISMATCH: Receipt integration_id does not match contract.`);
    }
  }

  _validateCredentialScope(credentialScope) {
    if (!credentialScope || !credentialScope.ttl_seconds || credentialScope.ttl_seconds > 86400) {
      throw new Error('INVALID_CREDENTIAL_SCOPE: TTL must be explicitly bounded and <= 24 hours (86400s).');
    }
  }
}
