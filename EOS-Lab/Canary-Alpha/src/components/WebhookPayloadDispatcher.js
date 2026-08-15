import crypto from 'node:crypto';

export class WebhookPayloadDispatcher {
  constructor(options = {}) {
    this.options = {
      mode: options.mode || 'ARM_AB', // CONTROL, ARM_A, ARM_B, ARM_AB, ARM_BA
      targetUrl: options.targetUrl || 'https://api.internal/webhooks/dispatcher',
      signingSecret: options.signingSecret || 'whsec_test_secret_key_12345',
      ...options
    };
  }

  // Sanitization logic
  sanitizePayload(obj) {
    if (typeof obj === 'string') {
      const patterns = [
        /Bearer\s+[^\s,"]+/gi,
        /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}(\.[A-Za-z0-9_\-]+)?/gi,
        /(sk_live_|pk_live_|sec_live_|whsec_)[A-Za-z0-9_\-]+/gi,
        /(\?|&)(token|apiKey|api_key|secret)=[^&\s,"')]+/gi,
        /(apiKey|api_key|secret|password|token)\s*[:=]\s*["']?[^&\s,"')]+/gi
      ];

      let clean = obj;
      for (const p of patterns) {
        clean = clean.replace(p, (match) => {
          if (match.toLowerCase().startsWith('bearer ')) return 'Bearer [REDACTED_SECRET]';
          if (match.startsWith('?') || match.startsWith('&')) return `${match[0]}token=[REDACTED_SECRET]`;
          return '[REDACTED_SECRET]';
        });
      }
      return clean;
    }

    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sanitizePayload(item));

    const result = Object.create(null);
    for (const key of Object.keys(obj)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
      result[key] = this.sanitizePayload(obj[key]);
    }
    return result;
  }

  processWebhook(payload) {
    // Under Arm A and Arm AB (Correct order), sanitize immediately
    if (this.options.mode === 'ARM_A' || this.options.mode === 'ARM_AB') {
      return this.sanitizePayload(payload);
    }

    // Under Arm BA (Reversed order), payload is sanitized only upon final dispatch
    if (this.options.mode === 'ARM_BA') {
      return this.sanitizePayload(payload);
    }

    // Under Control and Arm B, preserve raw
    return payload;
  }

  generateLiveFeedback(rawStr) {
    if (this.options.mode !== 'ARM_B' && this.options.mode !== 'ARM_AB' && this.options.mode !== 'ARM_BA') {
      return { hasDynamicGuidance: false };
    }

    const charCount = typeof rawStr === 'string' ? rawStr.length : 0;
    let syntaxValid = false;
    let errorMessage = null;

    try {
      if (typeof rawStr === 'string' && rawStr.trim().length > 0) {
        JSON.parse(rawStr);
        syntaxValid = true;
      }
    } catch (err) {
      errorMessage = err.message;
    }

    // If Arm BA, flag the reversed-order desynchronization hazard
    if (this.options.mode === 'ARM_BA') {
      const hasUnmaskedSecret = /(sec_live_|whsec_|Bearer\s+|apiKey)/i.test(rawStr);
      const liveAnnouncement = hasUnmaskedSecret
        ? `Warning: Raw unmasked credentials detected in preview buffer (${charCount} characters). Output desynchronization will occur on submit.`
        : `Syntax valid (Reversed mode). (${charCount} characters)`;

      return {
        hasDynamicGuidance: true,
        isOrderReversed: true,
        syntaxValid,
        charCount,
        liveAnnouncement,
        errorMessage
      };
    }

    const liveAnnouncement = syntaxValid
      ? `Syntax valid. Webhook payload ready for dispatch (${charCount} characters).`
      : `JSON syntax error: ${errorMessage || 'Incomplete JSON payload'}.`;

    return {
      hasDynamicGuidance: true,
      isOrderReversed: false,
      syntaxValid,
      charCount,
      liveAnnouncement,
      errorMessage
    };
  }

  renderTemplate(config = {}) {
    const title = config.title || 'Webhook Payload Dispatcher';

    return `
<section class="canary-webhook-container" role="region" aria-labelledby="webhook-heading">
  <h2 id="webhook-heading" class="canary-title">${title} (${this.options.mode})</h2>
  <p class="canary-desc">Configure outgoing webhook endpoints, headers, and JSON body. Real-time cognitive guidance and signature masking active in composite mode.</p>

  <form class="canary-webhook-form" novalidate>
    <div class="canary-field">
      <label for="webhook-url-input" class="canary-label">Webhook Destination URL:</label>
      <input type="url" id="webhook-url-input" class="canary-input" placeholder="https://api.partner.com/events" required aria-required="true" />
    </div>

    <div class="canary-field">
      <label for="webhook-payload-input" class="canary-label">Webhook JSON Payload:</label>
      <textarea id="webhook-payload-input" class="canary-textarea" rows="6" placeholder='{\n  "event": "order.completed",\n  "amount": 100\n}' required aria-required="true"></textarea>
    </div>

    <div class="canary-actions">
      <button type="button" class="canary-btn-cancel">Reset</button>
      <button type="button" class="canary-btn-submit">Dispatch Webhook</button>
    </div>

    <div class="canary-status-region" aria-live="polite" aria-atomic="true">
      Ready for webhook configuration.
    </div>
  </form>
</section>
    `.trim();
  }
}
