import test from 'node:test';
import assert from 'node:assert/strict';
import { EosMcpServer, CANONICAL_TOOLS } from '../src/mcp-server.js';

test('MCP-01: tools/list returns exactly 20 canonical tools', () => {
  assert.equal(CANONICAL_TOOLS.length, 20);
  const names = CANONICAL_TOOLS.map(t => t.name);
  assert.ok(names.includes('eos.context.compile'));
  assert.ok(names.includes('eos.ledger.get_features'));
  assert.ok(names.includes('eos.authority.check'));
  assert.ok(names.includes('eos.mission.recover'));
});

test('MCP-02: tools/call eos.authority.check executes AuthorityAdapter', async () => {
  const server = new EosMcpServer();
  const res = await server.handleToolCall('eos.authority.check', {
    requiredLevel: 'LEVEL_1',
    grantedLevel: 'LEVEL_2'
  });

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.executed, true);
  assert.equal(res.auth.authorized, true);
});

test('MCP-03: tools/call eos.context.compile compiles context cleanly', async () => {
  const server = new EosMcpServer();
  const res = await server.handleToolCall('eos.context.compile', {
    mission: { id: 'MIS-MCP-001', type: 'TEST', goal: 'MCP Context Test' },
    contract: { autonomyLevel: 'LEVEL_1', maxBudgetTokens: 2000 }
  });

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.executed, true);
  assert.ok(res.receipt.sha256);
});

test('MCP-04: Non-wired tools return SIMULATION_ONLY with executed:false and sideEffects:NONE', async () => {
  const server = new EosMcpServer();
  const res = await server.handleToolCall('eos.evidence.get', { id: 'EVD-999' });

  assert.equal(res.status, 'SIMULATION_ONLY');
  assert.equal(res.executed, false);
  assert.equal(res.sideEffects, 'NONE');
  assert.match(res.message, /not yet wired to an active engine/);
});
