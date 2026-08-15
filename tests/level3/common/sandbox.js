import fs from 'fs';
import path from 'path';
import { computeTreeHash } from './tree-hash.js';

const ALLOWED_SANDBOX_PARENT = path.resolve('tests/fixtures/level3-sandbox');
const FORBIDDEN_PATHS = [
  'Fundacion',
  'fundacion',
  'docs/projects/registrations',
  'scripts'
];

/**
 * Initializes and manages an isolated Level 3 test sandbox.
 */
export class Level3Sandbox {
  /**
   * @param {string} sandboxName 
   */
  constructor(sandboxName) {
    this.name = sandboxName;
    this.sandboxPath = path.join(ALLOWED_SANDBOX_PARENT, sandboxName);
    this.validateSafety();
  }

  validateSafety() {
    const normalized = path.resolve(this.sandboxPath);
    // Security check: Must be inside ALLOWED_SANDBOX_PARENT
    if (!normalized.startsWith(ALLOWED_SANDBOX_PARENT)) {
      throw new Error(`CRITICAL SECURITY VIOLATION: Sandbox path "${normalized}" escapes allowed sandbox root "${ALLOWED_SANDBOX_PARENT}".`);
    }

    for (const forbidden of FORBIDDEN_PATHS) {
      if (normalized.includes(forbidden)) {
        throw new Error(`CRITICAL SECURITY VIOLATION: Sandbox path "${normalized}" targets forbidden keyword "${forbidden}".`);
      }
    }
  }

  /**
   * Cleans and recreates the sandbox directory.
   */
  init(initialFiles = {}) {
    this.validateSafety();
    if (fs.existsSync(this.sandboxPath)) {
      fs.rmSync(this.sandboxPath, { recursive: true, force: true });
    }
    fs.mkdirSync(this.sandboxPath, { recursive: true });

    for (const [relPath, content] of Object.entries(initialFiles)) {
      const fullPath = path.join(this.sandboxPath, relPath);
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, 'utf8');
    }

    return this.captureState();
  }

  captureState() {
    this.validateSafety();
    return computeTreeHash(this.sandboxPath);
  }

  writeFile(relPath, content) {
    this.validateSafety();
    const fullPath = path.join(this.sandboxPath, relPath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  readFile(relPath) {
    this.validateSafety();
    const fullPath = path.join(this.sandboxPath, relPath);
    return fs.readFileSync(fullPath, 'utf8');
  }

  deleteFile(relPath) {
    this.validateSafety();
    const fullPath = path.join(this.sandboxPath, relPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { force: true });
    }
  }

  destroy() {
    this.validateSafety();
    if (fs.existsSync(this.sandboxPath)) {
      fs.rmSync(this.sandboxPath, { recursive: true, force: true });
    }
  }
}
