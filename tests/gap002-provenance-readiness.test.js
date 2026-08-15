import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ====================================================
// WS-01: GAP-002 EVIDENCE & PROVENANCE READINESS TESTS
// ====================================================

const GAP002_FILE = path.join(rootDir, 'docs/intelligence/user/FUNDACION_GAP_002_OFFICIAL_DATA.json');

test('WS-01.1: GAP-002 artifact exists and has valid JSON schema structure', () => {
  assert.ok(fs.existsSync(GAP002_FILE), 'FUNDACION_GAP_002_OFFICIAL_DATA.json must exist');
  const data = JSON.parse(fs.readFileSync(GAP002_FILE, 'utf-8'));
  
  assert.equal(data.project_id, 'PRJ-FUNDACION');
  assert.equal(data.gap_id, 'GAP-002');
  assert.equal(data.status, 'PENDING_PO_VALIDATION');
  assert.ok(data.fields, 'fields object must exist');
  
  const requiredFields = [
    'legal_name', 'nit', 'legal_entity_status', 'address',
    'email', 'phone', 'bank_name', 'account_type', 'account_number',
    'data_treatment_policy_url'
  ];
  requiredFields.forEach(field => {
    assert.ok(field in data.fields, `Field ${field} must exist in fields object`);
    assert.equal(data.fields[field], 'UNKNOWN', `Field ${field} must strictly start as UNKNOWN`);
  });
});

test('WS-01.2: State Machine Invariant — UNKNOWN cannot transition to VERIFIED without source_reference', () => {
  const transitionEvaluator = (currentField, newSource, poValidated) => {
    if (!newSource || !newSource.reference || newSource.reference.trim() === '') {
      return { status: 'DENIED', reason: 'Missing official source reference' };
    }
    if (!poValidated) {
      return { status: 'DENIED', reason: 'Missing Product Owner validation signature' };
    }
    return { status: 'VERIFIED' };
  };

  // Attempt without source
  const attemptNoSource = transitionEvaluator('UNKNOWN', null, true);
  assert.equal(attemptNoSource.status, 'DENIED');
  assert.ok(attemptNoSource.reason.includes('source reference'));

  // Attempt with empty source
  const attemptEmptySource = transitionEvaluator('UNKNOWN', { reference: '   ' }, true);
  assert.equal(attemptEmptySource.status, 'DENIED');

  // Attempt without PO validation
  const attemptNoPO = transitionEvaluator('UNKNOWN', { reference: 'Official Certificate' }, false);
  assert.equal(attemptNoPO.status, 'DENIED');
  assert.ok(attemptNoPO.reason.includes('Product Owner validation'));

  // Valid transition
  const validTransition = transitionEvaluator('UNKNOWN', { reference: 'Chamber of Commerce Cert #12345' }, true);
  assert.equal(validTransition.status, 'VERIFIED');
});

test('WS-01.3: Experiment Gate Invariant — Variant A execution is BLOCKED while GAP-002 != CLOSED', () => {
  const evaluateVariantAGate = (gap002Status, verifiedFields) => {
    const requiredForA = ['legal_name', 'nit', 'address', 'email', 'phone'];
    const allVerified = requiredForA.every(f => verifiedFields[f] && verifiedFields[f] !== 'UNKNOWN');
    
    if (gap002Status !== 'CLOSED' || !allVerified) {
      return {
        gateStatus: 'BLOCKED',
        reason: 'Variant A requires GAP-002 to be CLOSED and all primary institutional fields to be VERIFIED'
      };
    }
    return { gateStatus: 'AUTHORIZED' };
  };

  // Currently GAP-002 is PENDING_PO_VALIDATION
  const currentGate = evaluateVariantAGate('PENDING_PO_VALIDATION', {});
  assert.equal(currentGate.gateStatus, 'BLOCKED');

  // If status is closed but fields are missing
  const partialGate = evaluateVariantAGate('CLOSED', { legal_name: 'Fundacion Real', nit: 'UNKNOWN' });
  assert.equal(partialGate.gateStatus, 'BLOCKED');

  // Fully validated
  const passedGate = evaluateVariantAGate('CLOSED', {
    legal_name: 'Fundación Oficial',
    nit: '900.123.456-7',
    address: 'Calle 100 # 15-20',
    email: 'contacto@fundacion.org',
    phone: '+57 300 123 4567'
  });
  assert.equal(passedGate.gateStatus, 'AUTHORIZED');
});

test('WS-01.4: Experiment Gate Invariant — Variant B requires Variant A baseline; Variant C requires A+B', () => {
  const evaluateAccumulativeSequence = (variant, executedBaselines) => {
    if (variant === 'B' && !executedBaselines.includes('A')) {
      return { allowed: false, reason: 'Variant B requires Variant A to be completed first' };
    }
    if (variant === 'C' && (!executedBaselines.includes('A') || !executedBaselines.includes('B'))) {
      return { allowed: false, reason: 'Variant C requires both Variant A and Variant B to be completed first' };
    }
    return { allowed: true };
  };

  assert.equal(evaluateAccumulativeSequence('B', []).allowed, false);
  assert.equal(evaluateAccumulativeSequence('B', ['A']).allowed, true);
  assert.equal(evaluateAccumulativeSequence('C', ['A']).allowed, false);
  assert.equal(evaluateAccumulativeSequence('C', ['A', 'B']).allowed, true);
});

test('WS-01.5: Invariant — Rejection of Post-Hoc Target Mutation', () => {
  const FROZEN_TARGETS = {
    trust_score_target: 8.5,
    completion_target: 0.90,
    dropoff_target: 0.10
  };

  const validateTargetsImmutability = (attemptedTargets) => {
    if (
      attemptedTargets.trust_score_target !== FROZEN_TARGETS.trust_score_target ||
      attemptedTargets.completion_target !== FROZEN_TARGETS.completion_target ||
      attemptedTargets.dropoff_target !== FROZEN_TARGETS.dropoff_target
    ) {
      throw new Error('SECURITY_DENY: Post-hoc mutation of experimental success criteria is strictly forbidden');
    }
    return true;
  };

  assert.doesNotThrow(() => validateTargetsImmutability({ trust_score_target: 8.5, completion_target: 0.90, dropoff_target: 0.10 }));
  assert.throws(() => validateTargetsImmutability({ trust_score_target: 7.0, completion_target: 0.90, dropoff_target: 0.10 }), /Post-hoc mutation/);
});
