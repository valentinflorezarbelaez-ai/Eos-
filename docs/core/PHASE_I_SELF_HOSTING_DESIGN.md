# PHASE I: EOS SELF-HOSTING VALIDATION & BOUNDARY DESIGN (EXP-038-001)

* **Phase:** PHASE I — EOS SELF-HOSTING VALIDATION
* **Status:** DESIGN SPECIFIED (PHASE I DESIGN COMPLETE)
* **Date:** 2026-08-11
* **Experiment ID:** EXP-038-001
* **Scope:** Controlled Self-Modification & Self-Validation of EOS Core (`C:\Users\valen\Documents\Eos system`)

---

## 1. Constitutional Self-Hosting Invariants

> [!CAUTION]
> **1. Controlled Self-Hosting Invariant:**
> Self-hosting is a controlled engineering process, **NOT an unbounded recursive loop**. EOS applies its engineering pipeline to its own codebase while preserving strict safety boundaries.
>
> **2. Non-Autonomous Constitution Barrier:**
> EOS **CANNOT** self-modify `docs/core/CONSTITUTION.md`, `.agents/AGENTS.md`, or Human Policy Rules without explicit, interactive Product Owner approval.
>
> **3. Single Judge Prohibition:**
> EOS is **NEVER** the sole judge of its own safety. Self-modifications require external test execution and mandatory automated rollback capabilities.

```text
                             EOS SELF-HOSTING ENGINE
                                       │
                                       ▼
                         SELF-MODIFICATION BARRIER
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     Self-Modifiable Components                    Constitutional Invariants
 (Knowledge Indexer, Validator Engines,           (CONSTITUTION.md, AGENTS.md,
  Decision Engines, Verification Scripts)           PO Policies, Kill Switches)
 [ALLOWED UNDER LEVEL 3]                          [READ-ONLY / FORBIDDEN]
```

---

## 2. The 7 Mandatory Self-Hosting Boundaries

| Boundary | Definition & Enforcement Rules |
| :--- | :--- |
| **`SELF_HOSTING_SCOPE`** | Internal refactoring, engine performance optimization, validator additions, and indexer enhancements within EOS Core (`C:\Users\valen\Documents\Eos system`). |
| **`SELF_MODIFICATION_BOUNDARIES`** | `CONSTITUTION.md`, `AGENTS.md`, and `POLICY_ENGINE.json` are strictly **READ-ONLY** to self-modification. |
| **`SELF_VALIDATION_EVIDENCE`** | Automated verification scripts (`verify-eos.js`), unit tests, and dual-path evidence artifacts (`EVD-XXXX`). |
| **`SELF_FAILURE_MODES`** | Identification of self-introduced regressions, broken type contracts, index corruption, or unhandled exceptions. |
| **`SELF_GOVERNANCE_LIMITS`** | Maximum of 1 self-modification per cycle; mandatory git commit tagging (`eos-self-modify-<timestamp>`). |
| **`EXTERNAL_OR_HUMAN_OVERRIDE`** | Immediate Product Owner kill-switch authority and manual git revert capability. |
| **`ROLLBACK_CONDITION`** | **IMMEDIATE AUTOMATED ROLLBACK** (`git checkout / revert`) to pre-modification tag if Product Validation OR Knowledge Validation fails during Phase G. |

---

## 3. Self-Falsification & Self-Correction Standard

> [!NOTE]
> **Self-Falsification Principle:**
> If EOS self-modifies a component and empirical validation subsequently detects a regression or falsified prediction, **that self-falsification is recorded as a SUCCESSFUL experiment outcome.**
>
> It proves that EOS can detect, record, and roll back its own errors without human intervention or data corruption.

```text
  [Self-Modification Attempt] ──> [Dual-Path Validation (Phase G)]
                                               │
                                       ┌───────┴───────┐
                                       ▼               ▼
                                    [PASS]          [FAIL]
                                       │               │
                                       v               v
                             [Commit & Update KB] [AUTOMATED ROLLBACK &
                                                   Record Self-Falsification]
```

---

## 4. EXP-038-001 Protocol & Execution Steps

```text
  Step 1: Ingest Self-Hosting Intent (e.g. Optimize EOS Indexer / Add Verification Rule)
  Step 2: Level 1 READ_ONLY Self-Diagnosis (Identify target component & risks)
  Step 3: Level 2 Architectural Proposal & Machine-Readable ADR (Governance Check)
  Step 4: Create Pre-Modification Safety Tag (`git tag eos-pre-modify-<id>`)
  Step 5: Level 3 Controlled Self-Implementation
  Step 6: Phase G Dual-Path Validation (Product & Knowledge Verification)
  Step 7: If FAIL -> Automated Rollback (`git reset --hard eos-pre-modify-<id>`) & Record EVD-XXXX Failure
  Step 8: If PASS -> Update Knowledge Plane & Commit Self-Modification
```

---

## 5. Phase I Exit Check

- **Constitutional Invariants:** Enforced (Controlled self-hosting, non-autonomous constitution barrier, single judge prohibition).
- **7 Mandatory Boundaries:** Specified (`SCOPE`, `BOUNDARIES`, `EVIDENCE`, `FAILURE_MODES`, `GOVERNANCE_LIMITS`, `OVERRIDE`, `ROLLBACK`).
- **Self-Falsification Standard:** Formally specified (Self-detected regressions trigger automated rollback & count as successful self-correction learning).
- **EXP-038-001 Protocol:** Specified and ready for execution.
