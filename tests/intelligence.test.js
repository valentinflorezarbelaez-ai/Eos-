import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper validators
function validateSource(src) {
  if (!src.source_id) return { valid: false, reason: 'Source missing source_id' };
  const validStatuses = ['VERIFIED', 'NOT VERIFIED', 'PARTIALLY VERIFIED', 'BLOCKED'];
  if (!validStatuses.includes(src.verification_status)) return { valid: false, reason: 'Invalid verification_status' };
  return { valid: true };
}

function validateResearch(rsc) {
  if (!rsc.evidence || !Array.isArray(rsc.evidence) || rsc.evidence.length === 0) {
    return { valid: false, reason: 'Research missing evidence' };
  }
  if (!rsc.sources || !Array.isArray(rsc.sources) || rsc.sources.length === 0) {
    return { valid: false, reason: 'Research claims missing source' };
  }
  return { valid: true };
}

function validatePattern(pat) {
  if (!pat.evidence || !Array.isArray(pat.evidence) || pat.evidence.length === 0) {
    return { valid: false, reason: 'Pattern missing evidence' };
  }
  if (pat.status === 'VALIDATED' && pat.evidence.length === 0) {
    return { valid: false, reason: 'VALIDATED pattern has no evidence' };
  }
  return { valid: true };
}

function validateCapabilityAdoption(cap, decisions) {
  if (cap.adoption_level === 'ADOPT') {
    const dec = decisions.find(d => d.capability_id === cap.capability_id && d.decision === 'ADOPT');
    if (!dec) return { valid: false, reason: 'ADOPT capability missing decision record' };
    if (cap.status === 'ADOPTED' && !dec.evidence) return { valid: false, reason: 'Adopted capability missing verification evidence' };
  }
  return { valid: true };
}

function validateEvidenceStatus(evd) {
  const validStatuses = ['VERIFIED', 'NOT VERIFIED', 'PARTIALLY VERIFIED', 'BLOCKED', 'ASSUMPTION', 'RISK'];
  if (!validStatuses.includes(evd.status)) return { valid: false, reason: 'Invalid evidence status' };
  return { valid: true };
}

function validateContradictionResolution(contradiction) {
  if (contradiction.status === 'RESOLVED' && (!contradiction.evidence || contradiction.evidence.length === 0)) {
    return { valid: false, reason: 'Contradiction marked RESOLVED without evidence' };
  }
  return { valid: true };
}

// 1. Positive Tests
test('Positive Test: Sources Registry validity', () => {
  const sourcesPath = path.join(rootDir, 'docs/intelligence/sources/SOURCES.json');
  assert.ok(fs.existsSync(sourcesPath));
  const data = JSON.parse(fs.readFileSync(sourcesPath, 'utf-8'));
  assert.ok(Array.isArray(data.sources));
  assert.ok(data.sources.length >= 10);
});

test('Positive Test: RSC-0001 Gentleman Engram Study validity', () => {
  const rscPath = path.join(rootDir, 'docs/intelligence/research/RSC-0001-gentleman-engram-study.json');
  assert.ok(fs.existsSync(rscPath));
  const rsc = JSON.parse(fs.readFileSync(rscPath, 'utf-8'));
  const res = validateResearch(rsc);
  assert.equal(res.valid, true);
});

// 2. 12 Negative Tests (Step 26 Requirements)
test('Negative Test 1: Reject source without ID', () => {
  const invalidSrc = { name: 'No ID Source', verification_status: 'VERIFIED' };
  const res = validateSource(invalidSrc);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Source missing source_id');
});

test('Negative Test 2: Reject research without evidence', () => {
  const invalidRsc = { research_id: 'RSC-99', sources: ['SRC-0001'], evidence: [] };
  const res = validateResearch(invalidRsc);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Research missing evidence');
});

test('Negative Test 3: Reject claim/research without source', () => {
  const invalidRsc = { research_id: 'RSC-99', sources: [], evidence: ['EVD-0001'] };
  const res = validateResearch(invalidRsc);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Research claims missing source');
});

test('Negative Test 4: Reject pattern without evidence', () => {
  const invalidPat = { pattern_id: 'PAT-99', status: 'EMERGING', evidence: [] };
  const res = validatePattern(invalidPat);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Pattern missing evidence');
});

test('Negative Test 5: Reject VALIDATED pattern without evidence', () => {
  const invalidPat = { pattern_id: 'PAT-99', status: 'VALIDATED', evidence: [] };
  const res = validatePattern(invalidPat);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Pattern missing evidence');
});

test('Negative Test 6: Reject ADOPT capability without decision record', () => {
  const invalidCap = { capability_id: 'CAP-99', adoption_level: 'ADOPT', status: 'CANDIDATE' };
  const res = validateCapabilityAdoption(invalidCap, []);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'ADOPT capability missing decision record');
});

test('Negative Test 7: Reject source with invalid status', () => {
  const invalidSrc = { source_id: 'SRC-99', verification_status: 'UNKNOWN_STATUS' };
  const res = validateSource(invalidSrc);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Invalid verification_status');
});

test('Negative Test 8: Reject evidence with invalid status', () => {
  const invalidEvd = { id: 'EVD-99', status: 'SUPER_VALID' };
  const res = validateEvidenceStatus(invalidEvd);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Invalid evidence status');
});

test('Negative Test 9: Reject external write attempt during EOS Development Mode', () => {
  const policyEnginePath = path.join(rootDir, 'docs/policies/POLICY_ENGINE.json');
  const policyEngine = JSON.parse(fs.readFileSync(policyEnginePath, 'utf-8'));
  const pol = policyEngine.policies.find(p => p.policy_id === 'POL-001');
  assert.equal(pol.result, 'DENY');
});

test('Negative Test 10: Reject unauthorized project implementation', () => {
  const stateMachinePath = path.join(rootDir, 'docs/projects/STATE_MACHINE.json');
  const stateMachine = JSON.parse(fs.readFileSync(stateMachinePath, 'utf-8'));
  const prohibited = stateMachine.prohibited_transitions.find(p => p.from === 'REGISTERED' && p.to === 'IMPLEMENTATION');
  assert.ok(prohibited);
});

test('Negative Test 11: Reject contradiction marked RESOLVED without evidence', () => {
  const invalidContradiction = { status: 'RESOLVED', evidence: [] };
  const res = validateContradictionResolution(invalidContradiction);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Contradiction marked RESOLVED without evidence');
});

test('Negative Test 12: Reject capability adopted without verification', () => {
  const cap = { capability_id: 'CAP-99', adoption_level: 'ADOPT', status: 'ADOPTED' };
  const dec = [{ capability_id: 'CAP-99', decision: 'ADOPT', evidence: null }];
  const res = validateCapabilityAdoption(cap, dec);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'Adopted capability missing verification evidence');
});
