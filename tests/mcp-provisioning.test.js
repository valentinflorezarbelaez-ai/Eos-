import test from 'node:test';
import assert from 'node:assert/strict';
import { McpProvisioningEngine } from '../scripts/engine/mcp-provisioning-engine.js';

test('MCP Provisioning: Catalog loads all industrial servers from .cursor/mcp.json', () => {
  const engine = new McpProvisioningEngine();
  const catalog = engine.getCatalog().mcpServers || {};

  assert.ok(catalog.playwright, 'Playwright must be in catalog');
  assert.ok(catalog.context7, 'Context7 must be in catalog');
  assert.ok(catalog.trello, 'Trello must be in catalog');
  assert.ok(catalog.slack, 'Slack must be in catalog');
  assert.ok(catalog.jira, 'Jira must be in catalog');
  assert.ok(catalog.figma, 'Figma must be in catalog');
  assert.ok(catalog.stitch, 'Stitch must be in catalog');
  assert.ok(catalog.engram, 'Engram must be in catalog');
});

test('MCP Provisioning: Dynamically provisions requested MCPs into Mission Control safely', () => {
  const engine = new McpProvisioningEngine();
  const requested = ['playwright', 'context7', 'trello', 'slack', 'jira', 'figma', 'stitch', 'engram'];

  const result = engine.provisionMcps(requested);

  assert.equal(result.provisionedCount, 8);
  assert.equal(result.rejectedCount, 0);
  assert.equal(result.status, 'PROVISIONING_PIPELINE_EXECUTED_SAFELY');

  // Verify Active Tools state
  const verification = engine.verifyActiveMcps();
  assert.ok(verification.activeCount >= 8);
  const names = verification.mcps.map(m => m.name.toLowerCase());
  assert.ok(names.includes('playwright'));
  assert.ok(names.includes('context7'));
  assert.ok(names.includes('figma'));
  assert.ok(names.includes('jira'));
  assert.ok(names.includes('slack'));
  assert.ok(names.includes('trello'));
  assert.ok(names.includes('stitch'));
});

test('MCP Provisioning: Rejects unknown unverified servers under Default-Deny', () => {
  const engine = new McpProvisioningEngine();
  const result = engine.provisionMcps(['malicious_unknown_server']);

  assert.equal(result.provisionedCount, 0);
  assert.equal(result.rejectedCount, 1);
  assert.equal(result.rejected[0].reason, 'MCP_NOT_FOUND_IN_OFFICIAL_CATALOG');
});
