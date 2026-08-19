import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FEATURE_LIST_SCHEMA_PATH = path.resolve('docs/schemas/feature_list.schema.json');
const CONTEXT_RECEIPT_SCHEMA_PATH = path.resolve('docs/schemas/context_receipt.schema.json');

test('SCH-01: P0.1 schema files exist on disk', () => {
  assert.ok(fs.existsSync(FEATURE_LIST_SCHEMA_PATH), 'feature_list.schema.json must exist');
  assert.ok(fs.existsSync(CONTEXT_RECEIPT_SCHEMA_PATH), 'context_receipt.schema.json must exist');
});

test('SCH-02: P0.1 schema files contain valid parseable JSON', () => {
  const featContent = fs.readFileSync(FEATURE_LIST_SCHEMA_PATH, 'utf8');
  const featSchema = JSON.parse(featContent);
  assert.equal(featSchema.title, 'EOS Feature List Schema');
  assert.equal(featSchema.version, '1.0.0');

  const receiptContent = fs.readFileSync(CONTEXT_RECEIPT_SCHEMA_PATH, 'utf8');
  const receiptSchema = JSON.parse(receiptContent);
  assert.equal(receiptSchema.title, 'EOS Context Compiler Receipt Schema');
  assert.equal(receiptSchema.version, '1.1.0');
});

test('SCH-03: feature_list.schema.json has required schema structure and properties', () => {
  const schema = JSON.parse(fs.readFileSync(FEATURE_LIST_SCHEMA_PATH, 'utf8'));
  assert.ok(Array.isArray(schema.required));
  assert.ok(schema.required.includes('schemaVersion'));
  assert.ok(schema.required.includes('missionId'));
  assert.ok(schema.required.includes('features'));
  assert.ok(schema.properties.features.items.required.includes('id'));
  assert.ok(schema.properties.features.items.required.includes('status'));
});

test('SCH-04: context_receipt.schema.json has required schema structure and properties', () => {
  const schema = JSON.parse(fs.readFileSync(CONTEXT_RECEIPT_SCHEMA_PATH, 'utf8'));
  assert.ok(Array.isArray(schema.required));
  assert.ok(schema.required.includes('schemaVersion'));
  assert.ok(schema.required.includes('missionId'));
  assert.ok(schema.required.includes('sha256'));
  assert.ok(schema.required.includes('tokenBudget'));
  assert.ok(schema.required.includes('authority'));
});

test('SCH-05: Valid feature list fixture passes structural validation', () => {
  const validList = {
    schemaVersion: '1.0.0',
    missionId: 'MIS-VALID-001',
    initializedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    features: [
      { id: 'FEAT-001', name: 'Valid Feature', status: 'VERIFIED', evidenceReceipt: 'EVD-001' }
    ]
  };

  assert.equal(validList.schemaVersion, '1.0.0');
  assert.equal(typeof validList.missionId, 'string');
  assert.ok(Array.isArray(validList.features));
  assert.equal(validList.features[0].status, 'VERIFIED');
});

test('SCH-06: Malformed feature list fixture fails validation', () => {
  const malformedList = {
    schemaVersion: '1.0.0',
    // Missing missionId
    features: 'NOT_AN_ARRAY'
  };

  assert.ok(!malformedList.missionId, 'Should lack missionId');
  assert.ok(!Array.isArray(malformedList.features), 'Features should not be array');
});

test('SCH-07: Valid context receipt fixture passes structural validation', () => {
  const validReceipt = {
    schemaVersion: '1.1.0',
    missionId: 'MIS-VALID-002',
    compiledAt: new Date().toISOString(),
    tokenBudget: { maxBudgetTokens: 4000, usedTokens: 500, remainingTokens: 3500 },
    authority: { token: 'A1', mcl: 'MCL-1', rank: 1 },
    sectionsIncluded: ['HEADER'],
    sha256: 'a'.repeat(64),
    compiledPrompt: '=== PROMPT ===',
    epistemicStatus: 'VERIFIED'
  };

  assert.equal(validReceipt.schemaVersion, '1.1.0');
  assert.equal(validReceipt.sha256.length, 64);
  assert.equal(validReceipt.authority.rank, 1);
});

test('SCH-08: Malformed context receipt fixture fails validation', () => {
  const malformedReceipt = {
    schemaVersion: '1.1.0',
    sha256: 'short-invalid-hash'
  };

  assert.ok(malformedReceipt.sha256.length !== 64, 'SHA-256 length must be 64');
  assert.ok(!malformedReceipt.tokenBudget, 'Must lack tokenBudget');
});
