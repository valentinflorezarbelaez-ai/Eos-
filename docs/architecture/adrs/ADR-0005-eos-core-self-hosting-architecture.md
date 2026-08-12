# ADR-0005: EOS Core Self-Hosting Architecture, Isolation & Rollback Protocol

* **Status:** APPROVED WITH CONDITIONS (Level 3 Authorized)
* **Date:** 2026-08-11
* **Author:** EOS Autonomous Engineering System
* **Target:** EOS Core (`C:\Users\valen\Documents\Eos system`)

## Context
EOS Core requires implementing its 7-plane architecture (Phases A through I) and executing EXP-038-001 (Self-Hosting Validation) safely without risking source-of-truth corruption or losing self-falsification evidence on rollback.

## Architectural Decision
We adopt **Option A: Modular TypeScript Core + Git Worktree Isolation + Out-of-Band Evidence Buffer + Native `node:sqlite` In-Memory Indexer**.

## 6-Category Decision Breakdown

### 1. `KNOWN_FACT`
- Node.js v24 provides `node:sqlite` (`DatabaseSync`) natively.
- `git worktree` enables physical filesystem isolation for self-hosting experiments.

### 2. `TRANSFERRED_PRINCIPLE`
- **`SYS-PRN-001` (Boundary Contracts):** All module boundaries enforce strict type contracts.
- **`ENV-001` (Native Capability Probing):** Use native Node.js v24 primitives (`node:sqlite`, `node:crypto`) before introducing npm packages.

### 3. `HYPOTHESIS`
- An EOS Core executing over an isolated experiment workspace with out-of-band evidence persistence and independent validation will modify, validate, detect failures, preserve evidence, and revert changes without contaminating the source-of-truth.

### 4. `ASSUMPTION`
- The system operates within Node.js v24.16.0 on Windows/Linux with git CLI available.

### 5. `UNCERTAINTY`
- Operational performance of SQLite in-memory indexer under concurrent graph traversals (to be measured in Level 3).

### 6. `REVERSAL_CONDITION`
- If Git worktree isolation introduces OS file-lock conflicts on Windows or if out-of-band evidence fails integrity verification, the isolation model **MUST BE REVERSED** to containerized isolation or pre-compiled JSON indices.

## Level 3 Gate Requirements

1. **G1 — Isolation:** EOS Core main directory remains untouched (`git status` clean in root).
2. **G2 — Execution:** Self-modifications occur exclusively in the isolated experiment workspace.
3. **G3 — Validation:** Product Validation and Knowledge Validation remain strictly separated.
4. **G4 — Failure Preservation:** Out-of-band evidence is persisted and verified BEFORE any rollback.
5. **G5 — Rollback:** Experiment workspace reverts to baseline without losing failure evidence.

## Out-of-Band Evidence & Rollback Sequence

```text
1. Create Baseline Tag: git tag eos-pre-modify-<id>
2. Modify Code (Isolated Workspace Only)
3. Execute Dual-Path Validation (Phase G)
4. Persist Out-of-Band Evidence (EVD-XXXX):
   - Experiment ID
   - Pre-modification tag/commit
   - Diff reference
   - Product Validation result
   - Knowledge Validation result
   - Timestamp & Integrity Hash
5. Verify OOB Evidence Integrity
6. Execute Rollback (git reset --hard eos-pre-modify-<id>)
7. Restore EVD-XXXX into docs/evidence/ & Record REFUTED / CONTRADICTED in Knowledge Plane
```
