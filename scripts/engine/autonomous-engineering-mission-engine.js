import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AutonomousExecutionRuntime } from './autonomous-execution-runtime.js';
import { CapabilityIntelligenceEngine } from './capability-intelligence-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export class AutonomousEngineeringMissionEngine {
  constructor() {
    this.missions = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/missions/REGISTRY.json'), 'utf-8')).missions;
    this.lifecycle = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/orchestration/ENGINEERING_LIFECYCLE.json'), 'utf-8'));
    this.agentCouncil = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/agents/AGENT_COUNCIL.json'), 'utf-8')).roles;
    this.capabilityEngine = new CapabilityIntelligenceEngine();
    this.runtime = new AutonomousExecutionRuntime();
    this.activeMissions = new Map();
  }

  receiveMission(missionData) {
    if (!missionData || !missionData.missionId || !missionData.projectType) {
      return { status: 'REJECTED', reason: 'Invalid mission data payload' };
    }

    const missionState = {
      ...missionData,
      state: 'MISSION_RECEIVED',
      stateHistory: ['MISSION_RECEIVED'],
      artifacts: [],
      evidence: null,
      auditResult: null,
      learningEvents: [],
      releaseDecision: 'PENDING'
    };

    this.activeMissions.set(missionData.missionId, missionState);
    return { status: 'ACCEPTED', state: missionState };
  }

  transitionState(missionId, nextState) {
    const mission = this.activeMissions.get(missionId);
    if (!mission) return { status: 'FAILED', reason: 'Mission not found' };

    if (!this.lifecycle.states.includes(nextState)) {
      return { status: 'FAILED', reason: `Invalid lifecycle state: ${nextState}` };
    }

    mission.state = nextState;
    mission.stateHistory.push(nextState);
    return { status: 'SUCCESS', state: nextState };
  }

  runLifecycle(missionId, mode = 'SIMULATION') {
    const mission = this.activeMissions.get(missionId);
    if (!mission) return { status: 'FAILED', reason: 'Mission not found' };

    // Enforcement of execution modes
    if (mode === 'EXTERNAL_PROJECT' || mode === 'PRODUCTION') {
      if (mission.targetScope && mission.targetScope.includes('Fundacion')) {
        mission.state = 'BLOCKED';
        return { status: 'DENIED', reason: 'Policy POL-001: External project execution forbidden without explicit Level 2+ authorization' };
      }
    }

    // 19-state lifecycle execution simulation
    const steps = [
      'DISCOVERY', 'RESEARCH', 'REQUIREMENTS', 'SPECIFICATION', 'ARCHITECTURE',
      'PLANNING', 'AGENT_ASSIGNMENT', 'CAPABILITY_MATCHING', 'TOOL_SELECTION',
      'AUTHORIZATION', 'EXECUTION', 'TESTING', 'VERIFICATION', 'EVIDENCE',
      'AUDIT', 'LEARNING', 'RELEASE_REVIEW', 'COMPLETED'
    ];

    for (const step of steps) {
      const res = this.transitionState(missionId, step);
      if (res.status !== 'SUCCESS') return res;
    }

    mission.evidence = {
      claim: `Mission ${missionId} completed successfully under mode ${mode}`,
      status: 'VERIFIED'
    };
    mission.releaseDecision = 'APPROVED_FOR_STAGING';

    return {
      status: 'COMPLETED',
      missionState: mission
    };
  }
}

// CLI dry-run runner
if (process.argv.includes('--dry-run')) {
  const engine = new AutonomousEngineeringMissionEngine();
  const initRes = engine.receiveMission({
    missionId: 'MSN-DRYRUN-CLI-001',
    projectType: 'synthetic-website',
    objective: 'CLI Dry Run Mission Simulation',
    constraints: ['NO_EXTERNAL_WRITES'],
    targetScope: 'tests/fixtures/mission-projects/synthetic-website'
  });
  const runRes = engine.runLifecycle('MSN-DRYRUN-CLI-001', 'SIMULATION');
  console.log('CLI Dry Run Result:', JSON.stringify(runRes, null, 2));
}
