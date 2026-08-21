/**
 * @module MultiAgentSupervisionEngine
 * @description Coordinates the 8-dimensional supervision, independent evaluation,
 * structured correction directives, and escalation logic for multi-agent task execution.
 */

import { calculateSha256 } from '../sdd/epistemic-evidence-engine.js';

export class MultiAgentSupervisionEngine {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 2;
  }

  /**
   * Evaluates an agent task submission across 8 quality dimensions
   * @param {Object} taskContract The canonical task contract
   * @param {Object} selectionRecord The agent selection record (containing author and reviewer roles)
   * @param {Object} returnPackage The submitted return package from Cursor/Agent
   * @param {Array<Object>} retryHistory Previous return packages for this task
   * @returns {Object} Canonical TaskSupervisionEvaluation object
   */
  evaluateSubmission(taskContract = {}, selectionRecord = {}, returnPackage = {}, retryHistory = []) {
    const taskId = taskContract.task_id || returnPackage.task_id || 'TASK-UNSPECIFIED';
    const missionId = taskContract.mission_id || returnPackage.mission_id || 'MIS-UNSPECIFIED';
    const retryCount = retryHistory.length;
    const authorRoleId = selectionRecord.author_role_id || taskContract.assigned_role || 'ROLE-CORE-ENGINEER';
    const reviewerRoleId = selectionRecord.reviewer_role_id || 'ROLE-QA-ENGINEER';

    // 1. Check Anti-Infinite-Loop on Identical Retries
    const currentDiffHash = calculateSha256(returnPackage.diff || '');
    if (retryCount > 0) {
      const lastRetry = retryHistory[retryHistory.length - 1];
      const lastDiffHash = calculateSha256(lastRetry.diff || '');
      if (currentDiffHash === lastDiffHash && returnPackage.test_results?.pass_rate === lastRetry.test_results?.pass_rate) {
        return this._buildEvaluation({
          missionId,
          taskId,
          authorRoleId,
          reviewerRoleId,
          retryCount,
          dimensions: {
            contract_fidelity: 30.0,
            technical_correctness: (returnPackage.test_results?.pass_rate || 0) * 100.0,
            evidence_quality: 50.0,
            security_compliance: 100.0,
            cost_efficiency: 10.0,
            reproducibility: 10.0,
            handoff_quality: 20.0,
            communication_clarity: 20.0
          },
          verdict: 'ESCALATE_HITL',
          correctionDirective: {
            action_required: 'STOP_IMMEDIATE_ESCALATION',
            defects_identified: ['Identical retry submission detected with zero delta in diff or test pass rate.'],
            target_files: (returnPackage.affected_files || []).map(f => f.path)
          },
          receipts: returnPackage.evidence?.receipt_hashes || []
        });
      }
    }

    // 2. Evaluate 8 Quality Dimensions (0 - 100)
    // D1: Contract Fidelity
    let contractFidelity = 100.0;
    const requiredOutputs = taskContract.required_outputs || [];
    if (requiredOutputs.length > 0 && (!returnPackage.affected_files || returnPackage.affected_files.length === 0)) {
      contractFidelity = 30.0;
    }

    // D2: Technical Correctness
    const testResults = returnPackage.test_results || { pass_rate: 0.0, failed_tests: 0, total_tests: 0 };
    const technicalCorrectness = (testResults.pass_rate || 0.0) * 100.0;

    // D3: Evidence Quality
    const receiptHashes = returnPackage.evidence?.receipt_hashes || [];
    const evidenceQuality = receiptHashes.length > 0 ? 100.0 : 40.0;

    // D4: Security Compliance
    let securityCompliance = 100.0;
    const protectedSurfaces = taskContract.protected_surfaces || ['docs/governance/**', 'src/core/**'];
    for (const file of returnPackage.affected_files || []) {
      for (const surface of protectedSurfaces) {
        const prefix = surface.replace('/**', '').replace('/*', '');
        if (file.path.startsWith(prefix) && file.action !== 'READ_ONLY') {
          securityCompliance = 0.0;
          break;
        }
      }
    }

    // D5: Cost & Token Efficiency
    const costEfficiency = 95.0; // Offline fixture metering

    // D6: Reproducibility
    const reproducibility = testResults.total_tests > 0 ? 100.0 : 50.0;

    // D7: Handoff Quality
    const handoffQuality = returnPackage.diff && returnPackage.diff.length > 0 ? 95.0 : 50.0;

    // D8: Communication Clarity
    const communicationClarity = returnPackage.summary && returnPackage.summary.length > 20 ? 95.0 : 60.0;

    const dimensions = {
      contract_fidelity: parseFloat(contractFidelity.toFixed(1)),
      technical_correctness: parseFloat(technicalCorrectness.toFixed(1)),
      evidence_quality: parseFloat(evidenceQuality.toFixed(1)),
      security_compliance: parseFloat(securityCompliance.toFixed(1)),
      cost_efficiency: parseFloat(costEfficiency.toFixed(1)),
      reproducibility: parseFloat(reproducibility.toFixed(1)),
      handoff_quality: parseFloat(handoffQuality.toFixed(1)),
      communication_clarity: parseFloat(communicationClarity.toFixed(1))
    };

    // 3. Verdict Determination
    let verdict = 'ACCEPTED';
    let correctionDirective = null;

    if (securityCompliance === 0.0) {
      verdict = 'REJECTED';
      correctionDirective = {
        action_required: 'REVERT_PROTECTED_SURFACE_MUTATION',
        defects_identified: ['Attempted write to protected governance or core paths'],
        target_files: (returnPackage.affected_files || []).map(f => f.path)
      };
    } else if (returnPackage.status === 'BLOCKED') {
      verdict = 'ESCALATE_HITL';
    } else if (technicalCorrectness < 100.0 || contractFidelity < 80.0) {
      if (retryCount < this.maxRetries) {
        verdict = 'REQUEST_CORRECTION';
        correctionDirective = {
          action_required: 'FIX_FAILING_TESTS_AND_COMPLETE_OUTPUTS',
          defects_identified: [
            testResults.failed_tests > 0 ? `${testResults.failed_tests} tests failed` : 'Incomplete contractual outputs',
            testResults.log_excerpt || 'Review test failure logs'
          ],
          target_files: (returnPackage.affected_files || []).map(f => f.path)
        };
      } else {
        verdict = 'ESCALATE_HITL';
        correctionDirective = {
          action_required: 'MAX_RETRIES_EXCEEDED_ESCALATE',
          defects_identified: [`Exceeded maximum retry limit of ${this.maxRetries} without reaching 100% test pass rate.`],
          target_files: (returnPackage.affected_files || []).map(f => f.path)
        };
      }
    }

    return this._buildEvaluation({
      missionId,
      taskId,
      authorRoleId,
      reviewerRoleId,
      retryCount,
      dimensions,
      verdict,
      correctionDirective,
      receipts: receiptHashes
    });
  }

  _buildEvaluation({ missionId, taskId, authorRoleId, reviewerRoleId, retryCount, dimensions, verdict, correctionDirective, receipts }) {
    const weights = {
      contract_fidelity: 0.20,
      technical_correctness: 0.30,
      evidence_quality: 0.15,
      security_compliance: 0.15,
      cost_efficiency: 0.05,
      reproducibility: 0.05,
      handoff_quality: 0.05,
      communication_clarity: 0.05
    };

    let overallScore = 0.0;
    for (const [dim, weight] of Object.entries(weights)) {
      overallScore += (dimensions[dim] || 0.0) * weight;
    }

    return {
      schema_version: '1.0.0',
      evaluation_id: `EVAL-${Date.now()}-${taskId.replace('TASK-', '')}`,
      mission_id: missionId,
      task_id: taskId,
      author_role_id: authorRoleId,
      reviewer_role_id: reviewerRoleId,
      retry_count: retryCount,
      max_retries: this.maxRetries,
      dimensions,
      overall_score: parseFloat(overallScore.toFixed(1)),
      verdict,
      correction_directive: correctionDirective,
      evidence_receipts: receipts.length > 0 ? receipts : [calculateSha256(JSON.stringify(dimensions))]
    };
  }
}
