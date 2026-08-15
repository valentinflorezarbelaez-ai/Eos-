import test from 'node:test';
import assert from 'node:assert/strict';
import { ContactSupportDispatcher } from '../src/components/ContactSupportDispatcher.js';

test('TDD-M002-01: ContactSupportDispatcher initializes with multi-field schema', () => {
  const dispatcher = new ContactSupportDispatcher();
  assert.equal(dispatcher.options.sinkUrl, '/api/telemetry/canary-support');
  assert.ok(Array.isArray(dispatcher.categories));
  assert.ok(dispatcher.categories.includes('TECHNICAL_ISSUE'));
  assert.ok(dispatcher.categories.includes('QUOTA_REQUEST'));
});

test('TDD-M002-02: Structured PII & Secret Sanitization masks PANs, SSNs, and Bearer tokens in nested objects', () => {
  const dispatcher = new ContactSupportDispatcher();

  const dirtyPayload = {
    category: 'BILLING_INQUIRY',
    contactEmail: 'operator@canary-alpha.dev',
    priority: 'HIGH',
    metadata: {
      userProvidedCard: '4532-1122-3344-5566 and SSN: 000-12-3456',
      authToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
      nestedDetails: {
        rawQuery: 'SELECT * FROM users WHERE token="sk_live_998877665544332211"&pwd=mySuperSecret123'
      }
    }
  };

  const clean = dispatcher.sanitizeStructuredPayload(dirtyPayload);

  // Assert all PII and credentials are recursively scrubbed
  assert.ok(!JSON.stringify(clean).includes('4532-1122-3344-5566'));
  assert.ok(!JSON.stringify(clean).includes('000-12-3456'));
  assert.ok(!JSON.stringify(clean).includes('sk_live_998877665544332211'));
  assert.ok(!JSON.stringify(clean).includes('mySuperSecret123'));
  assert.ok(JSON.stringify(clean).includes('[REDACTED_PII]'));
  assert.ok(JSON.stringify(clean).includes('[REDACTED_SECRET]'));
});

test('TDD-M002-03: Prototype Pollution Injection Guard blocks malicious keys', () => {
  const dispatcher = new ContactSupportDispatcher();

  const attackPayload = {
    category: 'SECURITY_REPORT',
    '__proto__': { 'pollutedKey': 'MALICIOUS_INJECTION' },
    'constructor': { 'prototype': { 'hacked': true } },
    metadata: {
      '__proto__': { 'nestedPollution': true }
    }
  };

  const clean = dispatcher.sanitizeStructuredPayload(attackPayload);

  // Assert prototype keys are stripped and global object prototype is untouched
  assert.equal(clean.__proto__, undefined);
  assert.equal(clean.pollutedKey, undefined);
  assert.equal({}.pollutedKey, undefined);
});

test('TDD-M002-04: Homoglyph Normalization neutralizes spoofed email domains', () => {
  const dispatcher = new ContactSupportDispatcher();
  // Using cyrillic 'а' (U+0430) instead of latin 'a'
  const cyrillicEmail = 'operаtor@canary.dev';
  const normalized = dispatcher.normalizeUnicode(cyrillicEmail);

  assert.equal(dispatcher.validateEmail(normalized), true);
  assert.equal(normalized, 'operator@canary.dev');
});

test('TDD-M002-05: Multi-Field Ticket Creation & Dispatch', () => {
  const dispatcher = new ContactSupportDispatcher();
  const ticket = dispatcher.createTicket({
    category: 'QUOTA_REQUEST',
    contactEmail: 'lead@canary-alpha.dev',
    priority: 'HIGH',
    message: 'Need token budget raised from 40k to 50k for multi-agent validation.'
  });

  assert.ok(ticket.ticketId.startsWith('TCK-'));
  assert.equal(ticket.missionId, 'CANARY-M002');
  assert.equal(ticket.status, 'QUEUED');
  assert.equal(ticket.sanitizedData.category, 'QUOTA_REQUEST');
  assert.equal(ticket.sanitizedData.priority, 'HIGH');
});

test('TDD-M002-06: Accessible Multi-Field Form Generation (WCAG AA)', () => {
  const dispatcher = new ContactSupportDispatcher();
  const html = dispatcher.renderTemplate({
    title: 'Submit Canary Support Inquiry'
  });

  assert.ok(html.includes('<fieldset class='), 'Must contain semantic fieldset');
  assert.ok(html.includes('<legend class='), 'Must contain legend');
  assert.ok(html.includes('<label for="canary-category-select"'), 'Must have explicit category label');
  assert.ok(html.includes('<label for="canary-email-input"'), 'Must have explicit email label');
  assert.ok(html.includes('<label for="canary-msg-input"'), 'Must have explicit message label');
  assert.ok(html.includes('aria-live="polite"'), 'Must have ARIA live region');
});
