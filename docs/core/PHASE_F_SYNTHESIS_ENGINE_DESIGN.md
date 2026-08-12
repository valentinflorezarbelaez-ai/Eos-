# PHASE F: EOS CROSS-DOMAIN SYNTHESIS ENGINE DESIGN

* **Phase:** PHASE F — CROSS-DOMAIN SYNTHESIS ENGINE
* **Status:** DESIGN SPECIFIED & FROZEN WITH CONDITIONS
* **Date:** 2026-08-11
* **Scope:** Internal Cross-Domain Synthesis Engine Architecture (`C:\Users\valen\Documents\Eos system`)

---

## 1. Constitutional Synthesis Invariants

> [!CAUTION]
> **1. The Anti-Overgeneralization Invariant:**
> The Synthesis Engine **MUST** possess the explicit capability to **REJECT a candidate generalization**.
>
> If multiple projects exhibit superficial symptom similarities but stem from different underlying root causes or domain contexts, EOS **MUST NOT** manufacture a universal principle.
>
> **2. Reasoning Memory Invariant:**
> Rejected candidates (`GENERALIZATION_REJECTED`) are **NEVER DELETED**. They are preserved permanently as reasoning memory artifacts so EOS does not repeat invalid abstraction attempts when similar symptoms recur in future projects.

```text
  PROJECT OBSERVATIONS (Domain A, B, C)
            │
            v
  EVIDENCE (EVD-XXXX) & TRANSFERS
            │
            v
  CROSS-DOMAIN COMPARISON
            │
            v
  COMMONALITY & DIVERGENCE ANALYSIS
            │
    ┌───────┴───────┐
    ▼               ▼
[REJECT GENERALIZATION]   [PROMOTE TO HYPOTHESIS]
(Preserved as Reasoning    (Outputs GeneralizationCandidate)
 Memory Artifact)
```

---

## 2. The 6-Stage Synthesis Pipeline

1. **Observation Collection:** Aggregates `ObservationRecord` and `EvidenceRecordContainer` artifacts across $\ge 2$ distinct project domains.
2. **Cross-Domain Comparison:** Maps behavioral patterns, input parameters, and failure surfaces across domains.
3. **Commonality & Divergence Analysis:** Identifies shared underlying mechanics vs domain-specific environmental noise.
4. **Synthesis Decision Gate:** Evaluates whether shared mechanics justify abstraction or if contextual differences make generalization invalid.
5. **Generalization Candidate Formulation:** Emits a structured `GeneralizationCandidate` object.
6. **Predictive Hypothesis Formulation:** Formulates falsifiable predictions for future domain transfers.

---

## 3. Generalization Candidate Schema (TypeScript)

```typescript
export type CandidateStatus = 
  | 'PROPOSED'
  | 'GENERALIZATION_REJECTED' // Refused due to divergent root causes; preserved as Reasoning Memory
  | 'PROMOTED_TO_HYPOTHESIS'; // Promoted to UNVERIFIED KnowledgeAsset for future transfer testing

export interface GeneralizationCandidate {
  candidate_id: string; // e.g. SYN-CAND-001
  created_date: string;
  title: string;
  
  // Provenance & Source Domains
  originating_evidences: string[]; // EVD-XXXX references
  domains_involved: string[];     // e.g. ['Hospitality', 'Healthcare', 'B2B SaaS']
  
  // Comparative Structural Analysis
  observed_similarities: string[];
  contextual_differences: string[];
  
  // Causal Reasoning
  causal_hypothesis: string;      // Proposed underlying mechanism
  synthesis_status: CandidateStatus;
  rejection_reason?: string;      // MANDATORY if status = GENERALIZATION_REJECTED
  
  // Predictive Output (Required if status = PROMOTED_TO_HYPOTHESIS)
  predictive_hypothesis?: {
    testable_assertion: string;
    expected_outcome_in_new_domain: string;
    falsification_conditions: string[];
    operating_boundaries: string[];
  };

  confidence_score: number; // 0.0 - 1.0 based on evidence quality and domain variance
}
```

---

## 4. Synthesis Output Enforcement Rule

> [!IMPORTANT]
> **Synthesis Engine Output Rule:**
> The Synthesis Engine **NEVER** promotes a candidate directly to `CONFIRMED_IN_SCOPE` or `SUPPORTED_IN_SCOPE`.
>
> An approved synthesis outputs `synthesis_status = PROMOTED_TO_HYPOTHESIS`. The candidate enters the Knowledge Plane as an `UNVERIFIED` asset of type `HYPOTHESIS`. It becomes confirmed ONLY after a future project executes Level 3 empirical verification and Phase C assesses the evidence.
