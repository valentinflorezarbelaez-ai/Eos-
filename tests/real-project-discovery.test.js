import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RealProjectDiscoveryEngine } from '../scripts/engine/real-project-discovery-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const engine = new RealProjectDiscoveryEngine();

// ====================================================
// REAL PROJECT DISCOVERY & UNDERSTANDING TESTS (EXP-026-001)
// ====================================================
test('RealProjectDiscoveryEngine operates strictly in READ_ONLY mode', () => {
  assert.equal(engine.mode, 'EMPIRICAL_LEVEL_1_READ_ONLY');
  assert.doesNotThrow(() => engine.assertReadOnlyAccess('READ'));
  assert.throws(() => engine.assertReadOnlyAccess('WRITE'), /DENY/);
  assert.throws(() => engine.assertReadOnlyAccess('CREATE'), /DENY/);
  assert.throws(() => engine.assertReadOnlyAccess('DELETE'), /DENY/);
});

test('RealProjectDiscoveryEngine executes EXP-026-001 and produces structured output', () => {
  const discovery = engine.runDiscoveryMission();
  assert.equal(discovery.experimentId, 'EXP-026-001');
  assert.equal(discovery.level, 'EMPIRICAL_VALIDATION_LEVEL_1_READ_ONLY');
  assert.equal(discovery.decisionState, 'PASS_WITH_CONDITIONS');
  assert.equal(discovery.state.observedFacts[1].value, 0); // Fundacion count = 0
});

test('Negative Protection Test: Fundacion target remains 100% untouched (0 items)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const count = fs.readdirSync(fundacionPath).length;
  assert.equal(count, 0);
});
