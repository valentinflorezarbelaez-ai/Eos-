import crypto from 'node:crypto';

export class CsvTabularDataUploader {
  constructor(options = {}) {
    this.options = {
      maxRows: options.maxRows || 5000,
      delimiter: options.delimiter || ',',
      sinkUrl: options.sinkUrl || '/api/telemetry/canary-csv-upload',
      ...options
    };
    this.uploadedBatches = [];
  }

  // Sanitize single cell: defense against CSV Formula Injection and PII/Secret leaks
  sanitizeCell(value, columnName = '') {
    if (typeof value !== 'string') return value;

    let str = value.trim();

    // 1. Formula Injection Defense:
    // If it starts with =, +, -, @, check if it's a legitimate number or an executable formula
    const formulaPrefixes = ['=', '+', '-', '@'];
    if (formulaPrefixes.some(p => str.startsWith(p))) {
      // If it's a valid integer or float (e.g. "-150.50", "+250"), treat as numeric
      const numericCheck = /^[+-]?\d+(\.\d+)?$/;
      if (numericCheck.test(str)) {
        if (str.startsWith('+')) str = str.slice(1); // Normalize +250 to 250
      } else {
        // Obfuscate / escape executable formula with a single quote prefix
        str = `'${str}`;
      }
    }

    // 2. PII / Secret Regex Scrubbing
    const piiPatterns = [
      /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{13,19}\b/g, // Credit card PANs
      /\b\d{3}-\d{2}-\d{4}\b/g,                     // US SSNs
      /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g // Phone numbers
    ];

    const secretPatterns = [
      /Bearer\s+[^\s,"]+/gi,
      /ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}(\.[A-Za-z0-9_\-]+)?/gi,
      /(sk_live_|pk_live_|key_live_)[A-Za-z0-9_\-]+/gi
    ];

    for (const p of piiPatterns) {
      str = str.replace(p, '[REDACTED_PII]');
    }
    for (const s of secretPatterns) {
      str = str.replace(s, (m) => m.toLowerCase().startsWith('bearer ') ? 'Bearer [REDACTED_SECRET]' : '[REDACTED_SECRET]');
    }

    return str;
  }

  // RFC-4180 compliant lightweight CSV parser
  parseCsv(rawCsvString) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    const str = rawCsvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const nextChar = str[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentCell += '"';
          i++; // Skip escaped quote
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentCell += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === this.options.delimiter) {
          currentRow.push(currentCell.trim());
          currentCell = '';
        } else if (char === '\n') {
          currentRow.push(currentCell.trim());
          if (currentRow.some(c => c.length > 0)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  // Full parsing, sanitization, and structured mapping
  parseAndSanitize(rawCsvString) {
    const rawRows = this.parseCsv(rawCsvString);
    if (rawRows.length === 0) {
      return { headers: [], rows: [], totalCount: 0 };
    }

    const headers = rawRows[0].map(h => this.sanitizeCell(h, 'header'));
    const dataRows = rawRows.slice(1, this.options.maxRows + 1);

    const sanitizedRows = dataRows.map(row => {
      const rowObj = Object.create(null); // Prototype-safe dictionary
      headers.forEach((header, idx) => {
        const rawVal = row[idx] !== undefined ? row[idx] : '';
        rowObj[header] = this.sanitizeCell(rawVal, header);
      });
      return rowObj;
    });

    const batchId = `CSV-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const result = {
      batchId,
      headers,
      rows: sanitizedRows,
      totalCount: sanitizedRows.length
    };

    this.uploadedBatches.push(result);
    return result;
  }

  // Accessible WCAG 2.1 AA Data Preview Table
  renderPreviewTable(parsedData = {}) {
    const headers = parsedData.headers || [];
    const rows = (parsedData.rows || []).slice(0, 10); // Preview first 10 rows

    return `
<div class="canary-csv-preview-container" role="region" aria-labelledby="csv-preview-heading">
  <h3 id="csv-preview-heading" class="canary-title">Sanitized Data Preview (${parsedData.totalCount || 0} total rows)</h3>
  
  <table class="canary-table" aria-label="Sanitized tabular data preview">
    <caption class="canary-caption">Preview of uploaded dataset with confidential PII and formula triggers sanitized.</caption>
    <thead class="canary-thead">
      <tr>
        ${headers.map(h => `<th scope="col" class="canary-th">${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody class="canary-tbody">
      ${rows.map(r => `
        <tr>
          ${headers.map(h => `<td class="canary-td">${r[h] || ''}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="canary-status-region" aria-live="polite" aria-atomic="true">
    Dataset validated successfully. Total rows: ${parsedData.totalCount || 0}.
  </div>
</div>
    `.trim();
  }
}
