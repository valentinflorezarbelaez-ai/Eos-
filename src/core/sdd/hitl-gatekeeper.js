/**
 * @module HitlGatekeeper
 * @description Deterministic HITL Receipt Validator, Gatekeeper Engine,
 * and Supervised Autonomy Coordinator for EOS SDD Kernel.
 */

import { createHash, randomBytes } from 'node:crypto';

export const AUTONOMY_MODES = Object.freeze({
  READ_ONLY_AUTONOMOUS: 'READ_ONLY_AUTONOMOUS',
  LOCAL_BOUNDED_AUTONOMY: 'LOCAL_BOUNDED_AUTONOMY',
  STAGED_AUTONOMY: 'STAGED_AUTONOMY',
  PRODUCTION_SUPERVISED: 'PRODUCTION_SUPERVISED'
});

export const DECISION_CLASSES = Object.freeze({
  DELEGATED_ROUTINE: 'delegated_routine',
  APPROVAL_REQUIRED: 'approval_required',
  HUMAN_ONLY: 'human_only'
});

export const HUMAN_ONLY_ACTIONS = new Set([
  'HUMAN_DIRECTION_GATE',
  'HUMAN_RELEASE_GATE',
  'human.approve_direction',
  'human.approve_release',
  'scope.expand',
  'surface.modify_protected',
  'environment.production_release',
  'credentials.access',
  'external.message_publish',
  'constitution.exception'
]);

export const APPROVAL_REQUIRED_ACTIONS = new Set([
  'budget.extend',
  'architecture.major_tradeoff',
  'task_graph.restructure'
]);

export class HitlGatekeeper {
  constructor(options = {}) {
    this.revokedReceipts = new Set(options.revokedReceipts || []);
    this.consumedReceipts = new Set(options.consumedReceipts || []);
    this.mode = options.mode || AUTONOMY_MODES.LOCAL_BOUNDED_AUTONOMY;
  }

  setMode(mode) {
    if (!Object.values(AUTONOMY_MODES).includes(mode)) {
      throw new Error(`INVALID_MODE: Unknown autonomy mode '${mode}'`);
    }
    this.mode = mode;
  }

  revokeReceipt(receiptId, reason = 'Administrative revocation') {
    this.revokedReceipts.add(receiptId);
    return { revoked: true, receiptId, reason, timestamp: new Date().toISOString() };
  }

  isExpired(receipt, now = Date.now()) {
    if (!receipt || !receipt.expires_at) return true;
    const expiryTime = new Date(receipt.expires_at).getTime();
    return now >= expiryTime;
  }

  classifyDecision(actionType) {
    if (HUMAN_ONLY_ACTIONS.has(actionType)) {
      return DECISION_CLASSES.HUMAN_ONLY;
    }
    if (APPROVAL_REQUIRED_ACTIONS.has(actionType)) {
      return DECISION_CLASSES.APPROVAL_REQUIRED;
    }
    return DECISION_CLASSES.DELEGATED_ROUTINE;
  }

  validateReceipt(receipt, requestedAction = {}, missionSnapshot = {}) {
    // 1. Structure Check
    if (!receipt || typeof receipt !== 'object') {
      return this._buildError('HITL_INVALID_STRUCTURE', 'receipt', 'object', typeof receipt, 'Provide valid receipt object');
    }
    if (!receipt.receipt_id || !receipt.receipt_id.startsWith('HITL-')) {
      return this._buildError('HITL_INVALID_ID', 'receipt.receipt_id', 'HITL-*', receipt.receipt_id, 'Provide valid HITL receipt ID');
    }
    if (!receipt.approver || !receipt.approver.identity || !receipt.approver.authentication_ref) {
      return this._buildError('HITL_MISSING_APPROVER', 'receipt.approver', 'Identity & authentication_ref', 'Missing approver fields', 'Ensure receipt contains verified human approver');
    }

    // 2. Revocation Check
    if (receipt.revoked_at || this.revokedReceipts.has(receipt.receipt_id)) {
      return this._buildError('HITL_RECEIPT_REVOKED', 'receipt.status', 'Active receipt', 'Revoked', 'Request fresh authorization receipt from Human Director');
    }

    // 3. Replay Protection
    if (this.consumedReceipts.has(receipt.receipt_id)) {
      return this._buildError('HITL_RECEIPT_REPLAYED', 'receipt.receipt_id', 'Unconsumed receipt', 'Already consumed', 'One-time receipts cannot be re-used across distinct transitions');
    }

    // 4. Mission & Task Binding
    if (missionSnapshot.mission_id && receipt.scope?.mission_id && receipt.scope.mission_id !== missionSnapshot.mission_id) {
      return this._buildError('HITL_MISSION_MISMATCH', 'scope.mission_id', missionSnapshot.mission_id, receipt.scope.mission_id, 'Receipt must match active mission ID');
    }
    if (requestedAction.task_id && receipt.scope?.task_ids && !receipt.scope.task_ids.includes(requestedAction.task_id)) {
      return this._buildError('HITL_TASK_MISMATCH', 'scope.task_ids', `Include ${requestedAction.task_id}`, receipt.scope.task_ids, 'Receipt must cover requested task ID');
    }

    // 5. Gate & Action Class Compatibility
    if (requestedAction.gate_id && receipt.gate_id && receipt.gate_id !== requestedAction.gate_id) {
      return this._buildError('HITL_GATE_MISMATCH', 'receipt.gate_id', requestedAction.gate_id, receipt.gate_id, 'Receipt gate does not match requested gate');
    }
    if (requestedAction.action_class && receipt.scope?.action_classes && !receipt.scope.action_classes.includes(requestedAction.action_class)) {
      return this._buildError('HITL_ACTION_UNAUTHORIZED', 'scope.action_classes', `Include ${requestedAction.action_class}`, receipt.scope.action_classes, 'Grant requested action class in receipt scope');
    }

    // 6. Authority & Monotonicity
    if (receipt.authority_granted?.monotonicity_rule !== 'No authority outside this receipt is granted') {
      return this._buildError('HITL_MONOTONICITY_BREACH', 'authority_granted.monotonicity_rule', 'Explicit monotonicity preservation', receipt.authority_granted?.monotonicity_rule, 'Include strict monotonicity rule in receipt');
    }

    // 7. Edit Roots & Protected Surfaces
    if (requestedAction.target_files && receipt.scope?.allowed_edit_roots) {
      for (const file of requestedAction.target_files) {
        const inAllowedRoot = receipt.scope.allowed_edit_roots.some(root => file.startsWith(root));
        if (!inAllowedRoot) {
          return this._buildError('HITL_SCOPE_ROOT_VIOLATION', 'scope.allowed_edit_roots', `Cover file ${file}`, receipt.scope.allowed_edit_roots, 'Add target directory to allowed edit roots');
        }
        if (receipt.scope.protected_surfaces?.some(ps => file.startsWith(ps))) {
          return this._buildError('HITL_PROTECTED_SURFACE_VIOLATION', 'scope.protected_surfaces', 'Zero overlap with target files', file, 'Target file belongs to protected surface');
        }
      }
    }

    // 8. Environment Binding
    if (requestedAction.environment && receipt.scope?.environment && receipt.scope.environment !== requestedAction.environment) {
      return this._buildError('HITL_ENVIRONMENT_MISMATCH', 'scope.environment', requestedAction.environment, receipt.scope.environment, 'Receipt environment must match execution target');
    }

    // 9. Temporal Validity (Expiry)
    const now = requestedAction.timestamp ? new Date(requestedAction.timestamp).getTime() : Date.now();
    if (this.isExpired(receipt, now)) {
      return this._buildError('HITL_RECEIPT_EXPIRED', 'receipt.expires_at', `> ${new Date(now).toISOString()}`, receipt.expires_at, 'Request renewed receipt with future expiration');
    }

    // 10. Evidence Reviewed Integrity
    if (receipt.evidence_reviewed) {
      if (!Array.isArray(receipt.evidence_reviewed) || receipt.evidence_reviewed.length === 0) {
        return this._buildError('HITL_MISSING_EVIDENCE_REVIEWED', 'receipt.evidence_reviewed', 'At least 1 reviewed evidence reference', 'Empty list', 'Include evidence references reviewed by human');
      }
      for (const ev of receipt.evidence_reviewed) {
        if (!ev.sha256 || !/^[a-f0-9]{64}$/.test(ev.sha256)) {
          return this._buildError('HITL_MALFORMED_EVIDENCE_HASH', `evidence_reviewed.${ev.id}.sha256`, 'Valid 64-hex SHA-256', ev.sha256, 'Provide valid content hash for reviewed evidence');
        }
      }
    }

    // 11. Approver Independence (Self-Approval Guard)
    if (requestedAction.implementer_identity && receipt.approver.identity === requestedAction.implementer_identity) {
      return this._buildError('HITL_SELF_APPROVAL_VIOLATION', 'receipt.approver.identity', `Independent approver (not ${requestedAction.implementer_identity})`, receipt.approver.identity, 'Human Director or independent reviewer must sign receipt');
    }

    // 12. Approval Decision
    if (receipt.decision !== 'approve' && receipt.decision !== 'approve_with_conditions') {
      return this._buildError('HITL_DECISION_NOT_APPROVED', 'receipt.decision', 'approve or approve_with_conditions', receipt.decision, 'Human Director must grant approval');
    }

    return {
      valid: true,
      receiptId: receipt.receipt_id,
      authorityLevel: receipt.authority_granted?.level || 'LEVEL_0',
      decision: receipt.decision,
      conditions: receipt.conditions || []
    };
  }

  authorizeAction(actionType, options = {}) {
    const { receipt, requestedAction = {}, missionSnapshot = {} } = options;
    const decisionClass = this.classifyDecision(actionType);
    const decisionId = `DEC-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // Mode Boundary Check
    if (this.mode === AUTONOMY_MODES.READ_ONLY_AUTONOMOUS && requestedAction.is_mutating) {
      return {
        schema_version: '1.0.0',
        decision_id: decisionId,
        mission_id: missionSnapshot.mission_id || 'UNKNOWN',
        action_type: actionType,
        decision_class: decisionClass,
        status: 'DENIED',
        validation_details: {
          valid: false,
          code: 'MODE_MUTATION_FORBIDDEN',
          field: 'autonomy_mode',
          expected: 'LOCAL_BOUNDED_AUTONOMY or higher',
          observed: this.mode,
          next_action: 'Switch mode with human approval before performing mutating actions'
        },
        timestamp
      };
    }

    // Delegated Routine -> Autonomous Continuation
    if (decisionClass === DECISION_CLASSES.DELEGATED_ROUTINE) {
      return {
        schema_version: '1.0.0',
        decision_id: decisionId,
        receipt_id: null,
        mission_id: missionSnapshot.mission_id || 'UNKNOWN',
        action_type: actionType,
        decision_class: decisionClass,
        status: 'AUTHORIZED',
        validation_details: {
          valid: true,
          code: 'AUTONOMOUS_ROUTINE_ALLOWED',
          field: 'action_type',
          expected: 'delegated_routine',
          observed: actionType,
          next_action: 'Proceed with autonomous execution'
        },
        timestamp
      };
    }

    // Approval Required or Human Only -> Enforce Receipt
    if (!receipt) {
      return {
        schema_version: '1.0.0',
        decision_id: decisionId,
        receipt_id: null,
        mission_id: missionSnapshot.mission_id || 'UNKNOWN',
        action_type: actionType,
        decision_class: decisionClass,
        status: 'PAUSED_AWAITING_APPROVAL',
        validation_details: {
          valid: false,
          code: 'HITL_RECEIPT_REQUIRED',
          field: 'receipt',
          expected: 'Valid HITL receipt',
          observed: 'null',
          next_action: 'Pause execution and request Human Director authorization receipt'
        },
        timestamp
      };
    }

    const validation = this.validateReceipt(receipt, { ...requestedAction, gate_id: actionType }, missionSnapshot);
    if (!validation.valid) {
      return {
        schema_version: '1.0.0',
        decision_id: decisionId,
        receipt_id: receipt.receipt_id,
        mission_id: missionSnapshot.mission_id || 'UNKNOWN',
        action_type: actionType,
        decision_class: decisionClass,
        status: 'DENIED',
        validation_details: validation,
        timestamp
      };
    }

    // Mark receipt as consumed
    this.consumedReceipts.add(receipt.receipt_id);

    return {
      schema_version: '1.0.0',
      decision_id: decisionId,
      receipt_id: receipt.receipt_id,
      mission_id: missionSnapshot.mission_id || 'UNKNOWN',
      action_type: actionType,
      decision_class: decisionClass,
      status: 'AUTHORIZED',
      validation_details: {
        valid: true,
        code: 'HITL_RECEIPT_VERIFIED',
        field: 'receipt',
        expected: 'Valid receipt',
        observed: receipt.receipt_id,
        next_action: 'Execute authorized action'
      },
      timestamp
    };
  }

  generateStatusReport(snapshot, options = {}) {
    const {
      tasks = [],
      evidence = [],
      tools = [],
      budgets = {},
      risks = []
    } = options;

    return `# EOS Mission Status Report: ${snapshot.mission_id || 'UNKNOWN'}

* **Current State:** \`${snapshot.state || 'VISION_INTAKE'}\`
* **Operational Mode:** \`${this.mode}\`
* **Authority Level:** \`${snapshot.authority_level || 'LEVEL_0'}\`
* **Generated At:** \`${new Date().toISOString()}\`

---

## 1. Executive Summary & Scope
- **Mission ID:** \`${snapshot.mission_id || 'UNKNOWN'}\`
- **Objective:** ${snapshot.objective || 'Autonomous software engineering orchestration'}
- **Tasks Summary:** ${tasks.filter(t => t.status === 'COMPLETED').length} / ${tasks.length} tasks completed

---

## 2. Organization & Task Graph
| Task ID | Assigned Role | Status | Budget Burn |
|---|---|---|---|
${tasks.map(t => `| \`${t.task_id}\` | \`${t.assigned_role}\` | \`${t.status}\` | ${t.tokens_consumed || 0} tokens |`).join('\n') || '| None | None | None | 0 tokens |'}

---

## 3. Tool Realism & Capabilities
| Tool Name | Nature | Impact |
|---|---|---|
${tools.map(t => `| \`${t.name}\` | \`${t.nature}\` | \`${t.impact}\` |`).join('\n') || '| `read_only_inspector` | `REAL_LOCAL` | Read-only analysis |'}

---

## 4. Verification & Evidence Register
| Evidence ID | Category | Status | Hash |
|---|---|---|---|
${evidence.map(e => `| \`${e.receipt_id}\` | \`${e.category}\` | \`${e.status}\` | \`${e.sha256?.substring(0, 16)}...\` |`).join('\n') || '| None | None | None | None |'}

---

## 5. Budget Accounting
- **Tokens (Consumed / Max):** ${budgets.tokens_consumed || 0} / ${budgets.max_tokens || 50000}
- **Duration (Elapsed / Max):** ${budgets.duration_seconds || 0}s / ${budgets.max_duration_seconds || 1800}s

---

## 6. Discovered Risks & Mitigations
${risks.map(r => `- **${r.id}**: ${r.statement} (Mitigation: ${r.mitigation})`).join('\n') || '- Zero critical risks discovered'}

---

## 7. Outcomes & Verdict
- **Technical Correctness Verdict:** \`${evidence.every(e => e.status === 'VERIFIED') && evidence.length > 0 ? 'TECHNICAL_VERIFIED' : 'IN_PROGRESS'}\`
- **Business Outcome Statement:** Explicitly separated from technical checks — pending human experiment.
`;
  }

  _buildError(code, field, expected, observed, nextAction) {
    return {
      valid: false,
      code,
      field,
      expected: String(expected),
      observed: String(observed),
      next_action: nextAction
    };
  }
}
