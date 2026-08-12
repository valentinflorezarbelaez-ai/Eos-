# EXP-038-001: EOS Core Level 1 READ_ONLY Self-Diagnosis Report

* **Experiment:** EXP-038-001 — EOS Self-Hosting Validation
* **Status:** LEVEL 1 — SELF-DIAGNOSIS COMPLETE (READ_ONLY MODE)
* **Target Workspace:** EOS Control Plane (`C:\Users\valen\Documents\Eos system`)
* **Date:** 2026-08-11
* **Auditor:** EOS Autonomous Self-Diagnosis Engine

---

## 1. Strictly Enforced READ_ONLY Boundaries Check

During Level 1 Self-Diagnosis:
- ❌ **ZERO** code lines modified.
- ❌ **ZERO** npm packages installed.
- ❌ **ZERO** self-modifications executed.
- ❌ **ZERO** changes to `CONSTITUTION.md` or `.agents/AGENTS.md`.
- ❌ **ZERO** policy modifications.
- ❌ **ZERO** claims of unverified readiness.

---

## 2. Current EOS Core Component Mapping

### A. Architectural Specifications (`docs/core/`)
- `CANONICAL_DOMAIN_MODEL.md` (Phase A)
- `PHASE_B_KNOWLEDGE_PLANE_DESIGN.md` (Phase B)
- `PHASE_C_EVIDENCE_ENGINE_DESIGN.md` (Phase C)
- `PHASE_D_GOVERNANCE_ENGINE_DESIGN.md` (Phase D)
- `PHASE_E_DECISION_ENGINE_DESIGN.md` (Phase E)
- `PHASE_F_SYNTHESIS_ENGINE_DESIGN.md` (Phase F)
- `PHASE_G_DUAL_PATH_VALIDATION_DESIGN.md` (Phase G)
- `PHASE_H_EXECUTION_ENGINE_DESIGN.md` (Phase H)
- `PHASE_I_SELF_HOSTING_DESIGN.md` (Phase I)

### B. Active Knowledge Assets (`docs/knowledge/`)
- `LSN-001-mobile-navigation-qa.json` (Responsive Layout Strategy)
- `LSN-002-zero-js-cta-parameter-integrity.json` (CTA Data Integrity)
- `ENV-001-node-native-sqlite-runtime.json` (Native `node:sqlite` Capability)
- `SYS-PRN-001-system-boundary-contract-principle.json` (System Boundary & 409 Conflict)

### C. Active Engine Code (`scripts/`)
- `verify-eos.js` (Root verification suite)
- `scripts/engine/` (16 legacy engine scripts requiring migration to Phase A-I specifications)

---

## 3. Implementation Gaps & Discrepancies Identified

| Gap ID | Description | Impact on Self-Hosting | Required Resolution in Level 2/3 |
| :--- | :--- | :--- | :--- |
| **GAP-01** | **Legacy Scripts vs Phase A-I Specs:** Scripts in `scripts/engine/*.js` do not implement the 6-step Evidence Chain (`Claim -> Prediction -> Test -> Observation -> Evidence -> Assessment`), 6-category ADR breakdown, or 9-point Knowledge Asset schema. | Legacy scripts cannot enforce Phase C-G rules natively. | Refactor `scripts/engine/` into modular TypeScript/Node modules conforming to Phase A-I specs. |
| **GAP-02** | **Missing In-Memory Provenance Indexer:** `PHASE_B_KNOWLEDGE_PLANE_DESIGN.md` specifies a Hybrid Git JSON + Native `node:sqlite` in-memory indexer, but no indexer script exists. | Graph queries (`trace_provenance`) require parsing all JSON files sequentially. | Create `src/indexer/provenanceIndexer.ts` using native `node:sqlite`. |
| **GAP-03** | **Missing Machine-Readable ADR Generator:** `PHASE_E_DECISION_ENGINE_DESIGN.md` specifies `MachineReadableADR` schema. Existing ADRs are Markdown files without JSON parsers. | Decision Engine cannot validate ADR governance interlocks programmatically. | Create `ADR` JSON schema generator & validator. |
| **GAP-04** | **Rollback Evidence Preservation Risk:** A naive `git reset --hard` during a failed Level 3 self-modification would delete the raw failure evidence `EVD-XXXX`. | Violates learning invariant: fails to record self-falsification. | Implement **Out-of-Band Evidence Barrier**: write `EVD-XXXX` artifacts before triggering git rollback. |

---

## 4. Self-Hosting Unknowns Register (`UNK-SELF-XXXX`)

| Unknown ID | Question | Risk Level | Information Needed to Resolve | Potential Architecture Impact |
| :--- | :--- | :--- | :--- | :--- |
| **UNK-SELF-01** | How to build the native `node:sqlite` in-memory provenance indexer cleanly on startup without external dependencies? | **MEDIUM** | Performance benchmark of SQLite `DatabaseSync` in Node v24. | Determines startup indexing speed. |
| **UNK-SELF-02** | How to structure Out-of-Band Evidence Storage so raw `EVD-XXXX` failure records survive a `git reset --hard`? | **CRITICAL** | Git untracked / stash / out-of-tree evidence buffer strategy. | Prevents loss of self-falsification evidence on rollback. |
| **UNK-SELF-03** | How to enforce `GovernanceEngine.checkADRRecommendation` inside `verify-eos.js` without circular dependencies? | **HIGH** | Governance module boundaries. | Ensures ADRs pass policy checks before acceptance. |

---

## 5. Self-Hosting Risk Register & Rollback Protocol

```text
  [Self-Modification Attempt]
               │
               v
  [1. Pre-Modification Safety Tag]: git tag eos-pre-modify-<id>
               │
               v
  [2. Level 3 Implementation]
               │
               v
  [3. Phase G Dual-Path Validation]
               │
        ┌──────┴──────┐
        ▼             ▼
     [PASS]        [FAIL]
        │             │
        v             v
  [Commit Code]  [4. Out-of-Band Evidence Buffer]: Save EVD-XXXX outside git working tree
                      │
                      v
                 [5. Rollback]: git reset --hard eos-pre-modify-<id>
                      │
                      v
                 [6. Restore Evidence]: Copy EVD-XXXX into docs/evidence/ & record Self-Falsification
```

---

## 6. Level 1 Exit Criteria Check

1. **What Problem We Are Solving:** Transitioning EOS Core from legacy standalone scripts to a fully integrated, self-hosting, 7-plane architecture with out-of-band evidence rollback protection.
2. **Current State Mapped:** All 13 core specification documents, 4 knowledge assets, 35+ evidence records, and 16 legacy engine scripts inspected and mapped.
3. **Gaps & Unknowns Registered:** 4 implementation gaps (`GAP-01` to `GAP-04`) and 3 self-hosting unknowns (`UNK-SELF-01` to `UNK-SELF-03`) documented.
4. **Out-of-Band Rollback Rule Incorporated:** Pre-modification git tags + out-of-band evidence buffer specified to ensure failure logs survive rollbacks.
5. **Forbidden Actions Enforced:** Zero code modified, zero packages installed, zero policies altered.
