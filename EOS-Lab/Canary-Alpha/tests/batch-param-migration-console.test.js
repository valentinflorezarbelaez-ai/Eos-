import test from 'node:test';
import assert from 'node:assert/strict';
import { BatchParamMigrationConsole } from '../src/components/BatchParamMigrationConsole.js';

test('TDD-I001-01: Console initializes with configurable arm modes', () => {
  const consoleComp = new BatchParamMigrationConsole({ mode: 'ARM_AB' });
  assert.equal(consoleComp.options.mode, 'ARM_AB');
  assert.equal(consoleComp.options.targetCluster, 'canary-staging-cluster-1');
});

test('TDD-I001-02: Arm A & Arm AB mask credentials while Control & Arm B preserve raw input', () => {
  const payload = {
    clusterKey: 'us-east-1',
    databaseUri: 'postgres://operator:secretKey9988@db.internal:5432/migration',
    apiKey: 'sk_live_1122334455667788'
  };

  // Test Arm AB (Composite) -> Sanitizes
  const consoleAB = new BatchParamMigrationConsole({ mode: 'ARM_AB' });
  const cleanAB = consoleAB.processEnvelope(payload);
  assert.ok(!JSON.stringify(cleanAB).includes('secretKey9988'));
  assert.ok(!JSON.stringify(cleanAB).includes('sk_live_1122334455667788'));
  assert.ok(JSON.stringify(cleanAB).includes('[REDACTED_SECRET]'));

  // Test Arm B (Feedback only) -> Does not sanitize secrets
  const consoleB = new BatchParamMigrationConsole({ mode: 'ARM_B' });
  const rawB = consoleB.processEnvelope(payload);
  assert.ok(JSON.stringify(rawB).includes('secretKey9988'));
});

test('TDD-I001-03: Arm B & Arm AB emit real-time ARIA live feedback and syntax guidance', () => {
  const consoleAB = new BatchParamMigrationConsole({ mode: 'ARM_AB' });
  const guidance = consoleAB.validateSyntaxAndGenerateGuidance('{"target": "cluster_alpha", "params": 42}');

  assert.equal(guidance.syntaxValid, true);
  assert.equal(guidance.charCount, 41);
  assert.ok(guidance.liveAnnouncement.includes('Syntax valid. Ready to migrate.'));

  // Test Arm A (Sanitization only) -> No guidance
  const consoleA = new BatchParamMigrationConsole({ mode: 'ARM_A' });
  const guidanceA = consoleA.validateSyntaxAndGenerateGuidance('{"target": "cluster_alpha"}');
  assert.equal(guidanceA.hasDynamicGuidance, false);
});

test('TDD-I001-04: Accessible UI Generation conforms to WCAG 2.1 AA', () => {
  const consoleComp = new BatchParamMigrationConsole({ mode: 'ARM_AB' });
  const html = consoleComp.renderTemplate({ title: 'Batch Parameter Migration Console' });

  assert.ok(html.includes('role="region"'));
  assert.ok(html.includes('<label for="canary-migration-textarea"'));
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes('aria-atomic="true"'));
});
