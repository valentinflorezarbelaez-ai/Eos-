/**
 * @module GovernedTechnicalSelectionEngine
 * @description Governs the technical decision-making pipeline for EOS.
 * Implements multi-candidate comparison, epistemic promotion rules,
 * AI model and endpoint contract selection, HITL escalation triggers,
 * and dual human/machine Architecture Decision Record (ADR) generation.
 */

import crypto from 'node:crypto';

export class GovernedTechnicalSelectionEngine {
  constructor(options = {}) {
    this.weights = {
      project_compatibility: 0.20,
      ecosystem_maturity: 0.15,
      security_posture: 0.15,
      cost_efficiency: 0.10,
      performance_profile: 0.10,
      talent_availability: 0.10,
      operational_simplicity: 0.10,
      reversibility: 0.10
    };
  }

  /**
   * Evaluates and ranks multiple stack candidates for a discovered project
   * @param {Object} projectProfile Discovered project profile
   * @param {Array<Object>} candidates Array of candidate options
   * @param {Object} missionContext Budget, authority, and constraints
   * @returns {Object} Comparative evaluation result with selected candidate and ranking
   */
  compareCandidates(projectProfile, candidates = [], missionContext = {}) {
    if (!Array.isArray(candidates) || candidates.length < 2) {
      throw new Error('Governed selection requires at least 2 distinct candidates to evaluate trade-offs.');
    }

    const scoredCandidates = candidates.map(c => {
      const scoreMatrix = c.score_matrix || {
        project_compatibility: 5.0,
        ecosystem_maturity: 5.0,
        security_posture: 5.0,
        cost_efficiency: 5.0,
        performance_profile: 5.0,
        talent_availability: 5.0,
        operational_simplicity: 5.0,
        reversibility: 5.0
      };

      let aggregateScore = 0;
      for (const [dimension, weight] of Object.entries(this.weights)) {
        aggregateScore += (scoreMatrix[dimension] || 0) * weight;
      }
      aggregateScore = Math.round(aggregateScore * 10) / 10;

      // Determine epistemic level based on evidence present
      let evidenceLevel = c.evidence_level || 'DECLARED_SUPPORT';
      if (c.evidence_receipt_id && c.test_verified) {
        evidenceLevel = 'PROVEN_CAPABILITY';
      } else if (c.discovered_in_repo) {
        evidenceLevel = 'DISCOVERED_COMPATIBILITY';
      }

      // Check if HITL gate is required
      const isUnproven = evidenceLevel === 'DECLARED_SUPPORT';
      const isHighRisk = scoreMatrix.security_posture < 6.0 || scoreMatrix.reversibility < 5.0;
      const budgetExceeded = (c.estimated_monthly_cost_usd || 0) > (missionContext.max_cost_usd || 1000);

      const hitlRequired = isUnproven || isHighRisk || budgetExceeded || projectProfile.governance?.risk_tier === 'HIGH';
      const hitlReason = hitlRequired
        ? [
            isUnproven ? 'Unproven technology without local test evidence' : null,
            isHighRisk ? 'High security risk or low reversibility (<5.0)' : null,
            budgetExceeded ? 'Estimated operational cost exceeds project budget limit' : null,
            projectProfile.governance?.risk_tier === 'HIGH' ? 'Project classified under HIGH/CRITICAL governance risk tier' : null
          ].filter(Boolean).join('; ')
        : 'Standard routine selection within verified operational boundaries';

      return {
        ...c,
        score_matrix: scoreMatrix,
        aggregate_score: aggregateScore,
        evidence_level: evidenceLevel,
        human_approval_required: {
          required: hitlRequired,
          reason: hitlReason,
          gate_id: hitlRequired ? 'HITL-DECISION-GATE-ARCHITECTURE' : 'ROUTINE_AUTO_APPROVED'
        }
      };
    });

    // Sort descending by aggregate score
    scoredCandidates.sort((a, b) => b.aggregate_score - a.aggregate_score);

    const winner = scoredCandidates[0];
    const runnerUp = scoredCandidates[1];

    return {
      evaluated_at: new Date().toISOString(),
      project_id: projectProfile.project_id,
      selected_candidate: winner,
      runner_up: runnerUp,
      all_ranked_candidates: scoredCandidates,
      decision_verdict: winner.human_approval_required.required ? 'PENDING_HUMAN_APPROVAL' : 'DELEGATED_ROUTINE_APPROVED'
    };
  }

  /**
   * Selects an AI Model matching requirements, budget, and privacy tier
   * @param {Array<Object>} modelCatalog Available models
   * @param {Object} requirements Context window, vision, reasoning depth
   * @param {Object} privacyAndBudget Constraints
   * @returns {Object} Selected model and fallback option
   */
  selectAiModel(modelCatalog = [], requirements = {}, privacyAndBudget = {}) {
    const requiredPrivacy = privacyAndBudget.privacy_tier || 'ZERO_DATA_RETENTION';
    const maxCostPerM = privacyAndBudget.max_input_cost_per_m || 10.0;
    const minContext = requirements.min_context_window || 8192;

    const matchingModels = modelCatalog.filter(m => {
      if (m.capabilities.max_context_window_tokens < minContext) return false;
      if (requirements.requires_tool_calling && !m.capabilities.supports_tool_calling) return false;
      if (requirements.requires_vision && !m.capabilities.supports_vision) return false;
      if (requirements.requires_structured_json && !m.capabilities.supports_structured_json) return false;
      if (m.pricing_usd_per_million.input_tokens > maxCostPerM) return false;

      if (requiredPrivacy === 'ZERO_DATA_RETENTION' && !m.privacy_profile.zero_data_retention) return false;
      if (requiredPrivacy === 'LOCAL_AIRGAPPED' && !m.privacy_profile.on_premise_available) return false;

      return true;
    });

    if (matchingModels.length === 0) {
      throw new Error(`No models in catalog satisfy the required capabilities, privacy tier (${requiredPrivacy}), or cost budget.`);
    }

    // Sort by latency & cost balance
    matchingModels.sort((a, b) => a.performance_profile.p95_latency_ms - b.performance_profile.p95_latency_ms);

    return {
      selected_model: matchingModels[0],
      fallback_model: matchingModels[1] || matchingModels[0],
      selection_rationale: `Selected ${matchingModels[0].model_name} for lowest p95 latency (${matchingModels[0].performance_profile.p95_latency_ms}ms) under privacy tier ${requiredPrivacy}`
    };
  }

  /**
   * Generates a canonical ADR in both Machine-Readable JSON and Human Markdown
   * @param {Object} selectionResult Output from compareCandidates
   * @param {Object} projectProfile Discovered project profile
   * @param {Object} meta Metadata including adr_id, deciders, drivers
   * @returns {Object} { jsonAdr, markdownAdr }
   */
  generateAdr(selectionResult, projectProfile, meta = {}) {
    const adrId = meta.adr_id || 'ADR-0010';
    const title = meta.title || `Technical Stack Selection for ${projectProfile.project_id}`;
    const deciders = meta.deciders || ['Human Director', 'EOS Senior Systems Architect'];
    const chosen = selectionResult.selected_candidate;
    const runnerUp = selectionResult.runner_up;
    const dateStr = new Date().toISOString().split('T')[0];

    const consideredOptions = [
      {
        option_id: chosen.candidate_id || 'OPT-01',
        title: chosen.stack_name || 'Selected Option',
        description: chosen.tradeoff_rationale?.why_recommended || 'Optimal stack selection based on 8-dimensional evaluation',
        pros: chosen.tradeoff_rationale?.advantages || ['High compatibility', 'Proven security'],
        cons: chosen.tradeoff_rationale?.disadvantages || ['Standard operational trade-offs']
      },
      {
        option_id: runnerUp.candidate_id || 'OPT-02',
        title: runnerUp.stack_name || 'Alternative Option',
        description: runnerUp.tradeoff_rationale?.why_recommended || 'Alternative architectural candidate evaluated',
        pros: runnerUp.tradeoff_rationale?.advantages || ['Alternative performance balance'],
        cons: runnerUp.tradeoff_rationale?.disadvantages || ['Lower compatibility or higher operational complexity']
      }
    ];

    const isHitl = chosen.human_approval_required?.required;
    const approvalAuth = isHitl ? 'HUMAN_DIRECTOR' : 'AUTONOMOUS_DELEGATED';

    const rawPayload = JSON.stringify({
      adrId,
      chosenOption: chosen.candidate_id,
      score: chosen.aggregate_score,
      project: projectProfile.project_id
    });
    const evidenceSha = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const jsonAdr = {
      schema_version: '1.0.0',
      adr_id: adrId,
      title: title,
      status: isHitl ? 'PROPOSED' : 'APPROVED',
      date: dateStr,
      deciders: deciders,
      context_and_problem: `Project ${projectProfile.project_id} requires a governed, reproducible technical stack selection that aligns with existing repository conventions and security standards.`,
      decision_drivers: [
        'Ecosystem maturity and long-term maintainability',
        'Security posture and memory/secret protection',
        'Operational simplicity and low infrastructure cost',
        'Reversibility and low vendor lock-in'
      ],
      considered_options: consideredOptions,
      decision_outcome: {
        chosen_option_id: chosen.candidate_id || 'OPT-01',
        justification: `Selected option '${chosen.stack_name}' achieved aggregate score of ${chosen.aggregate_score}/10 with proven alignment to repository conventions.`,
        approval_authority: approvalAuth
      },
      consequences: {
        positive: chosen.tradeoff_rationale?.advantages || ['High compatibility', 'Verified security'],
        negative: chosen.tradeoff_rationale?.disadvantages || ['Ecosystem standard constraints'],
        risks_and_mitigations: [
          {
            risk: chosen.tradeoff_rationale?.primary_risks?.[0] || 'Operational drift over dependencies',
            mitigation: 'Lock versions in package manifests and enforce strict TDD in sandbox worktrees'
          }
        ]
      },
      epistemic_validation: {
        evidence_receipt_id: meta.evidence_receipt_id || null,
        sha256_hash: evidenceSha,
        verification_test_path: meta.verification_test_path || 'tests/p1-governed-technical-selection.test.js'
      }
    };

    const markdownAdr = `# ${adrId}: ${title}

**Status:** ${jsonAdr.status}  
**Date:** ${jsonAdr.date}  
**Deciders:** ${jsonAdr.deciders.join(', ')}  
**Approval Authority:** ${jsonAdr.decision_outcome.approval_authority}  

---

## 1. Context and Problem Statement
${jsonAdr.context_and_problem}

---

## 2. Decision Drivers
${jsonAdr.decision_drivers.map(d => `- ${d}`).join('\n')}

---

## 3. Considered Options
${jsonAdr.considered_options.map(opt => `### ${opt.option_id}: ${opt.title}\n${opt.description}\n\n- **Pros:** ${opt.pros.join(', ')}\n- **Cons:** ${opt.cons.join(', ')}`).join('\n\n')}

---

## 4. Decision Outcome
**Chosen Option:** \`${jsonAdr.decision_outcome.chosen_option_id}\`  
**Justification:** ${jsonAdr.decision_outcome.justification}

---

## 5. Consequences
### Positive
${jsonAdr.consequences.positive.map(p => `- ${p}`).join('\n')}

### Negative & Trade-offs
${jsonAdr.consequences.negative.map(n => `- ${n}`).join('\n')}

### Risks & Mitigations
${jsonAdr.consequences.risks_and_mitigations.map(rm => `- **Risk:** ${rm.risk}\n  - **Mitigation:** ${rm.mitigation}`).join('\n')}

---

## 6. Epistemic Validation
- **Cryptographic Hash (SHA-256):** \`${jsonAdr.epistemic_validation.sha256_hash}\`
- **Verification Test Reference:** \`${jsonAdr.epistemic_validation.verification_test_path}\`
`;

    return { jsonAdr, markdownAdr };
  }
}
