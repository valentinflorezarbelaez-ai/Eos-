# EOS CORE MATURATION: STEP 4 — MODEL & PROPOSAL (MACHINE-READABLE ADR GENERATOR & PARSER)

* **Step:** STEP 4 — MODEL & PROPOSE
* **Status:** APPROVED WITH CONDITIONS (STEP 4 IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Executable ADR Engine (`src/core/adrEngine.js`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Single Source of Truth & Unidirectional Render Flow

```text
  ONE-WAY MIGRATION ADAPTER (Historical Legacy Ingestion):
  [Legacy Markdown ADR (ADR-0001..0005)] ───> [Zero-Fiction Parser] ───> [Canonical JSON Container]

  NORMAL SYSTEM OPERATION (Unidirectional Flow):
  [Canonical Machine-Readable JSON (docs/architecture/adrs/*.json)]
                         │
                         │ SINGLE SOURCE OF TRUTH
                         ▼
           [ADREngine Deterministic Renderer]
                         │
                         │ DERIVED VIEW (BYTE-FOR-BYTE DETERMINISTIC)
                         ▼
  [Derived Human-Readable Markdown (docs/architecture/adrs/*.md)]
```

1. **Canonical JSON Container is the Single Source of Truth.** Markdown is strictly a derived human view.
2. **Deterministic Render Verification:** Testing verifies `Same Canonical JSON -> Deterministic Renderer -> Same Derived Markdown (Byte-for-Byte Identical)`.
3. **`evidence_ref != evidence_certifies_truth`:** An ADR references evidence to maintain proveniencia traceability; it **NEVER** fabricates epistemic truth. It consumes epistemic assessments evaluated by `EvidenceEngine` and governed by `GovernanceEngine`.

---

## 2. Canonical `MachineReadableADR` Schema

```typescript
export type ADRStatus =
  | 'DRAFT'
  | 'PROPOSED'
  | 'GOVERNANCE_REVIEW'
  | 'ACCEPTED'         // Best justified decision for tested scope
  | 'IMPLEMENTED'
  | 'VALIDATED'
  | 'REVIEW_REQUIRED'  // Falsification condition met or evidence degraded
  | 'REVERSED'
  | 'RETIRED';

export interface ArchitectureOption {
  option_id: string;
  name: string;
  description: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  operational_cost: 'NEGLIGIBLE' | 'LOW' | 'MODERATE' | 'HIGH';
  failure_surface: string;
  is_selected: boolean;
  rejection_rationale?: string; // MANDATORY if is_selected === false
}

export interface EvidenceReference {
  evidence_id: string; // EVD-XXXX
  supports_claim: string;
  unverified_hypothesis_portion: string;
}

export interface MachineReadableADR {
  // Identity & Status
  id: string; // e.g. ADR-0005
  title: string;
  project_id: string;
  date: string;
  status: ADRStatus;
  
  // Context & Rationale (WHY & WHAT)
  why: {
    business_goal: string;
    technical_motivation: string;
    requirements_refs: string[];
    constraints: string[];
  };

  what: {
    selected_option_id: string;
    architecture_description: string;
  };

  // Comparative Options & Rejection Memory
  options_evaluated: ArchitectureOption[];

  // Epistemic Classification & Provenance Mappings
  epistemic_classification: {
    KNOWN_FACT: string[];
    TRANSFERRED_PRINCIPLE: string[];
    HYPOTHESIS: string[];
    ASSUMPTION: string[];
    UNCERTAINTY: string[];
    REVERSAL_CONDITION: string[];
  };

  knowledge_asset_refs: string[];
  evidence_references: EvidenceReference[];
  governance_state: {
    governance_check_id?: string;
    governance_effect: 'ALLOW' | 'BLOCK' | 'REQUIRE_SCOPE_NARROWING' | 'REQUIRE_HUMAN_APPROVAL';
    checked_at?: string;
  };

  scope_boundaries: Record<string, string>;
  reversal_conditions: string[];
  missing_information?: string[];

  audit_metadata: {
    created_at: string;
    updated_at: string;
    author: string;
    schema_version: string;
  };
}
```

---

## 3. Explicit 9-State ADR Lifecycle State Machine

```text
  [DRAFT]
    │
    ▼
  [PROPOSED]
    │
    ▼
  [GOVERNANCE_REVIEW] ──┬──> (Blocked) ──> [REJECTED]
    │                   │
    │                   └──> (Scope Exceeded) ──> [REQUIRE_SCOPE_NARROWING]
    ▼
  [ACCEPTED]
    │
    ▼
  [IMPLEMENTED]
    │
    ▼
  [VALIDATED] ─────── (Falsification Triggered / Evidence Refuted)
    │
    ▼
  [REVIEW_REQUIRED] ──┬──> [REVERSED]
                      │
                      └──> [RETIRED]
```

---

## 4. System Authority Matrix

| Action | ADREngine | EvidenceEngine | GovernanceEngine | Product Owner |
| :--- | :---: | :---: | :---: | :---: |
| **Create DRAFT ADR** | ✅ | ❌ | ❌ | ✅ |
| **Ingest Raw Observations** | ❌ | ✅ | ❌ | ❌ |
| **Evaluate Epistemic Verdict** | ❌ | ✅ | ❌ | ❌ |
| **Authorize `ACCEPTED` Status** | ❌ | ❌ | ✅ | ❌ |
| **Enforce Scope Narrowing** | ❌ | ❌ | ✅ | ❌ |
| **Modify `CONSTITUTION.md`** | ❌ | ❌ | ❌ | ✅ (**SOLE AUTHORITY**) |
| **Modify `POLICY_ENGINE.json`** | ❌ | ❌ | ❌ | ✅ (**SOLE AUTHORITY**) |

---

## 5. Provenance Contract (6-Level DAG Traversal)

$$\text{ADR} \longrightarrow \text{Decision} \longrightarrow \text{KnowledgeAsset} \longrightarrow \text{EvidenceReference} \longrightarrow \text{EvidenceRecord} \longrightarrow \text{Observation}$$

- **Zero-Fiction Rule:** Legacy Markdown files missing explicit trade-offs (`options_evaluated`) or evidence references map missing fields as `UNSET` / `UNKNOWN` without inventing historical rationale.

---

## 6. Conceptual API for `src/core/adrEngine.js`

```javascript
export class ADREngine {
  /** Ingests legacy Markdown ADR (ADR-0001..0005) into canonical JSON container without fiction */
  parseLegacyMarkdownADR(markdownText, id) {}

  /** Deterministically renders canonical MachineReadableADR JSON into derived Markdown */
  renderADRToMarkdown(adrJson) {}

  /** Validates canonical MachineReadableADR JSON against zero-dependency schema */
  validateADRSchema(data) {}

  /** Submits candidate ADR to GovernanceEngine for checkADRRecommendation */
  async submitADRForGovernanceReview(adrJson, governanceEngine) {}
}
```

---

## 7. Negative & Boundary Test Cases for Level 3 Implementation

1. **`ADR_REFUTED_ASSET_REFERENCE`:** Candidate ADR recommending a `REFUTED` asset -> Must be intercepted by Governance and rejected (`is_approved = false`, `effect = 'BLOCK'`).
2. **`ADR_CONTRADICTED_WITHOUT_NARROWING`:** Candidate ADR referencing a `CONTRADICTED` asset without scope narrowing -> Must return `effect = 'REQUIRE_SCOPE_NARROWING'`.
3. **`ADR_WITHOUT_EVIDENCE`:** Candidate ADR claiming `KNOWN_FACT` without `evidence_references` -> Must block `ACCEPTED` state.
4. **`ADR_MISSING_PREDICTION`:** Candidate ADR referencing evidence lacking explicit predictions -> Must block `CONFIRMED` scope promotion.
5. **`ADR_NONEXISTENT_EVD_REF`:** Candidate ADR referencing non-existent `EVD-9999` -> Must fail validation.
6. **`ADR_EVIDENCE_DEGRADED`:** Previously `ACCEPTED` ADR whose evidence asset becomes `REFUTED` -> Must transition to `REVIEW_REQUIRED`.
7. **`ADR_SELF_GOVERNANCE_MUTATION`:** Candidate ADR attempting to alter its own `governance_state` directly -> Must throw `AUTHORITY_VIOLATION`.
8. **`ADR_POLICY_MUTATION_ATTEMPT`:** Candidate ADR attempting to mutate `POLICY_ENGINE.json` -> Must throw `AUTHORITY_VIOLATION`.
9. **`DETERMINISTIC_MARKDOWN_RENDER_TEST`:** Rendering derived Markdown twice from identical JSON -> Must yield byte-for-byte identical text.
10. **`INVALID_ADR_SCHEMA`:** Candidate ADR missing required fields (`id`, `title`, `options_evaluated`) -> Must fail validation.
11. **`FORBIDDEN_STATE_TRANSITION`:** Attempting direct transition from `DRAFT` to `VALIDATED` without `GOVERNANCE_REVIEW` -> Must fail.
12. **`POST_ACCEPTANCE_REVERSAL_TRIGGER`:** Execution satisfying explicit `reversal_conditions` -> Must transition ADR from `ACCEPTED` to `REVIEW_REQUIRED` then `REVERSED` or `RETIRED`.
