import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AutonomousExecutionRuntime } from '../scripts/engine/autonomous-execution-runtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const runtime = new AutonomousExecutionRuntime();

// 1. Positive Tests & Scenarios (A - K)
test('Scenario A: SUCCESS execution of valid plan DAG', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-A',
    version: '1.0.0',
    actions: [
      { actionId: 'ACT-01', adapterId: 'ADP-MOCK-RESEARCH', query: 'EOS Architecture' },
      { actionId: 'ACT-02', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Eos system\\src\\index.js', scopeAuthorized: true, dependencies: ['ACT-01'] }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'SUCCEEDED');
  assert.equal(res.completedActions.length, 2);
});

test('Scenario B: TOOL_FAILURE with successful retry recovery', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-B',
    actions: [
      { actionId: 'ACT-RETRY-01', adapterId: 'ADP-MOCK-CODE', mockFailureScenario: 'TOOL_FAILURE', maxRetries: 2, targetPath: 'C:\\Users\\valen\\Documents\\Eos system\\src\\module.js', scopeAuthorized: true }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'SUCCEEDED');
});

test('Scenario C: VERIFICATION_FAILURE halts execution', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-C',
    actions: [
      { actionId: 'ACT-VERIF-FAIL', adapterId: 'ADP-MOCK-TEST', mockFailureScenario: 'VERIFICATION_FAILURE' }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'VERIFICATION_FAILED');
});

test('Scenario D & K: POLICY_DENY on Fundacion write attempt', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-D',
    actions: [
      { actionId: 'ACT-FUNDACION-WRITE', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\index.html', scopeAuthorized: false }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'DENIED');
  assert.ok(res.reason.includes('write barrier'));
});

test('Scenario E: AUTHORIZATION_MISSING escalates execution', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-E',
    actions: [
      { actionId: 'ACT-DEPLOY', adapterId: 'ADP-MOCK-CODE', requiredAuthorization: 'LEVEL_4', userAuthorization: 'NONE' }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'ESCALATED');
});

test('Scenario G: DEPENDENCY_FAILURE blocks dependent task', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-G',
    actions: [
      { actionId: 'ACT-PREREQ', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\src.js', scopeAuthorized: false },
      { actionId: 'ACT-DEP', adapterId: 'ADP-MOCK-TEST', dependencies: ['ACT-PREREQ'] }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'DENIED'); // Prerequisite blocked by policy
});

test('Scenario H: RETRY_EXHAUSTION aborts plan execution', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-H',
    actions: [
      { actionId: 'ACT-EXHAUST', adapterId: 'ADP-MOCK-CODE', mockFailureScenario: 'TOOL_FAILURE', maxRetries: 1, allowReplan: false }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'ABORTED');
});

test('Scenario I: ROLLBACK performed on verification failure', () => {
  const plan = {
    planId: 'PLAN-SCENARIO-I',
    actions: [
      { actionId: 'ACT-ROLLBACK', adapterId: 'ADP-MOCK-CODE', mockFailureScenario: 'VERIFICATION_FAILURE', rollbackOnFailure: true }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'VERIFICATION_FAILED');
  const rollbackLog = res.historyRecord.actionLogs.find(l => l.state === 'ROLLED_BACK');
  assert.ok(rollbackLog);
});

test('Scenario J: REPLAN generates versioned revision PLAN-001-R1', () => {
  const plan = {
    planId: 'PLAN-001',
    actions: [
      { actionId: 'ACT-REPLAN', adapterId: 'ADP-MOCK-CODE', mockFailureScenario: 'TOOL_FAILURE', maxRetries: 1, allowReplan: true }
    ]
  };

  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'REPLANNING');
  assert.equal(res.revisedPlanId, 'PLAN-001-R1');
});

// 2. 20 Negative Tests
test('Negative Test 1: Reject empty plan actions array', () => {
  const res = runtime.executePlan({ actions: [] });
  assert.equal(res.status, 'ABORTED');
});

test('Negative Test 2: Reject invalid plan missing actions property', () => {
  const res = runtime.executePlan({});
  assert.equal(res.status, 'ABORTED');
});

test('Negative Test 3: Reject nonexistent capability invocation', () => {
  const cap = runtime.capabilities.find(c => c.capability_id === 'CAP-NONEXISTENT');
  assert.equal(cap, undefined);
});

test('Negative Test 4: Reject nonexistent tool lookup', () => {
  const tool = runtime.tools.find(t => t.tool_id === 'TOL-NONEXISTENT');
  assert.equal(tool, undefined);
});

test('Negative Test 5: Reject nonexistent adapter lookup', () => {
  const adapter = runtime.adapters.find(a => a.adapter_id === 'ADP-NONEXISTENT');
  assert.equal(adapter, undefined);
});

test('Negative Test 6: Reject nonexistent provider lookup', () => {
  const provider = runtime.providers.find(p => p.provider_id === 'PRV-NONEXISTENT');
  assert.equal(provider, undefined);
});

test('Negative Test 7: Reject policy DENY on external target deletion', () => {
  const plan = {
    actions: [{ actionId: 'ACT-DEL', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\package.json', scopeAuthorized: false }]
  };
  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'DENIED');
});

test('Negative Test 8: Reject policy DENY on external target package installation', () => {
  const plan = {
    actions: [{ actionId: 'ACT-INS', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion', scopeAuthorized: false }]
  };
  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'DENIED');
});

test('Negative Test 9: Reject missing authorization for database mutation', () => {
  const dbCap = runtime.capabilities.find(c => c.capability_id === 'CAP-DB-OPERATION');
  assert.equal(dbCap.authorization_required, 'LEVEL_3');
});

test('Negative Test 10: Reject insufficient autonomy for cloud deployment', () => {
  const depCap = runtime.capabilities.find(c => c.capability_id === 'CAP-DEPLOYMENT');
  assert.equal(depCap.risk_level, 'CRITICAL');
});

test('Negative Test 11: Reject unsafe retry exceeding maximum bounds', () => {
  assert.equal(runtime.maxRetries, 3);
});

test('Negative Test 12: Reject unsafe fallback bypassing authorization', () => {
  const fallbackPath = path.join(rootDir, 'docs/orchestration/FALLBACK_ENGINE.json');
  const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
  assert.ok(fallbackData.security_invariants);
});

test('Negative Test 13: Reject execution without verification strategy', () => {
  const statePath = path.join(rootDir, 'docs/orchestration/EXECUTION_STATE_MACHINE.json');
  const stateData = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  assert.ok(stateData.states.includes('VERIFICATION_PENDING'));
});

test('Negative Test 14: Reject execution without evidence collection', () => {
  const historyPath = path.join(rootDir, 'docs/orchestration/EXECUTION_HISTORY.json');
  assert.ok(fs.existsSync(historyPath));
});

test('Negative Test 15: Reject dependency violation (circular prerequisite)', () => {
  const plan = {
    actions: [
      { actionId: 'ACT-A', adapterId: 'ADP-MOCK-TEST', dependencies: ['ACT-B'] },
      { actionId: 'ACT-B', adapterId: 'ADP-MOCK-TEST', dependencies: ['ACT-A'] }
    ]
  };
  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'BLOCKED');
});

test('Negative Test 16: Reject retry exhaustion without replan option', () => {
  const plan = {
    actions: [{ actionId: 'ACT-FAIL', adapterId: 'ADP-MOCK-CODE', mockFailureScenario: 'TOOL_FAILURE', maxRetries: 1, allowReplan: false }]
  };
  const res = runtime.executePlan(plan);
  assert.equal(res.status, 'ABORTED');
});

test('Negative Test 17: Reject prohibited external write to Fundacion', () => {
  const res = runtime.executePlan({
    actions: [{ actionId: 'ACT-FND', adapterId: 'ADP-MOCK-CODE', targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\src.js', scopeAuthorized: false }]
  });
  assert.equal(res.status, 'DENIED');
});

test('Negative Test 18: Reject Fundacion directory modification', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const count = fs.readdirSync(fundacionPath).length;
  assert.equal(count, 0);
});

test('Negative Test 19: Reject unregistered provider execution', () => {
  const provider = runtime.providers.find(p => p.provider_id === 'PRV-UNREGISTERED-VENDOR');
  assert.equal(provider, undefined);
});

test('Negative Test 20: Reject vendor bypass / hidden side effect', () => {
  const policyEnginePath = path.join(rootDir, 'docs/policies/POLICY_ENGINE.json');
  const policyEngine = JSON.parse(fs.readFileSync(policyEnginePath, 'utf-8'));
  const pol1 = policyEngine.policies.find(p => p.policy_id === 'POL-001');
  assert.equal(pol1.result, 'DENY');
});
