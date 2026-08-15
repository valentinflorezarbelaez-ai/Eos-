import path from 'path';
import fs from 'fs';

/**
 * Validates path canonicality and scope containment.
 * Enforces PATH-I01 to PATH-I06.
 * 
 * @param {string} rawPath - Raw path input string as declared in task/payload
 * @param {string[]} authorizedFiles - List of explicitly authorized canonical relative paths
 * @param {string} sandboxRoot - Absolute path to sandbox root
 * @returns {{ allowed: boolean, canonicalPath?: string, reason?: string, resolvedPhysicalPath?: string }}
 */
export function validateCanonicalPath(rawPath, authorizedFiles, sandboxRoot) {
  if (typeof rawPath !== 'string' || !rawPath.trim()) {
    return { allowed: false, reason: 'DENIED_INVALID_EMPTY_PATH' };
  }

  // 1. Check for null bytes or encoding exploits
  if (rawPath.includes('\0') || rawPath.includes('%00')) {
    return { allowed: false, reason: 'DENIED_NULL_BYTE_EXPLOIT' };
  }

  // 2. Check for absolute paths
  if (path.isAbsolute(rawPath) || rawPath.startsWith('/') || rawPath.startsWith('\\') || /^[a-zA-Z]:/.test(rawPath)) {
    return { allowed: false, reason: 'DENIED_ABSOLUTE_PATH' };
  }

  // 3. Check for redundant slashes (// or \\)
  if (/\/{2,}|\\{2,}/.test(rawPath)) {
    return { allowed: false, reason: 'DENIED_NON_CANONICAL_REDUNDANT_SLASHES' };
  }

  // 4. Check for leading './' or '.\'
  if (rawPath.startsWith('./') || rawPath.startsWith('.\\')) {
    return { allowed: false, reason: 'DENIED_NON_CANONICAL_RELATIVE_PREFIX' };
  }

  // 5. Check for traversal segments or dot segments
  const segments = rawPath.split(/[/\\]/);
  if (segments.includes('..')) {
    return { allowed: false, reason: 'DENIED_PATH_TRAVERSAL' };
  }
  if (segments.includes('.')) {
    return { allowed: false, reason: 'DENIED_NON_CANONICAL_DOT_SEGMENT' };
  }

  // 6. Check for trailing slash on file path
  if (rawPath.endsWith('/') || rawPath.endsWith('\\')) {
    return { allowed: false, reason: 'DENIED_NON_CANONICAL_TRAILING_SLASH' };
  }

  // 7. Check for case-sensitive canonical exact match against authorized_files
  const normalizedSlash = rawPath.replace(/\\/g, '/');
  if (!authorizedFiles.includes(normalizedSlash)) {
    // Check if it's a case-insensitive variant of an authorized file
    const lowerMatch = authorizedFiles.find(f => f.toLowerCase() === normalizedSlash.toLowerCase());
    if (lowerMatch) {
      return { allowed: false, reason: 'DENIED_CASE_MISMATCH' };
    }
    return { allowed: false, reason: 'DENIED_SCOPE_VIOLATION' };
  }

  // 8. Physical Resolution & Symlink check
  const fullPhysicalPath = path.resolve(sandboxRoot, normalizedSlash);
  const normalizedSandboxRoot = path.resolve(sandboxRoot);

  if (!fullPhysicalPath.startsWith(normalizedSandboxRoot)) {
    return { allowed: false, reason: 'DENIED_SYMLINK_ESCAPE' };
  }

  // If file exists, check realpath (symlink resolution)
  if (fs.existsSync(fullPhysicalPath)) {
    try {
      const realPhysicalPath = fs.realpathSync(fullPhysicalPath);
      if (!realPhysicalPath.startsWith(normalizedSandboxRoot)) {
        return { allowed: false, reason: 'DENIED_SYMLINK_ESCAPE' };
      }
    } catch {
      // If error resolving, maintain containment
    }
  }

  return {
    allowed: true,
    canonicalPath: normalizedSlash,
    resolvedPhysicalPath: fullPhysicalPath
  };
}
