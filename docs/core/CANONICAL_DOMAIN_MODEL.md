# EOS CANONICAL DOMAIN MODEL SPECIFICATION

* **Phase:** PHASE A — CANONICAL DOMAIN MODEL
* **Status:** SPECIFIED
* **Date:** 2026-08-11
* **Scope:** Core Type Definitions & Entities for EOS Internal System (`C:\Users\valen\Documents\Eos system`)

---

## 1. Domain Entities & Type Definitions

```typescript
// 1. Evidence & Epistemic Classification Types
export type EpistemicStatus = 
  | 'AUDIT_EXECUTED'
  | 'FINDINGS_IDENTIFIED'
  | 'REMEDIATION_REQUIRED'
  | 'REMEDIATION_IN_PROGRESS'
  | 'REVALIDATION_REQUIRED'
  | 'VERIFIED'
  | 'PRODUCTION_READY_WITHIN_TESTED_SCOPE'
  | 'PRODUCTION_READY';

export type ClaimClassification =
  | 'KNOWN_FACT'
  | 'TRANSFERRED_PRINCIPLE'
  | 'HYPOTHESIS'
  | 'ASSUMPTION'
  | 'UNCERTAINTY'
  | 'REVERSAL_CONDITION';

export type KnowledgeLifecycleState =
  | 'UNVERIFIED'
  | 'SUPPORTED_IN_SCOPE'
  | 'CONFIRMED'
  | 'SUPERSEDED'
  | 'REFUTED'
  | 'RETIRED';

// 2. Evidence Record Entity (EVD-XXXX)
export interface EvidenceRecord {
  evidence_id: string;
  project_id: string;
  experiment_id?: string;
  date: string;
  auditor: string;
  validation_level: number;
  epistemic_status: EpistemicStatus;
  classified_claims: Array<{
    claim: string;
    classification: ClaimClassification;
    verification_method: string;
    result: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
  }>;
  unverified_dimensions: Record<string, string[]>;
}

// 3. The 9-Point Traceability Knowledge Asset Entity (LSN / ENV / SYS-PRN)
export interface KnowledgeAsset {
  id: string;
  type: 'PRINCIPLE' | 'PATTERN' | 'ANTI_PATTERN' | 'ENVIRONMENT_CAPABILITY';
  title: string;
  lifecycle_state: KnowledgeLifecycleState;
  
  // The Mandatory 9-Point Traceability Schema
  schema_9pt: {
    1_intent_and_action: string;
    2_expected_result: string;
    3_observed_behavior: string;
    4_verifiable_evidence_id: string; // Links to EVD-XXXX
    5_hypothesis_status: 'CONFIRMED' | 'REFUTED' | 'SUPPORTED_IN_SCOPE';
    6_boundary_operating_conditions: string[];
    7_explicit_reversal_triggers: string[];
    8_transfer_records: Array<{
      target_project_id: string;
      date: string;
      context: string;
    }>;
    9_empirical_transfer_outcomes: Array<{
      target_project_id: string;
      outcome: 'PASS' | 'FAIL' | 'PARTIAL';
      evidence_id: string;
    }>;
  };
}

// 4. Architecture Decision Record Entity (ADR-XXXX)
export interface DecisionRecord {
  id: string;
  title: string;
  project_id: string;
  date: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'REVERSED';
  requirement_ref: string;
  options_evaluated: Array<{
    name: string;
    description: string;
    tradeoffs: Record<string, string>;
  }>;
  decision_breakdown: Record<ClaimClassification, string[]>;
  reversal_conditions: string[];
}
```

---

## 2. Entity Relationship Graph

```text
  +------------------+         1:N         +------------------+
  |     Project      | ------------------->|  EvidenceRecord  |
  +------------------+                     |    (EVD-XXXX)    |
           |                               +--------+---------+
           | 1:N                                    |
           v                                        | 1:N (Links via ID)
  +------------------+                              v
  |  DecisionRecord  |                     +------------------+
  |    (ADR-XXXX)    |                     |  KnowledgeAsset  |
  +------------------+                     | (9-Point Schema) |
                                           +------------------+
```
