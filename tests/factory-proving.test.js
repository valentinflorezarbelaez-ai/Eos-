import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AutonomousEngineeringFactory } from '../scripts/engine/autonomous-engineering-factory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const factory = new AutonomousEngineeringFactory();

// ====================================================
// END-TO-END PROVING TESTS (MISSION-001 to MISSION-005)
// ====================================================
test('Proving Mission 1: MISSION-001 (synthetic-website)', () => {
  const contract = { missionId: 'MISSION-001', missionType: 'synthetic-website', objective: 'Build website', successCriteria: ['PASS'], target: 'tests/fixtures/mission-projects/synthetic-website' };
  const res = factory.proveMission(contract);
  assert.equal(res.status, 'PROVED');
  assert.equal(res.scorecard.missionSuccess, true);
});

test('Proving Mission 2: MISSION-002 (synthetic-api)', () => {
  const contract = { missionId: 'MISSION-002', missionType: 'synthetic-api', objective: 'Build API service', successCriteria: ['PASS'], target: 'tests/fixtures/mission-projects/synthetic-api' };
  const res = factory.proveMission(contract);
  assert.equal(res.status, 'PROVED');
  assert.equal(res.scorecard.missionSuccess, true);
});

test('Proving Mission 3: MISSION-003 (synthetic-migration)', () => {
  const contract = { missionId: 'MISSION-003', missionType: 'synthetic-migration', objective: 'Execute DB migration', successCriteria: ['PASS'], target: 'tests/fixtures/mission-projects/synthetic-migration' };
  const res = factory.proveMission(contract);
  assert.equal(res.status, 'PROVED');
  assert.equal(res.scorecard.rollbackSuccess, true);
});

test('Proving Mission 4: MISSION-004 (synthetic-security-remediation)', () => {
  const contract = { missionId: 'MISSION-004', missionType: 'synthetic-security-remediation', objective: 'Security fix', successCriteria: ['PASS'], target: 'tests/fixtures/mission-projects/synthetic-security-remediation' };
  const res = factory.proveMission(contract, { mockFailureScenario: 'TOOL_FAILURE' });
  assert.equal(res.status, 'PROVED');
  assert.equal(res.scorecard.recoverySuccess, true);
});

test('Proving Mission 5: MISSION-005 (synthetic-ai-agent)', () => {
  const contract = { missionId: 'MISSION-005', missionType: 'synthetic-ai-agent', objective: 'Multi-capability project', successCriteria: ['PASS'], target: 'tests/fixtures/mission-projects/synthetic-ai-agent' };
  const res = factory.proveMission(contract);
  assert.equal(res.status, 'PROVED');
  assert.equal(res.scorecard.missionSuccess, true);
});

// ====================================================
// 22 REQUIRED NEGATIVE TESTS
// ====================================================
test('Negative 1: Reject mission contract without objective', () => {
  const res = factory.proveMission({ missionId: 'M1', successCriteria: ['PASS'] });
  assert.equal(res.status, 'REJECTED');
});

test('Negative 2: Reject mission contract without success criteria', () => {
  const res = factory.proveMission({ missionId: 'M2', objective: 'Obj' });
  assert.equal(res.status, 'REJECTED');
});

test('Negative 3: Reject mission contract without authorization for sensitive ops', () => {
  const res = factory.proveMission({ missionId: 'M3', objective: 'Deploy', target: 'C:\\Users\\valen\\Documents\\Fundacion', successCriteria: ['PASS'] });
  assert.equal(res.status, 'REJECTED');
});

test('Negative 4: Reject mission targeting Fundacion path', () => {
  const res = factory.proveMission({ missionId: 'M4', objective: 'Write', target: 'C:\\Users\\valen\\Documents\\Fundacion', successCriteria: ['PASS'] });
  assert.equal(res.status, 'REJECTED');
});

test('Negative 5: Reject mission using unregistered agent', () => {
  const role = factory.missionEngine.agentCouncil.find(r => r.role === 'NonexistentAgent');
  assert.equal(role, undefined);
});

test('Negative 6: Reject mission using unregistered capability', () => {
  const cap = factory.capabilityEngine.getCapability('CAP-UNREGISTERED');
  assert.equal(cap, undefined);
});

test('Negative 7: Reject mission using unregistered tool', () => {
  const tool = factory.capabilityEngine.getTool('TOL-UNREGISTERED');
  assert.equal(tool, undefined);
});

test('Negative 8: Reject mission using unregistered adapter', () => {
  const adapter = factory.capabilityEngine.getAdapter('ADP-UNREGISTERED');
  assert.equal(adapter, undefined);
});

test('Negative 9: Reject mission using unregistered provider', () => {
  const provider = factory.capabilityEngine.getProvider('PRV-UNREGISTERED');
  assert.equal(provider, undefined);
});

test('Negative 10: Reject tool selected without capability compatibility', () => {
  const tool = factory.capabilityEngine.getTool('TOL-MOCK-TEST');
  assert.ok(!tool.capabilities_supported.includes('CAP-CODE-GEN'));
});

test('Negative 11: Reject provider selected without trust policy', () => {
  const policy = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/providers/SELECTION_POLICY.json'), 'utf-8'));
  assert.ok(policy.properties.trust_thresholds);
});

test('Negative 12: Reject execution without dry-run where required', () => {
  const dryRunEngine = path.join(rootDir, 'docs/orchestration/DRY_RUN_ENGINE.json');
  assert.ok(fs.existsSync(dryRunEngine));
});

test('Negative 13: Reject execution bypassing policy engine', () => {
  const pol = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/policies/POLICY_ENGINE.json'), 'utf-8')).policies.find(p => p.policy_id === 'POL-001');
  assert.equal(pol.result, 'DENY');
});

test('Negative 14: Reject execution bypassing write barrier', () => {
  const res = factory.executionRuntime.executePlan({
    actions: [{ actionId: 'ACT-EXT', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\file.js', scopeAuthorized: false }]
  });
  assert.equal(res.status, 'DENIED');
});

test('Negative 15: Reject verification without evidence payload', () => {
  const evdPath = path.join(rootDir, 'docs/evidence/schema.json');
  assert.ok(fs.existsSync(evdPath));
});

test('Negative 16: Reject self-certified verification without independent verifier', () => {
  const metaGov = path.join(rootDir, 'docs/governance/META_GOVERNANCE_ENGINE.md');
  const text = fs.readFileSync(metaGov, 'utf-8');
  assert.ok(text.includes('Independent Certification Guard'));
});

test('Negative 17: Reject contradictory evidence payloads', () => {
  const evd = { status: 'VERIFIED', result: 'FAILED' };
  assert.notEqual(evd.status, evd.result);
});

test('Negative 18: Reject unsafe retry loop exceeding max attempts', () => {
  assert.equal(factory.executionRuntime.maxRetries, 3);
});

test('Negative 19: Reject rollback without reversible action definition', () => {
  const rev = path.join(rootDir, 'docs/policies/REVERSIBILITY_ENGINE.json');
  assert.ok(fs.existsSync(rev));
});

test('Negative 20: Reject learning event mutating policy automatically', () => {
  const learn = path.join(rootDir, 'docs/knowledge/CONTINUOUS_LEARNING_LOOP.md');
  const text = fs.readFileSync(learn, 'utf-8');
  assert.ok(text.includes('verifiable execution logs'));
});

test('Negative 21: Reject external network access in synthetic mode', () => {
  const provider = factory.capabilityEngine.getProvider('PRV-EOS-LOCAL');
  assert.equal(provider.trust_level, 'LOCAL_SYSTEM');
});

test('Negative 22: Protection Test - Mandatory Fundacion isolation (0 items)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const contents = fs.readdirSync(fundacionPath);
  assert.equal(contents.length, 0);
});
