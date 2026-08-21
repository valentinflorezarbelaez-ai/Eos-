/**
 * C8 E2E local fixture — HITL reject path + successful governed close
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { MissionRuntime } from '../src/core/runtime/mission-runtime.js';
import { AuthorityTruthSource } from '../src/core/authority/authority-truth-source.js';
import { SDD_STATES, TransitionEnforcer } from '../src/core/sdd/sdd-fsm-engine.js';
import { TutorMaestro } from '../src/core/tutor/tutor-maestro.js';

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eos-e2e-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'eos-e2e-fixture', type: 'module' }));
  fs.mkdirSync(path.join(root, 'src'));
  return root;
}

test('E2E-01: full local cycle create→plan→package→report→pause→resume→close', () => {
  const root = fixtureRoot();
  const tutor = new TutorMaestro();
  const pre = tutor.explainBefore({
    action_id: 'e2e.create_plan_close',
    objective: 'Prove governed local mission cycle on disposable fixture',
    concept: 'MissionRuntime + AuthorityTruthSource',
    scope: [root],
    rationale: 'C8 acceptance requires measured E2E',
    risks: ['Side effect .missions under fixture only'],
    expected_evidence: ['exit success', 'phase COMPLETED', 'tasks PLANNED'],
    rollback: 'Delete fixture temp directory',
    hitl_status: 'NOT_REQUIRED_FOR_BRIDGE_PLAN'
  });
  assert.match(pre, /TUTOR \(antes\)/);

  const rt = new MissionRuntime({ baseDir: root });
  const created = rt.createMission({ goal: 'E2E governed fixture', projectPath: '.' });
  const planned = rt.planMission(created.mission_id);
  assert.equal(planned.tasks_generated, 3);
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, '.missions', created.mission_id, 'mission-package.json'), 'utf8')
  );
  assert.equal(pkg.phase, 'PLAN');
  assert.equal(pkg.orchestration.tasks[0].status, 'PLANNED');
  const pack = rt.packageMission(created.mission_id);
  assert.ok(pack.manifest_hash);
  const report = rt.reportMission(created.mission_id, 'json');
  assert.equal(report.executive_summary.epistemic_verdict, 'NOT_PROVEN');
  rt.pauseMission(created.mission_id);
  assert.equal(rt.ats.getSnapshot(created.mission_id).state, SDD_STATES.PAUSED);
  rt.resumeMission(created.mission_id);
  rt.closeMission(created.mission_id);
  assert.equal(rt.ats.getSnapshot(created.mission_id).state, SDD_STATES.COMPLETED);

  const post = tutor.explainAfter(
    { action_id: 'e2e.create_plan_close' },
    {
      observed: `mission ${created.mission_id} completed via commitTransition`,
      exit_code: 0,
      classification: 'MEASURED',
      interpretation: 'Local fixture cycle succeeded without network or main mutation',
      next_decision: 'Expand HITL reject drill (E2E-02)'
    }
  );
  assert.match(post, /MEASURED/);
});

test('E2E-02: HITL-required transition without receipt is blocked (reject path)', () => {
  const root = fixtureRoot();
  const missions = path.join(root, '.missions');
  const missionId = 'MIS-E2E-HITL';
  fs.mkdirSync(path.join(missions, missionId, 'ledger'), { recursive: true });
  fs.writeFileSync(
    path.join(missions, missionId, 'mission-package.json'),
    JSON.stringify({ mission_id: missionId, status: 'active', phase: null }, null, 2)
  );
  const ats = new AuthorityTruthSource({ missionsRoot: missions });
  ats.initMission({ missionId });

  // Advance to HUMAN_DIRECTION_GATE via enforcer then persist snapshot for ATS
  const enforcer = new TransitionEnforcer();
  let snap = ats.getSnapshot(missionId);
  let r = enforcer.evaluateTransition(
    snap,
    {
      event_id: 'E2E-F1',
      mission_id: missionId,
      from_state: SDD_STATES.VISION_INTAKE,
      to_state: SDD_STATES.MISSION_FORMULATION,
      event_type: 'mission.formulate',
      authority_level: 'LEVEL_0'
    },
    { artifacts: [{ kind: 'vision', sha256: 'a'.repeat(64) }] }
  );
  fs.writeFileSync(path.join(missions, missionId, 'authority-snapshot.json'), JSON.stringify(r.snapshot, null, 2));
  snap = r.snapshot;
  r = enforcer.evaluateTransition(
    snap,
    {
      event_id: 'E2E-F2',
      mission_id: missionId,
      from_state: SDD_STATES.MISSION_FORMULATION,
      to_state: SDD_STATES.HUMAN_DIRECTION_GATE,
      event_type: 'mission.propose_direction',
      authority_level: 'LEVEL_0'
    },
    {
      artifacts: [
        { kind: 'mission_package', sha256: 'b'.repeat(64) },
        { kind: 'contract', sha256: 'c'.repeat(64) }
      ]
    }
  );
  fs.writeFileSync(path.join(missions, missionId, 'authority-snapshot.json'), JSON.stringify(r.snapshot, null, 2));

  assert.throws(
    () =>
      ats.commitTransition({
        missionId,
        event_type: 'human.approve_direction',
        to_state: SDD_STATES.DISCOVER,
        authority_level: 'LEVEL_0'
      }),
    /HITL_DENIED|GATE_SKIPPED/
  );
  assert.equal(ats.getSnapshot(missionId).state, SDD_STATES.HUMAN_DIRECTION_GATE);
});

test('E2E-03: checkpoint restore recovers prior state (rollback drill)', () => {
  const enforcer = new TransitionEnforcer();
  const snapshot = {
    mission_id: 'MIS-E2E-RB',
    state: SDD_STATES.PLAN,
    previous_state: SDD_STATES.VISION_INTAKE,
    sequence: 2
  };
  const cp = enforcer.createCheckpoint(snapshot);
  assert.ok(cp.checkpoint_hash);
  const restored = enforcer.restoreCheckpoint(cp);
  assert.equal(restored.state, SDD_STATES.PLAN);
  assert.equal(restored.mission_id, 'MIS-E2E-RB');
});
