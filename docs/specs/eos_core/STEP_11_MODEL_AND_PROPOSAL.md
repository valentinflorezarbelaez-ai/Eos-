# EOS CORE MATURATION: STEP 11 — MODEL & PROPOSAL (SELF-HOSTING OPERATING LOOP ARCHITECTURE)

* **Step:** STEP 11 — MODEL & PROPOSE (EXP-038-001 Re-Application)
* **Status:** APPROVED WITH CONDITIONS (STEP 11 FINAL IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Self-Referential Operating Loop Controller (`src/core/selfHostingLoop.js`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Non-Negotiable Constitutional Authority Principle

> **Constitutional Invariant:** EOS may optimize its implementation, but it **CANNOT** unilaterally expand or modify the authority that governs its own optimization.

```text
                             CANONICAL AUTHORITY BOUNDARY
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
  EOS MAY AUTO-MODIFY                                         EOS MUST REQUIRE HUMAN PO
 (Within Bounded Worktree)                                    AUTHORIZATION (Secret Token)
 ├─ src/core/ implementation                                  ├─ CONSTITUTION.md
 ├─ Indexers, Parsers, Engine Logic                           ├─ .agents/AGENTS.md
 ├─ Test Suites & Benchmark Fixtures                          ├─ POLICY_ENGINE.json
 ├─ Observability Tooling & Metrics                            ├─ Write Authorization Levels (L1/L2/L3)
 ├─ Refactoring & Internal Optimizations                      ├─ Epistemic State Definitions
 └─ Evidence & Observation Logging                            └─ Authority Boundary Modifications
```

---

## 2. Industry Practice Research Synthesis (OpenAI, Anthropic, GitHub, Google)

| Industry Practice | Source Organization | Problem Solved | EOS Resemblance | Key EOS Difference | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sandboxed Worktrees** | OpenAI Codex / GitHub Agent | Prevents dirtying workspace during experimental coding | Worktree Isolation Boundary | EOS persists out-of-band failure evidence before rollback | **ADOPT** |
| **Evaluator-Optimizer Loops** | Anthropic Evals | Iterative code optimization via separate evaluator agent | Dual Validation Engine ($S1..S4$) | EOS requires independent Path A & B non-circularity proof | **ADAPT** |
| **Telemetry & Approval Gates** | OpenAI Harness / GCP | Bounds autonomous action and tracks agent traces | Governance Capability Tokens | Governance Engine fail-closed default-deny interlock | **ADAPT** |
| **Eval-Driven Development** | Anthropic / OpenAI | Ensures code changes don't degrade quality metrics | Step 10 Benchmark Engine | EOS measures 6-dimension empirical baseline | **ADOPT** |
| **Same-Model Self-Certification**| Naive Auto-Agents | Agent approves its own untested code changes | Multi-Agent Council & Governance | **REJECTED**: EOS prohibits single-agent self-approval | **REJECT** |

---

## 3. Canonical `SelfImprovementMission` Unit of Work

```typescript
export interface SelfImprovementMission {
  mission_id: string; // e.g. "SIM-2026-08-11-01"
  target_component: string; // e.g. "src/core/knowledgePlane.js"
  intent: string;
  problem_statement: string;
  baseline_revision: string; // Git SHA / Tag
  workspace: {
    worktree_path: string;
    isolation_token: string;
    expiration_timestamp: string;
  };
  scope: {
    allowed_files: string[];
    forbidden_files: string[]; // e.g. ["CONSTITUTION.md", "POLICY_ENGINE.json"]
  };
  knowledge_refs: string[];
  evidence_refs: string[];
  adr_ref?: string;
  governance_requirements: {
    required_authorization_level: 'LEVEL_1_READ_ONLY' | 'LEVEL_2_PROPOSAL' | 'LEVEL_3_IMPLEMENTATION';
    human_approval_required: boolean;
  };
  success_criteria: {
    target_metric_id: string;
    min_improvement_delta: number;
    max_allowed_regression_percent: number;
  };
  failure_criteria: {
    test_failure_count: number;
    security_violation_count: number;
    rollback_trigger_scenarios: string[]; // e.g. ["S2", "S4"]
  };
  rollback_policy: {
    preserve_oob_evidence: boolean;
    rollback_intent: 'REVERT_WORKTREE' | 'RESTORE_BASELINE_TAG';
  };
  validation_plan: {
    require_dual_validation_s1: boolean;
    require_red_team_pass: boolean;
  };
  learning_plan: {
    export_hypothesis_on_pass: boolean;
    export_refutation_on_fail: boolean;
  };
}
```

---

## 4. 19-State Self-Hosting Lifecycle Machine

```text
  [IDLE] ───> [SELF_DISCOVERY] ───> [DIAGNOSING] ───> [HYPOTHESIS_FORMULATION] ───> [PROPOSING]
                                                                                          │
  [ISOLATED_WORKSPACE] <── [BASELINE_CAPTURE] <── [GOVERNANCE_REVIEW] <───────────────────┘
          │
          ▼
  [IMPLEMENTING] ───> [TESTING] ───> [DUAL_VALIDATING] ───> [MEASURING] ───> [EVIDENCE_CAPTURE]
                                                                                     │
  [MISSION_COMPLETE] <── [LEARNING] <── [PROMOTION_REVIEW] <─────────────────────────┘
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                               [INTEGRATE]  [ROLLBACK]  [HUMAN_REVIEW]
```

### Valid & Invalid State Transitions
- **19 Canonical States:** `IDLE`, `SELF_DISCOVERY`, `DIAGNOSING`, `HYPOTHESIS_FORMULATION`, `PROPOSING`, `GOVERNANCE_REVIEW`, `BASELINE_CAPTURE`, `ISOLATED_WORKSPACE`, `IMPLEMENTING`, `TESTING`, `DUAL_VALIDATING`, `MEASURING`, `EVIDENCE_CAPTURE`, `PROMOTION_REVIEW`, `INTEGRATE`, `ROLLBACK`, `HUMAN_REVIEW`, `LEARNING`, `MISSION_COMPLETE`.
- **Invalid (FORBIDDEN):** `PROPOSING -> IMPLEMENTING` (bypassing Governance Review), `IMPLEMENTING -> INTEGRATE` (bypassing Dual Validation & Evidence Capture), `FAILED -> INTEGRATE` (direct failure integration).

---

## 5. Self-Diagnosis & Hypothesis Engine

### 5.1 Diagnosis Categorization
EOS distinguishes 4 diagnostic categories to avoid treating uncertainties as confirmed bugs:
1. `OBSERVED_DEFECT`: Proven failure backed by test log `EVD-XXXX`.
2. `HYPOTHESIS`: Unverified optimization idea.
3. `OPTIMIZATION_OPPORTUNITY`: Benchmark latency $> p_{90}$ threshold.
4. `UNCERTAINTY`: Unclear behavior requiring discovery.

### 5.2 Hypothesis Formulation Structure
```typescript
export interface SelfImprovementHypothesis {
  hypothesis_id: string;
  statement: string; // e.g. "Replacing regex parser in ADREngine with AST tokenizer reduces parse latency by >15%."
  expected_outcome: { metric_id: string; target_value: number; unit: string };
  falsification_condition: string; // "If parse latency degrades or ADR markdown output is not byte-for-byte identical."
  rollback_trigger: string;
}
```

---

## 6. Baseline-First Protocol & Layered Isolation Barrier

```text
  Baseline Capture Order:
  1. Capture Git Commit SHA
  2. Run Full System Test Battery (74 Tests)
  3. Sample Baseline Benchmarks (empiricalBaseline.js)
  4. Sample Memory & CPU Footprint
  5. Snapshot POLICY_ENGINE.json & CONSTITUTION.md hashes
  6. Verify Workspace Clean (git status)
  7. Create Out-of-Band Baseline Evidence (EVD-BASE-XXXX)
```

```text
                               ISOLATION BARRIER
  EOS Main Repository (Read-Only Reference)
         │
         ▼
  .gemini/self-hosting-workspace/ (Git Worktree Sandbox)
         │
         ▼
  Governance Capability Token (GOVERNANCE_AUTHORIZED_TOKEN)
         │
         ▼
  Dual Validation & Benchmark Interceptor
```

---

## 7. Dual Experiment Protocol: Pass Path vs Fail Path

```text
                                  SELF-HOSTING LOOP EXPERIMENT
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
                [PASS PATH]                                           [FAIL PATH]
      (Valid Improvement Proposal)                         (Intentionally Defective Proposal)
                     │                                                     │
                     ▼                                                     ▼
           [Implementation in Worktree]                          [Implementation in Worktree]
                     │                                                     │
                     ▼                                                     ▼
            [Dual Validation S1]                                  [Dual Validation S4]
               (PASS / PASS)                                         (FAIL / FAIL)
                     │                                                     │
                     ▼                                                     ▼
          [1. Evidence Saved]                                   [1. Evidence Saved OOB]
          [2. EvidenceEngine Assessment]                        [2. Reset/Rollback Worktree]
          [3. Governance Review]                                [3. Baseline Verified Clean]
          [4. Controlled Integration]                           [4. Knowledge Asset REFUTED]
```

*Note: PASS PATH does NOT automatically promote knowledge. Evidence is passed to EvidenceEngine and GovernanceEngine for formal assessment before promotion.*

---

## 8. Test Integrity Defense & Benchmark Gaming Mitigation

To prevent an agent from "gaming" tests or benchmarks to force a PASS:
1. **`TEST_INTEGRITY` Policy:** Deleting assertions, disabling tests, relaxing threshold values, or altering test fixtures is strictly detected by `TestIntegrityGuard` and throws `AUTHORITY_VIOLATION`.
2. **Multi-Objective Trade-Off Matrix:** A change that improves latency by $10\%$ but increases memory footprint by $>50\%$ or degrades security tests is classified as `TRADEOFF` or `REGRESSED` and rejected.

---

## 9. Rollback Design & Out-of-Band Evidence Preservation

```text
  Execution Failure Detected
              │
              ▼
  [1. Capture Raw Stdout/Stderr & Exit Code]
              │
              ▼
  [2. Persist Evidence Payload (EVD-OOB-FAIL-XXXX) in docs/evidence/]
              │
              ▼
  [3. Certify Evidence Integrity]
              │
              ▼
  [4. Execute Clean Git Reset / Worktree Teardown]
              │
              ▼
  [5. Verify Source Repository Restored & Failure Evidence Intact]
```

---

## 10. Conceptual API for `src/core/selfHostingLoop.js`

```javascript
export class SelfHostingLoopController {
  /** Ingests SelfImprovementMission and validates authority boundaries */
  ingestMission(mission) {}

  /** Captures baseline snapshots prior to any code modification */
  async captureBaselineSnapshot(mission) {}

  /** Requests Governance capability token for worktree implementation */
  async requestGovernanceApproval(mission, governanceEngine) {}

  /** Executes Pass Path or Fail Path experiment in isolated worktree */
  async executeSelfImprovementExperiment(mission, worktreePath) {}

  /** Evaluates Dual Validation (Path A & B) and Benchmark distributions */
  async validateAndBenchmark(mission, dualValEngine, benchmarkEngine) {}

  /** Executes clean rollback while preserving out-of-band failure evidence */
  async executeFailureRollback(mission, rawError, evidenceEngine) {}

  /** Finalizes mission, updates Knowledge Plane via Evidence/Governance, and exports SelfImprovementCertification */
  async certifyAndComplete(mission) {}
}
```

---

## 11. 6-Category Decision Classification of Proposal

1. **`KNOWN_FACT`**: Steps 1–10 modules exist in `.gemini/self-hosting-workspace/src/core/`. No `selfHostingLoop.js` exists yet.
2. **`TRANSFERRED_PRINCIPLE`**: `SYS-PRN-001` (Boundary Contracts): Self-improvement missions must be schema-validated and governance-gated at the engine boundary.
3. **`HYPOTHESIS`**: Implementing `SelfHostingLoopController` with dual Pass/Fail path validation will demonstrate self-improving engineering autonomy while preserving authority boundaries.
4. **`ASSUMPTION`**: `git worktree` creation and teardown will execute cleanly under Windows environment.
5. **`UNCERTAINTY`**: System I/O file lock contention during rapid worktree resets on Windows.
6. **`REVERSAL_CONDITION`**: If worktree resets fail to restore clean git state in $>2\%$ of runs, worktree isolation **MUST BE REVERSED** to containerized process isolation.

---

## 12. Exit Criteria & Double Verdict

* **Implementation Result:** `MODEL_COMPLETED` (Step 11 Architecture & Self-Hosting Design Specified)
* **Epistemic Verdict:** `MAXIMUM_OPERATIONAL_MATURITY_WITHIN_TESTED_SCOPE`
