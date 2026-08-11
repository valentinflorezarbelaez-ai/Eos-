import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ProductionReadinessReviewEngine } from '../scripts/engine/production-readiness-review.js';
import { ReleaseDecisionEngine } from '../scripts/engine/release-decision-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const reviewEngine = new ProductionReadinessReviewEngine();
const decisionEngine = new ReleaseDecisionEngine();

// ====================================================
// POSITIVE RELEASE GOVERNANCE TESTS
// ====================================================
test('Production Readiness Review Engine evaluates 13 release gates', () => {
  const context = { releaseId: 'REL-PASS', testPassed: true, securityVerified: true, evidenceRefs: ['EVD-0019.json'] };
  const res = reviewEngine.evaluateReadiness(context);
  assert.equal(res.decision, 'APPROVE');
  assert.equal(res.gates.length, 13);
  assert.equal(res.verifierIndependent, true);
});

test('Release Decision Engine produces auditable rationale on APPROVE', () => {
  const context = { releaseId: 'REL-AUDIT', testPassed: true, securityVerified: true, evidenceRefs: ['EVD-0019.json'] };
  const dec = decisionEngine.evaluateReleaseDecision(context);
  assert.equal(dec.decision, 'APPROVE');
  assert.ok(dec.whyApproved);
  assert.equal(dec.confidence, 0.99);
});

test('Execution of 10 Proving Missions (PROVING-001 to PROVING-010)', () => {
  const results = reviewEngine.runAllProvingMissions();
  assert.equal(results.length, 10);
  results.forEach(r => assert.equal(r.verifierIndependent, true));
});

// ====================================================
// 15 CONTROLLED FAILURE SCENARIOS & NEGATIVE TESTS
// ====================================================
test('RELEASE_FAILURE_001: Missing requirements blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R1' }, { failureScenario: 'RELEASE_FAILURE_001' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_002: Incomplete specification blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R2' }, { failureScenario: 'RELEASE_FAILURE_002' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_003: Architecture risk rejects release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R3' }, { failureScenario: 'RELEASE_FAILURE_003' });
  assert.equal(dec.decision, 'REJECT');
});

test('RELEASE_FAILURE_004: Security vulnerability rejects release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R4' }, { failureScenario: 'RELEASE_FAILURE_004' });
  assert.equal(dec.decision, 'REJECT');
});

test('RELEASE_FAILURE_005: Insufficient tests blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R5' }, { failureScenario: 'RELEASE_FAILURE_005' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_006: Performance regression requires remediation', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R6' }, { failureScenario: 'RELEASE_FAILURE_006' });
  assert.equal(dec.decision, 'REMEDIATE');
});

test('RELEASE_FAILURE_007: Accessibility regression requires remediation', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R7' }, { failureScenario: 'RELEASE_FAILURE_007' });
  assert.equal(dec.decision, 'REMEDIATE');
});

test('RELEASE_FAILURE_008: Missing observability blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R8' }, { failureScenario: 'RELEASE_FAILURE_008' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_009: Missing rollback blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R9' }, { failureScenario: 'RELEASE_FAILURE_009' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_010: Insufficient evidence blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R10' }, { failureScenario: 'RELEASE_FAILURE_010' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_011: Contradictory evidence blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R11' }, { failureScenario: 'RELEASE_FAILURE_011' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_012: Unauthorized release blocks release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R12' }, { failureScenario: 'RELEASE_FAILURE_012' });
  assert.equal(dec.decision, 'BLOCK');
});

test('RELEASE_FAILURE_013: False readiness claim rejects release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R13' }, { failureScenario: 'RELEASE_FAILURE_013' });
  assert.equal(dec.decision, 'REJECT');
});

test('RELEASE_FAILURE_014: Verifier self-certification rejects release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R14' }, { failureScenario: 'RELEASE_FAILURE_014' });
  assert.equal(dec.decision, 'REJECT');
});

test('RELEASE_FAILURE_015: Governance bypass attempt rejects release', () => {
  const dec = decisionEngine.evaluateReleaseDecision({ releaseId: 'R15' }, { failureScenario: 'RELEASE_FAILURE_015' });
  assert.equal(dec.decision, 'REJECT');
});

test('Negative 16: Protection Test - Mandatory Fundacion isolation (0 items)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const contents = fs.readdirSync(fundacionPath);
  assert.equal(contents.length, 0);
});
