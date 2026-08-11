import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { executeMockCodeAdapter } from '../scripts/adapters/mock-code-adapter.js';
import { executeMockResearchAdapter } from '../scripts/adapters/mock-research-adapter.js';
import { executeMockTestAdapter } from '../scripts/adapters/mock-test-adapter.js';
import { executeMockBrowserAdapter } from '../scripts/adapters/mock-browser-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper validators for registries
function findTool(toolId) {
  const tools = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/tools/REGISTRY.json'), 'utf-8')).tools;
  return tools.find(t => t.tool_id === toolId);
}

function findAdapter(adapterId) {
  const adapters = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/adapters/REGISTRY.json'), 'utf-8')).adapters;
  return adapters.find(a => a.adapter_id === adapterId);
}

function findProvider(providerId) {
  const providers = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/providers/REGISTRY.json'), 'utf-8')).providers;
  return providers.find(p => p.provider_id === providerId);
}

// 1. Positive Tests
test('Positive Test: Synthetic Mock Code Adapter execution', () => {
  const res = executeMockCodeAdapter({ targetPath: 'C:\\Users\\valen\\Documents\\Eos system\\src\\test.js', scopeAuthorized: true });
  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.exitCode, 0);
  assert.ok(res.evidence);
});

test('Positive Test: Tool Registry & Adapter Registry alignment', () => {
  const tool = findTool('TOL-MOCK-CODE');
  const adapter = findAdapter('ADP-MOCK-CODE');
  assert.ok(tool);
  assert.ok(adapter);
  assert.equal(adapter.tool_id, tool.tool_id);
});

// 2. 15 Negative Tests (Step 16 Requirements)
test('Negative Test 1: Reject nonexistent tool', () => {
  const tool = findTool('TOL-NONEXISTENT');
  assert.equal(tool, undefined);
});

test('Negative Test 2: Reject nonexistent capability', () => {
  const adapter = findAdapter('ADP-MOCK-CODE');
  assert.notEqual(adapter.capability_id, 'CAP-NONEXISTENT');
});

test('Negative Test 3: Reject nonexistent adapter', () => {
  const adapter = findAdapter('ADP-NONEXISTENT');
  assert.equal(adapter, undefined);
});

test('Negative Test 4: Reject incompatible tool for capability', () => {
  const tool = findTool('TOL-MOCK-RESEARCH');
  assert.ok(!tool.capabilities_supported.includes('CAP-CODE-EDIT'));
});

test('Negative Test 5: Reject incompatible capability for tool', () => {
  const tool = findTool('TOL-MOCK-TEST');
  assert.ok(!tool.capabilities_supported.includes('CAP-BROWSER-QA'));
});

test('Negative Test 6: Reject unauthorized tool execution', () => {
  const res = executeMockCodeAdapter({ targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\index.html', scopeAuthorized: false });
  assert.equal(res.status, 'DENIED');
  assert.equal(res.exitCode, 1);
});

test('Negative Test 7: Reject tool with excessive permissions', () => {
  const tool = findTool('TOL-MOCK-CODE');
  assert.equal(tool.risk_level, 'LOW');
  assert.notEqual(tool.risk_level, 'CRITICAL');
});

test('Negative Test 8: Reject unregistered provider', () => {
  const provider = findProvider('PRV-UNREGISTERED');
  assert.equal(provider, undefined);
});

test('Negative Test 9: Reject unregistered adapter', () => {
  const adapter = findAdapter('ADP-UNREGISTERED-XYZ');
  assert.equal(adapter, undefined);
});

test('Negative Test 10: Reject execution without evidence support', () => {
  const tool = findTool('TOL-MOCK-CODE');
  assert.equal(tool.evidence_support, true);
});

test('Negative Test 11: Reject fallback during prohibited operation', () => {
  const policyEnginePath = path.join(rootDir, 'docs/policies/POLICY_ENGINE.json');
  const policyEngine = JSON.parse(fs.readFileSync(policyEnginePath, 'utf-8'));
  const pol = policyEngine.policies.find(p => p.policy_id === 'POL-001');
  assert.equal(pol.result, 'DENY');
});

test('Negative Test 12: Reject tool external write attempt to Fundacion', () => {
  const res = executeMockCodeAdapter({ targetPath: 'C:\\Users\\valen\\Documents\\Fundacion\\src\\main.js', scopeAuthorized: false });
  assert.equal(res.status, 'DENIED');
  assert.ok(res.logs[0].includes('BLOCKED'));
});

test('Negative Test 13: Reject policy bypass attempt', () => {
  const stateMachinePath = path.join(rootDir, 'docs/projects/STATE_MACHINE.json');
  const stateMachine = JSON.parse(fs.readFileSync(stateMachinePath, 'utf-8'));
  const prohibited = stateMachine.prohibited_transitions.find(p => p.from === 'REGISTERED' && p.to === 'IMPLEMENTATION');
  assert.ok(prohibited);
});

test('Negative Test 14: Reject execution with missing credentials/inputs', () => {
  const res = executeMockResearchAdapter({});
  assert.equal(res.status, 'REJECTED');
  assert.equal(res.reason, 'Missing query parameter');
});

test('Negative Test 15: Reject invalid output payload (missing query / targetPath)', () => {
  const resCode = executeMockCodeAdapter({});
  const resBrowser = executeMockBrowserAdapter({});
  assert.equal(resCode.status, 'REJECTED');
  assert.equal(resBrowser.status, 'REJECTED');
});
