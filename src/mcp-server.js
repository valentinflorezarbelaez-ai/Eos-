/**
 * @module EosMcpServer
 * @version 1.1.0
 * @description JSON-RPC 2.0 stdio MCP Server for EOS Mission OS.
 * Exposes the canonical 20-tool manifest with explicit SIMULATION_ONLY markers
 * for tools not yet connected to active engine runners.
 */

import readline from 'node:readline';
import { ContextCompiler } from '../scripts/engine/context-compiler.js';
import { MissionLedger } from '../scripts/engine/mission-ledger.js';
import { AuthorityAdapter } from '../scripts/engine/authority-adapter.js';

const CANONICAL_TOOLS = [
  { name: 'eos.mission.resolve', description: 'Resolve raw intent into structured mission DAG', category: 'MISSION' },
  { name: 'eos.mission.start', description: 'Initialize and start a mission', category: 'MISSION' },
  { name: 'eos.mission.status', description: 'Get current mission status and telemetry', category: 'MISSION' },
  { name: 'eos.mission.recover', description: 'Recover mission state from append-only ledger', category: 'MISSION' },
  { name: 'eos.context.compile', description: 'Compile token-budgeted prompt context with receipts', category: 'CONTEXT' },
  { name: 'eos.ledger.get_features', description: 'Get feature list and task DoD status', category: 'LEDGER' },
  { name: 'eos.ledger.update_feature', description: 'Update feature status with evidence receipt', category: 'LEDGER' },
  { name: 'eos.authority.check', description: 'Check monotonic authority permissions and gates', category: 'GOVERNANCE' },
  { name: 'eos.policy.validate', description: 'Validate operation against machine-readable policy engine', category: 'GOVERNANCE' },
  { name: 'eos.evidence.record', description: 'Record immutable evidence receipt with SHA-256 hash', category: 'EVIDENCE' },
  { name: 'eos.evidence.get', description: 'Retrieve verified evidence receipt by ID', category: 'EVIDENCE' },
  { name: 'eos.verifier.run', description: 'Run strict governance and schema verification', category: 'QUALITY' },
  { name: 'eos.provider.route', description: 'Route prompt or task to optimal model/provider', category: 'ROUTING' },
  { name: 'eos.provider.health', description: 'Get latency, health and error rate for providers', category: 'ROUTING' },
  { name: 'eos.workspace.discover', description: 'Inspect workspace files, dependencies and git state', category: 'WORKSPACE' },
  { name: 'eos.workspace.barrier_check', description: 'Enforce write barrier against unauthorized external paths', category: 'WORKSPACE' },
  { name: 'eos.fdir.status', description: 'Get current FDIR health state and safe mode status', category: 'RELIABILITY' },
  { name: 'eos.fdir.trip', description: 'Trip safe mode breaker to halt all mutating operations', category: 'RELIABILITY' },
  { name: 'eos.audit.run', description: 'Run complete 21-step compliance audit', category: 'AUDIT' },
  { name: 'eos.report.generate', description: 'Generate executive mission summary report', category: 'AUDIT' }
];

class EosMcpServer {
  constructor() {
    this.ledger = new MissionLedger();
  }

  async handleToolCall(name, args = {}) {
    switch (name) {
      case 'eos.context.compile': {
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

        if (method === 'tools/list') {
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
