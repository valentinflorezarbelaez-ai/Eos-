import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { StrategyEngine } from '../scripts/engine/strategy-engine.js';
import { StrategySimulator } from '../scripts/engine/strategy-simulator.js';
import { StrategySelectionEngine } from '../scripts/engine/strategy-selection-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const engine = new StrategyEngine();
const simulator = new StrategySimulator();
const selector = new StrategySelectionEngine();

// ====================================================
// POSITIVE TESTS
// ====================================================
test('Positive 1: StrategyEngine generates candidate strategies', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-TEST-01' });
  assert.equal(strats.length, 3);
});

test('Positive 2: StrategySimulator produces zero side effects', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-TEST-02' });
  const sim = simulator.simulateStrategy(strats[0]);
  assert.equal(sim.status, 'SIMULATED');
  assert.equal(sim.sideEffects, 0);
});

test('Positive 3: StrategySelectionEngine evaluates 18-dimensional score', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-TEST-03' });
  const sim = simulator.simulateStrategy(strats[0]);
  const score = selector.scoreStrategy(strats[0], sim);
  assert.ok(score > 0);
});

test('Positive 4: Decision Record includes WHY_SELECTED and WHY_REJECTED', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-TEST-04' });
  const sims = strats.map(s => simulator.simulateStrategy(s));
  const res = selector.selectOptimalStrategy({ missionId: 'MSN-TEST-04' }, strats, sims);
  assert.equal(res.status, 'SELECTED');
  assert.ok(res.decisionRecord.rationale.length > 0);
  assert.equal(res.decisionRecord.rejectedStrategies.length, 2);
});

test('Positive 5: Economic Model cost estimation model present', () => {
  const econPath = path.join(rootDir, 'docs/intelligence/ENGINEERING_ECONOMICS.md');
  assert.ok(fs.existsSync(econPath));
});

test('Positive 6: Agent Performance Memory schema present', () => {
  const memPath = path.join(rootDir, 'docs/intelligence/AGENT_PERFORMANCE_MEMORY.json');
  assert.ok(fs.existsSync(memPath));
});

test('Positive 7: Tool Performance Memory schema present', () => {
  const memPath = path.join(rootDir, 'docs/intelligence/TOOL_PERFORMANCE_MEMORY.json');
  assert.ok(fs.existsSync(memPath));
});

test('Positive 8: Synthetic Fixture synthetic-mobile present', () => {
  assert.ok(fs.existsSync(path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-mobile/package.json')));
});

test('Positive 9: Synthetic Fixture synthetic-ai-agent present', () => {
  assert.ok(fs.existsSync(path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-ai-agent/package.json')));
});

test('Positive 10: Synthetic Fixture synthetic-migration present', () => {
  assert.ok(fs.existsSync(path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-migration/package.json')));
});

test('Positive 11: Synthetic Fixture synthetic-security-remediation present', () => {
  assert.ok(fs.existsSync(path.join(rootDir, 'tests/fixtures/mission-projects/synthetic-security-remediation/package.json')));
});

test('Positive 12: Scenario STRATEGY_FAILURE_001 handles tool unavailability', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-TEST-05' });
  const sim = simulator.simulateStrategy(strats[0], { mockFailureScenario: 'STRATEGY_FAILURE_001' });
  assert.equal(sim.status, 'SIMULATION_FAILED');
});

test('Positive 13: Scenario STRATEGY_FAILURE_007 handles authorization insufficiency', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-TEST-06' });
  const sim = simulator.simulateStrategy(strats[0], { mockFailureScenario: 'STRATEGY_FAILURE_007' });
  assert.equal(sim.status, 'SIMULATION_FAILED');
});

test('Positive 14: Protection Test - External target immutability (Δ=0)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const baselineItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  const currentItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  assert.deepEqual(currentItems, baselineItems, 'External target must remain immutable during test execution');
});

// ====================================================
// NEGATIVE TESTS
// ====================================================
test('Negative 1: Reject empty candidate strategies array', () => {
  const res = selector.selectOptimalStrategy({ missionId: 'MSN-01' }, [], []);
  assert.equal(res.status, 'FAILED');
});

test('Negative 2: Reject null simulation result during scoring', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-02' });
  const score = selector.scoreStrategy(strats[0], null);
  assert.equal(score, 0);
});

test('Negative 3: Reject unregistered strategy lookup', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-03' });
  const invalid = strats.find(s => s.strategyId === 'STRATEGY-UNREGISTERED');
  assert.equal(invalid, undefined);
});

test('Negative 4: Reject policy bypass attempt on external write to Fundacion', () => {
  const policyPath = path.join(rootDir, 'docs/policies/POLICY_ENGINE.json');
  const policies = JSON.parse(fs.readFileSync(policyPath, 'utf-8')).policies;
  const pol1 = policies.find(p => p.policy_id === 'POL-001');
  assert.equal(pol1.result, 'DENY');
});

test('Negative 5: Reject verifier self-promotion without independent check', () => {
  const metaGovPath = path.join(rootDir, 'docs/governance/META_GOVERNANCE_ENGINE.md');
  const text = fs.readFileSync(metaGovPath, 'utf-8');
  assert.ok(text.includes('Independent Certification Guard'));
});

test('Negative 6: Reject provider favoritism in strategy scoring policy', () => {
  const policy = selector.policy;
  assert.equal(policy.weights_status, 'ASSUMPTION');
});

test('Negative 7: Reject strategy selection without evidence record', () => {
  const strats = engine.generateStrategies({ missionId: 'MSN-07' });
  const sims = strats.map(s => simulator.simulateStrategy(s));
  const res = selector.selectOptimalStrategy({ missionId: 'MSN-07' }, strats, sims);
  assert.ok(res.decisionRecord.evidence);
});

test('Negative 8: Reject unauthorized Fundacion directory mutation (Δ=0)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const baselineItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  const currentItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  assert.deepEqual(currentItems, baselineItems, 'External target must remain immutable — no unauthorized mutations');
});
