import crypto from 'node:crypto';

export class DiagnosticReporter {
  constructor(options = {}) {
    this.options = {
      sinkUrl: options.sinkUrl || '/api/telemetry/canary-report',
      maxCommentLength: options.maxCommentLength || 1000,
      enableOfflineQueue: options.enableOfflineQueue !== false,
      ...options
    };
    this.queue = [];
  }

  // C-12: High-efficacy client-side secret & credential scrubbing
  sanitizePayload(payload = {}) {
    const secretPatterns = [
      // Bearer tokens
      /Bearer\s+[^\s,]+/gi,
      // Standalone JWT tokens (ey...)
      /ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}(\.[A-Za-z0-9_\-]+)?/gi,
      // API Keys (sk_live_, pk_live_, etc.)
      /(sk_live_|pk_live_|key_live_)[A-Za-z0-9_\-]+/gi,
      // Query param or JSON assignments with sensitive keys
      /(apiKey|api_key|password|passwd|pwd|secret|token)\s*[:=]\s*[^&\s,)]+/gi
    ];

    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      let clean = str;
      for (const pattern of secretPatterns) {
        clean = clean.replace(pattern, (match) => {
          if (match.toLowerCase().startsWith('bearer ')) return 'Bearer [REDACTED_SECRET]';
          return '[REDACTED_SECRET]';
        });
      }
      return clean;
    };

    const sanitized = {};
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        if (key.toLowerCase().includes('header') || key.toLowerCase().includes('auth')) {
          const headerObj = {};
          for (const [hKey, hVal] of Object.entries(value)) {
            if (['authorization', 'x-api-key', 'api-key', 'token'].includes(hKey.toLowerCase())) {
              headerObj[hKey] = '[REDACTED_SECRET]';
            } else {
              headerObj[hKey] = sanitizeString(String(hVal));
            }
          }
          sanitized[key] = headerObj;
        } else {
          sanitized[key] = this.sanitizePayload(value);
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  collectEnvironmentContext(mockParams = {}) {
    return {
      timestamp: new Date().toISOString(),
      userAgent: mockParams.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      viewportWidth: mockParams.viewport?.width || 1280,
      viewportHeight: mockParams.viewport?.height || 720,
      route: mockParams.currentRoute || '/',
      locale: mockParams.locale || 'en-US'
    };
  }

  createReport(data = {}) {
    const rawComment = (data.userComment || '').slice(0, this.options.maxCommentLength);
    const sanitizedContext = this.sanitizePayload({
      userComment: rawComment,
      errorContext: data.errorContext || {}
    });

    const envContext = this.collectEnvironmentContext(data.mockEnvironment);
    const idempotencyKey = `REP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const report = {
      idempotencyKey,
      missionId: 'CANARY-M001',
      projectId: 'PRJ-CANARY-ALPHA',
      createdAt: new Date().toISOString(),
      sanitizedComment: sanitizedContext.userComment,
      errorContext: sanitizedContext.errorContext,
      environment: envContext,
      status: 'QUEUED'
    };

    return report;
  }

  queueReport(report) {
    this.queue.push(report);
    return this.queue.length;
  }

  getQueueSize() {
    return this.queue.length;
  }

  drainQueue() {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  // C-13: Accessible Template Generation (WCAG 2.1 AA)
  renderTemplate(config = {}) {
    const title = config.title || 'Report an Issue';
    const submitLabel = config.submitLabel || 'Submit Report';

    return `
<div class="canary-modal-backdrop" id="diagnostic-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
  <div class="canary-modal-content">
    <header class="canary-modal-header">
      <h2 id="modal-title" class="canary-title">${title}</h2>
      <button type="button" class="canary-close-btn" aria-label="Close dialog">&times;</button>
    </header>
    <p id="modal-desc" class="canary-desc">Your environment context and error diagnostics will be safely sanitized before submission.</p>
    
    <form class="canary-form" novalidate>
      <div class="canary-field">
        <label for="canary-feedback-input" class="canary-label">Describe what happened:</label>
        <textarea id="canary-feedback-input" class="canary-textarea" rows="4" maxlength="1000" required aria-required="true" placeholder="E.g., I clicked export and the page didn't respond..."></textarea>
      </div>

      <div class="canary-actions">
        <button type="button" class="canary-btn-cancel">Cancel</button>
        <button type="button" class="canary-btn-submit">${submitLabel}</button>
      </div>

      <div class="canary-status-region" aria-live="polite" aria-atomic="true"></div>
    </form>
  </div>
</div>
    `.trim();
  }
}
