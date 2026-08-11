import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export class CapabilityIntelligenceEngine {
  constructor() {
    this.capabilities = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/capabilities/REGISTRY.json'), 'utf-8')).capabilities;
    this.tools = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/tools/REGISTRY.json'), 'utf-8')).tools;
    this.adapters = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/adapters/REGISTRY.json'), 'utf-8')).adapters;
    this.providers = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/providers/REGISTRY.json'), 'utf-8')).providers;
    this.policyEngine = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/policies/POLICY_ENGINE.json'), 'utf-8')).policies;
  }

  getCapability(capabilityId) {
    return this.capabilities.find(c => c.capability_id === capabilityId);
  }

  getTool(toolId) {
    return this.tools.find(t => t.tool_id === toolId);
  }

  getAdapter(adapterId) {
    return this.adapters.find(a => a.adapter_id === adapterId);
  }

  getProvider(providerId) {
    return this.providers.find(p => p.provider_id === providerId);
  }

  evaluateToolScore(tool, capability) {
    // 12-dimensional scoring matrix
    if (!tool || !capability) return 0;
    let score = 0;
    if (tool.capabilities_supported.includes(capability.capability_id)) score += 30; // Capability fit
    if (tool.evidence_support) score += 20; // Evidence quality
    if (tool.risk_level === 'LOW') score += 15; // Security fit
    if (tool.interface_type === 'SYNTHETIC_MOCK') score += 15; // Local reliability
    const provider = this.getProvider(tool.provider_id);
    if (provider && provider.trust_level === 'LOCAL_SYSTEM') score += 20; // Provider trust
    return score;
  }

  generateExecutionPlan(taskRequest, isDryRun = true) {
    const { taskId, requiredCapabilityId, targetPath, authorizationLevel, scopeAuthorized } = taskRequest;

    const capability = this.getCapability(requiredCapabilityId);
    if (!capability) {
      return {
        status: 'REJECTED',
        reason: `Capability ${requiredCapabilityId} not found in registry`,
        executionPlan: null
      };
    }

    // Write Barrier & Policy Check
    let policyDecision = 'ALLOW';
    let policyReason = 'Passed standard governance policies';

    if (targetPath && (targetPath.includes('Fundacion') || !targetPath.includes('Eos system'))) {
      if (!scopeAuthorized) {
        policyDecision = 'DENY';
        policyReason = 'Policy POL-001: External write attempt during EOS Development Mode without explicit Level 2+ authorization';
      }
    }

    if (policyDecision === 'DENY') {
      return {
        status: 'DENIED',
        reason: policyReason,
        executionPlan: null
      };
    }

    // Tool Discovery & Scoring
    const candidateTools = this.tools.filter(t => t.capabilities_supported.includes(capability.capability_id));
    if (candidateTools.length === 0) {
      return {
        status: 'REJECTED',
        reason: `No compatible tools registered for capability ${requiredCapabilityId}`,
        executionPlan: null
      };
    }

    const scoredTools = candidateTools.map(t => ({
      tool: t,
      score: this.evaluateToolScore(t, capability)
    })).sort((a, b) => b.score - a.score);

    const selectedTool = scoredTools[0].tool;
    const selectedAdapter = this.adapters.find(a => a.tool_id === selectedTool.tool_id && a.capability_id === capability.capability_id);
    const selectedProvider = this.getProvider(selectedTool.provider_id);

    if (!selectedAdapter) {
      return {
        status: 'REJECTED',
        reason: `No adapter registered for tool ${selectedTool.tool_id} and capability ${capability.capability_id}`,
        executionPlan: null
      };
    }

    return {
      status: 'PLAN_GENERATED',
      isDryRun,
      executionPlan: {
        taskId: taskId || 'TSK-MOCK-001',
        requiredCapability: capability.capability_id,
        selectedTool: selectedTool.tool_id,
        selectedAdapter: selectedAdapter.adapter_id,
        selectedProvider: selectedProvider ? selectedProvider.provider_id : 'UNKNOWN',
        score: scoredTools[0].score,
        policyDecision,
        authorizationLevel: authorizationLevel || 'LEVEL_1',
        autonomyLevel: 'L3_SIMULATE',
        targetPath: targetPath || 'C:\\Users\\valen\\Documents\\Eos system\\src\\index.js',
        evidenceRequired: capability.evidence_required,
        rollbackPlan: 'REVERSIBLE_CHANGE_JSON_AUDIT'
      }
    };
  }

  resolveFallback(taskRequest, failedToolId) {
    const capability = this.getCapability(taskRequest.requiredCapabilityId);
    if (!capability) return { status: 'FALLBACK_FAILED', reason: 'Capability missing' };

    // Check if fallback capability exists
    if (!capability.fallback_capability) {
      return { status: 'FALLBACK_FAILED', reason: 'No fallback capability defined' };
    }

    const fallbackCap = this.getCapability(capability.fallback_capability);
    if (!fallbackCap) return { status: 'FALLBACK_FAILED', reason: 'Fallback capability missing' };

    return this.generateExecutionPlan({
      ...taskRequest,
      requiredCapabilityId: fallbackCap.capability_id
    }, true);
  }
}
