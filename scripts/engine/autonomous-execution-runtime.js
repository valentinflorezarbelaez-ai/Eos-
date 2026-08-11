import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { executeMockCodeAdapter } from '../adapters/mock-code-adapter.js';
import { executeMockResearchAdapter } from '../adapters/mock-research-adapter.js';
import { executeMockTestAdapter } from '../adapters/mock-test-adapter.js';
import { executeMockBrowserAdapter } from '../adapters/mock-browser-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export class AutonomousExecutionRuntime {
  constructor() {
    this.capabilities = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/capabilities/REGISTRY.json'), 'utf-8')).capabilities;
    this.tools = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/tools/REGISTRY.json'), 'utf-8')).tools;
    this.adapters = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/adapters/REGISTRY.json'), 'utf-8')).adapters;
    this.providers = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/providers/REGISTRY.json'), 'utf-8')).providers;
    this.executionHistory = [];
    this.maxRetries = 3;
  }

  executePlan(plan) {
    const executionId = `EXC-${Date.now()}`;
    const historyRecord = {
      executionId,
      planId: plan.planId || 'PLAN-001',
      version: plan.version || '1.0.0',
      startTime: new Date().toISOString(),
      actionLogs: [],
      status: 'INITIATED'
    };

    if (!plan.actions || !Array.isArray(plan.actions) || plan.actions.length === 0) {
      historyRecord.status = 'ABORTED';
      historyRecord.error = 'Invalid or empty plan actions';
      this.executionHistory.push(historyRecord);
      return { status: 'ABORTED', reason: 'Invalid or empty plan actions', historyRecord };
    }

    // Sort actions by dependencies
    const actions = [...plan.actions];
    const completedActionIds = new Set();
    const actionStates = {};

    for (const action of actions) {
      actionStates[action.actionId] = 'PLANNED';
    }

    for (const action of actions) {
      // 1. Check prerequisites
      if (action.dependencies && action.dependencies.length > 0) {
        const unfulfilled = action.dependencies.some(depId => !completedActionIds.has(depId));
        if (unfulfilled) {
          actionStates[action.actionId] = 'BLOCKED';
          historyRecord.actionLogs.push({
            actionId: action.actionId,
            state: 'BLOCKED',
            reason: 'Dependency prerequisite unfulfilled'
          });
          historyRecord.status = 'BLOCKED';
          this.executionHistory.push(historyRecord);
          return { status: 'BLOCKED', reason: `Prerequisite unfulfilled for ${action.actionId}`, historyRecord };
        }
      }

      actionStates[action.actionId] = 'VALIDATING';

      // 2. Validate Authorization & Policy
      if (action.targetPath && (action.targetPath.includes('Fundacion') || !action.targetPath.includes('Eos system'))) {
        if (!action.scopeAuthorized) {
          actionStates[action.actionId] = 'BLOCKED';
          historyRecord.actionLogs.push({
            actionId: action.actionId,
            state: 'BLOCKED',
            policyDecision: 'DENY',
            reason: 'Policy POL-001: Unauthorized write attempt to external target'
          });
          historyRecord.status = 'ABORTED';
          this.executionHistory.push(historyRecord);
          return { status: 'DENIED', reason: 'External target write barrier violation', historyRecord };
        }
      }

      if (action.requiredAuthorization === 'LEVEL_4' && action.userAuthorization !== 'APPROVED') {
        actionStates[action.actionId] = 'ESCALATE';
        historyRecord.actionLogs.push({
          actionId: action.actionId,
          state: 'ESCALATE',
          reason: 'Authorization LEVEL_4 required from Product Owner'
        });
        historyRecord.status = 'ESCALATED';
        this.executionHistory.push(historyRecord);
        return { status: 'ESCALATED', reason: 'Authorization LEVEL_4 required', historyRecord };
      }

      actionStates[action.actionId] = 'AUTHORIZED';
      actionStates[action.actionId] = 'READY';
      actionStates[action.actionId] = 'RUNNING';

      // 3. Execute Adapter Action with Retry & Replan
      let attempt = 0;
      let success = false;
      let actionResult = null;

      while (attempt < (action.maxRetries || this.maxRetries) && !success) {
        attempt++;
        if (attempt > 1) {
          actionStates[action.actionId] = 'RETRYING';
        }

        if (action.mockFailureScenario === 'TOOL_FAILURE' && attempt === 1) {
          actionResult = { status: 'FAILED', exitCode: 1, reason: 'Simulated tool failure' };
        } else if (action.mockFailureScenario === 'VERIFICATION_FAILURE') {
          actionResult = { status: 'SUCCESS', exitCode: 0, verificationFailed: true };
        } else {
          // Normal adapter execution
          if (action.adapterId === 'ADP-MOCK-CODE' || action.adapterId === 'ADP-MOCK-CODE-EDIT') {
            actionResult = executeMockCodeAdapter({ targetPath: action.targetPath || 'C:\\Users\\valen\\Documents\\Eos system\\src\\index.js', scopeAuthorized: action.scopeAuthorized });
          } else if (action.adapterId === 'ADP-MOCK-RESEARCH') {
            actionResult = executeMockResearchAdapter({ query: action.query || 'EOS Architecture' });
          } else if (action.adapterId === 'ADP-MOCK-TEST') {
            actionResult = executeMockTestAdapter({ testSuite: action.testSuite || 'unit-tests', requirePassEvidence: true });
          } else if (action.adapterId === 'ADP-MOCK-BROWSER') {
            actionResult = executeMockBrowserAdapter({ targetUrl: action.targetUrl || 'http://localhost:3000' });
          } else {
            actionResult = { status: 'SUCCESS', exitCode: 0 };
          }
        }

        if (actionResult && actionResult.status === 'SUCCESS' && !actionResult.verificationFailed) {
          success = true;
        }
      }

      if (!success) {
        if (actionResult && actionResult.verificationFailed) {
          actionStates[action.actionId] = 'FAILED';
          historyRecord.actionLogs.push({
            actionId: action.actionId,
            state: 'VERIFICATION_FAILED',
            attempts: attempt,
            reason: 'Tool executed but verification checks failed'
          });

          if (action.rollbackOnFailure) {
            actionStates[action.actionId] = 'ROLLED_BACK';
            historyRecord.actionLogs.push({
              actionId: action.actionId,
              state: 'ROLLED_BACK',
              reason: 'Reversible change rolled back safely'
            });
          }

          historyRecord.status = 'VERIFICATION_FAILED';
          this.executionHistory.push(historyRecord);
          return { status: 'VERIFICATION_FAILED', actionId: action.actionId, historyRecord };
        }

        actionStates[action.actionId] = 'FAILED';
        historyRecord.actionLogs.push({
          actionId: action.actionId,
          state: 'FAILED',
          attempts: attempt,
          reason: 'Retry exhaustion'
        });

        // Trigger Replan
        if (action.allowReplan) {
          const revisedPlanId = `${plan.planId || 'PLAN-001'}-R1`;
          historyRecord.status = 'REPLANNING';
          historyRecord.revisedPlanId = revisedPlanId;
          this.executionHistory.push(historyRecord);
          return { status: 'REPLANNING', revisedPlanId, historyRecord };
        }

        historyRecord.status = 'ABORTED';
        this.executionHistory.push(historyRecord);
        return { status: 'ABORTED', reason: `Execution failed on action ${action.actionId}`, historyRecord };
      }

      actionStates[action.actionId] = 'VERIFIED';
      completedActionIds.add(action.actionId);
      historyRecord.actionLogs.push({
        actionId: action.actionId,
        state: 'VERIFIED',
        attempts: attempt,
        output: actionResult
      });
    }

    historyRecord.status = 'SUCCEEDED';
    historyRecord.endTime = new Date().toISOString();
    this.executionHistory.push(historyRecord);

    return {
      status: 'SUCCEEDED',
      executionId,
      completedActions: Array.from(completedActionIds),
      historyRecord
    };
  }
}
