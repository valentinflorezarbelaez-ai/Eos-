import test from 'node:test';
import assert from 'node:assert/strict';
import { ConfigPayloadImporter } from '../src/components/ConfigPayloadImporter.js';

test('TDD-M003-01: ConfigPayloadImporter initializes with safe recursion and depth limits', () => {
  const importer = new ConfigPayloadImporter();
  assert.equal(importer.options.maxDepth, 10);
  assert.equal(importer.options.maxPayloadBytes, 500000);
});

test('TDD-M003-02: Deeply nested (6-level) JSON payload sanitization masks hidden secrets', () => {
  const importer = new ConfigPayloadImporter();

  const deeplyNestedConfig = {
    app: {
      services: {
        database: {
          connection: {
            cluster: {
              credentials: {
                uri: 'postgres://admin:superSecretPass123@db.cluster.internal:5432/canary',
                apiKey: 'sk_live_998877665544332211',
                backupAuth: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0'
              }
            }
          }
        }
      }
    }
  };

  const clean = importer.parseAndSanitize(deeplyNestedConfig);

  // Assert all 6-level deep secrets are sanitized
  const jsonStr = JSON.stringify(clean);
  assert.ok(!jsonStr.includes('superSecretPass123'));
  assert.ok(!jsonStr.includes('sk_live_998877665544332211'));
  assert.ok(!jsonStr.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
  assert.ok(jsonStr.includes('[REDACTED_SECRET]'));
});

test('TDD-M003-03: Base64-obfuscated credential detection masks hidden payload', () => {
  const importer = new ConfigPayloadImporter();

  // "sk_live_1234567890abcdef" in Base64 is "c2tfbGl2ZV8xMjM0NTY3ODkwYWJjZGVm"
  const payloadWithBase64 = {
    envKey: 'PRODUCTION_INTEGRATION',
    encodedSecretBlob: 'c2tfbGl2ZV8xMjM0NTY3ODkwYWJjZGVm',
    plainParam: 'standard_configuration'
  };

  const clean = importer.parseAndSanitize(payloadWithBase64);
  const jsonStr = JSON.stringify(clean);

  assert.ok(!jsonStr.includes('c2tfbGl2ZV8xMjM0NTY3ODkwYWJjZGVm'));
  assert.ok(jsonStr.includes('[REDACTED_OBFUSCATED_SECRET]'));
});

test('TDD-M003-04: Circular reference detection neutralizes infinite loops gracefully', () => {
  const importer = new ConfigPayloadImporter();

  const circularObj = {
    name: 'CanaryConfigRoot',
    version: '1.0'
  };
  circularObj.selfRef = circularObj; // Circular link

  const clean = importer.parseAndSanitize(circularObj);

  assert.equal(clean.name, 'CanaryConfigRoot');
  assert.equal(clean.selfRef, '[CIRCULAR_REFERENCE_NORMALIZED]');
});

test('TDD-M003-05: Raw string JSON parser handles malformed syntax and throws typed error', () => {
  const importer = new ConfigPayloadImporter();

  const malformedJson = '{ "unclosed": "brace", ';
  const result = importer.importRawString(malformedJson);

  assert.equal(result.success, false);
  assert.equal(result.errorType, 'SYNTAX_ERROR');
  assert.ok(result.errorMessage);
});

test('TDD-M003-06: Accessible Importer UI Generation (WCAG AA)', () => {
  const importer = new ConfigPayloadImporter();
  const html = importer.renderTemplate({
    title: 'Import Operational Configuration'
  });

  assert.ok(html.includes('role="region"'));
  assert.ok(html.includes('aria-labelledby="importer-title"'));
  assert.ok(html.includes('<label for="canary-raw-config-input"'));
  assert.ok(html.includes('aria-live="polite"'));
});
