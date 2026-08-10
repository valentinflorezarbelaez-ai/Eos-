import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper functions for factory governance validation
function validateTaskExecution(task, plan) {
  if (!plan || !plan.plan_id) return { valid: false, reason: 'Task execution without plan' };
  if (!task.evidence_requirements || task.evidence_requirements.length === 0) return { valid: false, reason: 'Task completion without evidence' };
  return { valid: true };
}

function validateAgentAuthority(agent, action) {
  if (agent.forbidden_actions && agent.forbidden_actions.includes(action.action_type)) {
    return { valid: false, reason: 'Agent exceeding authority' };
  }
  if (action.action_type === 'MODIFY_EXTERNAL' && agent.agent_id !== 'AGT-GOVERNANCE-AUDITOR') {
    if (!action.has_authorization) return { valid: false, reason: 'External write without authorization' };
  }
  return { valid: true };
}

function validateReversibilityAction(actionTier, authorization) {
  if (actionTier === 'IRREVERSIBLE' && authorization !== 'HUMAN_OWNER_APPROVED') {
    return { valid: false, reason: 'Irreversible action without authorization' };
  }
  return { valid: true };
}

function validateRetryLimits(attempts, maxAllowed = 3) {
  if (attempts > maxAllowed) return { valid: false, reason: 'Exceeded max retries (infinite retry risk)' };
  return { valid: true };
}

function validateDelegationDepth(depth, maxDepth = 3) {
  if (depth > maxDepth) return { valid: false, reason: 'Circular delegation loop detected' };
  return { valid: true };
}

function validateClaimStatus(claim) {
  if ((claim.status === 'PASS' || claim.status === 'VERIFIED') && (!claim.evidence || claim.evidence.length === 0)) {
    return { valid: false, reason: 'Unverified PASS / false VERIFIED claim' };
  }
  return { valid: true };
}

// 1. Positive Tests
test('Positive Test: Task Graph schema validity', () => {
  const taskGraphPath = path.join(rootDir, 'docs/orchestration/TASK_GRAPH.json');
  assert.ok(fs.existsSync(taskGraphPath));
  const data = JSON.parse(fs.readFileSync(taskGraphPath, 'utf-8'));
  assert.ok(Array.isArray(data.hierarchy_levels));
});

test('Positive Test: Autonomy & Risk Model levels validity', () => {
  const autonomyPath = path.join(rootDir, 'docs/policies/AUTONOMY_RISK_MODEL.json');
  assert.ok(fs.existsSync(autonomyPath));
  const data = JSON.parse(fs.readFileSync(autonomyPath, 'utf-8'));
  assert.equal(data.autonomy_levels.length, 7);
});

// 2. 12 Negative Tests (Step 30 Requirements)
test('Negative Test 1: Reject external write without authorization', () => {
  const agent = { agent_id: 'AGT-IMPLEMENTATION', forbidden_actions: ['WRITE_UNAUTHORIZED_EXTERNAL'] };
  const action = { action_type: 'MODIFY_EXTERNAL', has_authorization: false };
  const res = validateAgentAuthority(agent, action);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'External write without authorization');
});

test('Negative Test 2: Reject production deployment without approval', () => {
  const policyEnginePath = path.join(rootDir, 'docs/policies/POLICY_ENGINE.json');
  const policyEngine = JSON.parse(fs.readFileSync(policyEnginePath, 'utf-8'));
  const pol = policyEngine.policies.find(p => p.policy_id === 'POL-003');
  assert.equal(pol.result, 'ESCALATE');
});

test('Negative Test 3: Reject task execution without plan', () => {
  const task = { task_id: 'TSK-001' };
  const res = validateTaskExecution(task, null);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Task execution without plan');
});

test('Negative Test 4: Reject task completion without evidence', () => {
  const task = { task_id: 'TSK-001', evidence_requirements: [] };
  const plan = { plan_id: 'PLN-001' };
  const res = validateTaskExecution(task, plan);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Task completion without evidence');
});

test('Negative Test 5: Reject agent without required capability', () => {
  const registryPath = path.join(rootDir, 'docs/agents/REGISTRY.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  const agent = registry.agents.find(a => a.agent_id === 'AGT-ACCESSIBILITY');
  assert.ok(!agent.capabilities.includes('code_writing'), 'Accessibility agent must not possess code_writing capability');
});

test('Negative Test 6: Reject agent exceeding authority', () => {
  const agent = { agent_id: 'AGT-TESTING', forbidden_actions: ['WRITE_PRODUCTION_CODE'] };
  const action = { action_type: 'WRITE_PRODUCTION_CODE' };
  const res = validateAgentAuthority(agent, action);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Agent exceeding authority');
});

test('Negative Test 7: Reject irreversible action without authorization', () => {
  const res = validateReversibilityAction('IRREVERSIBLE', 'NONE');
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Irreversible action without authorization');
});

test('Negative Test 8: Reject release without evidence', () => {
  const releaseClaim = { status: 'PASS', evidence: [] };
  const res = validateClaimStatus(releaseClaim);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Unverified PASS / false VERIFIED claim');
});

test('Negative Test 9: Reject infinite retry (exceeding max attempts)', () => {
  const res = validateRetryLimits(4, 3);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Exceeded max retries (infinite retry risk)');
});

test('Negative Test 10: Reject circular delegation loop', () => {
  const res = validateDelegationDepth(4, 3);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Circular delegation loop detected');
});

test('Negative Test 11: Reject unverified PASS claim', () => {
  const unverifiedPass = { status: 'PASS', evidence: null };
  const res = validateClaimStatus(unverifiedPass);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Unverified PASS / false VERIFIED claim');
});

test('Negative Test 12: Reject false VERIFIED claim', () => {
  const falseVerified = { status: 'VERIFIED', evidence: [] };
  const res = validateClaimStatus(falseVerified);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Unverified PASS / false VERIFIED claim');
});
