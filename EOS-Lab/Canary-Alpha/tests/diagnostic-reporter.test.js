import test from 'node:test';
import assert from 'node:assert/strict';
import { DiagnosticReporter } from '../src/components/DiagnosticReporter.js';

test('TDD-01: DiagnosticReporter initializes with default safe options', () => {
  const reporter = new DiagnosticReporter();
  assert.equal(reporter.options.sinkUrl, '/api/telemetry/canary-report');
  assert.equal(reporter.options.maxCommentLength, 1000);
  assert.equal(reporter.queue.length, 0);
});

test('TDD-02: Secret Sanitization scrubs Bearer tokens, passwords, and API keys', () => {
  const reporter = new DiagnosticReporter();

  const dirtyPayload = {
    userComment: 'Encountered error with Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and apiKey=sk_live_998877665544332211',
    errorStack: 'Error at fetch (password=secretPass123&token=tok_44332211)',
    headers: {
      Authorization: 'Bearer secret_token_xyz',
      'X-Api-Key': 'key_live_abcdef123456'
    }
  };

  const clean = reporter.sanitizePayload(dirtyPayload);

  // Assert no plaintext secrets survive
  assert.ok(!clean.userComment.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
  assert.ok(clean.userComment.includes('[REDACTED_SECRET]'));
  assert.ok(!clean.userComment.includes('sk_live_998877665544332211'));
  assert.ok(!clean.errorStack.includes('secretPass123'));
  assert.ok(clean.errorStack.includes('[REDACTED_SECRET]'));
  assert.equal(clean.headers.Authorization, '[REDACTED_SECRET]');
  assert.equal(clean.headers['X-Api-Key'], '[REDACTED_SECRET]');
});

test('TDD-03: Environment context collection extracts safe fingerprints', () => {
  const reporter = new DiagnosticReporter();
  const context = reporter.collectEnvironmentContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    viewport: { width: 1920, height: 1080 },
    currentRoute: '/dashboard/overview'
  });

  assert.equal(context.viewportWidth, 1920);
  assert.equal(context.viewportHeight, 1080);
  assert.equal(context.route, '/dashboard/overview');
  assert.ok(context.timestamp);
});

test('TDD-04: Report creation formats payload and assigns UUID idempotency key', () => {
  const reporter = new DiagnosticReporter();
  const report = reporter.createReport({
    userComment: 'The export button was unresponsive after clicking 3 times.',
    errorContext: { component: 'ExportModal', status: 504 },
    mockEnvironment: { currentRoute: '/reports/export' }
  });

  assert.ok(report.idempotencyKey.startsWith('REP-'));
  assert.equal(report.missionId, 'CANARY-M001');
  assert.equal(report.status, 'QUEUED');
  assert.equal(report.sanitizedComment, 'The export button was unresponsive after clicking 3 times.');
});

test('TDD-05: Offline queueing stores reports and supports drain', () => {
  const reporter = new DiagnosticReporter();
  
  reporter.queueReport({ reportId: 'REP-01', payload: 'data-1' });
  reporter.queueReport({ reportId: 'REP-02', payload: 'data-2' });
  assert.equal(reporter.getQueueSize(), 2);

  const drained = reporter.drainQueue();
  assert.equal(drained.length, 2);
  assert.equal(reporter.getQueueSize(), 0);
});

test('TDD-06: Accessible DOM Template generation conforms to WCAG AA requirements', () => {
  const reporter = new DiagnosticReporter();
  const html = reporter.renderTemplate({
    title: 'Report Canary Alpha Issue',
    submitLabel: 'Send Diagnostic Report'
  });

  // WCAG Checks
  assert.ok(html.includes('role="dialog"'), 'Must have role=dialog');
  assert.ok(html.includes('aria-labelledby='), 'Must have aria-labelledby');
  assert.ok(html.includes('aria-describedby='), 'Must have aria-describedby');
  assert.ok(html.includes('aria-live="polite"'), 'Must have ARIA live region for feedback');
  assert.ok(html.includes('<label for='), 'Must have explicit form labels');
  assert.ok(html.includes('type="button"'), 'Buttons must be typed explicitly');
});
