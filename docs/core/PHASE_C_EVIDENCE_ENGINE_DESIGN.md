# PHASE C: EOS EVIDENCE & EPISTEMIC CLASSIFICATION ENGINE DESIGN

* **Phase:** PHASE C — EVIDENCE ENGINE DESIGN
* **Status:** DESIGN SPECIFIED & FROZEN WITH CONDITIONS
* **Date:** 2026-08-11
* **Scope:** Internal Evidence Engine Architecture for EOS (`C:\Users\valen\Documents\Eos system`)

---

## 1. Fundamental Non-Dogmatic Invariant

> [!CAUTION]
> **The Epistemic Non-Dogmatism Invariant:**
> The Evidence Plane **NEVER** outputs `UNIVERSALLY_TRUE` or `ABSOLUTE_FACT`. All claims are assessed strictly relative to their scope boundaries, empirical observations, and falsification tests.

Supported 6 Output States:
1. `UNVERIFIED`: Claim written without dynamic test execution.
2. `SUPPORTED_IN_SCOPE`: Claim backed by passing evidence and sufficient quality evaluation within 1 specific scope.
3. `CONFIRMED_IN_SCOPE`: Claim backed by passing evidence across independent transfers matching policy thresholds without contradiction.
4. `CONTRADICTED`: Incompatible evidence exists (Pass in Scope A, Fail in Scope B), but explicit falsification condition has NOT been triggered.
5. `REFUTED`: Empirical evidence satisfied the explicit falsification condition (`falsification_condition == TRUE`).
6. `INCONCLUSIVE`: Execution was partial, corrupted, or insufficient to pass or fail. Absence of evidence is NOT negative evidence.

> **Semantics:** Every `REFUTED` state implies contradiction, but not every `CONTRADICTED` state implies refutation.

---

## 2. The 6-Step Evidence Chain Pipeline

```text
  +---------+     +------------+     +-----------------+     +-------------+     +----------------+     +------------+
  |  CLAIM  | --> | PREDICTION | --> | TEST_DEFINITION | --> | OBSERVATION | --> | EVIDENCE_RECORD| --> | ASSESSMENT |
  +---------+     +------------+     +-----------------+     +-------------+     +----------------+     +------------+
```

### Engine Pipeline Entities:

```typescript
export interface Claim {
  claim_id: string;
  statement: string;
  classification: 
    | 'KNOWN_FACT'
    | 'TRANSFERRED_PRINCIPLE'
    | 'HYPOTHESIS'
    | 'ASSUMPTION'
    | 'UNCERTAINTY'
    | 'REVERSAL_CONDITION';
  target_asset_id?: string;
}

export interface Prediction {
  prediction_id: string;
  claim_id: string;
  testable_assertion: string;
  expected_outcome: string;
  falsification_condition: string; // Explicit condition where falsification_condition == TRUE -> REFUTED
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

export interface EvidenceRecordContainer {
  evidence_id: string;
  project_id: string;
  claims_tested: Claim[];
  predictions: Prediction[];
  observations: ObservationRecord[];
}

export interface EvidenceAssessment {
  assessment_id: string;
  evidence_id: string;
  evaluated_date: string;
  
  // Quality & Sufficiency Breakdown (Pass != Sufficient Evidence)
  evidence_sufficiency_evaluation: {
    test_passed: boolean;
    evidence_quality_score: number; // 0.0 - 1.0
    test_coverage_score: number;    // 0.0 - 1.0
    claim_scope_alignment: boolean;
    falsification_coverage_score: number; // 0.0 - 1.0
    is_sufficient_for_claim: boolean; // Must be true for promotion
  };

  scope_boundaries: {
    project_id: string;
    domain: string;
    environment: string;
    viewport?: string;
  };
  
  claim_assessments: Array<{
    claim_id: string;
    result: 'PASS' | 'FAIL' | 'CONTRADICTED' | 'INCONCLUSIVE';
    resulting_state: 'SUPPORTED_IN_SCOPE' | 'CONFIRMED_IN_SCOPE' | 'REFUTED' | 'CONTRADICTED' | 'INCONCLUSIVE';
    rationale: string;
  }>;
}
```

---

## 3. Evidence Sufficiency & Policy-Based Promotion Thresholds

`CONFIRMED_IN_SCOPE` requires:
$$\text{CONFIRMED\_IN\_SCOPE} = \text{Independent Transfer Evidence} + \text{Prediction Consistency} + \text{Falsification Coverage} + \text{No Contradictions} + \text{Scope Explicitness}$$

The required number of independent project transfers is a **configurable policy parameter** in Governance based on claim risk, not a fixed universal constant.

---

## 4. Contradictory Evidence & Inconclusive Resolution

1. **`INCONCLUSIVE` State:** If execution fails due to infrastructure, missing tools, or partial outputs, the result is marked `INCONCLUSIVE`. It triggers a test re-run without altering knowledge state.
2. **`CONTRADICTED` State:** If Scope A passes and Scope B fails without triggering the explicit `falsification_condition`, state becomes `CONTRADICTED`. System does NOT average results; it triggers Scope Narrowing.
3. **`REFUTED` State:** If `falsification_condition == TRUE`, state becomes `REFUTED`, triggering immediate demotion.
