/**
 * C7 negative security / governance tests for ATS + Integration FDIR
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { AuthorityTruthSource } from '../src/core/authority/authority-truth-source.js';
import { SDD_STATES } from '../src/core/sdd/sdd-fsm-engine.js';
import { MissionRuntime } from '../src/core/runtime/mission-runtime.js';
import { IntegrationGatekeeper } from '../src/core/governance/integration-gatekeeper.js';

function seed(missions, missionId) {
  const dir = path.join(missions, missionId);
  fs.mkdirSync(path.join(dir, 'ledger'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'mission-package.json'),
    JSON.stringify({ mission_id: missionId, status: 'active', phase: null, orchestration: { tasks: [] } }, null, 2)
  );
  fs.writeFileSync(path.join(dir, 'direction.json'), '{}');
  fs.writeFileSync(path.join(dir, 'project-profile.json'), '{}');
}

test('NEG-01: missing required artifact rejects plan transition', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eos-neg-'));
  const missions = path.join(root, '.missions');
  fs.mkdirSync(missions);
  const missionId = 'MIS-NEG-01';
  seed(missions, missionId);
  const ats = new AuthorityTruthSource({ missionsRoot: missions });
  ats.initMission({ missionId });
  assert.throws(
    () =>
      ats.commitTransition({
        missionId,
        event_type: 'runtime.plan_mission',
        to_state: SDD_STATES.PLAN,
        authority_level: 'LEVEL_0',
        artifacts: [{ kind: 'direction', sha256: 'a'.repeat(64) }] // missing project_profile
      }),
    /MISSING_REQUIRED_ARTIFACT|TRANSITION_DENIED/
  );
  assert.equal(ats.getSnapshot(missionId).state, SDD_STATES.VISION_INTAKE);
});

test('NEG-02: invalid current state rejects transition', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eos-neg-'));
  const missions = path.join(root, '.missions');
  fs.mkdirSync(missions);
  const missionId = 'MIS-NEG-02';
  seed(missions, missionId);
  const ats = new AuthorityTruthSource({ missionsRoot: missions });
  ats.initMission({ missionId });
  assert.throws(
    () =>
      ats.commitTransition({
        missionId,
        event_type: 'definition.complete',
        to_state: SDD_STATES.PLAN,
        authority_level: 'LEVEL_0',
        artifacts: [
          { kind: 'technical_spec', sha256: 'a'.repeat(64) },
          { kind: 'acceptance_criteria', sha256: 'b'.repeat(64) }
        ]
      }),
    /INVALID_STATE_TRANSITION|TRANSITION_DENIED/
  );
});

test('NEG-03: FDIR tripped blocks closeMission', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eos-neg-'));
  fs.writeFileSync(path.join(root, 'package.json'), '{"name":"t","type":"module"}');
  fs.mkdirSync(path.join(root, 'src'));
  const gate = new IntegrationGatekeeper();
  gate.tripFdirKillSwitch('TEST_TRIP');
  const rt = new MissionRuntime({ baseDir: root, integrationGate: gate });
  const c = rt.createMission({ goal: 'fdir close block', projectPath: '.' });
  rt.planMission(c.mission_id);
  assert.throws(() => rt.closeMission(c.mission_id), /FDIR_SAFE_MODE|INTEGRATION_BLOCKED/);
});

test('NEG-04: ATS init twice rejected', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eos-neg-'));
  const missions = path.join(root, '.missions');
  fs.mkdirSync(missions);
  const missionId = 'MIS-NEG-04';
  seed(missions, missionId);
  const ats = new AuthorityTruthSource({ missionsRoot: missions });
  ats.initMission({ missionId });
  assert.throws(() => ats.initMission({ missionId }), /ATS_ALREADY_INITIALIZED/);
});
