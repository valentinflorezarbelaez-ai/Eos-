# EOS CORE MATURATION: STEP 5 — MODEL & PROPOSAL (CROSS-DOMAIN SYNTHESIS ENGINE)

* **Step:** STEP 5 — MODEL & PROPOSE
* **Status:** APPROVED WITH CONDITIONS (STEP 5 IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Executable Synthesis Engine (`src/core/synthesisEngine.js`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Constitutional Anti-Overgeneralization & Authority Invariants

```text
  [Project Domain A Evidence (Andes)] + [Project Domain B Evidence (Sonrisa)]
                                  │
                                  ▼
                      [Cross-Domain Synthesis Engine]
                                  │
      ┌───────────────────────────┴───────────────────────────┐
      ▼                                                       ▼
  [GENERALIZATION_REJECTED]                       [PROMOTED_TO_HYPOTHESIS]
  (Preserved as Reasoning                         (Ingested into Knowledge Plane as
   Memory Artifact in Git)                         UNVERIFIED Asset of type HYPOTHESIS)
                                                              │
                                                              ▼
                                                   [Level 3 Empirical Testing]
                                                              │
                                                              ▼
                                                   [EvidenceEngine EVD-XXXX]
                                                              │
                                                              ▼
                                                   [GovernanceEngine Policy Gate]
```

1. **Anti-Overgeneralization Invariant:** Combining single-scope evidence from Domain A and Domain B **NEVER** yields direct `CONFIRMED_IN_SCOPE` or `UNIVERSALLY_TRUE` status.
   $$\text{SUPPORTED\_IN\_SCOPE(A)} + \text{SUPPORTED\_IN\_SCOPE(B)} \neq \text{UNIVERSALLY\_TRUE}$$
2. **Output Rule:** An approved synthesis outputs `synthesis_status = PROMOTED_TO_HYPOTHESIS`. The candidate enters the Knowledge Plane strictly as an **`UNVERIFIED`** asset of type `HYPOTHESIS`. It can reach `CONFIRMED_IN_SCOPE` ONLY after Level 3 empirical testing in a new domain generates passing `EVD-XXXX` evidence.
3. **Reasoning Memory Preservation:** Candidates rejected due to divergent root causes (`GENERALIZATION_REJECTED`) are **NEVER DELETED**. They are preserved as Git JSON reasoning memory artifacts so EOS does not repeat invalid abstractions when similar symptoms recur.

---

## 2. Canonical `GeneralizationCandidate` & Synthesis Schemas

```typescript
export type CandidateSynthesisStatus = 
  | 'PROPOSED'
  | 'GENERALIZATION_REJECTED' // Refused due to divergent root causes; preserved as Reasoning Memory
  | 'PROMOTED_TO_HYPOTHESIS'; // Promoted to UNVERIFIED KnowledgeAsset for future transfer testing

export interface PredictiveHypothesis {
  testable_assertion: string;
  expected_outcome_in_new_domain: string;
  falsification_conditions: string[];
  operating_boundaries: string[];
}

export interface GeneralizationCandidate {
  candidate_id: string; // e.g. SYN-CAND-001
  created_date: string;
  title: string;
  
  // Provenance & Source Domains
  originating_evidences: string[]; // EVD-XXXX references
  domains_involved: string[];     // e.g. ['Hospitality', 'Healthcare', 'B2B SaaS']
  parent_asset_ids: string[];     // e.g. ['LSN-001', 'LSN-002']

  // Structural Causal Mechanism Analysis (Not Keyword Matching!)
  observed_similarities: string[];
  contextual_differences: string[];
  underlying_causal_mechanism: string;
  
  synthesis_status: CandidateSynthesisStatus;
  rejection_reason?: string; // MANDATORY if synthesis_status === GENERALIZATION_REJECTED

  // Predictive Output for Future Level 3 Testing
  predictive_hypothesis?: PredictiveHypothesis;

  missing_information?: string[];
  audit_metadata: {
    created_at: string;
    author: string;
    schema_version: string;
  };
}
```

---

## 3. Structural Causal Comparison vs. False Causal Similarity

```text
  FALSE CAUSAL SIMILARITY (REJECTED):
  Domain A: Hospital Patient Queue ("waiting list")
  Domain B: Restaurant Table Reservation ("waiting list")
  Symptom: Both share surface vocabulary & UI text ("waiting list")
  Root Cause A: Triage priority & medical emergency overrides
  Root Cause B: First-come first-served table allocation
  Result: REJECT GENERALIZATION (synthesis_status = GENERALIZATION_REJECTED)

  VALID STRUCTURAL TRANSFER (PROMOTED):
  Domain A: Andes Mobile Navigation (< 640px viewport overflow)
  Domain B: Sonrisa Mobile Form (< 640px viewport overflow)
  Symptom: Touch targets clipped & horizontal scrolling < 375px
  Root Cause: Data density layout failing to collapse into cards below breakpoint
  Result: PROMOTE TO HYPOTHESIS (UNVERIFIED KnowledgeAsset SYS-PRN-001)
```

---

## 4. System Integration & Decoupled Authority Matrix

```text
  [Knowledge Plane / Evidence Inputs]
                │
                ▼
   [Synthesis Engine Module] ──────> Formulates GeneralizationCandidate (status: PROMOTED_TO_HYPOTHESIS, state: UNVERIFIED)
                │
                ▼
    [Evidence Engine Module] ──────> Evaluates empirical Level 3 test results (EVD-XXXX)
                │
                ▼
   [Governance Engine Module] ─────> Checks policy risk & authorizes scope transfer (ALLOW / REQUIRE_SCOPE_NARROWING)
                │
                ▼
       [ADR Engine Module] ────────> Renders machine-readable decision record (docs/architecture/adrs/*.json)
```

| Action | SynthesisEngine | EvidenceEngine | GovernanceEngine | ADREngine |
| :--- | :---: | :---: | :---: | :---: |
| **Formulate Candidate Hypothesis** | ✅ | ❌ | ❌ | ❌ |
| **Reject Invalid Abstraction** | ✅ | ❌ | ❌ | ❌ |
| **Evaluate Level 3 Evidence** | ❌ | ✅ | ❌ | ❌ |
| **Assign Epistemic State** | ❌ | ✅ | ❌ | ❌ |
| **Authorize Scope Transfer** | ❌ | ❌ | ✅ | ❌ |
| **Render Architecture Decision** | ❌ | ❌ | ❌ | ✅ |

---

## 5. Conceptual API for `src/core/synthesisEngine.js`

```javascript
export class SynthesisEngine {
  /** Ingests EvidenceRecordContainers and KnowledgeAssets across >= 2 domains */
  ingestDomainEvidence(evidences, assets) {}

  /** Analyzes underlying causal mechanisms and detects structural differences */
  compareStructuralMechanics(domainAEvidence, domainBEvidence) {}

  /** Formulates a GeneralizationCandidate object */
  synthesizeCandidate(title, domainA, domainB, mechanism, similarities, differences) {}

  /** Rejects an invalid abstraction and preserves it as a Reasoning Memory Artifact */
  rejectGeneralization(candidate, rejectionReason) {}

  /** Promotes a candidate to an UNVERIFIED KnowledgeAsset of type HYPOTHESIS */
  exportToKnowledgePlaneHypothesis(candidate) {}
}
```

---

## 6. Negative & Boundary Test Cases for Level 3 Implementation

1. **`REJECT_SUPERFICIAL_ANALOGY`:** Inputting Domain A and Domain B evidence with surface keyword matches but divergent root causes -> Must set `synthesis_status = GENERALIZATION_REJECTED` and store `rejection_reason`.
2. **`FALSE_CAUSAL_SIMILARITY`:** Inputting Domain A (Patient Queue) and Domain B (Table Reservation) sharing UI text but different causal mechanisms -> Must set `synthesis_status = GENERALIZATION_REJECTED` and preserve in Reasoning Memory.
3. **`BLOCK_DIRECT_CONFIRMED_PROMOTION`:** Candidate synthesis attempting to output `CONFIRMED_IN_SCOPE` directly -> Must throw `AUTHORITY_VIOLATION` error.
4. **`SINGLE_DOMAIN_SYNTHESIS_REJECTED`:** Attempting cross-domain synthesis with evidence from only 1 domain -> Must fail with `INSUFFICIENT_DOMAINS_FOR_SYNTHESIS`.
5. **`MISSING_PREDICTIVE_HYPOTHESIS`:** Promoted candidate lacking `predictive_hypothesis` -> Must fail schema validation.
6. **`REASONING_MEMORY_PRESERVATION`:** Verifies that rejected generalizations are persisted to disk and NOT discarded or deleted.
7. **`CONTRADICTION_DETECTION`:** Synthesizing Domain A (PASS) and Domain B (FAIL) under identical assertions -> Must mark `contradiction_detected = true` and narrow operating boundaries.
8. **`SYNTHESIS_GOVERNANCE_LEAK_GUARD`:** Attempting to force `SynthesisEngine` to issue a Governance Policy Action (`ALLOW`, `BLOCK`) -> Must throw `AUTHORITY_VIOLATION` error.
