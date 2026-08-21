/**
 * @module TutorMaestro
 * @description Governed pedagogical pre/post action explanations for the Human Director.
 * Does not invent evidence — only structures objectives, risks, and observed outcomes.
 */

export class TutorMaestro {
  /**
   * @param {object} [options]
   * @param {(entry: object) => void} [options.sink] optional logger
   */
  constructor(options = {}) {
    this.sink = options.sink || null;
    this.log = [];
  }

  /**
   * Explanation before a consequential action.
   */
  explainBefore(action) {
    const entry = {
      kind: 'PRE_ACTION',
      timestamp: new Date().toISOString(),
      action_id: action.action_id || action.name || 'UNKNOWN',
      objective: action.objective || '',
      concept: action.concept || '',
      scope: action.scope || [],
      cwd: action.cwd || process.cwd(),
      permissions: action.permissions || { allowed: [], blocked: [] },
      rationale: action.rationale || '',
      alternatives: action.alternatives || [],
      risks: action.risks || [],
      expected_evidence: action.expected_evidence || [],
      rollback: action.rollback || 'No mutation yet — abort before execute.',
      hitl_status: action.hitl_status || 'NOT_REQUIRED'
    };
    this._record(entry);
    return this._formatPre(entry);
  }

  /**
   * Explanation after an action with observed evidence classification.
   */
  explainAfter(action, observation = {}) {
    const entry = {
      kind: 'POST_ACTION',
      timestamp: new Date().toISOString(),
      action_id: action.action_id || action.name || 'UNKNOWN',
      observed: observation.observed || '',
      exit_code: observation.exit_code ?? null,
      evidence: observation.evidence || [],
      classification: observation.classification || 'UNKNOWN',
      delta: observation.delta || {},
      interpretation: observation.interpretation || '',
      next_decision: observation.next_decision || ''
    };
    this._record(entry);
    return this._formatPost(entry);
  }

  _record(entry) {
    this.log.push(entry);
    if (typeof this.sink === 'function') this.sink(entry);
  }

  _formatPre(e) {
    return [
      `📚 TUTOR (antes) — ${e.action_id}`,
      `OBJECTIVE: ${e.objective}`,
      `CONCEPT: ${e.concept}`,
      `CWD: ${e.cwd}`,
      `SCOPE: ${(e.scope || []).join(', ') || '(none)'}`,
      `RATIONALE: ${e.rationale}`,
      `RISKS: ${(e.risks || []).join('; ') || '(none listed)'}`,
      `EXPECTED_EVIDENCE: ${(e.expected_evidence || []).join('; ') || '(none)'}`,
      `ROLLBACK: ${e.rollback}`,
      `HITL: ${e.hitl_status}`
    ].join('\n');
  }

  _formatPost(e) {
    return [
      `📚 TUTOR (después) — ${e.action_id}`,
      `OBSERVED: ${e.observed}`,
      `EXIT_CODE: ${e.exit_code}`,
      `CLASSIFICATION: ${e.classification}`,
      `INTERPRETATION: ${e.interpretation}`,
      `NEXT: ${e.next_decision}`
    ].join('\n');
  }
}
