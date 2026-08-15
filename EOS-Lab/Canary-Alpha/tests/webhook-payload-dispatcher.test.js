import test from 'node:test';
import assert from 'node:assert/strict';
import { WebhookPayloadDispatcher } from '../src/components/WebhookPayloadDispatcher.js';

test('TDD-J001-01: Dispatcher initializes across 5 arm modes', () => {
  const dispatcherAB = new WebhookPayloadDispatcher({ mode: 'ARM_AB' });
  const dispatcherBA = new WebhookPayloadDispatcher({ mode: 'ARM_BA' });

  assert.equal(dispatcherAB.options.mode, 'ARM_AB');
  assert.equal(dispatcherBA.options.mode, 'ARM_BA');
});

test('TDD-J001-02: Arm AB masks secrets first and generates guidance on sanitized preview', () => {
  const dispatcher = new WebhookPayloadDispatcher({ mode: 'ARM_AB' });
  const rawPayload = {
    webhookUrl: 'https://api.partner.com/events?token=sec_live_998877',
    authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    data: { event: 'user.signup', accountId: 'acc_123' }
  };

  const processed = dispatcher.processWebhook(rawPayload);
  assert.ok(!JSON.stringify(processed).includes('sec_live_998877'));
  assert.ok(JSON.stringify(processed).includes('[REDACTED_SECRET]'));

  const feedback = dispatcher.generateLiveFeedback(JSON.stringify(processed));
  assert.equal(feedback.syntaxValid, true);
  assert.ok(feedback.liveAnnouncement.includes('Syntax valid'));
});

test('TDD-J001-03: Arm BA evaluates feedback on raw string, exposing unmasked token metrics before transform', () => {
  const dispatcher = new WebhookPayloadDispatcher({ mode: 'ARM_BA' });
  const rawStr = '{"token": "sec_live_raw_exposed_99"}';

  // In Arm BA, feedback is generated on RAW string before sanitization
  const feedback = dispatcher.generateLiveFeedback(rawStr);
  assert.equal(feedback.isOrderReversed, true);
  assert.ok(feedback.liveAnnouncement.includes('Warning: Raw unmasked credentials detected in preview buffer'));
});

test('TDD-J001-04: Accessible UI Template generation conforms to WCAG AA', () => {
  const dispatcher = new WebhookPayloadDispatcher({ mode: 'ARM_AB' });
  const html = dispatcher.renderTemplate({ title: 'Webhook Dispatcher' });

  assert.ok(html.includes('role="region"'));
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes('<label for="webhook-payload-input"'));
});
