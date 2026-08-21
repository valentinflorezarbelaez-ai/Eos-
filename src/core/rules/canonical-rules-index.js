/**
 * @module CanonicalRulesIndex
 * @description Loads the local canonical rules index for Tutor and CLI citation.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_INDEX = path.resolve(__dirname, '../../../docs/rules/CANONICAL_RULES_INDEX.json');

export class CanonicalRulesIndex {
  constructor(options = {}) {
    this.indexPath = options.indexPath || DEFAULT_INDEX;
    this._data = null;
  }

  load() {
    if (this._data) return this._data;
    if (!fs.existsSync(this.indexPath)) {
      const err = new Error(`RULES_INDEX_MISSING: ${this.indexPath}`);
      err.code = 'RULES_INDEX_MISSING';
      throw err;
    }
    this._data = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
    return this._data;
  }

  list() {
    return this.load().rules || [];
  }

  get(ruleId) {
    return this.list().find((r) => r.rule_id === ruleId) || null;
  }

  cite(ruleIds = []) {
    return ruleIds
      .map((id) => this.get(id))
      .filter(Boolean)
      .map((r) => `${r.rule_id}: ${r.statement}`);
  }
}
