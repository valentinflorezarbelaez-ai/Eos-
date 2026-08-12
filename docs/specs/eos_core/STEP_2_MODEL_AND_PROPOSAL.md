# EOS CORE MATURATION: STEP 2 — MODEL & PROPOSAL (EVIDENCE & EPISTEMIC CLASSIFICATION ENGINE)

* **Step:** STEP 2 — MODEL & PROPOSE
* **Status:** APPROVED WITH CONDITIONS (STEP 2 IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Executable Evidence Engine (`src/core/evidenceEngine.js`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Authority Decoupling & Epistemic Invariants

```text
  [Test Runner / Product Validator]
                 │  Captures stdout, stderr, exit code, media artifacts
                 ▼
        [ObservationRecord]
                 │
                 ▼
     [Evidence Engine Module] ───────> Interprets Evidence Quality & Sufficiency
                 │                 (Outputs Epistemic Verdict: SUPPORTED, REFUTED, etc.)
                 ▼
       [EvidenceAssessment]
                 │
                 ▼
     [Governance Engine Module] ─────> Enforces Binding Operational Action
                                       (BLOCK_ADR_RECOMMENDATION, REQUIRE_SCOPE_NARROWING, ALLOW)
```

1. **Evidence Engine != Governance Engine:** Evidence Engine evaluates evidence quality and assigns epistemic states (`SUPPORTED_IN_SCOPE`, `REFUTED`, `CONTRADICTED`, `INCONCLUSIVE`); it **NEVER** outputs Governance policy actions (`BLOCK_ADR_RECOMMENDATION`).
2. **Explicable Sufficiency Invariant:** Sufficiency evaluations MUST NOT use opaque numeric scores. Every evaluation provides an auditable boolean/enum breakdown (`test_executed`, `claim_scope_alignment`, `falsification_checked`, `missing_information`).
3. **Zero-Fiction Legacy Invariant:** Legacy flat evidence files (`EVD-0001` .. `EVD-0038`) are converted into canonical representations with missing fields explicitly marked `UNSET` / `UNKNOWN` / `UNVERIFIED`. No historical data is invented. `observation_integrity` for legacy files is assigned `'NOT_AVAILABLE'`.

---

## 2. Canonical Contracts & Schemas

### A. Sub-Entity Contracts (TypeScript Interfaces)

```typescript
export type ClaimClassification = 
  | 'KNOWN_FACT'
  | 'TRANSFERRED_PRINCIPLE'
  | 'HYPOTHESIS'
  | 'ASSUMPTION'
  | 'UNCERTAINTY'
  | 'REVERSAL_CONDITION';

export type EpistemicState = 
  | 'UNVERIFIED'
  | 'SUPPORTED_IN_SCOPE'
  | 'CONFIRMED_IN_SCOPE'
  | 'CONTRADICTED'
  | 'REFUTED'
  | 'INCONCLUSIVE';

export type ObservationIntegrity = 'VERIFIED' | 'UNVERIFIED' | 'NOT_AVAILABLE';

export interface Claim {
  claim_id: string;
  statement: string;
  classification: ClaimClassification;
  target_asset_id?: string;
}

export interface Prediction {
  prediction_id: string;
  claim_id: string;
  testable_assertion: string;
  expected_outcome: string;
  falsification_condition: string; // If falsification_condition == TRUE -> REFUTED
}

export interface TestDefinition {
  test_id: string;
  prediction_id: string;
  type: 'UNIT_TEST' | 'CONCURRENCY_STRESS' | 'BROWSER_QA' | 'SECURITY_AUDIT' | 'PERFORMANCE_BENCHMARK';
  execution_command: string;
  environment_requirements: Record<string, string>;
}

export interface ObservationRecord {
  observation_id: string;
  test_id: string;
  timestamp: string;
  exit_code: number;
  raw_stdout: string;
  raw_stderr: string;
  media_artifacts?: string[];
}
```

### B. Canonical `EvidenceRecordContainer` & `EvidenceAssessment`

```typescript
export interface EvidenceRecordContainer {
  evidence_id: string; // e.g. EVD-0038-PASS-TEST
  project_id: string;
  claims_tested: Claim[];
  predictions: Prediction[];
  observations: ObservationRecord[];
}

export interface EvidenceSufficiencyEvaluation {
  test_executed: boolean;
  test_result: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
  observation_integrity: ObservationIntegrity; // VERIFIED | UNVERIFIED | NOT_AVAILABLE
  claim_scope_alignment: boolean;
  prediction_available: boolean;
  falsification_checked: boolean;
  transfer_independence: boolean;
  contradiction_detected: boolean;
  missing_information: string[]; // Explicit list (e.g. ['predictions', 'falsification_conditions', 'observation_integrity_hash'])
  is_sufficient_for_claim: boolean;
}

export interface EvidenceAssessment {
  assessment_id: string;
  evidence_id: string;
  evaluated_date: string;
  sufficiency_evaluation: EvidenceSufficiencyEvaluation;
  scope_boundaries: {
    project_id: string;
    domain: string;
    environment: string;
    viewport?: string;
  };
  claim_assessments: Array<{
    claim_id: string;
    result: 'PASS' | 'FAIL' | 'CONTRADICTED' | 'INCONCLUSIVE';
    resulting_state: EpistemicState; // STRICT: CANNOT BE A GOVERNANCE ACTION
    rationale: string;
  }>;
}
```

---

## 3. Legacy-to-Canonical Zero-Fiction Adapter Strategy

The `EvidenceEngine` dynamically reads the real evidence directory on disk (`docs/evidence/*.json`) and adapts legacy files without fiction:

| Legacy Field | Canonical Mapping | Value Assignment | Handling of Missing Fields |
| :--- | :--- | :--- | :--- |
| `id` / `evidenceId` | `evidence_id` | Preserved (e.g. `EVD-0001`, `EVD-0035`) | Direct mapping. |
| `claim` / `hypothesis_validation` | `claims_tested[0].statement` | Preserved text | `classification` assigned `HYPOTHESIS`. |
| `command` / `browser_qa` | `observations[0].raw_stdout` | Preserved command/logs | `test_id` assigned `LEGACY_COMMAND`. |
| `result` / `status` | `sufficiency_evaluation.test_result` | `PASS` -> `PASS`, `FAIL` -> `FAIL` | Mapped to `test_result`. |
| *(Missing)* | `predictions` | **`[]` (Empty Array)** | `prediction_available = false`, `missing_information.push('predictions')`. |
| *(Missing)* | `falsification_conditions` | **`UNSET`** | `falsification_checked = false`, `missing_information.push('falsification_conditions')`. |
| *(Missing Hash)* | `observation_integrity` | **`'NOT_AVAILABLE'`** | `missing_information.push('observation_integrity_hash')`. |

---

## 4. Epistemic State Machine Rules

```text
  [UNVERIFIED] ─── (1 Test Pass + Sufficiency True) ───> [SUPPORTED_IN_SCOPE]
       │                                                         │
       │                                                         │ (Transfer Pass in >= 2 Independent Domains
       │                                                         │  with 0 Falsification Triggers)
       │                                                         v
       │                                              [CONFIRMED_IN_SCOPE]
       │                                                         │
       ├────── (Same Claim + Same Prediction + Independent Domains + Pass(A) + Fail(B)) ───> [CONTRADICTED]
       │                                                         │
       ├────── (falsification_condition == TRUE) ────────────────┼───> [REFUTED]
       │                                                         │
       └────── (Corrupted logs / Partial execution) ─────────────┴───> [INCONCLUSIVE]
```

1. **`UNVERIFIED` -> `SUPPORTED_IN_SCOPE`:** Requires `is_sufficient_for_claim = true`, `test_result = 'PASS'`, and matching scope boundaries.
2. **`SUPPORTED_IN_SCOPE` -> `CONFIRMED_IN_SCOPE`:** Requires independent transfer evidence passing across multiple domains without falsification.
3. **Strict Contradiction Rule (`CONTRADICTED`):**
   Requires: `SAME_CLAIM` + `SAME_PREDICTION` + `INDEPENDENT_DOMAINS` + `COMPARABLE_SCOPE` + `(PASS in Scope A)` + `(FAIL in Scope B)` + `(falsification_condition == FALSE)`.
4. **`falsification_condition == TRUE` -> `REFUTED`:** If explicit falsification condition is met, resulting state is `REFUTED`.
5. **Partial / Corrupted Execution -> `INCONCLUSIVE`:** If execution logs are corrupted, incomplete, or missing, resulting state is `INCONCLUSIVE`. Existing epistemic state is preserved.

---

## 5. Conceptual API for `src/core/evidenceEngine.js`

```javascript
export class EvidenceEngine {
  /** Ingests a raw EvidenceRecordContainer or Legacy EVD JSON */
  ingestEvidence(data) {}

  /** Evaluates evidence quality, scope alignment, and sufficiency */
  evaluateSufficiency(container) {}

  /** Assesses claims and derives the resulting epistemic state */
  assessClaims(container, sufficiencyEval, scopeBoundaries) {}

  /** Legacy Zero-Fiction Adapter: Maps legacy files into canonical container */
  adaptLegacyEvidence(legacyJson) {}
}
```

---

## 6. Negative Test Cases for Level 3 Implementation

1. **`CORRUPTED_OBSERVATION`:** Hash mismatch or missing `raw_stdout` -> Must yield `resulting_state = 'INCONCLUSIVE'`.
2. **`UNMATCHED_SCOPE`:** Test passed in `Environment A`, evaluated for `Environment B` -> Must set `claim_scope_alignment = false` and yield `INCONCLUSIVE`.
3. **`PROMOTION_WITHOUT_PREDICTION`:** Legacy asset with missing `predictions` -> Must block `CONFIRMED_IN_SCOPE` and set `missing_information = ['predictions']`.
4. **`FALSIFICATION_TRIGGERED`:** Explicit `falsification_condition == TRUE` -> Must yield `resulting_state = 'REFUTED'`.
5. **`CONTRADICTION_NO_FAIL`:** Same claim & prediction across Scope A (PASS) and Scope B (FAIL) -> Must yield `resulting_state = 'CONTRADICTED'`, not an averaged numeric score.
6. **`EVIDENCE_ENGINE_GOVERNANCE_LEAK`:** Attempting to make `EvidenceEngine` output a Governance policy action (`BLOCK_ADR_RECOMMENDATION`) -> **MUST THROW AN EXPLICIT ERROR / BE REJECTED**.
