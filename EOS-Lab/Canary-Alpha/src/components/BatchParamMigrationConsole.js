import crypto from 'node:crypto';

export class BatchParamMigrationConsole {
  constructor(options = {}) {
    this.options = {
      mode: options.mode || 'ARM_AB', // CONTROL, ARM_A, ARM_B, ARM_AB
      targetCluster: options.targetCluster || 'canary-staging-cluster-1',
      sinkUrl: options.sinkUrl || '/api/telemetry/canary-param-migration',
      ...options
    };
    this.migrationHistory = [];
  }

  // Sanitization logic for Arm A and Arm AB
  sanitizeSecretValues(obj) {
    if (typeof obj === 'string') {
      const patterns = [
        /postgres:\/\/([^:]+):([^@]+)@/gi,
        /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/gi,
        /Bearer\s+[^\s,"]+/gi,
        /ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}(\.[A-Za-z0-9_\-]+)?/gi,
        /(sk_live_|pk_live_|key_live_)[A-Za-z0-9_\-]+/gi,
        /(apiKey|api_key|password|passwd|pwd|secret|token)\s*[:=]\s*["']?[^&\s,"')]+/gi
      ];

      let clean = obj;
      for (const p of patterns) {
        clean = clean.replace(p, (match) => {
          if (match.toLowerCase().startsWith('bearer ')) return 'Bearer [REDACTED_SECRET]';
          if (match.includes('://')) return match.replace(/:[^:@]+@/, ':[REDACTED_SECRET]@');
          return '[REDACTED_SECRET]';
        });
      }
      return clean;
    }

    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sanitizeSecretValues(item));

    const result = Object.create(null);
    for (const key of Object.keys(obj)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
      result[key] = this.sanitizeSecretValues(obj[key]);
    }
    return result;
  }

  processEnvelope(payload) {
    // Under Arm A and Arm AB, apply edge sanitization
    if (this.options.mode === 'ARM_A' || this.options.mode === 'ARM_AB') {
      return this.sanitizeSecretValues(payload);
    }
    // Under Control and Arm B, passthrough raw
    return payload;
  }

  // Live Accessible Feedback logic for Arm B and Arm AB
  validateSyntaxAndGenerateGuidance(rawStr) {
    if (this.options.mode !== 'ARM_B' && this.options.mode !== 'ARM_AB') {
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

    const liveAnnouncement = syntaxValid
      ? `Syntax valid. Ready to migrate. (${charCount} characters)`
      : `JSON syntax error: ${errorMessage || 'Incomplete structure'}.`;

    return {
      hasDynamicGuidance: true,
      syntaxValid,
      charCount,
      liveAnnouncement,
      errorMessage
    };
  }

  // Accessible WCAG 2.1 AA HTML Rendering
  renderTemplate(config = {}) {
    const title = config.title || 'Batch Parameter Migration Console';

    return `
<section class="canary-migration-container" role="region" aria-labelledby="migration-heading">
  <h2 id="migration-heading" class="canary-title">${title} (${this.options.mode})</h2>
  <p class="canary-desc">Enter target cluster configuration envelope. Real-time cognitive guidance and credential masking are applied in composite mode.</p>

  <form class="canary-migration-form" novalidate>
    <div class="canary-field">
      <label for="canary-migration-textarea" class="canary-label">Migration Parameters JSON:</label>
      <textarea id="canary-migration-textarea" class="canary-textarea" rows="8" placeholder='{\n  "targetCluster": "canary-1",\n  "configs": { ... }\n}' required aria-required="true"></textarea>
    </div>

    <div class="canary-actions">
      <button type="button" class="canary-btn-cancel">Clear</button>
      <button type="button" class="canary-btn-submit">Execute Migration</button>
    </div>

    <div class="canary-status-region" aria-live="polite" aria-atomic="true">
      Ready for input.
    </div>
  </form>
</section>
    `.trim();
  }
}
