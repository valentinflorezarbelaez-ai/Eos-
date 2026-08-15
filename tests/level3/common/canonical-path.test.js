import { validateCanonicalPath } from './canonical-path.js';
import path from 'path';

export function runCanonicalPathRegression() {
  const sandboxRoot = path.resolve('tests/fixtures/level3-sandbox/regression');
  const authorizedFiles = ['src/app.js', 'package.json'];

  const testCases = [
    { id: 'REG-PATH-001', input: 'src//app.js', expectedAllowed: false, expectedReason: 'DENIED_NON_CANONICAL_REDUNDANT_SLASHES' },
    { id: 'REG-PATH-002', input: 'src/./app.js', expectedAllowed: false, expectedReason: 'DENIED_NON_CANONICAL_DOT_SEGMENT' },
    { id: 'REG-PATH-003', input: 'src/a/../app.js', expectedAllowed: false, expectedReason: 'DENIED_PATH_TRAVERSAL' },
    { id: 'REG-PATH-004', input: './src/app.js', expectedAllowed: false, expectedReason: 'DENIED_NON_CANONICAL_RELATIVE_PREFIX' },
    { id: 'REG-PATH-005', input: 'src/app.js/', expectedAllowed: false, expectedReason: 'DENIED_NON_CANONICAL_TRAILING_SLASH' },
    { id: 'REG-PATH-006', input: 'src///app.js', expectedAllowed: false, expectedReason: 'DENIED_NON_CANONICAL_REDUNDANT_SLASHES' },
    { id: 'REG-PATH-007', input: 'SRC/APP.JS', expectedAllowed: false, expectedReason: 'DENIED_CASE_MISMATCH' },
    { id: 'REG-PATH-008', input: 'src/../secret.txt', expectedAllowed: false, expectedReason: 'DENIED_PATH_TRAVERSAL' },
    { id: 'REG-PATH-009', input: '/absolute/path/app.js', expectedAllowed: false, expectedReason: 'DENIED_ABSOLUTE_PATH' },
    { id: 'REG-PATH-010', input: 'src/unauthorized.js', expectedAllowed: false, expectedReason: 'DENIED_SCOPE_VIOLATION' },
    { id: 'REG-PATH-011', input: 'src/app.js%00.exe', expectedAllowed: false, expectedReason: 'DENIED_NULL_BYTE_EXPLOIT' },
    { id: 'REG-PATH-012', input: 'src/app.js', expectedAllowed: true, expectedReason: undefined }
  ];

  const results = [];
  for (const tc of testCases) {
    const res = validateCanonicalPath(tc.input, authorizedFiles, sandboxRoot);
    const passed = res.allowed === tc.expectedAllowed && (tc.expectedReason ? res.reason === tc.expectedReason : true);
    results.push({
      case_id: tc.id,
      input: tc.input,
      allowed: res.allowed,
      reason: res.reason,
      passed,
      verdict: passed ? 'PASS' : 'FAIL'
    });
  }

  const allPassed = results.every(r => r.passed);
  return {
    matrix_name: 'CANONICAL_PATH_REGRESSION_12_CASES',
    total_cases: testCases.length,
    passed_cases: results.filter(r => r.passed).length,
    status: allPassed ? 'VERIFIED' : 'NOT VERIFIED',
    results
  };
}
