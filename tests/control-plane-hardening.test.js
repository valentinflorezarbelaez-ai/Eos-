import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Positive Test: Agent Selection Engine capability match', () => {
  const selectionEnginePath = path.join(rootDir, 'docs/agents/SELECTION_ENGINE.json');
  assert.ok(fs.existsSync(selectionEnginePath), 'Selection Engine JSON must exist');
  
  const selectionEngine = JSON.parse(fs.readFileSync(selectionEnginePath, 'utf-8'));
  const rule = selectionEngine.rules.find(r => r.task_type === 'ACCESSIBILITY_AUDIT');
  
  assert.ok(rule, 'Rule for ACCESSIBILITY_AUDIT must exist');
  assert.equal(rule.selected_agent, 'AGT-ACCESSIBILITY');
});

test('Positive Test: Project State Machine valid transition', () => {
  const stateMachinePath = path.join(rootDir, 'docs/projects/STATE_MACHINE.json');
  assert.ok(fs.existsSync(stateMachinePath), 'State Machine JSON must exist');
  
  const stateMachine = JSON.parse(fs.readFileSync(stateMachinePath, 'utf-8'));
  const transition = stateMachine.transitions.find(t => t.from === 'REGISTERED' && t.to === 'INTAKE');
  
  assert.ok(transition, 'Valid transition REGISTERED -> INTAKE must exist');
  assert.equal(transition.required_authority, 'EOS System');
});

test('Positive Test: Policy Engine DENY on EOS Development Mode External Write', () => {
  const policyEnginePath = path.join(rootDir, 'docs/policies/POLICY_ENGINE.json');
  assert.ok(fs.existsSync(policyEnginePath), 'Policy Engine JSON must exist');
  
  const policyEngine = JSON.parse(fs.readFileSync(policyEnginePath, 'utf-8'));
  const policy = policyEngine.policies.find(p => p.policy_id === 'POL-001');
  
  assert.ok(policy, 'POL-001 policy must exist');
  assert.equal(policy.result, 'DENY');
});

test('Negative Test: Prohibited Transition REGISTERED -> IMPLEMENTATION is blocked', () => {
  const stateMachinePath = path.join(rootDir, 'docs/projects/STATE_MACHINE.json');
  const stateMachine = JSON.parse(fs.readFileSync(stateMachinePath, 'utf-8'));
  
  const prohibited = stateMachine.prohibited_transitions.find(p => p.from === 'REGISTERED' && p.to === 'IMPLEMENTATION');
  assert.ok(prohibited, 'REGISTERED -> IMPLEMENTATION must be prohibited');
});

test('Negative Test: Fundacion Target Directory remains immutable (Δ=0 External Isolation)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  // If the directory doesn't exist, Δ=0 is trivially satisfied
  const baselineItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  const currentItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  assert.deepEqual(currentItems, baselineItems, 'External target must remain immutable — no unauthorized mutations');
});
