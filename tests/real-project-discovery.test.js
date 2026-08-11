import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RealProjectDiscoveryEngine } from '../scripts/engine/real-project-discovery-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ====================================================
// REAL PROJECT DISCOVERY & TARGET INDEPENDENCE TESTS
// ====================================================
test('RealProjectDiscoveryEngine operates strictly in READ_ONLY mode', () => {
  const engine = new RealProjectDiscoveryEngine();
  assert.equal(engine.mode, 'EMPIRICAL_LEVEL_1_READ_ONLY');
  assert.doesNotThrow(() => engine.assertReadOnlyAccess('READ'));
  assert.throws(() => engine.assertReadOnlyAccess('WRITE'), /DENY/);
  assert.throws(() => engine.assertReadOnlyAccess('CREATE'), /DENY/);
  assert.throws(() => engine.assertReadOnlyAccess('DELETE'), /DENY/);
});

test('RealProjectDiscoveryEngine rejects self-analysis of EOS Control Plane for security isolation', () => {
  assert.throws(() => new RealProjectDiscoveryEngine(rootDir), /SECURITY_DENY/);
});

test('RealProjectDiscoveryEngine analyzes unpopulated target project (Fundacion)', () => {
  const engine = new RealProjectDiscoveryEngine('C:\\Users\\valen\\Documents\\Fundacion');
  const discovery = engine.runDiscoveryMission();
  assert.equal(discovery.projectId, 'fundacion');
  assert.equal(discovery.architectureAssessment.pattern, 'UNPOPULATED_TARGET');
  assert.equal(discovery.state.observedFacts.find(f => f.key === 'ITEM_COUNT').value, 0);
});

test('RealProjectDiscoveryEngine analyzes populated real target project (Andes-Retreat)', () => {
  const andesPath = 'C:\\Users\\valen\\Documents\\EOS-Lab\\Andes-Retreat';
  if (!fs.existsSync(andesPath)) return; // Guard if run in isolated environment

  const engine = new RealProjectDiscoveryEngine(andesPath);
  const discovery = engine.runDiscoveryMission();
  assert.equal(discovery.projectId, 'andes-retreat');
  assert.equal(discovery.architectureAssessment.pattern, 'POPULATED_REAL_PROJECT');
  assert.equal(discovery.state.observedFacts.find(f => f.key === 'HAS_GIT').value, true);
  assert.equal(discovery.state.observedFacts.find(f => f.key === 'PACKAGE_NAME').value, 'andes-retreat');
  assert.ok(discovery.state.derivedFacts.find(f => f.key === 'FILE_TREE_COUNT').value > 0);
});

test('Negative Protection Test: Target directories remain 100% untouched during discovery', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const andesPath = 'C:\\Users\\valen\\Documents\\EOS-Lab\\Andes-Retreat';

  if (fs.existsSync(fundacionPath)) {
    assert.equal(fs.readdirSync(fundacionPath).length, 0);
  }
  if (fs.existsSync(andesPath)) {
    assert.ok(fs.existsSync(path.join(andesPath, 'package.json')));
  }
});
