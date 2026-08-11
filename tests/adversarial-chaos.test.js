import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AdversarialLaboratoryEngine } from '../scripts/engine/adversarial-laboratory-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const advEngine = new AdversarialLaboratoryEngine();

// ====================================================
// POSITIVE ADVERSARIAL & CHAOS TESTS
// ====================================================
test('Adversarial Laboratory validates steady state before attack injection', () => {
  const steady = advEngine.verifySteadyState();
  assert.equal(steady.steadyStateValid, true);
  assert.equal(steady.fundacionCount, 0);
  assert.equal(steady.controlPlaneStatus, 'HEALTHY');
});

test('Adversarial Laboratory executes 15 Game Day scenarios', () => {
  const results = advEngine.runFullGameDaySuite();
  assert.equal(results.length, 15);
  results.forEach(r => {
    assert.equal(r.status, 'SUCCESS');
    assert.equal(r.outcome.verifiedIndependent, true);
    assert.equal(r.evolutionProposal.type, 'PROPOSAL_ONLY');
    assert.equal(r.evolutionProposal.requiresHumanAuthorization, true);
  });
});

test('Game Day experiment produces multidimensional Resilience Score', () => {
  const res = advEngine.runGameDayExperiment('ADV_TOOL_01');
  assert.equal(res.status, 'SUCCESS');
  assert.ok(res.resilienceScore.detection >= 0.0);
  assert.ok(res.resilienceScore.containment >= 0.0);
  assert.ok(res.resilienceScore.recovery >= 0.0);
});

// ====================================================
// NEGATIVE TESTS & SAFETY BARRIER INVARIANTS
// ====================================================
test('Negative 1: Reject experiment attempting prohibited blast radius B4', () => {
  const res = advEngine.runGameDayExperiment('ADV_TOOL_01', { blastRadius: 'B4' });
  assert.equal(res.status, 'ABORTED');
  assert.ok(res.reason.includes('forbidden'));
});

test('Negative 2: Reject experiment targeting Fundacion path write', () => {
  const res = advEngine.runGameDayExperiment('ADV_TOOL_01', { target: 'C:\\Users\\valen\\Documents\\Fundacion' });
  assert.equal(res.status, 'ABORTED');
  assert.ok(res.reason.includes('forbidden'));
});

test('Negative 3: Protection Test - Mandatory Fundacion isolation (0 items)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const contents = fs.readdirSync(fundacionPath);
  assert.equal(contents.length, 0);
});
