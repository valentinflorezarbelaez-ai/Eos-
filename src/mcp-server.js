/**
 * @module EosMcpServer
 * @version 1.2.0
 * @description JSON-RPC 2.0 stdio MCP Server for EOS Mission OS.
 * Exposes the canonical 20-tool manifest with explicit deny-by-default
 * authorization and read-only governance guards.
 */

import readline from 'node:readline';
import { ContextCompiler } from '../scripts/engine/context-compiler.js';
import { MissionLedger } from '../scripts/engine/mission-ledger.js';
import { AuthorityAdapter } from '../scripts/engine/authority-adapter.js';

const CANONICAL_TOOLS = [
  { name: 'eos.mission.resolve', description: 'Resolve raw intent into structured mission DAG', category: 'MISSION', sideEffects: 'NONE', requiredAuthority: 'A0' },
  { name: 'eos.mission.start', description: 'Initialize and start a mission', category: 'MISSION', sideEffects: 'LEDGER_WRITE', requiredAuthority: 'A1' },
  { name: 'eos.mission.status', description: 'Get current mission status and telemetry', category: 'MISSION', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.mission.recover', description: 'Recover mission state from append-only ledger', category: 'MISSION', sideEffects: 'LEDGER_WRITE', requiredAuthority: 'A1' },
  { name: 'eos.context.compile', description: 'Compile token-budgeted prompt context with receipts', category: 'CONTEXT', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.ledger.get_features', description: 'Get feature list and task DoD status', category: 'LEDGER', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.ledger.update_feature', description: 'Update feature status with evidence receipt', category: 'LEDGER', sideEffects: 'LEDGER_WRITE', requiredAuthority: 'A1' },
  { name: 'eos.authority.check', description: 'Check monotonic authority permissions and gates', category: 'GOVERNANCE', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.policy.validate', description: 'Validate operation against machine-readable policy engine', category: 'GOVERNANCE', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.evidence.record', description: 'Record immutable evidence receipt with SHA-256 hash', category: 'EVIDENCE', sideEffects: 'LEDGER_WRITE', requiredAuthority: 'A1' },
  { name: 'eos.evidence.get', description: 'Retrieve verified evidence receipt by ID', category: 'EVIDENCE', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.verifier.run', description: 'Run strict governance and schema verification', category: 'QUALITY', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.provider.route', description: 'Route prompt or task to optimal model/provider', category: 'ROUTING', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.provider.health', description: 'Get latency, health and error rate for providers', category: 'ROUTING', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.workspace.discover', description: 'Inspect workspace files, dependencies and git state', category: 'WORKSPACE', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.workspace.barrier_check', description: 'Enforce write barrier against unauthorized external paths', category: 'WORKSPACE', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.fdir.status', description: 'Get current FDIR health state and safe mode status', category: 'RELIABILITY', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.fdir.trip', description: 'Trip safe mode breaker to halt all mutating operations', category: 'RELIABILITY', sideEffects: 'NONE', requiredAuthority: 'A2' },
  { name: 'eos.audit.run', description: 'Run complete 21-step compliance audit', category: 'AUDIT', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' },
  { name: 'eos.report.generate', description: 'Generate executive mission summary report', category: 'AUDIT', sideEffects: 'READ_ONLY', requiredAuthority: 'A0' }
];

class EosMcpServer {
  constructor(customLedger = null) {
    this.ledger = customLedger || new MissionLedger();
  }

  evaluateToolGuard(toolDef, env = process.env) {
    const rawMode = env.EOS_MODE !== undefined ? env.EOS_MODE : 'read-only';
    const rawAutonomy = env.EOS_AUTONOMY_LEVEL !== undefined ? env.EOS_AUTONOMY_LEVEL : 'LEVEL_0';
    const rawAllowExternal = env.EOS_ALLOW_EXTERNAL_SIDE_EFFECTS !== undefined ? env.EOS_ALLOW_EXTERNAL_SIDE_EFFECTS : 'false';

    if (typeof rawMode !== 'string' || typeof rawAutonomy !== 'string') {
      return {
        allowed: false,
        reason: 'INVALID_GOVERNANCE_CONFIGURATION: Non-string environment values'
      };
    }

    const mode = rawMode.trim().toLowerCase();
    const autonomy = rawAutonomy.trim().toUpperCase();
    const allowExternal = String(rawAllowExternal).trim().toLowerCase() === 'true';

    const validModes = ['read-only', 'read-write', 'production', 'simulation'];
    if (!validModes.includes(mode)) {
      return {
        allowed: false,
        reason: `INVALID_GOVERNANCE_CONFIGURATION: Unrecognized EOS_MODE '${rawMode}'`
      };
    }

    const normalizedAutonomy = AuthorityAdapter.normalize(autonomy);
    if (normalizedAutonomy.isDenied) {
      return {
        allowed: false,
        reason: `INVALID_GOVERNANCE_CONFIGURATION: Unrecognized or denied EOS_AUTONOMY_LEVEL '${rawAutonomy}'`
      };
    }

    if (mode === 'read-only' && toolDef.sideEffects === 'LEDGER_WRITE') {
      return {
        allowed: false,
        reason: 'READ_ONLY_MODE_BLOCKS_LEDGER_WRITE'
      };
    }

    if (!allowExternal && toolDef.sideEffects === 'EXTERNAL_WRITE') {
      return {
        allowed: false,
        reason: 'EXTERNAL_SIDE_EFFECTS_DISABLED'
      };
    }

    const requiredAuth = toolDef.requiredAuthority || 'A0';
    const authCheck = AuthorityAdapter.checkAuthority(requiredAuth, autonomy);
    if (!authCheck.authorized) {
      return {
        allowed: false,
        reason: `INSUFFICIENT_AUTONOMY_LEVEL: Required ${requiredAuth} (rank ${authCheck.requiredRank}) exceeds granted ${autonomy} (rank ${authCheck.effectiveRank})`
      };
    }

    return { allowed: true };
  }

  async handleToolCall(name, args = {}, env = process.env) {
    const toolDef = CANONICAL_TOOLS.find(t => t.name === name);

    switch (name) {
      case 'eos.context.compile': {
        const guard = this.evaluateToolGuard(toolDef, env);
        if (!guard.allowed) {
          return { tool: name, status: 'DENIED', executed: false, sideEffects: 'NONE', reason: guard.reason };
        }
        const receipt = ContextCompiler.compileMissionContext(args);
        return {
          tool: name,
          status: 'SUCCESS',
          executed: true,
          sideEffects: 'READ_ONLY',
          receipt
        };
      }

      case 'eos.ledger.get_features': {
        const guard = this.evaluateToolGuard(toolDef, env);
        if (!guard.allowed) {
          return { tool: name, status: 'DENIED', executed: false, sideEffects: 'NONE', reason: guard.reason };
        }
        const features = this.ledger.getFeatureList(args.missionId);
        return {
          tool: name,
          status: 'SUCCESS',
          executed: true,
          sideEffects: 'READ_ONLY',
          features
        };
      }

      case 'eos.ledger.update_feature': {
        const guard = this.evaluateToolGuard(toolDef, env);
        if (!guard.allowed) {
          return { tool: name, status: 'DENIED', executed: false, sideEffects: 'NONE', reason: guard.reason };
        }
        const feature = this.ledger.updateFeatureStatus(
          args.missionId,
          args.featureId,
          args.newStatus,
          args.evidenceReceipt
        );
        return {
          tool: name,
          status: 'SUCCESS',
          executed: true,
          sideEffects: 'LEDGER_WRITE',
          feature
        };
      }

      case 'eos.authority.check': {
        const guard = this.evaluateToolGuard(toolDef, env);
        if (!guard.allowed) {
          return { tool: name, status: 'DENIED', executed: false, sideEffects: 'NONE', reason: guard.reason };
        }
        const auth = AuthorityAdapter.checkAuthority(args.requiredLevel, args.grantedLevel);
        return {
          tool: name,
          status: 'SUCCESS',
          executed: true,
          sideEffects: 'READ_ONLY',
          auth
        };
      }

      case 'eos.mission.recover': {
        const guard = this.evaluateToolGuard(toolDef, env);
        if (!guard.allowed) {
          return { tool: name, status: 'DENIED', executed: false, sideEffects: 'NONE', reason: guard.reason };
        }
        const recovered = this.ledger.recover(args.missionId);
        return {
          tool: name,
          status: 'SUCCESS',
          executed: true,
          sideEffects: 'LEDGER_WRITE',
          recovered
        };
      }

      default: {
        return {
          tool: name,
          status: 'SIMULATION_ONLY',
          executed: false,
          sideEffects: 'NONE',
          governance: 'DEFAULT_DENY_SUPERVISED',
          message: `Tool '${name}' is registered in the Target Manifest but is not yet wired to an active engine. No side effects occurred.`
        };
      }
    }
  }

  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', async (line) => {
      if (!line.trim()) return;

      try {
        const request = JSON.parse(line);
        const { id, method, params } = request;

        if (method === 'initialize') {
          const response = {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: { name: 'eos-mission-os', version: '1.2.0' }
            }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        } else if (method === 'tools/list') {
          const response = {
            jsonrpc: '2.0',
            id,
            result: {
              tools: CANONICAL_TOOLS.map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: { type: 'object' }
              }))
            }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        } else if (method === 'tools/call') {
          const result = await this.handleToolCall(params.name, params.arguments || {});
          const response = {
            jsonrpc: '2.0',
            id,
            result: {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
            }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        } else {
          const response = {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method '${method}' not found` }
          };
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (err) {
        const errorResponse = {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error', data: err.message }
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    });
  }
}

export { EosMcpServer, CANONICAL_TOOLS };

if (process.argv[1] && process.argv[1].endsWith('mcp-server.js')) {
  const server = new EosMcpServer();
  server.start();
}
