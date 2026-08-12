# PHASE E: EOS DECISION ENGINE & MACHINE-READABLE ADRS DESIGN

* **Phase:** PHASE E — DECISION ENGINE DESIGN
* **Status:** DESIGN SPECIFIED & FROZEN WITH CONDITIONS
* **Date:** 2026-08-11
* **Scope:** Internal Decision Engine & Machine-Readable ADR Architecture (`C:\Users\valen\Documents\Eos system`)

---

## 1. Core Decoupling Invariants

> [!CAUTION]
> **1. The ADR Decoupling Invariant:**
> An Architecture Decision Record (ADR) is a contextual, project-specific decision; **it does NOT automatically constitute Global Knowledge.**
>
> **2. The Contextual Acceptance Invariant:**
> `ADR = ACCEPTED` does NOT mean "Architecture is objectively correct forever". It means *"Best justified contextual decision given current requirements, constraints, evidence, knowledge, and uncertainties."*
>
> **3. Reasoning Memory Invariant:**
> Discarded options (`options_evaluated`) are NEVER lost. Rejection rationales are preserved permanently so future evidence can re-evaluate previously rejected options.

---

## 2. The 6-Step Decision Engine Pipeline

```text
  +---------+     +-------------------+     +--------------------+     +------------------+     +-------------------+     +----------------------+
  | INPUTS  | --> | GOVERNANCE_FILTER | --> | TRADE_OFF_ANALYSIS | --> | OPTION_SELECTION | --> | 6_CAT_BREAKDOWN   | --> | MACHINE_READABLE_ADR |
  +---------+     +-------------------+     +--------------------+     +------------------+     +-------------------+     +----------------------+
```

---

## 3. Machine-Readable ADR Schema (JSON / TypeScript)

```typescript
export type ADRStatus = 
  | 'PROPOSED' 
  | 'ACCEPTED' // Best justified contextual decision given current state
  | 'REVIEW_REQUIRED' 
  | 'REJECTED' 
  | 'REVERSED';

export interface ArchitectureOption {
  option_id: string;
  name: string;
  description: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  operational_cost: 'NEGLIGIBLE' | 'LOW' | 'MODERATE' | 'HIGH';
  failure_surface: string;
  is_selected: boolean;
  rejection_rationale?: string; // MANDATORY if is_selected = false
  tradeoffs: Record<string, string>;
}

export interface EvidenceMapping {
  evidence_id: string; // EVD-XXXX
  supports_claim: string;
  unverified_hypothesis_portion: string; // Explicitly states what part remains unverified
}

export interface MachineReadableADR {
  id: string; // e.g. ADR-0004
  title: string;
  project_id: string;
  date: string;
  status: ADRStatus;
  
  // Rationale & Context
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

  // Comparative Trade-off & Rejection Memory
  options_evaluated: ArchitectureOption[];

  // Epistemic & Evidence Explicit Mapping
  evidence_mappings: EvidenceMapping[];
  knowledge_asset_refs: string[];

  // Epistemic Bounds
  assumptions: string[];
  uncertainties: string[];
  scope_boundaries: Record<string, string>;
  reversal_conditions: string[];

  // 6-Category Decision Breakdown
  decision_breakdown: {
    KNOWN_FACT: string[];
    TRANSFERRED_PRINCIPLE: string[];
    HYPOTHESIS: string[];
    ASSUMPTION: string[];
    UNCERTAINTY: string[];
    REVERSAL_CONDITION: string[];
  };
}
```

---

## 4. Decision Engine Governance Interlock

Before an ADR status transitions from `PROPOSED` to `ACCEPTED`:

```text
  [Decision Engine: Candidate ADR]
                │
                v
  [Governance Engine: checkADRRecommendation(asset_refs, project_scope)]
                │
         ┌──────┴──────┐
         ▼             ▼
      [ALLOW]       [BLOCK]
         │             │
         v             v
  [Set ACCEPTED]   [Reject Option / Trigger Alternative Analysis]
```
