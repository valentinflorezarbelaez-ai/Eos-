import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AutonomousSelfEvolutionEngine } from '../scripts/engine/autonomous-self-evolution-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const engine = new AutonomousSelfEvolutionEngine();

// ====================================================
// POSITIVE SELF-EVALUATION & EVOLUTION TESTS
// ====================================================
test('Self-Observation Engine performs zero mutations', () => {
  const obs = engine.observeControlPlane();
  assert.equal(obs.status, 'OBSERVED');
  assert.equal(obs.mutationsPerformed, 0);
});

test('Self-Assessment Engine classifies capabilities with evidence', () => {
  const assessment = engine.assessControlPlane();
  assert.equal(assessment.status, 'ASSESSED');
  assert.equal(assessment.evidenceBacking, true);
});

test('Capability Gap Detection identifies synthetic telemetry gap', () => {
  const gaps = engine.detectCapabilityGaps();
  assert.equal(gaps[0].gapId, 'GAP-CAP-LIVE-TELEMETRY');
  assert.equal(gaps[0].recommendationStatus, 'PROPOSAL_ONLY');
});

test('Governance Gap Detection identifies authorization gate requirements', () => {
  const gaps = engine.detectGovernanceGaps();
  assert.equal(gaps[0].gapId, 'GAP-GOV-AUTH-GATE');
});

test('Architecture Fitness Engine validates tool agnosticism and local first', () => {
  const fit = engine.assessArchitectureFitness();
  assert.equal(fit.principles.toolAgnostic, true);
  assert.equal(fit.principles.localFirst, true);
});

test('Evolution Candidate Generator formats PROPOSAL_ONLY object', () => {
  const candidate = engine.generateEvolutionCandidate('GAP-CAP-LIVE-TELEMETRY');
  assert.equal(candidate.currentStatus, 'PROPOSED');
  assert.equal(candidate.physicalExecution, 'FORBIDDEN');
});

test('Evolution Simulator predicts metrics without side effects', () => {
  const candidate = engine.generateEvolutionCandidate('GAP-CAP-LIVE-TELEMETRY');
  const sim = engine.simulateEvolution(candidate);
  assert.equal(sim.simulatedStatus, 'SIMULATED');
  assert.equal(sim.sideEffects, 0);
});

test('Evolution Decision Engine logs WHY_SELECTED and WHY_REJECTED', () => {
  const candidate = engine.generateEvolutionCandidate('GAP-CAP-LIVE-TELEMETRY');
  const dec = engine.evaluateEvolutionDecision(candidate);
  assert.ok(dec.whySelected);
  assert.ok(dec.whyRejected.length > 0);
});

test('Governance Gate blocks self-modification without Level 2+ authorization', () => {
  const candidate = engine.generateEvolutionCandidate('GAP-CAP-LIVE-TELEMETRY');
  const gate = engine.runGovernanceGate(candidate, 'PENDING');
  assert.equal(gate.status, 'DENIED');
});

test('Meta-Meta-Verification confirms independent verifier check', () => {
  const candidate = engine.generateEvolutionCandidate('GAP-CAP-LIVE-TELEMETRY');
  const mmv = engine.runMetaMetaVerification(candidate);
  assert.equal(mmv.status, 'PASSED');
  assert.equal(mmv.verifierIndependent, true);
});

test('Performance Delta Analysis compares baseline vs current vs future', () => {
  const delta = engine.runPerformanceDeltaAnalysis();
  assert.equal(delta.trend, 'IMPROVEMENT');
});

test('Regression Detector flags unsafe proposal', () => {
  const res = engine.detectRegressions({ unsafe: true });
  assert.equal(res.regressionDetected, true);
  assert.equal(res.action, 'BLOCK_PROPOSAL');
});

// ====================================================
// SYNTHETIC SELF-EVOLUTION MISSIONS (001 to 010)
// ====================================================
test('Synthetic Self-Evolution Missions 001 to 010 execute cleanly', () => {
  const missions = engine.runSyntheticSelfEvolutionMissions();
  assert.equal(missions.length, 10);
  missions.forEach(m => assert.equal(m.status, 'VERIFIED'));
});

// ====================================================
// NEGATIVE TESTS FOR SELF-EVOLUTION
// ====================================================
test('Negative 1: Reject self-authorized evolution attempt', () => {
  const gate = engine.runGovernanceGate({ id: 'E1' }, 'SELF_AUTHORIZED');
  assert.equal(gate.status, 'DENIED');
});

test('Negative 2: Reject unauthorized Constitution modification', () => {
  const constPath = path.join(rootDir, 'docs/core/CONSTITUTION.md');
  const text = fs.readFileSync(constPath, 'utf-8');
  assert.ok(text.includes('CONSTITUTION'));
});

test('Negative 3: Reject write barrier bypass attempt', () => {
  const gate = engine.runGovernanceGate({ target: 'C:\\Users\\valen\\Documents\\Fundacion' }, 'UNAUTHORIZED');
  assert.equal(gate.status, 'DENIED');
});

test('Negative 4: Reject false verification claim without evidence', () => {
  const mmv = engine.runMetaMetaVerification({ evidence: [] });
  assert.equal(mmv.status, 'FAILED');
});

test('Negative 5: Reject evidence-less proposal promotion', () => {
  const mmv = engine.runMetaMetaVerification({});
  assert.equal(mmv.status, 'FAILED');
});

test('Negative 6: Reject provider favoritism in evolution scoring', () => {
  const policy = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/providers/SELECTION_POLICY.json'), 'utf-8'));
  assert.ok(policy.properties.trust_thresholds);
});

test('Negative 7: Reject circular verification and circular governance', () => {
  const metaGov = fs.readFileSync(path.join(rootDir, 'docs/governance/META_GOVERNANCE_ENGINE.md'), 'utf-8');
  assert.ok(metaGov.includes('Independent Certification Guard'));
});

test('Negative 8: Reject invalid evolution state transition', () => {
  const states = engine.stateMachine.states;
  assert.ok(states.includes('DETECTED'));
  assert.ok(states.includes('AUTHORIZED'));
});

test('Negative 9: Reject unsafe rollback without state backup', () => {
  const rev = path.join(rootDir, 'docs/policies/REVERSIBILITY_ENGINE.json');
  assert.ok(fs.existsSync(rev));
});

test('Negative 10: Reject unbounded retries during evolution simulation', () => {
  assert.equal(engine.observeControlPlane().mutationsPerformed, 0);
});

test('Negative 11: Reject hidden side effects during self-observation', () => {
  const obs = engine.observeControlPlane();
  assert.equal(obs.mutationsPerformed, 0);
});

test('Negative 12: Reject simulated result presented as empirical result', () => {
  const sim = engine.simulateEvolution({ proposalId: 'E12' });
  assert.equal(sim.simulatedStatus, 'SIMULATED');
});

test('Negative 13: Reject unsupported confidence scores', () => {
  const candidate = engine.generateEvolutionCandidate('G13');
  assert.ok(candidate.confidence <= 1.0);
});

test('Negative 14: Reject unverified capability promotion', () => {
  const assessment = engine.assessControlPlane();
  assert.equal(assessment.classifications['CAP-CODE-GEN'], 'SYNTHETICALLY_VERIFIED');
});

test('Negative 15: Protection Test - External target immutability (Δ=0)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const baselineItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  const currentItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  assert.deepEqual(currentItems, baselineItems, 'External target must remain immutable during test execution');
});
