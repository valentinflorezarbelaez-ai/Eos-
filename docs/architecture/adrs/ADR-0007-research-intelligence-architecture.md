# ADR-0007: RESEARCH & INTELLIGENCE ENGINE EPISTEMIC ARCHITECTURE

* **Status:** PROPOSED FOR LEVEL 2 REVIEW (PENDING PO LEVEL 3 IMPLEMENTATION AUTHORIZATION)
* **Project ID:** `PRJ-RESEARCH-INTEL`
* **Date:** 2026-08-11
* **Author:** EOS Autonomous Architectural Engine
* **Target Workspace:** `C:\Users\valen\Documents\Research-Intelligence-Engine`
* **Epistemic Classification:** `TRANSFERRED_PRINCIPLE` / `HYPOTHESIS`

---

## 1. Intent & Technical Motivation
Define a multi-source, open-world research architecture for `PRJ-RESEARCH-INTEL` that enforces strict separation between raw data payloads and agent instructions (`WEB_CONTENT != INSTRUCTIONS`), extracts atomic propositional claims with complete provenance, resolves contradictions deterministically, and emits non-resolution verdicts (`INSUFFICIENT_EVIDENCE`, `CONTRADICTED`, `UNRESOLVED`) when evidence is incomplete or conflicting.

---

## 2. Options Evaluated

### Option 1: Epistemic Pipeline with ClaimModel, Source Trust Scoring & Prompt Injection Boundary [SELECTED]
- **Description:** Structure open-world research into a 7-stage pipeline (`SOURCE -> DOCUMENT -> CLAIM -> EVIDENCE -> ASSESSMENT -> SYNTHESIS -> CONCLUSION`). Neutralize retrieved text directives at the boundary, score publisher trust, detect date drift, and link claims to verifiable snippets.
- **Complexity:** `HIGH`
- **Operational Cost:** Governed by search API limits and budget interlocks.
- **Failure Surface:** Bounded to extraction and synthesis stages; hallucinated citations are blocked by SHA-256 snippet matching.
- **Selection Rationale:** Prevents prompt injection attacks, eliminates hallucinated citations, handles source contradictions gracefully, and adheres to EOS truth preservation invariants.

### Option 2: Direct Search Summarizer (Web Page == Truth) [REJECTED]
- **Description:** Feeding raw web search results directly into a generative LLM prompt to produce a summarized answer without claim extraction or trust scoring.
- **Complexity:** `LOW`
- **Operational Cost:** Low initial overhead.
- **Failure Surface:** Extremely vulnerable to prompt injection, source poisoning, citation laundering, and hallucinated conclusions.
- **Rejection Rationale:** Violates core EOS epistemic principles (`Truth Over Claims`), allows un-sanitized prompt injections to hijack agent control flow, and fails to detect false consensus or date drift.

---

## 3. Machine-Readable ADR Payload (JSON Source of Truth)

```json
{
  "$schema": "../schema.json",
  "id": "ADR-0007",
  "title": "Research & Intelligence Engine Epistemic Architecture",
  "project_id": "PRJ-RESEARCH-INTEL",
  "date": "2026-08-11",
  "status": "PROPOSED",
  "why": {
    "business_goal": "Enable open-world research and deep multi-source synthesis without prompt injection risks or hallucinated citations",
    "technical_motivation": "Enforce strict separation between retrieved web content and agent instructions while preserving evidence provenance",
    "requirements_refs": ["SPEC-0003:REQ-2.1", "SPEC-0003:REQ-3.1"],
    "constraints": ["LEVEL_1_READ_ONLY discovery complete; Level 3 PO authorization required for execution"]
  },
  "what": {
    "selected_option_id": "OPT-01-EPISTEMIC-PIPELINE",
    "architecture_description": "7-stage epistemic extraction pipeline with ClaimModel, ContradictionResolutionEngine, and InferenceBoundaryFilter"
  },
  "options_evaluated": [
    {
      "option_id": "OPT-01-EPISTEMIC-PIPELINE",
      "name": "Epistemic Extraction Pipeline",
      "description": "Source trust scoring, claim extraction, prompt injection filtering, and non-resolution output handling",
      "complexity": "HIGH",
      "operational_cost": "GOVERNED",
      "failure_surface": "Bounded to extraction adapters",
      "is_selected": true
    },
    {
      "option_id": "OPT-02-DIRECT-SEARCH-SUMMARIZER",
      "name": "Direct Search Summarizer",
      "description": "Directly summarizing web search payloads without claim extraction or trust scoring",
      "complexity": "LOW",
      "operational_cost": "LOW",
      "failure_surface": "High risk of prompt injection and hallucinated citations",
      "is_selected": false,
      "rejection_rationale": "Violates core EOS truth-over-claims principles and introduces prompt injection vulnerability"
    }
  ],
  "epistemic_classification": {
    "KNOWN_FACT": ["Project #3 tests open-world research and contradiction resolution"],
    "TRANSFERRED_PRINCIPLE": ["SYS-PRN-001: Boundary Contracts", "EVD-0036: Workspace Isolation"],
    "HYPOTHESIS": ["7-stage epistemic pipeline prevents hallucinated citations and retrieved prompt injections"],
    "ASSUMPTION": ["Search retrieval adapters provide raw document payloads with publisher metadata"],
    "UNCERTAINTY": ["Web search provider latency and rate limits"],
    "REVERSAL_CONDITION": ["Prompt injection leak > 0% forces parser boundary reversal"]
  },
  "knowledge_asset_refs": ["KNO-SYS-PRN-001", "KNO-LSN-LUXE-001", "KNO-LSN-MC-001", "KNO-LSN-MC-002"],
  "evidence_references": [
    {
      "evidence_id": "EVD-0036",
      "supports_claim": "Workspace isolation prevents target project artifacts from polluting EOS Core",
      "unverified_hypothesis_portion": "Contradiction resolution accuracy"
    }
  ],
  "governance_state": {
    "governance_effect": "PENDING_LEVEL_2_REVIEW"
  },
  "scope_boundaries": {
    "project_id": "PRJ-RESEARCH-INTEL"
  },
  "reversal_conditions": [
    "REVERSAL_CONDITION-01: IF prompt injection leak > 0%, reverse parser boundary for immediate hardening.",
    "REVERSAL_CONDITION-02: IF fabricated citations > 0, reverse synthesis generator to strict verbatim snippet matching."
  ],
  "audit_metadata": {
    "created_at": "2026-08-11T23:37:00Z",
    "updated_at": "2026-08-11T23:37:00Z",
    "author": "EOS Autonomous Architectural Engine",
    "schema_version": "1.0.0"
  }
}
```
