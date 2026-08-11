export function executeMockResearchAdapter(input) {
  const startTime = Date.now();
  const { query, sourceRequired } = input;

  if (!query) {
    return {
      status: 'REJECTED',
      exitCode: 1,
      reason: 'Missing query parameter',
      durationMs: Date.now() - startTime
    };
  }

  if (sourceRequired && !input.sourceId) {
    return {
      status: 'REJECTED',
      exitCode: 1,
      reason: 'Missing sourceId for research query',
      durationMs: Date.now() - startTime
    };
  }

  return {
    status: 'SUCCESS',
    exitCode: 0,
    query,
    durationMs: Date.now() - startTime,
    findings: [`Simulated research result for: ${query}`],
    evidence: {
      claim: `Synthetic research execution completed for query: ${query}`,
      status: 'VERIFIED'
    }
  };
}
