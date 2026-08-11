export function executeMockTestAdapter(input) {
  const startTime = Date.now();
  const { testSuite, requirePassEvidence } = input;

  if (!testSuite) {
    return {
      status: 'REJECTED',
      exitCode: 1,
      reason: 'Missing testSuite parameter',
      durationMs: Date.now() - startTime
    };
  }

  return {
    status: 'SUCCESS',
    exitCode: 0,
    testSuite,
    testsPassed: 10,
    testsFailed: 0,
    durationMs: Date.now() - startTime,
    evidence: requirePassEvidence ? { claim: `Suite ${testSuite} passed 10/10`, status: 'VERIFIED' } : null
  };
}
