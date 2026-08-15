import test from 'node:test';
import assert from 'node:assert/strict';

// ====================================================
// P-12: TOOL PRIVILEGE ESCALATION PREVENTION TESTS
// ====================================================

test('P-12.1: Enforce hard block against self-granted write authority by discovered tools', () => {
  const evaluateToolPermissionRequest = (toolCatalogEntry, requestedAction, targetScope) => {
    // Constitutional invariant: Discovered tools cannot grant themselves write authority
    if (toolCatalogEntry.write_access === false && requestedAction === 'WRITE') {
      return {
        status: 'DENIED',
        violation: 'SECURITY_ATTEMPT_TOOL_PRIVILEGE_ESCALATION',
        reason: `Tool ${toolCatalogEntry.tool_id} is classified as read-only and cannot perform WRITE actions.`
      };
    }

    if (targetScope === 'C:\\Users\\valen\\Documents\\Fundacion' && requestedAction === 'WRITE') {
      return {
        status: 'DENIED',
        violation: 'EXTERNAL_TARGET_WRITE_BARRIER_ENFORCED',
        reason: 'Target is protected by external write barrier.'
      };
    }

    return { status: 'AUTHORIZED' };
  };

  const readOnlyTool = {
    tool_id: 'TOL-PLAYWRIGHT-MCP',
    write_access: false,
    network_access: true
  };

  // Attempt write action
  const writeAttempt = evaluateToolPermissionRequest(readOnlyTool, 'WRITE', 'C:\\Users\\valen\\Documents\\Eos system\\src');
  assert.equal(writeAttempt.status, 'DENIED');
  assert.equal(writeAttempt.violation, 'SECURITY_ATTEMPT_TOOL_PRIVILEGE_ESCALATION');

  // Attempt external write to Fundacion
  const fundacionAttempt = evaluateToolPermissionRequest({ tool_id: 'TOL-CODE-GEN', write_access: true }, 'WRITE', 'C:\\Users\\valen\\Documents\\Fundacion');
  assert.equal(fundacionAttempt.status, 'DENIED');
  assert.equal(fundacionAttempt.violation, 'EXTERNAL_TARGET_WRITE_BARRIER_ENFORCED');
});

test('P-12.2: Enforce hard block against tool altering its own catalog definition', () => {
  const protectToolCatalog = (invokingToolId, targetFile) => {
    if (targetFile.includes('NORMALIZED_TOOL_CATALOG.json') || targetFile.includes('CONSTITUTION.md')) {
      throw new Error(`SECURITY_DENY: Tool ${invokingToolId} attempted unauthorized mutation of governance catalog.`);
    }
    return true;
  };

  assert.throws(
    () => protectToolCatalog('TOL-PLAYWRIGHT-MCP', 'docs/tools/NORMALIZED_TOOL_CATALOG.json'),
    /SECURITY_DENY/
  );
});
