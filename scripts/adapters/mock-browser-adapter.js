export function executeMockBrowserAdapter(input) {
  const startTime = Date.now();
  const { targetUrl } = input;

  if (!targetUrl) {
    return {
      status: 'REJECTED',
      exitCode: 1,
      reason: 'Missing targetUrl parameter',
      durationMs: Date.now() - startTime
    };
  }

  return {
    status: 'SUCCESS',
    exitCode: 0,
    targetUrl,
    viewportTested: '1920x1080',
    consoleErrors: 0,
    durationMs: Date.now() - startTime,
    evidence: {
      claim: `Browser QA check passed cleanly on ${targetUrl}`,
      status: 'VERIFIED'
    }
  };
}
