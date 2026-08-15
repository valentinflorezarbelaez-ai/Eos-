import crypto from 'node:crypto';

export class ContactSupportDispatcher {
  constructor(options = {}) {
    this.options = {
      sinkUrl: options.sinkUrl || '/api/telemetry/canary-support',
      maxMessageLength: options.maxMessageLength || 2000,
      ...options
    };
    this.categories = [
      'TECHNICAL_ISSUE',
      'QUOTA_REQUEST',
      'SECURITY_REPORT',
      'GENERAL_INQUIRY'
    ];
    this.priorities = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
    this.queue = [];
  }

  // Unicode Homoglyph Map & Normalization
  normalizeUnicode(str) {
    if (typeof str !== 'string') return str;
    // Map common cyrillic/greek homoglyphs to latin equivalents
    const homoglyphMap = {
      '\u0430': 'a', '\u0410': 'A', // Cyrillic A
      '\u0435': 'e', '\u0415': 'E', // Cyrillic E
      '\u043E': 'o', '\u041E': 'O', // Cyrillic O
      '\u0440': 'p', '\u0420': 'P', // Cyrillic P
      '\u0441': 'c', '\u0421': 'C', // Cyrillic C
      '\u0443': 'y', '\u0423': 'Y', // Cyrillic Y
      '\u0445': 'x', '\u0425': 'X', // Cyrillic X
      '\u0456': 'i', '\u0406': 'I'  // Cyrillic I
    };

    let normalized = '';
    for (const char of str) {
      normalized += homoglyphMap[char] || char;
    }
    return normalized.normalize('NFKC');
  }

  validateEmail(email) {
    if (typeof email !== 'string') return false;
    const normalized = this.normalizeUnicode(email.trim());
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(normalized);
  }

  // Recursive deep structured PII & Credential Sanitization
  sanitizeStructuredPayload(payload = {}) {
    const piiPatterns = [
      // Credit card PANs (13-19 digits formatted or unformatted)
      /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{13,19}\b/g,
      // US SSNs (000-00-0000)
      /\b\d{3}-\d{2}-\d{4}\b/g,
      // Phone numbers
      /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
    ];

    const secretPatterns = [
      // Bearer / JWT tokens
      /Bearer\s+[^\s,]+/gi,
      /ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}(\.[A-Za-z0-9_\-]+)?/gi,
      // API keys
      /(sk_live_|pk_live_|key_live_)[A-Za-z0-9_\-]+/gi,
      // Key-value password/token query assignments
      /(apiKey|api_key|password|passwd|pwd|secret|token)\s*[:=]\s*["']?[^&\s,"')]+/gi
    ];

    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      let clean = this.normalizeUnicode(str);
      for (const pattern of piiPatterns) {
        clean = clean.replace(pattern, '[REDACTED_PII]');
      }
      for (const pattern of secretPatterns) {
        clean = clean.replace(pattern, (match) => {
          if (match.toLowerCase().startsWith('bearer ')) return 'Bearer [REDACTED_SECRET]';
          return '[REDACTED_SECRET]';
        });
      }
      return clean;
    };

    const cleanObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) {
        return sanitizeString(obj);
      }

      if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item));
      }

      const result = Object.create(null); // Prevents prototype pollution
      for (const key of Object.keys(obj)) {
        // Prototype pollution guard
        if (['__proto__', 'constructor', 'prototype'].includes(key)) {
          continue;
        }
        result[key] = cleanObject(obj[key]);
      }
      return result;
    };

    return cleanObject(payload);
  }

  createTicket(data = {}) {
    const rawData = {
      category: data.category || 'TECHNICAL_ISSUE',
      contactEmail: this.normalizeUnicode(data.contactEmail || ''),
      priority: data.priority || 'NORMAL',
      message: (data.message || '').slice(0, this.options.maxMessageLength),
      metadata: data.metadata || {}
    };

    const sanitizedData = this.sanitizeStructuredPayload(rawData);
    const ticketId = `TCK-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const ticket = {
      ticketId,
      missionId: 'CANARY-M002',
      projectId: 'PRJ-CANARY-ALPHA',
      createdAt: new Date().toISOString(),
      sanitizedData,
      status: 'QUEUED'
    };

    this.queue.push(ticket);
    return ticket;
  }

  // Accessible Multi-Field HTML Template (WCAG 2.1 AA)
  renderTemplate(config = {}) {
    const title = config.title || 'Canary Support Dispatcher';

    return `
<div class="canary-support-container" id="support-dispatcher-container">
  <form class="canary-support-form" novalidate aria-labelledby="form-heading">
    <h2 id="form-heading" class="canary-title">${title}</h2>
    
    <fieldset class="canary-fieldset">
      <legend class="canary-legend">Support Request Details</legend>

      <div class="canary-field">
        <label for="canary-category-select" class="canary-label">Inquiry Category:</label>
        <select id="canary-category-select" class="canary-select" required aria-required="true">
          <option value="TECHNICAL_ISSUE">Technical Issue</option>
          <option value="QUOTA_REQUEST">Quota Increase Request</option>
          <option value="SECURITY_REPORT">Security Disclosure</option>
          <option value="GENERAL_INQUIRY">General Inquiry</option>
        </select>
      </div>

      <div class="canary-field">
        <label for="canary-email-input" class="canary-label">Operator Contact Email:</label>
        <input type="email" id="canary-email-input" class="canary-input" placeholder="operator@canary-alpha.dev" required aria-required="true">
      </div>

      <div class="canary-field">
        <label for="canary-priority-select" class="canary-label">Priority Level:</label>
        <select id="canary-priority-select" class="canary-select">
          <option value="LOW">Low</option>
          <option value="NORMAL" selected>Normal</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div class="canary-field">
        <label for="canary-msg-input" class="canary-label">Message Details:</label>
        <textarea id="canary-msg-input" class="canary-textarea" rows="5" maxlength="2000" required aria-required="true" placeholder="Provide operational context..."></textarea>
      </div>

      <div class="canary-actions">
        <button type="button" class="canary-btn-cancel">Reset</button>
        <button type="button" class="canary-btn-submit">Dispatch Ticket</button>
      </div>

      <div class="canary-status-region" aria-live="polite" aria-atomic="true"></div>
    </fieldset>
  </form>
</div>
    `.trim();
  }
}
