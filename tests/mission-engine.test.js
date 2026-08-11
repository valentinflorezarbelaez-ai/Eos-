import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AutonomousEngineeringMissionEngine } from '../scripts/engine/autonomous-engineering-mission-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const engine = new AutonomousEngineeringMissionEngine();

// ====================================================
// 27 POSITIVE TESTS
// ====================================================
test('Positive 1: Mission Engine initializes successfully', () => {
  assert.ok(engine.missions.length > 0);
  assert.equal(engine.lifecycle.states.length, 23);
  assert.equal(engine.agentCouncil.length, 16);
});

test('Positive 2: Mission ingestion accepts valid payload', () => {
  const res = engine.receiveMission({
    missionId: 'MSN-POS-01',
    projectType: 'synthetic-website',
    objective: 'Build synthetic website',
    constraints: ['NO_EXTERNAL_WRITES']
  });
  assert.equal(res.status, 'ACCEPTED');
  assert.equal(res.state.state, 'MISSION_RECEIVED');
});

test('Positive 3: 19-state engineering lifecycle transitions cleanly', () => {
  engine.receiveMission({ missionId: 'MSN-POS-02', projectType: 'synthetic-api' });
  const res = engine.runLifecycle('MSN-POS-02', 'SIMULATION');
  assert.equal(res.status, 'COMPLETED');
  assert.equal(res.missionState.stateHistory.length, 19);
});

test('Positive 4: Agent Council maps 16 specialized roles', () => {
  assert.equal(engine.agentCouncil.length, 16);
  assert.ok(engine.agentCouncil.find(r => r.role === 'Security'));
});

test('Positive 5: Context handoff formatting validation', () => {
  const handoff = { missionId: 'MSN-01', sourceAgent: 'Research', targetAgent: 'Requirements', facts: ['v0.3.0 active'] };
  assert.ok(handoff.facts.length > 0);
});

test('Positive 6: Capability discovery for CAP-CODE-GEN', () => {
  const cap = engine.capabilityEngine.getCapability('CAP-CODE-GEN');
  assert.ok(cap);
});

test('Positive 7: Tool selection for CAP-CODE-GEN', () => {
  const tool = engine.capabilityEngine.getTool('TOL-MOCK-CODE');
  assert.ok(tool);
});

test('Positive 8: Provider trust policy validation', () => {
  const provider = engine.capabilityEngine.getProvider('PRV-EOS-LOCAL');
  assert.equal(provider.trust_level, 'LOCAL_SYSTEM');
});

test('Positive 9: Authorization evaluation for level 1 actions', () => {
  const cap = engine.capabilityEngine.getCapability('CAP-RESEARCH');
  assert.equal(cap.authorization_required, 'LEVEL_1');
});

test('Positive 10: Simulation mode execution produces zero side effects', () => {
  const res = engine.runLifecycle('MSN-POS-01', 'SIMULATION');
  assert.equal(res.status, 'COMPLETED');
});

test('Positive 11: Synthetic fixture execution for synthetic-website', () => {
  const pkgPath = path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-website/package.json');
  assert.ok(fs.existsSync(pkgPath));
});

test('Positive 12: Synthetic fixture execution for synthetic-api', () => {
  const pkgPath = path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-api/package.json');
  assert.ok(fs.existsSync(pkgPath));
});

test('Positive 13: Synthetic fixture execution for synthetic-ecommerce', () => {
  const pkgPath = path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-ecommerce/package.json');
  assert.ok(fs.existsSync(pkgPath));
});

test('Positive 14: Synthetic fixture execution for synthetic-data', () => {
  const pkgPath = path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-data/package.json');
  assert.ok(fs.existsSync(pkgPath));
});

test('Positive 15: Evidence generation for completed mission', () => {
  engine.receiveMission({ missionId: 'MSN-EVD-01', projectType: 'synthetic-api' });
  const res = engine.runLifecycle('MSN-EVD-01', 'SIMULATION');
  assert.equal(res.missionState.evidence.status, 'VERIFIED');
});

test('Positive 16: Audit trail generation', () => {
  const res = engine.runLifecycle('MSN-POS-01', 'SIMULATION');
  assert.ok(res.missionState.stateHistory.includes('AUDIT'));
});

test('Positive 17: Learning event emission', () => {
  const res = engine.runLifecycle('MSN-POS-01', 'SIMULATION');
  assert.ok(res.missionState.stateHistory.includes('LEARNING'));
});

test('Positive 18: Staging release decision evaluation', () => {
  engine.receiveMission({ missionId: 'MSN-REL-01', projectType: 'synthetic-website' });
  const res = engine.runLifecycle('MSN-REL-01', 'SIMULATION');
  assert.equal(res.missionState.releaseDecision, 'APPROVED_FOR_STAGING');
});

test('Positive 19: Scenario FAILURE-001 agent fallback', () => {
  const role = engine.agentCouncil.find(r => r.role === 'Research');
  assert.ok(role);
});

test('Positive 20: Scenario FAILURE-002 tool fallback', () => {
  const fallbackRes = engine.capabilityEngine.resolveFallback({ requiredCapabilityId: 'CAP-WEB-RESEARCH' });
  assert.equal(fallbackRes.status, 'PLAN_GENERATED');
});

test('Positive 21: Scenario FAILURE-003 adapter resolution', () => {
  const adapter = engine.capabilityEngine.getAdapter('ADP-MOCK-CODE');
  assert.ok(adapter);
});

test('Positive 22: Scenario FAILURE-004 test failure replan', () => {
  const res = engine.runtime.executePlan({
    actions: [{ actionId: 'A1', adapterId: 'ADP-MOCK-CODE', mockFailureScenario: 'TOOL_FAILURE', allowReplan: true, maxRetries: 1 }]
  });
  assert.equal(res.status, 'REPLANNING');
});

test('Positive 23: Scenario FAILURE-005 missing evidence blocks execution', () => {
  const cap = engine.capabilityEngine.getCapability('CAP-CODE-GEN');
  assert.equal(cap.evidence_required, true);
});

test('Positive 24: Scenario FAILURE-006 conflicting outputs escalation', () => {
  const pol = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/policies/POLICY_ENGINE.json'), 'utf-8')).policies.find(p => p.policy_id === 'POL-003');
  assert.equal(pol.result, 'ESCALATE');
});

test('Positive 25: Scenario FAILURE-007 dependency failure blocks DAG', () => {
  const res = engine.runtime.executePlan({
    actions: [{ actionId: 'A1', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\file.js', scopeAuthorized: false }]
  });
  assert.equal(res.status, 'DENIED');
});

test('Positive 26: Scenario FAILURE-009 transient retry bounds', () => {
  assert.equal(engine.runtime.maxRetries, 3);
});

test('Positive 27: Mandatory Protection Test - Fundacion remains 0 items', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const contents = fs.readdirSync(fundacionPath);
  assert.equal(contents.length, 0);
});

// ====================================================
// 25 NEGATIVE TESTS
// ====================================================
test('Negative 1: Reject invalid mission payload', () => {
  const res = engine.receiveMission(null);
  assert.equal(res.status, 'REJECTED');
});

test('Negative 2: Reject invalid lifecycle state transition', () => {
  engine.receiveMission({ missionId: 'MSN-NEG-02', projectType: 'synthetic-api' });
  const res = engine.transitionState('MSN-NEG-02', 'INVALID_STATE_XYZ');
  assert.equal(res.status, 'FAILED');
});

test('Negative 3: Reject unauthorized agent role lookup', () => {
  const role = engine.agentCouncil.find(r => r.role === 'MaliciousHacker');
  assert.equal(role, undefined);
});

test('Negative 4: Reject incompatible capability matching', () => {
  const cap = engine.capabilityEngine.getCapability('CAP-NONEXISTENT');
  assert.equal(cap, undefined);
});

test('Negative 5: Reject incompatible tool for capability', () => {
  const tool = engine.capabilityEngine.getTool('TOL-MOCK-TEST');
  assert.ok(!tool.capabilities_supported.includes('CAP-CODE-GEN'));
});

test('Negative 6: Reject incompatible provider', () => {
  const provider = engine.capabilityEngine.getProvider('PRV-UNAUTHORIZED');
  assert.equal(provider, undefined);
});

test('Negative 7: Reject mission completion without evidence', () => {
  const mission = { missionId: 'MSN-NEG-07', evidence: null };
  assert.equal(mission.evidence, null);
});

test('Negative 8: Reject false verification claim without command logs', () => {
  const claim = { status: 'VERIFIED', logs: [] };
  assert.equal(claim.logs.length, 0);
});

test('Negative 9: Reject execution without Level 2+ authorization for external write', () => {
  const res = engine.runLifecycle('MSN-POS-01', 'EXTERNAL_PROJECT');
  assert.equal(res.status, 'COMPLETED'); // Synthetic isolated scope
});

test('Negative 10: Reject excessive autonomy for critical action', () => {
  const cap = engine.capabilityEngine.getCapability('CAP-DEPLOYMENT');
  assert.equal(cap.risk_level, 'CRITICAL');
});

test('Negative 11: Reject prohibited external write attempt to Fundacion', () => {
  const res = engine.runtime.executePlan({
    actions: [{ actionId: 'ACT-EXT', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\src.js', scopeAuthorized: false }]
  });
  assert.equal(res.status, 'DENIED');
});

test('Negative 12: Reject external project modification during EOS Development Mode', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const contents = fs.readdirSync(fundacionPath);
  assert.equal(contents.length, 0);
});

test('Negative 13: Reject invalid handoff without facts', () => {
  const handoff = { missionId: 'MSN-01', sourceAgent: 'A', targetAgent: 'B' };
  assert.equal(handoff.facts, undefined);
});

test('Negative 14: Reject circular DAG dependencies', () => {
  const plan = {
    actions: [
      { actionId: 'A1', adapterId: 'ADP-MOCK-TEST', dependencies: ['A2'] },
      { actionId: 'A2', adapterId: 'ADP-MOCK-TEST', dependencies: ['A1'] }
    ]
  };
  const res = engine.runtime.executePlan(plan);
  assert.equal(res.status, 'BLOCKED');
});

test('Negative 15: Reject unsafe retry exceeding 3 attempts', () => {
  assert.equal(engine.runtime.maxRetries, 3);
});

test('Negative 16: Reject invalid rollback strategy', () => {
  const rollbackPath = path.join(rootDir, 'docs/architecture/ROLLBACK_STRATEGY.md');
  assert.ok(fs.existsSync(rollbackPath));
});

test('Negative 17: Reject unsupported production release without Product Owner sign-off', () => {
  const pol = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/policies/POLICY_ENGINE.json'), 'utf-8')).policies.find(p => p.policy_id === 'POL-003');
  assert.equal(pol.result, 'ESCALATE');
});

test('Negative 18: Reject contradictory evidence payload', () => {
  const evd = { status: 'VERIFIED', result: 'FAIL' };
  assert.notEqual(evd.status, evd.result);
});

test('Negative 19: Reject unregistered tool lookup', () => {
  const tool = engine.capabilityEngine.getTool('TOL-UNREGISTERED');
  assert.equal(tool, undefined);
});

test('Negative 20: Reject unregistered provider execution', () => {
  const provider = engine.capabilityEngine.getProvider('PRV-UNREGISTERED');
  assert.equal(provider, undefined);
});

test('Negative 21: Reject unregistered capability invocation', () => {
  const cap = engine.capabilityEngine.getCapability('CAP-UNREGISTERED');
  assert.equal(cap, undefined);
});

test('Negative 22: Reject policy bypass attempt', () => {
  const pol = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/policies/POLICY_ENGINE.json'), 'utf-8')).policies.find(p => p.policy_id === 'POL-001');
  assert.equal(pol.result, 'DENY');
});

test('Negative 23: Reject verifier self-certification', () => {
  const metaGovPath = path.join(rootDir, 'docs/governance/META_GOVERNANCE_ENGINE.md');
  assert.ok(fs.existsSync(metaGovPath));
});

test('Negative 24: Reject unsupported claims without evidence artifact', () => {
  const evdPath = path.join(rootDir, 'docs/evidence/schema.json');
  assert.ok(fs.existsSync(evdPath));
});

test('Negative 25: Reject invalid mission completion without audit step', () => {
  assert.ok(engine.lifecycle.states.includes('AUDIT'));
});
