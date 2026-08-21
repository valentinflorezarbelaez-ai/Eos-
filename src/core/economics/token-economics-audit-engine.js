/**
 * @module TokenEconomicsAuditEngine
 * @description Audits token consumption, context redundancy, retry taxonomy,
 * evidence-per-token efficiency, and cost bounds for EOS missions.
 * Enforces strict anti-infinite-loop and anti-duplicate-context invariants.
 */

import crypto from 'node:crypto';

export class TokenEconomicsAuditEngine {
  constructor(options = {}) {
    this.modelPricing = {
      'CLAUDE_3_5_SONNET': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
      'GPT_4O_MINI': { inputPerMillion: 0.15, outputPerMillion: 0.60 },
      'DEFAULT_BALANCED': { inputPerMillion: 1.0, outputPerMillion: 3.0 }
    };
    this.previousPromptFingerprints = new Map(); // taskId -> array of SHA-256 hashes
  }

  /**
   * Estimates token count (~4 characters per token as standard baseline)
   * @param {string|Object} content
   * @returns {number} Estimated tokens
   */
  estimateTokens(content) {
    if (!content) return 0;
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    return Math.ceil(str.length / 4);
  }

  /**
   * Computes Jaccard similarity and duplicate token ratio between two text contexts
   * @param {string} prevContext
   * @param {string} nextContext
   * @returns {Object} { duplicateRatioPct, progressiveDisclosureScore, isBloated }
   */
  analyzeContextRedundancy(prevContext = '', nextContext = '') {
    if (!prevContext || !nextContext) {
      return { duplicateRatioPct: 0.0, progressiveDisclosureScore: 10.0, isBloated: false };
    }

    const prevTokens = new Set(prevContext.toLowerCase().split(/\s+/).filter(Boolean));
    const nextTokens = new Set(nextContext.toLowerCase().split(/\s+/).filter(Boolean));

    if (prevTokens.size === 0 || nextTokens.size === 0) {
      return { duplicateRatioPct: 0.0, progressiveDisclosureScore: 10.0, isBloated: false };
    }

    let intersectionCount = 0;
    for (const token of nextTokens) {
      if (prevTokens.has(token)) intersectionCount++;
    }

    const duplicateRatioPct = Math.round((intersectionCount / nextTokens.size) * 1000) / 10;
    // Progressive disclosure score is inversely proportional to unnecessary duplication
    const progressiveDisclosureScore = Math.max(0, Math.round((10 - (duplicateRatioPct / 10)) * 10) / 10);
    const isBloated = duplicateRatioPct > 85.0 && nextContext.length > 5000;

    return {
      duplicateRatioPct,
      progressiveDisclosureScore,
      isBloated
    };
  }

  /**
   * Inspects a retry attempt, classifying its cause and halting identical unmutated retries
   * @param {string} taskId
   * @param {string|Object} promptOrArgs
   * @param {string} failureReason
   * @param {number} attemptNumber
   * @returns {Object} Retry evaluation
   */
  evaluateRetry(taskId, promptOrArgs, failureReason = '', attemptNumber = 1) {
    const payloadStr = typeof promptOrArgs === 'string' ? promptOrArgs : JSON.stringify(promptOrArgs);
    const currentHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

    const history = this.previousPromptFingerprints.get(taskId) || [];

    // Check for Identical Retries
    const isIdentical = history.includes(currentHash);
    history.push(currentHash);
    this.previousPromptFingerprints.set(taskId, history);

    let cause = 'LOGICAL_ASSERTION_FAILURE';
    if (failureReason.toLowerCase().includes('timeout')) {
      cause = 'TRANSIENT_TIMEOUT';
    } else if (failureReason.toLowerCase().includes('schema') || failureReason.toLowerCase().includes('json')) {
      cause = 'SCHEMA_VALIDATION_ERROR';
    }

    if (isIdentical) {
      cause = 'IDENTICAL_REPEAT_ATTEMPT';
    }

    if (attemptNumber > 2 || isIdentical) {
      return {
        allowed: false,
        blocked_as_identical: isIdentical,
        cause,
        attemptNumber,
        action: 'HALT_AND_ESCALATE_TO_HITL',
        reason: isIdentical
          ? `Identical retry blocked: Prompt payload matches previous failing attempt (Hash: ${currentHash.substring(0, 12)}...)`
          : `Max automated retries (${attemptNumber}) exceeded without progress.`
      };
    }

    return {
      allowed: true,
      blocked_as_identical: false,
      cause,
      attemptNumber,
      action: 'PROCEED_WITH_RETRY'
    };
  }

  /**
   * Compiles an exhaustive token economics and cost audit report for a mission
   * @param {Object} telemetry Data recorded across mission tasks
   * @returns {Object} Audit object matching token-economics-audit.schema.json
   */
  generateMissionAudit(telemetry = {}) {
    const missionId = telemetry.mission_id || 'MIS-P2-DEFAULT';
    const totalInputTokens = telemetry.total_input_tokens || 0;
    const totalOutputTokens = telemetry.total_output_tokens || 0;
    const totalTokens = totalInputTokens + totalOutputTokens;

    const modelName = telemetry.model_family || 'DEFAULT_BALANCED';
    const pricing = this.modelPricing[modelName] || this.modelPricing.DEFAULT_BALANCED;

    const inputCost = (totalInputTokens / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (totalOutputTokens / 1_000_000) * pricing.outputPerMillion;
    const estimatedCostUsd = Math.round((inputCost + outputCost) * 10000) / 10000;

    const budgetCapUsd = telemetry.budget_cap_usd || 1.0;
    const budgetConsumedPct = Math.min(100, Math.round((estimatedCostUsd / budgetCapUsd) * 1000) / 10);

    const redundancy = this.analyzeContextRedundancy(telemetry.initial_context || '', telemetry.final_context || '');
    const retries = telemetry.retries || [];
    const identicalBlocked = retries.filter(r => r.blocked_as_identical).length;

    const verifiedCount = telemetry.verified_assertions_count || 0;
    const evidencePerKiloToken = totalTokens > 0 ? Math.round((verifiedCount / (totalTokens / 1000)) * 100) / 100 : 0;
    const costPerVerifiedOutcome = verifiedCount > 0 ? Math.round((estimatedCostUsd / verifiedCount) * 10000) / 10000 : estimatedCostUsd;

    let governanceStatus = 'OPTIMAL';
    if (identicalBlocked > 0) {
      governanceStatus = 'BLOCKED_ON_IDENTICAL_RETRY';
    } else if (budgetConsumedPct > 100) {
      governanceStatus = 'BUDGET_EXCEEDED';
    } else if (budgetConsumedPct > 80) {
      governanceStatus = 'BUDGET_WARNING';
    } else {
      governanceStatus = 'WITHIN_BUDGET';
    }

    return {
      schema_version: '1.0.0',
      audit_id: `ECO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      mission_id: missionId,
      timestamp: new Date().toISOString(),
      token_metrics: {
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        total_tokens: totalTokens,
        context_compilation_latency_ms: telemetry.compilation_latency_ms || 15.5
      },
      cost_metrics: {
        estimated_cost_usd: estimatedCostUsd,
        budget_cap_usd: budgetCapUsd,
        budget_consumed_pct: budgetConsumedPct
      },
      redundancy_analysis: {
        duplicate_token_ratio_pct: redundancy.duplicateRatioPct,
        progressive_disclosure_score: redundancy.progressiveDisclosureScore,
        bloated_context_flag: redundancy.isBloated
      },
      retry_analysis: {
        total_retries: retries.length,
        identical_retries_blocked: identicalBlocked,
        retry_taxonomy: retries.map(r => ({
          task_id: r.task_id || 'TSK-UNKNOWN',
          attempt_number: r.attemptNumber || 1,
          cause: r.cause || 'LOGICAL_ASSERTION_FAILURE',
          blocked_as_identical: !!r.blocked_as_identical
        }))
      },
      efficiency_index: {
        verified_assertions_count: verifiedCount,
        evidence_per_kilotoken_ratio: evidencePerKiloToken,
        cost_per_verified_outcome_usd: costPerVerifiedOutcome
      },
      governance_status: governanceStatus
    };
  }
}
