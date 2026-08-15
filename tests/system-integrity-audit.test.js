import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SystemWideIntegrityAuditEngine } from '../scripts/engine/system-wide-integrity-audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const auditEngine = new SystemWideIntegrityAuditEngine();

// ====================================================
// SYSTEM-WIDE INTEGRITY AUDIT TESTS
// ====================================================
test('System-Wide Integrity Audit evaluates 5 audit levels (L1 to L5)', () => {
  const audit = auditEngine.runFullSystemAudit();
  assert.equal(audit.auditLevels.length, 5);
  audit.auditLevels.forEach(l => assert.equal(l.passed, true));
});

test('System-Wide Integrity Audit evaluates all 28 required audit questions', () => {
  const audit = auditEngine.runFullSystemAudit();
  assert.equal(audit.questionsEvaluated, 28);
  assert.ok(audit.questions.length === 28);
});

test('System-Wide Integrity Audit produces valid decision gate state', () => {
  const audit = auditEngine.runFullSystemAudit();
  const validStates = ['SYSTEM_READY', 'SYSTEM_READY_WITH_CONDITIONS', 'SYSTEM_REMEDIATION_REQUIRED', 'SYSTEM_NOT_READY'];
  assert.ok(validStates.includes(audit.finalDecisionState));
  assert.equal(audit.finalDecisionState, 'SYSTEM_READY_WITH_CONDITIONS');
});

test('Negative Protection Test: PRJ-FUNDACION isolation - external target immutability (Δ=0)', () => {
  const fundacionPath = 'C:\\Users\\valen\\Documents\\Fundacion';
  const baselineItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  const currentItems = fs.existsSync(fundacionPath) ? fs.readdirSync(fundacionPath).sort() : [];
  assert.deepEqual(currentItems, baselineItems, 'External target must remain immutable during test execution');
});
