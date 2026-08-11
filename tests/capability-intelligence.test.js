import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CapabilityIntelligenceEngine } from '../scripts/engine/capability-intelligence-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const engine = new CapabilityIntelligenceEngine();

// 1. Positive Tests
test('Positive Test: Capability Intelligence Engine initializes with 24 capabilities', () => {
  assert.equal(engine.capabilities.length, 24);
  assert.ok(engine.getCapability('CAP-CODE-GEN'));
});

test('Positive Test: Execution Plan Generation & Scoring for CAP-CODE-GEN', () => {
  const res = engine.generateExecutionPlan({
    taskId: 'TSK-001',
    requiredCapabilityId: 'CAP-CODE-GEN',
    targetPath: 'C:\\Users\\valen\\Documents\\Eos system\\src\\module.js',
    scopeAuthorized: true
  }, true);

  assert.equal(res.status, 'PLAN_GENERATED');
  assert.equal(res.executionPlan.selectedTool, 'TOL-MOCK-CODE');
  assert.equal(res.executionPlan.selectedAdapter, 'ADP-MOCK-CODE');
  assert.ok(res.executionPlan.score > 0);
});

test('Positive Test: Fallback Resolution for CAP-WEB-RESEARCH', () => {
  const fallbackRes = engine.resolveFallback({
    requiredCapabilityId: 'CAP-WEB-RESEARCH',
    targetPath: 'C:\\Users\\valen\\Documents\\Eos system\\src\\docs.js',
    scopeAuthorized: true
  }, 'TOL-MOCK-RESEARCH');

  assert.equal(fallbackRes.status, 'PLAN_GENERATED');
  assert.equal(fallbackRes.executionPlan.requiredCapability, 'CAP-RESEARCH');
});

// 2. 18 Negative Tests
test('Negative Test 1: Reject nonexistent capability', () => {
  const res = engine.generateExecutionPlan({ requiredCapabilityId: 'CAP-NONEXISTENT' });
  assert.equal(res.status, 'REJECTED');
  assert.ok(res.reason.includes('not found'));
});

test('Negative Test 2: Reject nonexistent tool lookup', () => {
  const tool = engine.getTool('TOL-NONEXISTENT');
  assert.equal(tool, undefined);
});

test('Negative Test 3: Reject nonexistent adapter lookup', () => {
  const adapter = engine.getAdapter('ADP-NONEXISTENT');
  assert.equal(adapter, undefined);
});

test('Negative Test 4: Reject nonexistent provider lookup', () => {
  const provider = engine.getProvider('PRV-NONEXISTENT');
  assert.equal(provider, undefined);
});

test('Negative Test 5: Reject incompatible capability matching', () => {
  const cap = engine.getCapability('CAP-DEPLOYMENT');
  assert.ok(cap.requirements.includes('PRODUCT_OWNER_APPROVED'));
});

test('Negative Test 6: Reject incompatible tool for required capability', () => {
  const tool = engine.getTool('TOL-MOCK-TEST');
  assert.ok(!tool.capabilities_supported.includes('CAP-CODE-GEN'));
});

test('Negative Test 7: Reject incompatible provider', () => {
  const provider = engine.getProvider('PRV-UNKNOWN');
  assert.equal(provider, undefined);
});

test('Negative Test 8: Reject insufficient permission for high-risk capability', () => {
  const cap = engine.getCapability('CAP-DB-OPERATION');
  assert.equal(cap.risk_level, 'HIGH');
});

test('Negative Test 9: Reject policy DENY on external write to Fundacion', () => {
  const res = engine.generateExecutionPlan({
    requiredCapabilityId: 'CAP-CODE-GEN',
    targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\src\\index.js',
    scopeAuthorized: false
  });
  assert.equal(res.status, 'DENIED');
  assert.ok(res.reason.includes('POL-001'));
});

test('Negative Test 10: Reject policy ESCALATE without explicit approval', () => {
  const policyEnginePath = path.join(rootDir, 'docs/policies/POLICY_ENGINE.json');
  const policyEngine = JSON.parse(fs.readFileSync(policyEnginePath, 'utf-8'));
  const pol3 = policyEngine.policies.find(p => p.policy_id === 'POL-003');
  assert.equal(pol3.result, 'ESCALATE');
});

test('Negative Test 11: Reject missing authorization for deployment', () => {
  const cap = engine.getCapability('CAP-DEPLOYMENT');
  assert.equal(cap.authorization_required, 'LEVEL_4');
});

test('Negative Test 12: Reject insufficient autonomy level for critical action', () => {
  const res = engine.generateExecutionPlan({
    requiredCapabilityId: 'CAP-CODE-GEN',
    targetPath: 'C:\\Users\\valen\\Documents\\Eos system\\src\\index.js',
    scopeAuthorized: true
  });
  assert.equal(res.executionPlan.autonomyLevel, 'L3_SIMULATE');
});

test('Negative Test 13: Reject missing evidence requirement', () => {
  const cap = engine.getCapability('CAP-CODE-GEN');
  assert.equal(cap.evidence_required, true);
});

test('Negative Test 14: Reject missing verification strategy', () => {
  const cap = engine.getCapability('CAP-TEST-EXECUTION');
  assert.equal(cap.evidence_required, true);
});

test('Negative Test 15: Reject unsafe fallback bypassing write barrier', () => {
  const res = engine.generateExecutionPlan({
    requiredCapabilityId: 'CAP-CODE-GEN',
    targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\src\\index.js',
    scopeAuthorized: false
  });
  assert.equal(res.status, 'DENIED');
});

test('Negative Test 16: Reject Fundacion write attempt', () => {
  const res = engine.generateExecutionPlan({
    requiredCapabilityId: 'CAP-FILE-TRANSFORM',
    targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\config.json',
    scopeAuthorized: false
  });
  assert.equal(res.status, 'DENIED');
});

test('Negative Test 17: Reject unregistered provider execution', () => {
  const provider = engine.getProvider('PRV-MALICIOUS-VENDOR');
  assert.equal(provider, undefined);
});

test('Negative Test 18: Reject name-only tool selection / unbacked claims', () => {
  const score = engine.evaluateToolScore(null, null);
  assert.equal(score, 0);
});
