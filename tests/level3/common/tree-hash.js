import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Deterministic TreeHash calculation for a directory.
 * Traverses files recursively, computes SHA-256 of contents, sorts paths, and hashes the manifest.
 * @param {string} dirPath - Absolute path to directory
 * @param {string[]} [ignorePatterns=['.git']] - Patterns to ignore
 * @returns {{ treeHash: string, fileCount: number, manifest: Record<string, string> }}
 */
export function computeTreeHash(dirPath, ignorePatterns = ['.git']) {
  if (!fs.existsSync(dirPath)) {
    return {
      treeHash: crypto.createHash('sha256').update('EMPTY_OR_NON_EXISTENT').digest('hex'),
      fileCount: 0,
      manifest: {}
    };
  }

  const manifest = {};

  function traverse(currentPath, relativePath = '') {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const relEntry = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (ignorePatterns.some(p => relEntry === p || relEntry.startsWith(`${p}/`))) {
        continue;
      }

      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath, relEntry);
      } else if (entry.isFile()) {
        const fileBuffer = fs.readFileSync(fullPath);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        manifest[relEntry] = fileHash;
      }
    }
  }

  traverse(dirPath);

  // Deterministically sort keys
  const sortedKeys = Object.keys(manifest).sort();
  const manifestHash = crypto.createHash('sha256');
  for (const key of sortedKeys) {
    manifestHash.update(`${key}:${manifest[key]}\n`);
  }

  return {
    treeHash: sortedKeys.length === 0 ? crypto.createHash('sha256').update('EMPTY_DIR').digest('hex') : manifestHash.digest('hex'),
    fileCount: sortedKeys.length,
    manifest
  };
}
