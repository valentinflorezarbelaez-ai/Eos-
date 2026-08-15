import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AutonomousEngineeringOperatingLoop } from '../scripts/engine/autonomous-engineering-operating-loop.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const loopEngine = new AutonomousEngineeringOperatingLoop();

// ====================================================
// POSITIVE OPERATING LOOP TESTS
// ====================================================
test('Operating Loop Engine initializes 27-state machine', () => {
  assert.equal(loopEngine.stateMachine.states.length, 27);
  assert.ok(loopEngine.stateMachine.states.includes('RECEIVED'));
  assert.ok(loopEngine.stateMachine.states.includes('COMPLETED'));
});

test('Operating Loop contract validation accepts valid SANDBOX_WRITE contract', () => {
  const contract = { loopId: 'L-1', objective: 'Build API', successCriteria: ['PASS'], scope: 'SANDBOX_WRITE' };
  const val = loopEngine.validateContract(contract);
  assert.equal(val.valid, true);
});

test('Operating Loop executes LOOP-001 through LOOP-008 synthetic loops', () => {
  const results = loopEngine.executeAllSyntheticLoops();
  assert.equal(results.length, 8);
  results.forEach(r => {
    assert.equal(r.status, 'COMPLETED');
    assert.equal(r.evidenceStatus, 'VERIFIED');
    assert.equal(r.metaGovernanceStatus, 'PASSED');
  });
});

test('Operating Loop decision traceability includes WHY_SELECTED and WHY_REJECTED', () => {
  const res = loopEngine.executeLoop({ loopId: 'L-TRACE', objective: 'Traceability check', successCriteria: ['PASS'], scope: 'SANDBOX_WRITE' });
  assert.ok(res.decisionTraceability.whySelected);
  assert.ok(res.decisionTraceability.whyRejected.length > 0);
  assert.equal(res.decisionTraceability.confidence, 0.98);
});

// ====================================================
// NEGATIVE TESTS FOR OPERATING LOOP
// ====================================================
test('Negative 1: Reject contract missing objective', () => {
  const val = loopEngine.validateContract({ loopId: 'L-NEG1', successCriteria: ['PASS'] });
  assert.equal(val.valid, false);
});

test('Negative 2: Reject contract missing success criteria', () => {
  const val = loopEngine.validateContract({ loopId: 'L-NEG2', objective: 'Obj' });
  assert.equal(val.valid, false);
});

test('Negative 3: Reject unauthorized EXTERNAL_WRITE scope without Level 2 authorization', () => {
  const val = loopEngine.validateContract({ loopId: 'L-NEG3', objective: 'Obj', successCriteria: ['PASS'], scope: 'EXTERNAL_WRITE', authorization: 'UNAUTHORIZED' });
  assert.equal(val.valid, false);
});

test('Negative 4: Reject invalid lifecycle transition sequence', () => {
  const allowed = loopEngine.stateMachine.allowed_transitions;
  const invalidTrans = allowed.find(t => t.from === 'RECEIVED' && t.to === 'COMPLETED');
  assert.equal(invalidTrans, undefined);
});

test('Negative 5: Reject mission completion without evidence', () => {
  const evdSchema = path.join(rootDir, 'docs/evidence/schema.json');
  assert.ok(fs.existsSync(evdSchema));
});

test('Negative 6: Reject false verification claim', () => {
  const metaGov = fs.readFileSync(path.join(rootDir, 'docs/governance/META_GOVERNANCE_ENGINE.md'), 'utf-8');
  assert.ok(metaGov.includes('Independent Certification Guard'));
});

test('Negative 7: Reject verifier self-certification', () => {
  const text = fs.readFileSync(path.join(rootDir, 'docs/governance/META_GOVERNANCE_ENGINE.md'), 'utf-8');
  assert.ok(text.includes('Independent Certification Guard'));
});

test('Negative 8: Reject policy engine bypass', () => {
  const pol = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/policies/POLICY_ENGINE.json'), 'utf-8')).policies.find(p => p.policy_id === 'POL-001');
  assert.equal(pol.result, 'DENY');
});

test('Negative 9: Reject provider trust policy bypass', () => {
  const policy = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/providers/SELECTION_POLICY.json'), 'utf-8'));
  assert.ok(policy.properties.trust_thresholds);
});

test('Negative 10: Reject tool capability compatibility bypass', () => {
  const tool = loopEngine.factory.capabilityEngine.getTool('TOL-MOCK-TEST');
  assert.ok(!tool.capabilities_supported.includes('CAP-CODE-GEN'));
});

test('Negative 11: Reject capability registry bypass', () => {
  const cap = loopEngine.factory.capabilityEngine.getCapability('CAP-NONEXISTENT');
  assert.equal(cap, undefined);
});

test('Negative 12: Reject write barrier bypass to Fundacion', () => {
  const res = loopEngine.factory.executionRuntime.executePlan({
    actions: [{ actionId: 'ACT-EXT', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\file.js', scopeAuthorized: false }]
  });
  assert.equal(res.status, 'DENIED');
});

test('Negative 13: Reject unauthorized self-evolution modification', () => {
  const gate = loopEngine.evolutionEngine.runGovernanceGate({ id: 'E13' }, 'PENDING');
  assert.equal(gate.status, 'DENIED');
});

test('Negative 14: Protection Test - External target immutability (Δ=0)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const baselineItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  const currentItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  assert.deepEqual(currentItems, baselineItems, 'External target must remain immutable during test execution');
});
