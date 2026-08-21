/**
 * Local schema + rules index + FSM path without bridge
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { SchemaValidator } from '../src/core/contracts/schema-validator.js';
import { CanonicalRulesIndex } from '../src/core/rules/canonical-rules-index.js';
import { MissionRuntime } from '../src/core/runtime/mission-runtime.js';
import { HitlGatekeeper } from '../src/core/sdd/hitl-gatekeeper.js';
import { SDD_STATES } from '../src/core/sdd/sdd-fsm-engine.js';

test('SCHEMA-01: valid local mission-package and direction pass', () => {
  const v = new SchemaValidator();
  const direction = {
    mission_id: 'MIS-SCHEMA-01',
    goal: 'g',
    project_path: '.',
    authority_level: 'LEVEL_0'
  };
  const pkg = {
    schema_version: '1.0.0',
    mission_id: 'MIS-SCHEMA-01',
    contract_id: 'CON-SCHEMA-01',
    status: 'active',
    phase: 'VISION_INTAKE',
    direction: {},
    authority: {},
    budgets: {},
    scope: {},
    artifacts: {},
    orchestration: {},
    evidence_policy: {}
  };
  assert.equal(v.validate(direction, 'direction.local.schema.json').valid, true);
  assert.equal(v.validate(pkg, 'mission-package.local.schema.json').valid, true);
});

test('SCHEMA-02: missing required field fails closed', () => {
  const v = new SchemaValidator();
  const bad = { mission_id: 'MIS-X', goal: 'g' }; // missing project_path, authority_level
  const r = v.validate(bad, 'direction.local.schema.json');
  assert.equal(r.valid, false);
  assert.throws(() => v.assertValid(bad, 'direction.local.schema.json'), /SCHEMA_VALIDATION_FAILED/);
});

test('RULES-01: canonical rules index loads and cites', () => {
  const idx = new CanonicalRulesIndex();
  assert.ok(idx.list().length >= 5);
  assert.ok(idx.get('R-ATS-01'));
  const cited = idx.cite(['R-ATS-01', 'R-HITL-01']);
  assert.equal(cited.length, 2);
});

test('E2E-04: requireExternalHitl blocks plan without receipt', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eos-req-hitl-'));
  fs.writeFileSync(path.join(root, 'package.json'), '{"name":"t","type":"module"}');
  fs.mkdirSync(path.join(root, 'src'));
  const rt = new MissionRuntime({ baseDir: root, allowLocalDirectorReceipt: false });
  const c = rt.createMission({ goal: 'need hitl', projectPath: '.' });
  assert.throws(() => rt.planMission(c.mission_id, { requireExternalHitl: true }), /HITL_RECEIPT_REQUIRED/);
  assert.equal(rt.ats.getSnapshot(c.mission_id).state, SDD_STATES.HUMAN_DIRECTION_GATE);
});

test('E2E-05: explicit HITL approve receipt advances to PLAN', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'eos-hitl-ok-'));
  fs.writeFileSync(path.join(root, 'package.json'), '{"name":"t","type":"module"}');
  fs.mkdirSync(path.join(root, 'src'));
  const hitl = new HitlGatekeeper();
  const rt = new MissionRuntime({ baseDir: root, hitl, allowLocalDirectorReceipt: false });
  const c = rt.createMission({ goal: 'explicit hitl', projectPath: '.' });
  // First attempt without receipt should stop at gate if we force require — instead supply receipt
  const receipt = hitl.issueLocalBoundedReceipt({
    missionId: c.mission_id,
    gateId: 'HUMAN_DIRECTION_GATE',
    reason: 'Director-supplied fixture receipt for E2E-05'
  });
  const planned = rt.planMission(c.mission_id, { hitlReceipt: receipt, requireExternalHitl: true });
  assert.equal(planned.phase, SDD_STATES.PLAN);
  assert.ok(planned.transitions.some((t) => t.event_type === 'human.approve_direction'));
});
