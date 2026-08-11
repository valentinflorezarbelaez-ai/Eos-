import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { IndependentVerificationHarness } from '../scripts/engine/independent-verification-harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const harness = new IndependentVerificationHarness();

// ====================================================
// INDEPENDENT EMPIRICAL VALIDATION TESTS
// ====================================================
test('Independent Verification Harness evaluates 5 falsification cases (A to E)', () => {
  const res = harness.runIndependentValidationSuite();
  assert.equal(res.falsificationCasesEvaluated, 5);
  assert.equal(res.harnessPassed, true);
  assert.equal(res.metrics.CDR, 1.0);
  assert.equal(res.metrics.FAR, 0.0);
});

test('Independence Levels classification (I0 to I4)', () => {
  assert.equal(harness.evaluateClaimIndependence({}).independenceLevel, 'I0');
  assert.equal(harness.evaluateClaimIndependence({ evidence: 'E1' }).independenceLevel, 'I1');
  assert.equal(harness.evaluateClaimIndependence({ evidence: 'E1', independentLocalVerified: true }).independenceLevel, 'I2');
  assert.equal(harness.evaluateClaimIndependence({ evidence: 'E1', externalVerified: true }).independenceLevel, 'I4');
});

test('Contradiction testing halts promotion on contradiction or tampered evidence', () => {
  const caseB = harness.evaluateContradictionCase('PASS', 'FAIL', true, false);
  assert.equal(caseB.outcome, 'CONTRADICTION');
  assert.equal(caseB.haltPromotion, true);

  const caseE = harness.evaluateContradictionCase('PASS', 'PASS', true, true);
  assert.equal(caseE.outcome, 'INTEGRITY_FAILURE');
  assert.equal(caseE.haltPromotion, true);
});

test('Negative Protection Test: PRJ-FUNDACION isolation remains strictly 0 items', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const count = fs.readdirSync(fundacionPath).length;
  assert.equal(count, 0);
});
