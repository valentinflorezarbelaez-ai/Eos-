# EOS CORE MATURATION: STEP 1 — MODEL & PROPOSAL (KNOWLEDGE PLANE & PROVENANCE INDEXER)

* **Step:** STEP 1 — MODEL & PROPOSE
* **Status:** APPROVED WITH CONDITIONS (STEP 1 IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Executable Knowledge Plane (`src/core/knowledgePlane.ts`) & Provenance Indexer (`src/indexer/provenanceIndexer.ts`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Core Decoupling & Authority Invariants

```text
  [Git-Versioned JSON Files en docs/knowledge/*.json]
                         │  SINGLE SOURCE OF TRUTH (PERSISTENT & HUMAN-READABLE)
                         ▼
             [KnowledgePlaneEngine Module]
                         │  Ingests, Validates (Native Zero-Dep) & Proposes Changes
                         ▼
      [Governance / Authorization Policy Interlock]
                         │  Gated Authorization
                         ▼
         [Native node:sqlite In-Memory Derived Index]
                         │  NON-AUTHORITATIVE DERIVED QUERY CACHE
                         ▼
        [Queries: WHAT applies?, WHY?, WHAT EVIDENCE?, TRACE DAG]
```

1. **Git JSON Files (`docs/knowledge/*.json`) are the Single Source of Truth.**
2. **SQLite (`:memory:`) is strictly a Derived Index & Non-Authoritative Query Cache.** It NEVER writes to Git JSON files directly.
3. **Authorized Persistence Gate:** `saveAsset()` is NOT an arbitrary write from the index. It requires explicit Governance authorization (`LOAD -> VALIDATE -> PROPOSE -> GOVERNANCE GATE -> GIT JSON SAVE`).
4. **Native Zero-Dependency Validator:** Native JS schema validator replaces external Zod dependency (`ZOD_NOT_INSTALLED` verified empirically via Node runtime probe).
5. **Zero Fictional Data Invariant:** Legacy asset migration maps existing fields into canonical structures; missing historical data remains `UNSET` / `UNVERIFIED` rather than manufactured out of thin air.

---

## 2. Canonical Contracts & Schemas

### A. Sub-Entity Contracts (TypeScript Interfaces)

```typescript
export type RelationshipType = 
  | 'DERIVED_FROM'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'SUPERSEDES'
  | 'SPECIALIZES'
  | 'PARENT_OF';

export interface AssetRelationship {
  source_asset_id: string;
  target_asset_id: string;
  relationship_type: RelationshipType;
}

export interface EvidenceReference {
  evidence_id: string;        // e.g. EVD-0035
  project_id: string;         // e.g. FlowDesk, Sonrisa-Nova, Andes-Retreat
  scenario_ref?: string;      // e.g. Level 3 Concurrency Verification
  verification_date: string;  // ISO-8601 UTC timestamp
}

export interface ReversalCondition {
  condition_id: string;        // e.g. REV-ENV-001-01
  description: string;         // Human-readable trigger description
  metric_or_threshold: string; // Falsification condition or boundary metric
  reversal_action: string;     // Binding action (e.g. DEGRADE_TO_UNVERIFIED, SWITCH_DRIVER)
}

export interface TransferRecord {
  transfer_id: string;          // e.g. TRF-LSN-001-FLOWDESK
  source_project_id: string;   // e.g. Andes-Retreat
  target_project_id: string;   // e.g. FlowDesk
  applied_date: string;        // ISO-8601 UTC timestamp
  outcome: 'CONFIRMED_IN_SCOPE' | 'REFUTED' | 'MODIFIED_IN_TRANSFER';
  evidence_ref: EvidenceReference;
}
```

### B. Canonical `KnowledgeAsset` Interface

```typescript
export interface KnowledgeAsset {
  id: string;                 // e.g. SYS-PRN-001, LSN-001, ENV-001
  version: string;            // Semantic Versioning e.g. 1.0.0
  type: 'PRINCIPLE' | 'PATTERN' | 'ANTI_PATTERN' | 'HYPOTHESIS' | 'ENVIRONMENT_CAPABILITY';
  title: string;
  domain_scope: 'PROJECT_SPECIFIC' | 'DOMAIN_SPECIFIC' | 'CROSS_DOMAIN' | 'SYSTEM_PRINCIPLE';
  lifecycle_state: 'UNVERIFIED' | 'SUPPORTED_IN_SCOPE' | 'CONFIRMED_IN_SCOPE' | 'SUPERSEDED' | 'REFUTED' | 'RETIRED';
  
  // Core Payload
  intent: string;
  statement: string;
  operating_boundaries: string[];
  reversal_conditions: ReversalCondition[];

  // Provenance & Multi-Type Relationship Graph Links
  provenance: {
    originating_observations: string[];
    originating_evidence: EvidenceReference[];
    parent_asset_id?: string;
    relationships: AssetRelationship[];
    transfers: TransferRecord[];
  };
}
```

---

## 3. Legacy-to-Canonical Migration Strategy (Zero-Fiction Rule)

EOS must migrate the 4 existing legacy JSON files without inventing missing historical facts:

| Legacy Asset | Field Mapping | Canonical Mapping Status | Handling of Missing Fields |
| :--- | :--- | :--- | :--- |
| **`LSN-001`** | `topic` -> `title`<br>`principle` -> `statement`<br>`invariants` -> `operating_boundaries` | `version: "1.0.0"`<br>`type: "PATTERN"`<br>`lifecycle_state: "CONFIRMED_IN_SCOPE"` | `provenance.originating_evidence`: Mapped to `EVD-0033` (Andes) and `EVD-0034` (Sonrisa). |
| **`LSN-002`** | `topic` -> `title`<br>`principle` -> `statement`<br>`invariants` -> `operating_boundaries` | `version: "1.0.0"`<br>`type: "PATTERN"`<br>`lifecycle_state: "CONFIRMED_IN_SCOPE"` | `provenance.originating_evidence`: Mapped to `EVD-0033` (Andes) and `EVD-0034` (Sonrisa). |
| **`ENV-001`** | `topic` -> `title`<br>`discovery` -> `statement`<br>`limitations_and_reversal` -> `reversal_conditions` | `version: "1.0.0"`<br>`type: "ENVIRONMENT_CAPABILITY"`<br>`lifecycle_state: "SUPPORTED_IN_SCOPE"` | `provenance.originating_evidence`: Mapped to `EVD-0035` (FlowDesk). |
| **`SYS-PRN-001`** | `topic` -> `title`<br>`principle` -> `statement`<br>`invariants` -> `operating_boundaries` | `version: "1.0.0"`<br>`type: "PRINCIPLE"`<br>`lifecycle_state: "CONFIRMED_IN_SCOPE"` | `provenance.originating_evidence`: Mapped to `EVD-0035` (FlowDesk). `parent_asset_id`: `"LSN-002"`. `relationships`: `[{ source_asset_id: "SYS-PRN-001", target_asset_id: "LSN-002", relationship_type: "DERIVED_FROM" }]`. |

---

## 4. Native `node:sqlite` In-Memory Derived Schema (Including Relationships)

The `provenanceIndexer` creates the following temporary `:memory:` tables on engine startup:

```sql
-- 1. Main Knowledge Assets Table
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  domain_scope TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL,
  intent TEXT NOT NULL,
  statement TEXT NOT NULL,
  parent_asset_id TEXT
);

-- 2. Multi-Type Asset Relationships Table (DAG Edges)
CREATE TABLE asset_relationships (
  source_asset_id TEXT NOT NULL,
  target_asset_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  PRIMARY KEY (source_asset_id, target_asset_id, relationship_type),
  FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 3. Operating Boundaries Table
CREATE TABLE operating_boundaries (
  asset_id TEXT NOT NULL,
  boundary TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 4. Reversal Conditions Table
CREATE TABLE reversal_conditions (
  condition_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  description TEXT NOT NULL,
  metric_or_threshold TEXT NOT NULL,
  reversal_action TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 5. Evidence References Table (Graph Edges: Asset -> Evidence)
CREATE TABLE evidence_refs (
  asset_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  scenario_ref TEXT,
  verification_date TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- 6. Transfers Table (Graph Edges: Source Project -> Target Project)
CREATE TABLE transfers (
  transfer_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL,
  source_project_id TEXT NOT NULL,
  target_project_id TEXT NOT NULL,
  applied_date TEXT NOT NULL,
  outcome TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);
```

---

## 5. Conceptual Engine APIs & Query Interfaces

### A. Conceptual API: `src/core/knowledgePlane.ts`
```typescript
export class KnowledgePlaneEngine {
  /** Reads and validates all JSON files in docs/knowledge/*.json using zero-dep native validator */
  async loadAllAssets(): Promise<KnowledgeAsset[]>;
  
  /** Native Schema Validator (Zero npm dependencies) */
  validateAssetSchema(data: unknown): KnowledgeAsset;
  
  /** Governance-Gated Authorized Persistence Operation (Proposes & writes authorized Git JSON changes) */
  async saveAssetAuthorized(asset: KnowledgeAsset, governanceToken: string): Promise<void>;
}
```

### B. Conceptual API: `src/indexer/provenanceIndexer.ts`
```typescript
export class ProvenanceIndexer {
  /** Populates SQLite :memory: database from KnowledgeAsset array */
  buildIndex(assets: KnowledgeAsset[]): void;

  /** Query 1: WHAT applies to a given domain scope and lifecycle state? */
  queryWhat(domainScope?: string, activeStatesOnly?: boolean): KnowledgeAsset[];

  /** Query 2: WHY does EOS believe an asset applies? (Returns intent, boundaries, reversal conditions) */
  explainWhy(assetId: string): { asset: KnowledgeAsset; reversal_conditions: ReversalCondition[] } | null;

  /** Query 3: WHAT EVIDENCE proves an asset? (Traverses SQL graph join: Asset -> Relationships -> EvidenceRefs -> Transfers) */
  traceEvidence(assetId: string): { evidence_ids: string[]; relationships: AssetRelationship[]; transfers: TransferRecord[] };
}
```

---

## 6. 6-Category Decision Classification

1. **`KNOWN_FACT`**:
   - `node:sqlite` `DatabaseSync` is available in Node.js v24.16.0.
   - `ZOD_NOT_INSTALLED` verified via runtime probe; validator will use zero-dependency native JS.
   - Legacy `docs/knowledge/*.json` files lack Phase B schema attributes.
2. **`TRANSFERRED_PRINCIPLE`**:
   - `ENV-001` (Native Capability Probing): Use Node v24 native `node:sqlite` for in-memory graph indexing without adding external npm C++ dependencies.
   - `SYS-PRN-001` (Boundary Contracts): Ingested Knowledge JSONs must be strictly validated against the `KnowledgeAsset` schema at the engine boundary.
3. **`HYPOTHESIS`**:
   - Migrating existing JSON assets to canonical `KnowledgeAsset` structures with multi-relationship DAGs (`DERIVED_FROM`, `SUPERSEDES`, etc.) will enable deterministic SQL graph queries (`queryWhat`, `explainWhy`, `traceEvidence`) while preserving Git as the 100% single source of truth.
4. **`ASSUMPTION`**:
   - In-memory SQLite indexing will be operationally viable for the real volume of knowledge observed during the experiment. Latency will be measured empirically in Level 3.
5. **`UNCERTAINTY`**:
   - Whether upgrading `docs/evidence/schema.json` to Phase C epistemic states will require updating legacy `scripts/verify-eos.js` assertions.
6. **`REVERSAL_CONDITION`**:
   - If in-memory `node:sqlite` indexing fails or causes memory leaks during continuous execution, `ProvenanceIndexer` **MUST BE REVERSED** to an in-memory Map / Set graph indexer in pure JavaScript.
