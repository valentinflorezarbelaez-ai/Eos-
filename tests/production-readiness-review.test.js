import test from 'node:test';
import assert from 'node:assert/strict';
import { ProductionReadinessReviewEngine } from '../scripts/engine/production-readiness-review.js';

// ====================================================
// EOS PRODUCTION READINESS REVIEW TESTS (PRR-001)
// ====================================================

const engine = new ProductionReadinessReviewEngine();

test('Package A (Security): Validates zero unauthorized writes, secret isolation, and supply chain bounds', () => {
  const res = engine.evaluatePackageA_Security();

  assert.equal(res.authorityBoundaries.unauthorizedWritesPermitted, 0);
  assert.equal(res.secretIsolation.secretsExposedCount, 0);
  assert.equal(res.mcpSupplyChain.sandboxed, true);
  assert.equal(res.verdict, 'PACKAGE_A_SECURITY_PASSED');
});

test('Package B (Reliability): Enforces strict denominators on success, incidents, and BKM retention', () => {
  const res = engine.evaluatePackageB_Reliability();

  assert.equal(res.missionSuccessRate.successes, 200);
  assert.equal(res.missionSuccessRate.total, 200);
  assert.equal(res.criticalIncidents.denominator, '0/200 missions');
  assert.equal(res.bkmRetention.retained, 48);
  assert.equal(res.bkmRetention.total, 48);
  assert.equal(res.bkmRetention.ratePct, 100.0);
  assert.equal(res.verdict, 'PACKAGE_B_RELIABILITY_PASSED');
});

test('Package C & D (User Value & Economics): Validates 98% task completion and 97.1% cost efficiency', () => {
  const userVal = engine.evaluatePackageC_UserValue();
  const econ = engine.evaluatePackageD_Economics();

  assert.equal(userVal.taskCompletionRate.successes, 196);
  assert.equal(userVal.taskCompletionRate.total, 200);
  assert.equal(userVal.accessibilityWcagAaCompliance.ratePct, 100.0);
  assert.equal(econ.costReductionVsConventionalPct, 97.1);
  assert.equal(econ.humanInterventionsRatio.ratio, 0.1);
});

test('Package E (Governance): Keeps GAP-002 strictly UNKNOWN and GATE-13 strictly CLOSED', () => {
  const res = engine.evaluatePackageE_Governance();

  assert.equal(res.fundacionGap002.state, 'UNKNOWN');
  assert.equal(res.gate13ProductionAutonomy.state, 'STRICTLY_CLOSED');
  assert.equal(res.verdict, 'PACKAGE_E_GOVERNANCE_PASSED_INVARIANTS_PROTECTED');
});

test('Autonomy Matrix: Calibrates operational autonomy strictly by risk tier', () => {
  const matrix = engine.determineGraduatedAutonomyMatrix();

  assert.equal(matrix.LOW_RISK.mode, 'AUTONOMOUS');
  assert.equal(matrix.MEDIUM_RISK.mode, 'AUTONOMOUS_WITH_ASYNC_AUDIT');
  assert.equal(matrix.HIGH_RISK.mode, 'HUMAN_APPROVAL_REQUIRED');
  assert.equal(matrix.CRITICAL_RISK.mode, 'STRICTLY_HUMAN_CONTROLLED');
});

test('PRR-001 Full Review: Concludes GO_WITH_RESTRICTIONS protecting all constitutional gates', () => {
  const fullReview = engine.executeProductionReadinessReview();

  assert.equal(fullReview.reviewVerdict, 'GO_WITH_RESTRICTIONS');
  assert.equal(fullReview.gate13Status, 'STRICTLY_CLOSED');
  assert.equal(fullReview.gap002Status, 'UNKNOWN');
  assert.ok(fullReview.executiveSummary.includes('GO_WITH_RESTRICTIONS'));
});
