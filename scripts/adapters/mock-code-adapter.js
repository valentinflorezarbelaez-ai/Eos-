import fs from 'node:fs';
import path from 'node:path';

export function executeMockCodeAdapter(input) {
  const startTime = Date.now();
  const { targetPath, action, scopeAuthorized } = input;

  if (!targetPath) {
    return {
      status: 'REJECTED',
      exitCode: 1,
      reason: 'Missing targetPath',
      durationMs: Date.now() - startTime,
      logs: ['Error: targetPath required']
    };
  }

  // Write Barrier Check
  if (targetPath.includes('Fundacion') || !targetPath.includes('Eos system')) {
    if (!scopeAuthorized) {
      return {
        status: 'DENIED',
        exitCode: 1,
        reason: 'External write barrier active during EOS Development Mode',
        durationMs: Date.now() - startTime,
        logs: [`BLOCKED: Target path ${targetPath} is external and unauthorized.`]
      };
    }
  }

  return {
    status: 'SUCCESS',
    exitCode: 0,
    actionPerformed: action || 'MOCK_CODE_GENERATE',
    targetPath,
    durationMs: Date.now() - startTime,
    logs: [`Mock code generation simulated for ${targetPath}`],
    evidence: {
      claim: `Synthetic mock code execution completed safely for ${targetPath}`,
      status: 'VERIFIED'
    }
  };
}
