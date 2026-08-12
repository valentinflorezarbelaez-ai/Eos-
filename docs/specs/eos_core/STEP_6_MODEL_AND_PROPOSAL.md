# EOS CORE MATURATION: STEP 6 — MODEL & PROPOSAL (DUAL-PATH VALIDATION ENGINE)

* **Step:** STEP 6 — MODEL & PROPOSE
* **Status:** APPROVED WITH CONDITIONS (STEP 6 IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Executable Dual-Path Validation Engine (`src/core/dualValidationEngine.js`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Single Epistemic Authority & Path Independence Invariants

```text
                        EOS DUAL-PATH VALIDATION ENGINE
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
        PATH A: PRODUCT VALIDATION           PATH B: KNOWLEDGE VALIDATION
       (Requisitos funcionales, UX,         (Hipótesis transferida, consistencia
        Browser QA, tests dinámicos)         de predicciones, límites de borde)
                     │                                   │
                     └─────────────────┬─────────────────┘
                                       ▼
                       [Path Independence Proof Contract]
                         (No Mocks Compartidos / No Premisas Circulares)
                                       │
                                       ▼
                       [DualValidationResult (S1..S4)]
                                       │
                                       ▼
                       [Phase C: Evidence Engine] ─── (Sole Epistemic Authority!)
                                       │
                                       ▼
                       [Phase D: Governance Engine] ── (Sole Policy Authority!)
```

1. **The Epistemic Decoupling Invariant:** `DualValidationEngine` **NEVER** mutates epistemic states directly (`REFUTED`, `CONTRADICTED`, `CONFIRMED_IN_SCOPE`). It structures raw validation results, detects divergence (`S2` or `S3`), and emits an un-interpreted evidence payload to `EvidenceEngine` (Phase C).
2. **Path Independence Proof Contract:** Path A and Path B **MUST** prove non-circular independence. If Path A and Path B share a single-point mock, shared test premise, or circular data source:
   $$\text{independence\_verified} = \text{false} \implies \text{status} = \text{INCONCLUSIVE}$$
   No scope promotion or epistemic state change is permitted without verified independence.

---

## 2. Canonical `DualValidationResult` & Independence Schemas

```typescript
export type CombinatorialScenario = 'S1' | 'S2' | 'S3' | 'S4';

export interface IndependenceProof {
  data_source_a: string;
  data_source_b: string;
  has_shared_mock: boolean;
  has_shared_premise: boolean;
  independence_verified: boolean;
  rejection_reason?: string; // MANDATORY if independence_verified === false
}

export interface ProductPathResult {
  status: 'PASS' | 'FAIL';
  passed_invariants: string[];
  failed_invariants: string[];
  raw_logs: string[];
}

export interface KnowledgePathResult {
  hypothesis_asset_id: string;
  status: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
  falsification_triggered: boolean;
  falsification_reason?: string;
  raw_logs: string[];
}

export interface DualValidationResult {
  validation_id: string; // e.g. VAL-2026-001
  timestamp: string;
  project_id: string;
  
  // Independence Contract Check
  independence_proof: IndependenceProof;

  // Dual Pathways
  product_result: ProductPathResult;
  knowledge_result: KnowledgePathResult;

  // Combinatorial Outcome & Divergence Detection
  combinatorial_scenario: CombinatorialScenario;
  divergence_detected: boolean; // TRUE for S2 (PASS/FAIL) and S3 (FAIL/PASS)

  // Un-interpreted Payload to Phase C Evidence Engine
  evidence_payload: {
    evidence_id: string; // EVD-XXXX
    summary: string;
  };

  audit_metadata: {
    created_at: string;
    author: string;
    schema_version: string;
  };
}
```

---

## 3. The 4 Combinatorial Outcomes Matrix & Epistemic Routing

| Scenario | Product Result (Path A) | Knowledge Result (Path B) | Divergence Detected | Payload Routing to Evidence Engine |
| :--- | :---: | :---: | :---: | :--- |
| **`S1`** | **`PASS`** | **`PASS`** | `false` | **Full Success:** Emits payload for `EvidenceEngine` to evaluate `CONFIRMED_IN_SCOPE` promotion. |
| **`S2`** | **`PASS`** | **`FAIL`** | `true` | **Alternative Mechanism / Knowledge Falsification:** Product worked via another mechanic; emits payload for `EvidenceEngine` to evaluate `REFUTED` or `CONTRADICTED`. |
| **`S3`** | **`FAIL`** | **`PASS`** | `true` | **Product Bug / Knowledge Confirmation:** Product failed due to unrelated UI bug; emits payload for `EvidenceEngine` to evaluate hypothesis validity despite product bug. |
| **`S4`** | **`FAIL`** | **`FAIL`** | `false` | **Double Failure:** Both product and technical hypothesis failed. |

---

## 4. System Integration & Decoupled Authority Matrix

```text
  [Product & Knowledge Suites]
               │
               ▼
  [DualValidationEngine] ────> Executes Path A & B, verifies independence, outputs DualValidationResult (S1..S4)
               │
               ▼
   [EvidenceEngine Module] ───> Evaluates payload sufficiency & assigns Epistemic State (CONFIRMED / REFUTED)
               │
               ▼
  [GovernanceEngine Module] ──> Checks policy risk & authorizes scope transfer (ALLOW / REQUIRE_SCOPE_NARROWING)
               │
               ▼
      [ADR Engine Module] ────> Renders machine-readable decision record (docs/architecture/adrs/*.json)
```

| Action | DualValidationEngine | EvidenceEngine | GovernanceEngine | ADREngine |
| :--- | :---: | :---: | :---: | :---: |
| **Verify Path Independence** | ✅ | ❌ | ❌ | ❌ |
| **Detect Path Divergence (S2/S3)** | ✅ | ❌ | ❌ | ❌ |
| **Assign Epistemic State** | ❌ | ✅ | ❌ | ❌ |
| **Evaluate Evidence Sufficiency** | ❌ | ✅ | ❌ | ❌ |
| **Authorize Scope Transfer** | ❌ | ❌ | ✅ | ❌ |
| **Render Architecture Decision** | ❌ | ❌ | ❌ | ✅ |

---

## 5. Conceptual API for `src/core/dualValidationEngine.js`

```javascript
export class DualValidationEngine {
  /** Verifies that Path A and Path B operate over non-circular, un-mocked independent data */
  verifyPathIndependence(sourceA, sourceB, sharedMocks, sharedPremises) {}

  /** Executes dynamic validation across Path A (Product) and Path B (Knowledge) */
  executeDualValidation(productSuite, knowledgeSuite, independenceProof) {}

  /** Determines combinatorial scenario (S1..S4) and sets divergence_detected */
  classifyValidationOutcome(productStatus, knowledgeStatus) {}

  /** Exports un-interpreted evidence payload to EvidenceEngine */
  exportEvidencePayload(validationResult) {}
}
```

---

## 6. Negative & Boundary Test Cases for Level 3 Implementation

1. **`SHARED_MOCK_CIRCULAR_DEPENDENCY`:** Path A and Path B sharing a single-point mock or premise -> Must set `independence_verified = false` and yield `status = INCONCLUSIVE`.
2. **`INDEPENDENT_SOURCES_VERIFIED`:** Path A (Source A) + Path B (Source B un-mocked) -> Sets `independence_verified = true` and yields valid S1/S2/S3/S4 scenario.
3. **`DUAL_VALIDATION_EPISTEMIC_MUTATION_GUARD`:** Attempting to force `DualValidationEngine` to assign `REFUTED` or `CONFIRMED_IN_SCOPE` directly -> Must throw `AUTHORITY_VIOLATION` error.
4. **`SCENARIO_S2_DIVERGENCE_DETECTION`:** Product `PASS` + Knowledge `FAIL` -> Must set `combinatorial_scenario = 'S2'` and `divergence_detected = true`.
5. **`SCENARIO_S3_DIVERGENCE_DETECTION`:** Product `FAIL` + Knowledge `PASS` -> Must set `combinatorial_scenario = 'S3'` and `divergence_detected = true`.
6. **`MISSING_PATH_RESULT`:** Validation suite executed without Path B -> Must fail schema validation.
7. **`INCONCLUSIVE_PATH_PREVENTS_PROMOTION`:** Path B returning `INCONCLUSIVE` -> Must yield `combinatorial_scenario = 'S4'` or `INCONCLUSIVE` payload to halt promotion.
8. **`DUAL_VALIDATION_GOVERNANCE_LEAK_GUARD`:** Attempting to force `DualValidationEngine` to issue a Governance Policy Action (`ALLOW`, `BLOCK`) -> Must throw `AUTHORITY_VIOLATION` error.
