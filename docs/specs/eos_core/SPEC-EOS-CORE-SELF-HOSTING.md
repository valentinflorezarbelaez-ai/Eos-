# SPEC-EOS-CORE-SELF-HOSTING: Level 2 Architecture & Self-Hosting Proposal (EXP-038-001)

* **Experiment:** EXP-038-001 — EOS Self-Hosting Validation
* **Phase:** LEVEL 2 — PROPOSAL & ARCHITECTURE
* **Status:** PROPOSED (PENDING PO REVIEW)
* **Date:** 2026-08-11
* **Engine:** EOS Engineering Operating System (`C:\Users\valen\Documents\Eos system`)

---

## 1. Physical Isolation & Worktree Experiment Workspace

To prevent self-modification from corrupting the active EOS Core source of truth:

```text
  EOS CORE (Source of Truth & Governing Engine)
  Path: C:\Users\valen\Documents\Eos system
         │
         │ Git Worktree Isolation Barrier
         ▼
  SELF-HOSTING EXPERIMENT WORKSPACE (Isolated Target Workspace)
  Path: C:\Users\valen\Documents\Eos system\.gemini\self-hosting-workspace
         │
         ├── Controlled Self-Modification (Level 3)
         ├── Automated Test Execution (Phase G)
         └── Dual-Path Validation
```

- **Physical Barrier:** Self-modifications occur **ONLY** inside the isolated worktree directory (`.gemini/self-hosting-workspace`).
- **Source of Truth Protection:** The main directory (`C:\Users\valen\Documents\Eos system`) remains untouched during execution. If an experiment fails, the worktree is discarded without risk to the active system.

---

## 2. Solutions to Gaps & Level 2 Conditions

### A. Resolution of Implementation Gaps (`GAP-01` to `GAP-04`)

1. **`GAP-01` (Legacy Scripts Migration):**
   - Refactor `scripts/engine/*.js` into modular TypeScript components (`src/core/`) matching Phase A–I specifications.
   - Enforce the 6-step Evidence Chain (`Claim -> Prediction -> Test -> Observation -> Evidence -> Assessment`) natively.

2. **`GAP-02` (Hybrid In-Memory Provenance Indexer):**
   - Create `src/indexer/provenanceIndexer.ts` using Node.js v24 native `node:sqlite` (`DatabaseSync`).
   - Parses Git JSON files in `docs/knowledge/` on startup, building an in-memory SQL index for instant graph queries (`trace_provenance`).
   - Performance baseline will be empirically measured in Level 3 without hardcoded threshold assumptions.

3. **`GAP-03` (Machine-Readable ADR Generator & Parser):**
   - Create `src/adr/adrEngine.ts` to serialize/parse `MachineReadableADR` JSON objects.
   - Enforces 6-category breakdown (`KNOWN_FACT`, `TRANSFERRED_PRINCIPLE`, `HYPOTHESIS`, `ASSUMPTION`, `UNCERTAINTY`, `REVERSAL_CONDITION`) and validates governance checks via `checkADRRecommendation`.

4. **`GAP-04` & `UNK-SELF-04` (Out-of-Band Evidence Buffer & Durability):**
   - **Out-of-Band Path:** Evidence records (`EVD-XXXX`) are written immediately to an uncommitted, out-of-tree directory (`C:\Users\valen\.gemini\antigravity-ide\evidence-buffer\`).
   - **Durability Guarantee:** Even if a process crashes, git worktree is deleted, or a `git reset --hard` occurs, the out-of-tree buffer preserves the raw stdout, stderr, and test results.
   - **Restoration Workflow:** After rollback completes, the orchestrator reads the out-of-tree buffer, copies `EVD-XXXX` into `docs/evidence/`, and updates the Knowledge Plane with the `REFUTED` or `CONTRADICTED` self-falsification assessment.

### B. Resolution of Self-Evaluation Authority (`UNK-SELF-05`)

To prevent circular self-trust:

```text
  [Self-Modification Component A]
                │
                v
  [Phase G Dual-Path Test Runner] (Executes external verification commands)
                │
                v
  [Independent Verification Script]: verify-eos.js (Runs in separate Node process)
                │
                v
  [Evidence Engine (Phase C)]     (Evaluates evidence sufficiency score)
                │
                v
  [Product Owner Policy Gate]     (Mandatory check against CONSTITUTION.md invariants)
```

- **Execution != Validation != Truth:** EOS running a test produces an `ObservationRecord`. The Phase C Evidence Engine checks `evidence_sufficiency_score` and `falsification_conditions`.
- **Constitutional Invariant:** Self-modifications affecting governance or constitution rules require explicit interactive Product Owner approval.

---

## 3. Evaluation of Architectural Options for EOS Core Implementation

### Option A: Modular Node.js / TypeScript Core Engine + Native `node:sqlite`
* **Design:** Clean TypeScript modules compiled with `tsc` or executed via `tsx`, using built-in `node:sqlite` for in-memory indexing and Git JSON files as Source of Truth.
* **Pros:** 0 external C++ add-ons, 0 native build tools (`node-gyp`), 100% portable, fast startup.

### Option B: Monolithic Single-Script Runtime (`verify-eos.js` Expansion)
* **Design:** Appending all Phase A-I logic into the monolithic `verify-eos.js` file.
* **Cons:** High coupling, unmaintainable, violates Single Responsibility Principle.

---

## 4. 6-Category Decision Breakdown (Option A)

1. **`KNOWN_FACT`**:
   - `node:sqlite` (`DatabaseSync`) is built into Node.js v24.16.0.
   - Git worktrees allow isolated parallel branches without dirtying the main working tree.
2. **`TRANSFERRED_PRINCIPLE`**:
   - `SYS-PRN-001` (Boundary Contracts): Modules enforce strict Zod schema contracts at boundaries.
   - `ENV-001` (Native Capabilities): Use Node built-ins (`node:sqlite`, `node:crypto`) before introducing third-party packages.
3. **`HYPOTHESIS`**:
   - A modular TypeScript core using Git JSON as Source of Truth and `node:sqlite` as a derived in-memory indexer will achieve 100% spec compliance with zero external dependencies.
4. **`ASSUMPTION`**:
   - Node.js v24.16.0 remains the standard execution environment for EOS Core.
5. **`UNCERTAINTY`**:
   - Memory footprint of loading 100+ knowledge JSON files into SQLite in-memory tables (to be measured in Level 3).
6. **`REVERSAL_CONDITION`**:
   - If Node.js deprecates `node:sqlite` or if Git JSON parsing on startup exceeds acceptable CLI responsiveness thresholds, the in-memory indexer **MUST BE REVERSED** to an asynchronous persistence layer or static pre-compiled JSON index.
