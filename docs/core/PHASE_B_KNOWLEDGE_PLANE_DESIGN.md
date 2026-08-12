# PHASE B: EOS KNOWLEDGE PLANE DESIGN & STORAGE ABSTRACTION

* **Phase:** PHASE B — KNOWLEDGE PLANE & STORAGE SCHEMA
* **Status:** DESIGN SPECIFIED (PHASE B DESIGN COMPLETE)
* **Date:** 2026-08-11
* **Scope:** Internal Knowledge Plane Architecture for EOS (`C:\Users\valen\Documents\Eos system`)

---

## 1. Canonical Knowledge Schema

The Knowledge Plane formalizes knowledge into 9 distinct entity types bound by strict provenance relations:

```text
  +-------------------+       +-------------------+       +-------------------+
  |   Observation     | ----> |  EvidenceRecord   | <---- |     Hypothesis    |
  | (Observed state)  |       |    (EVD-XXXX)     |       | (Proposed status) |
  +---------+---------+       +---------+---------+       +---------+---------+
            |                           ^                           |
            v                           |                           v
  +-------------------+                 |                 +-------------------+
  |      Pattern      | ----------------+---------------->|     Principle     |
  |   / AntiPattern   |                 |                 | (Derived standard)|
  +-------------------+                 |                 +---------+---------+
                                        |                           |
                                        +---------------------------+
```

### Entity Schema Specifications:

```typescript
export interface EvidenceReference {
  evidence_id: string; // e.g., EVD-0035
  project_id: string;
  scenario_ref: string;
  verification_date: string;
}

export interface ReversalCondition {
  condition_id: string;
  description: string;
  metric_or_threshold: string;
  reversal_action: string;
}

export interface TransferRecord {
  transfer_id: string;
  source_project_id: string;
  target_project_id: string;
  applied_date: string;
  outcome: 'CONFIRMED_IN_SCOPE' | 'REFUTED' | 'MODIFIED_IN_TRANSFER';
  evidence_ref: EvidenceReference;
}

export interface KnowledgeAsset {
  id: string; // e.g. SYS-PRN-001, LSN-001, ENV-001
  version: string; // Semantic version e.g. 1.2.0
  type: 'PRINCIPLE' | 'PATTERN' | 'ANTI_PATTERN' | 'HYPOTHESIS' | 'ENVIRONMENT_CAPABILITY';
  title: string;
  domain_scope: 'PROJECT_SPECIFIC' | 'DOMAIN_SPECIFIC' | 'CROSS_DOMAIN' | 'SYSTEM_PRINCIPLE';
  lifecycle_state: 'UNVERIFIED' | 'SUPPORTED_IN_SCOPE' | 'CONFIRMED' | 'SUPERSEDED' | 'REFUTED' | 'RETIRED';
  
  // Content Payload
  intent: string;
  statement: string;
  operating_boundaries: string[];
  reversal_conditions: ReversalCondition[];
  
  // Provenance & Provenance Graph
  provenance: {
    originating_observations: string[];
    originating_evidence: EvidenceReference[];
    parent_asset_id?: string; // If synthesized/derived from older assets
    transfers: TransferRecord[];
  };
}
```

---

## 2. Identity, Versioning & Provenance Graph

To prevent static document rot, the system maintains two separate graphs:

```text
  PROVENANCE GRAPH (Causal Derivation):
  [Observation A] ──┐
  [Observation B] ──┼──> [EVD-XXXX] ──> [Assessment] ──> [KnowledgeAsset] ──> [Transfer]
  [Observation C] ──┘

  VERSION GRAPH (Knowledge Evolution):
  [KnowledgeAsset v1.0.0] ──> [KnowledgeAsset v1.1.0] ──> [KnowledgeAsset v2.0.0]
```

- **Provenance Graph vs Version Graph:** Provenance tracks causal derivation (`Observation -> Evidence -> Knowledge -> Transfer`). Versioning tracks asset evolution (`v1.0.0 -> v1.1.0`). Separating these keeps the Provenance DAG strictly acycled.
- **Stable Identity:** `ID` (e.g. `SYS-PRN-001`) remains constant across evolution.
- **Derived Index Invariant:** The in-memory `node:sqlite` index is strictly a **Derived Index — Never Source of Truth**. If destroyed, it can be 100% deterministically rebuilt from the Git JSON files in `docs/knowledge/`.

---

## 3. Knowledge Lifecycle State Machine

```text
  [UNVERIFIED]
       |
       v (Verified in single project scope)
  [SUPPORTED_IN_SCOPE]
       |
       v (Cross-domain transfer confirmed with EVD-XXXX)
  [CONFIRMED] ───+---> [SUPERSEDED] (Replaced by higher-order principle)
                 |
                 +---> [REFUTED]    (Falsified by new empirical evidence)
                 |
                 +---> [RETIRED]    (Reversal trigger activated or obsolete)
```

---

## 4. Provenance-Aware Retrieval Model

The Knowledge Plane answers three mandatory queries for any engineering problem:

```text
1. WHAT applies? 
   query(domain, requirements) -> Returns matching KnowledgeAssets (filtered by state = CONFIRMED | SUPPORTED_IN_SCOPE).

2. WHY does EOS believe it applies?
   explain(asset_id) -> Returns intent, operating boundaries, and transfer records.

3. WHAT EVIDENCE proves it?
   trace_provenance(asset_id) -> Traverses graph: Asset -> EvidenceReference -> EVD-XXXX -> Verification Logs.
```

---

## 5. Storage Capability Requirements & Candidate Models

Before committing to any storage technology, EOS evaluates the capabilities required by the Knowledge Plane:

### Capability Requirements:
1. **Graph Traversal Capability:** Ability to walk `Asset -> Evidence -> Project` relationships upstream and downstream.
2. **Versioned Document Retrieval:** Ability to store JSON/document payloads with atomic version histories.
3. **Zero External Operational Dependency:** Must run within the local EOS Control Plane (`C:\Users\valen\Documents\Eos system`) without requiring managed cloud clusters.
4. **Git Compatibility:** Must serialize cleanly to human-readable/git-diffable text files for source control auditing.

### Evaluation of Candidate Storage Models:

| Evaluation Dimension | Model 1: Flat JSON Files in Git (`docs/knowledge/*.json`) | Model 2: Embedded SQLite Graph/Document Store (`node:sqlite`) | Model 3: Hybrid Git JSON + SQLite Indexer |
| :--- | :--- | :--- | :--- |
| **Git Diffability & Auditability** | **PERFECT** (Human readable, native git tracking) | **POOR** (Binary file diffs) | **PERFECT** (JSON is source of truth, DB is cache) |
| **Graph Traversal Speed** | **SLOW** (Requires reading N files) | **FAST** (SQL recursive CTEs / indexing) | **FAST** (Indexed in SQLite from JSON) |
| **Zero External Dependency** | **YES** | **YES** (via native `node:sqlite`) | **YES** |
| **Consistency & Single Source** | **HIGH** | **HIGH** | **HIGH** (Rebuild index on startup) |

> [!IMPORTANT]
> **Recommended Storage Model: Model 3 (Hybrid Git JSON Source of Truth + Native SQLite Provenance Index)**
> - **Source of Truth:** Human-readable JSON documents in `docs/knowledge/` versioned in Git.
> - **Indexing & Graph Queries:** Built-in `node:sqlite` indexer populated on demand to provide instant graph traversals (`trace_provenance`) without binary DB lock-in.

---

## 6. Phase B Exit Check

- **Canonical Schema:** Specified (`KnowledgeAsset`, `EvidenceReference`, `TransferRecord`, `ReversalCondition`).
- **Identity & Traceability:** Stable IDs + Semantic Versioning + Directed Acyclic Provenance Graph specified.
- **Lifecycle:** State Machine specified (`UNVERIFIED` -> `SUPPORTED_IN_SCOPE` -> `CONFIRMED` -> `SUPERSEDED` / `REFUTED` / `RETIRED`).
- **Retrieval Model:** 3-tier query specification (`WHAT`, `WHY`, `EVIDENCE`).
- **Storage Abstraction:** Capability requirements evaluated; Hybrid Git JSON + Native SQLite Indexer selected without premature tech bloat.
