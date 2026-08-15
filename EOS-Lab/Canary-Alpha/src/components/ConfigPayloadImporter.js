import crypto from 'node:crypto';

export class ConfigPayloadImporter {
  constructor(options = {}) {
    this.options = {
      maxDepth: options.maxDepth || 10,
      maxPayloadBytes: options.maxPayloadBytes || 500000,
      sinkUrl: options.sinkUrl || '/api/telemetry/canary-config-import',
      ...options
    };
    this.importedConfigs = [];
  }

  // Sniff Base64 encoded secret strings
  isBase64Secret(str) {
    if (typeof str !== 'string' || str.length < 16 || str.length > 512) return false;
    // Check if valid base64 pattern
    if (!/^[A-Za-z0-9+/=]+$/.test(str)) return false;
    try {
      const decoded = Buffer.from(str, 'base64').toString('utf8');
      // If decoded contains secret tokens (sk_live_, eyJ, password=, Bearer, etc.)
      const secretCheck = /(sk_live_|pk_live_|Bearer\s|eyJ[A-Za-z0-9_\-]{5,}|password=|passwd=)/i;
      return secretCheck.test(decoded);
    } catch {
      return false;
    }
  }

  // Deep recursive parser & sanitizer with cycle detection WeakSet
  parseAndSanitize(input, depth = 0, seen = new WeakSet()) {
    if (depth > this.options.maxDepth) {
      return '[MAX_DEPTH_EXCEEDED_TRUNCATED]';
    }

    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }

    if (typeof input !== 'object' || input === null) {
      return input;
    }

    // Cycle detection guard
    if (seen.has(input)) {
      return '[CIRCULAR_REFERENCE_NORMALIZED]';
    }
    seen.add(input);

    if (Array.isArray(input)) {
      return input.map(item => this.parseAndSanitize(item, depth + 1, seen));
    }

    const clean = Object.create(null); // Prototype-pollution safe dictionary
    for (const key of Object.keys(input)) {
      // Prototype injection block
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        continue;
      }
      clean[key] = this.parseAndSanitize(input[key], depth + 1, seen);
    }

    return clean;
  }

  sanitizeString(str) {
    if (typeof str !== 'string') return str;

    // Check Base64 obfuscated secrets first
    if (this.isBase64Secret(str)) {
      return '[REDACTED_OBFUSCATED_SECRET]';
    }

    // Standard credential & URI connection strings patterns
    const patterns = [
      /postgres:\/\/([^:]+):([^@]+)@/gi,
      /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/gi,
      /Bearer\s+[^\s,"]+/gi,
      /ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}(\.[A-Za-z0-9_\-]+)?/gi,
      /(sk_live_|pk_live_|key_live_)[A-Za-z0-9_\-]+/gi,
      /(apiKey|api_key|password|passwd|pwd|secret|token)\s*[:=]\s*["']?[^&\s,"')]+/gi
    ];

    let clean = str;
    for (const pattern of patterns) {
      clean = clean.replace(pattern, (match) => {
        if (match.toLowerCase().startsWith('bearer ')) return 'Bearer [REDACTED_SECRET]';
        if (match.includes('://')) return match.replace(/:[^:@]+@/, ':[REDACTED_SECRET]@');
        return '[REDACTED_SECRET]';
      });
    }

    return clean;
  }

  importRawString(rawStr) {
    if (typeof rawStr !== 'string') {
      return { success: false, errorType: 'INVALID_INPUT', errorMessage: 'Input must be a string' };
    }

    if (Buffer.byteLength(rawStr, 'utf8') > this.options.maxPayloadBytes) {
      return { success: false, errorType: 'PAYLOAD_TOO_LARGE', errorMessage: 'Payload exceeds max size limit' };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawStr);
    } catch (err) {
      return {
        success: false,
        errorType: 'SYNTAX_ERROR',
        errorMessage: `JSON syntax error: ${err.message}`
      };
    }

    const sanitized = this.parseAndSanitize(parsed);
    const importId = `CFG-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const record = {
      importId,
      missionId: 'CANARY-M003',
      projectId: 'PRJ-CANARY-ALPHA',
      importedAt: new Date().toISOString(),
      sanitizedConfig: sanitized,
      status: 'IMPORTED'
    };

    this.importedConfigs.push(record);
    return { success: true, importRecord: record };
  }

  // Accessible WCAG 2.1 AA template
  renderTemplate(config = {}) {
    const title = config.title || 'Configuration Importer';

    return `
<section class="canary-importer-container" role="region" aria-labelledby="importer-title">
  <h2 id="importer-title" class="canary-title">${title}</h2>
  <p class="canary-desc">Paste raw JSON configuration or environment settings below. Nested credentials and obfuscated tokens will be scrubbed automatically.</p>

  <form class="canary-importer-form" novalidate>
    <div class="canary-field">
      <label for="canary-raw-config-input" class="canary-label">Raw JSON / Data Payload:</label>
      <textarea id="canary-raw-config-input" class="canary-textarea" rows="8" placeholder='{\n  "service": "database",\n  "config": { ... }\n}' required aria-required="true"></textarea>
    </div>

    <div class="canary-actions">
      <button type="button" class="canary-btn-cancel">Clear</button>
      <button type="button" class="canary-btn-submit">Import & Sanitize</button>
    </div>

    <div class="canary-status-region" aria-live="polite" aria-atomic="true"></div>
  </form>
</section>
    `.trim();
  }
}
