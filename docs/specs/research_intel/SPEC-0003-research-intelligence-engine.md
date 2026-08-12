# SPEC-0003: RESEARCH & INTELLIGENCE ENGINE EPISTEMIC SPECIFICATION

* **Status:** PROPOSED FOR LEVEL 2 REVIEW (PENDING PO LEVEL 3 IMPLEMENTATION AUTHORIZATION)
* **Project ID:** `PRJ-RESEARCH-INTEL`
* **Phase II Role:** PROJECT #3 (OPEN-WORLD RESEARCH, EPISTEMOLOGY & DEEP SYNTHESIS)
* **Date:** 2026-08-11
* **Author:** EOS Autonomous Architectural Engine
* **Target Workspace:** `C:\Users\valen\Documents\Research-Intelligence-Engine`
* **Epistemic Verdict:** `TRANSFERRED_PRINCIPLE` / `HYPOTHESIS`

---

## 1. Executive Summary & Intent
`PRJ-RESEARCH-INTEL` is an open-world research, multi-source synthesis, contradiction resolution, and evidence-backed claim verification system. It enables EOS Core to explore open-ended research questions, extract atomic propositional claims, evaluate source credibility, detect temporal drift and contradictions, and emit evidence-backed conclusions whose strength never exceeds available empirical evidence.

---

## 2. Fundamental Epistemic Invariants

> **Invariant 1 (`WEB_CONTENT != EOS_INSTRUCTIONS`):** Retrieved web content, PDFs, and external documents are treated strictly as **Data Payloads**, NEVER as executable agent instructions. Any embedded prompt directives MUST be neutralized at the parser boundary.

> **Invariant 2 (Non-Resolution Truth Preservation):** If available evidence is conflicting, incomplete, or un-corroborated, the system MUST emit `INSUFFICIENT_EVIDENCE`, `CONTRADICTED`, or `UNRESOLVED`. Fabricating plausible answers to fill information gaps is **STRICTLY FORBIDDEN**.

---

## 3. Epistemic Pipeline Architecture

```text
SOURCE DISCOVERY & ACQUISITION
               │
               ▼
[DOCUMENT NORMALIZATION & PROMPT INJECTION FILTER]
 (Enforces WEB_CONTENT != INSTRUCTIONS)
               │
               ▼
   [ATOMIC CLAIM EXTRACTION] ──> Schema: ClaimModel
               │
               ▼
    [SOURCE & CLAIM ASSESSMENT] ──> Source Trust & Methodological Scoring
               │
               ▼
  [CONTRADICTION & TEMPORAL ENGINE] ──> Maps Date Drift & Incompatible Assertions
               │
               ▼
      [PROVENANCE GRAPH] ──> SOURCE -> DOC -> CLAIM -> EVD -> ASSESS -> SYNTH -> CONCL
               │
               ▼
   [INFERENCE BOUNDARY FILTER] ──> Tags OBSERVED / INFERRED / SYNTHESIZED / SPECULATION
               │
               ▼
   [EVIDENCE ENGINE & KNOWLEDGE PLANE INGESTION]
```

---

## 4. Canonical `ClaimModel` Schema

```typescript
export interface ClaimModel {
  claim_id: string; // e.g. "CLM-RI-2026-001"
  propositional_statement: string; // Atomic assertion
  source_metadata: {
    source_url: string;
    publisher: string;
    publication_date: string;
    is_primary_source: boolean;
    source_trust_score: number; // 0.0 - 1.0
  };
  document_hash: string; // SHA-256 of raw retrieved document
  extraction_provenance: {
    extracted_at: string;
    extractor_adapter: string;
    exact_quoted_snippet: string;
  };
  epistemic_classification: 'OBSERVED' | 'INFERRED' | 'SYNTHESIZED' | 'SPECULATION' | 'UNKNOWN';
  temporal_validity: {
    effective_date: string;
    is_deprecated: boolean;
    superseded_by_claim_id?: string;
  };
  supporting_evidence_refs: string[];
  contradictory_claim_refs: string[];
  unsupported_inference_flags: string[];
}
```

---

## 5. Contradiction Resolution Taxonomy (`ContradictionResolutionEngine`)

When two claims $C_1$ and $C_2$ yield conflicting conclusions, the engine classifies the contradiction into one of 7 canonical states:

```text
                        CONTRADICTION CLASSIFICATION
                                     │
   ┌──────────┬──────────┬───────────┼───────────┬──────────┬──────────┐
   ▼          ▼          ▼           ▼           ▼          ▼          ▼
[DIRECT    [OUTDATED  [DIFFERENT  [DIFFERENT  [DIFFERENT [PRIMARY/  [UNRESOLVED]
 CONTRAD.]  DATE]      SCOPE]      DEFINITIONS] MEASURE]   SECONDARY]
```

1. **`DIRECT_CONTRADICTION`**: Two authoritative sources make incompatible assertions on identical scope. Result: `CONTRADICTED`.
2. **`OUTDATED_INFORMATION`**: $C_1$ ($2020$) is superseded by $C_2$ ($2026$). Result: $C_1$ tagged `DEPRECATED`.
3. **`DIFFERENT_SCOPE`**: $C_1$ applies to Region A; $C_2$ applies to Region B. Result: Scope narrowed.
4. **`DIFFERENT_DEFINITIONS`**: $C_1$ and $C_2$ use divergent metric definitions. Result: Definition gap logged.
5. **`DIFFERENT_MEASUREMENTS`**: Divergent methodology yields different numerical results. Result: Methodology variance logged.
6. **`PRIMARY_VS_SECONDARY`**: Primary research paper contradicts secondary media summary. Result: Primary source preferred; secondary tagged `CITATION_LAUNDERED`.
7. **`UNRESOLVED`**: Insufficient evidence to determine root cause. Result: `UNRESOLVED`.

---

## 6. Threat Modeling: 12 Research Vulnerability Vectors

| Vulnerability Vector | Attack Description | EOS Intercept & Defense Strategy |
| :--- | :--- | :--- |
| **1. Retrieved Prompt Injection** | HTML/text contains hidden instructions targeting agent | Treat retrieved body strictly as string data; strip executable tokens |
| **2. Source Poisoning** | Malicious site publishes false claims to manipulate output | Require multi-publisher corroboration ($N \ge 2$) before claim promotion |
| **3. Fake Consensus** | 10 sites copy 1 false blog post | Provenance graph traces primary origin; collapse redundant echo-chambers |
| **4. Citation Laundering** | Secondary source distorts primary paper claims | Verify primary source snippet directly against secondary claims |
| **5. Malicious Documents / PDFs** | Buffer overflow or script payload in PDF | Parse via sandboxed plain-text extraction adapter |
| **6. Poisoned Search Results** | SEO manipulation elevating untrusted sites | Source trust scoring penalizes low-authority domains |
| **7. Conflicting Primaries** | Two peer-reviewed papers reach opposite conclusions | Emit `CONTRADICTED` with explicit multi-source evidence links |
| **8. Outdated Sources** | Stale 2015 data presented as current truth | Enforce temporal decay checking on publication dates |
| **9. Hidden Instructions** | White-on-white text in web page containing agent prompts | Structural DOM parser strips hidden/invisible CSS elements |
| **10. Fabricated Citations** | LLM hallucinating paper titles or DOIs | Verify DOI / URL existence and SHA-256 hash before citing |
| **11. Unsupported Synthesis** | Synthesizing conclusion exceeding evidence boundary | Inference boundary filter downgrades assertion to `SPECULATION` |
| **12. Evidence Laundering** | Presenting un-verified speculation as evidence | Epistemic guard blocks `SPECULATION` from becoming evidence |

---

## 7. Reversal Conditions
- **`REVERSAL_CONDITION-01`:** IF a retrieval adapter fails to strip prompt injection directives in $> 0\%$ of benchmark cases, the parser **MUST BE REVERSED** for immediate hardening.
- **`REVERSAL_CONDITION-02`:** IF synthesized conclusions produce fabricated citations, the synthesis generator **MUST BE REVERSED** to strict verbatim snippet matching.
