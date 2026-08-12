# EOS CORE MATURATION: STEP 4 — READ (MACHINE-READABLE ADR ENGINE DIAGNOSIS)

* **Step:** STEP 4 — READ (MACHINE-READABLE ADR GENERATOR & PARSER)
* **Status:** READ COMPLETE (AWAITING PO MODEL & PROPOSE AUTHORIZATION)
* **Target Workspace:** EOS Control Plane (`C:\Users\valen\Documents\Eos system`)
* **Date:** 2026-08-11
* **Auditor:** EOS Autonomous Architectural Auditor

---

## 1. Strictly Enforced READ Boundaries Check

During Step 4 — READ:
- ❌ **ZERO** code lines written or created (`src/core/adrEngine.js` does NOT exist yet).
- ❌ **ZERO** npm packages installed.
- ❌ **ZERO** files modified in `docs/core/`, `docs/architecture/adrs/`, or `docs/policies/`.
- ❌ **ZERO** retrospective invention of historical data for legacy ADR files (`ADR-0001` .. `ADR-0005`).

---

## 2. Answers to the 7 Fundamental ADR Engine Questions

### Q1: Source of Truth (Markdown vs. JSON vs. Both)
$$\text{JSON Machine-Readable Container} \xrightarrow{\quad\text{Deterministic Render}\quad} \text{Human-Readable Markdown File}$$
- **JSON File (`docs/architecture/adrs/*.json`):** Machine-Readable Single Source of Truth. Contains structured trade-off options, evidence mappings, and 6-category breakdowns.
- **Markdown File (`docs/architecture/adrs/*.md`):** Derived Representation for Human Review. Always 100% deterministically generated from the machine-readable JSON container.

### Q2: Epistemic Integrity (Preventing False Claims)
- An ADR MUST preserve the 6-Category Decision Breakdown:
  `KNOWN_FACT`, `TRANSFERRED_PRINCIPLE`, `HYPOTHESIS`, `ASSUMPTION`, `UNCERTAINTY`, `REVERSAL_CONDITION`.
- An ADR **CANNOT** promote a `HYPOTHESIS` or `ASSUMPTION` to `KNOWN_FACT` without an explicit `EVD-XXXX` evidence reference certified by `EvidenceEngine`.

### Q3: Provenance Traversal
An ADR enables full 6-level provenance tracing upstream to raw observations:
$$\text{ADR} \longrightarrow \text{Decision} \longrightarrow \text{KnowledgeAsset} \longrightarrow \text{EvidenceReference} \longrightarrow \text{EvidenceRecord} \longrightarrow \text{Observation}$$

### Q4: Governance Engine Interlock
Before `DecisionEngine` can propose or finalize an ADR recommendation, it MUST call `GovernanceEngine.checkADRRecommendation(asset_id, epistemicState, scope)`:
- `ALLOW` $\longrightarrow$ Finalize ADR as `ACCEPTED`.
- `BLOCK` $\longrightarrow$ Reject option; trigger trade-off re-analysis.
- `REQUIRE_SCOPE_NARROWING` $\longrightarrow$ ADR restricted strictly to verified scope.
- `REQUIRE_HUMAN_APPROVAL` $\longrightarrow$ Escalate to Product Owner.

### Q5: Forbidden Architectural Decisions
The Decision Engine MUST NOT output ADR proposals that:
1. Recommend `REFUTED` or `RETIRED` assets.
2. Treat `CONTRADICTED` assets as universally true.
3. Recommend promotions without supporting evidence.
4. Redefine constitutional boundaries (`CONSTITUTION.md`).
5. Self-authorize modifications to governance policies (`POLICY_ENGINE.json`).

### Q6: Reversibility & Explicit Triggers
Every canonical ADR MUST contain an explicit `reversal_conditions: ReversalCondition[]` array. If an empirical observation satisfies `falsification_condition == TRUE`, `GovernanceEngine` automatically marks the ADR as `REVIEW_REQUIRED` or `REVERSED` without silently destroying historical text.

### Q7: Zero-Fiction Legacy ADR Parsing Strategy
Legacy Markdown ADRs (`ADR-0001` .. `ADR-0005`) are ingested into canonical `MachineReadableADR` representations using a Zero-Fiction Adapter:
- Text under `## Context` $\longrightarrow$ `why.technical_motivation`.
- Text under `## Decision` $\longrightarrow$ `what.architecture_description`.
- Text under `## 6-Category Decision Breakdown` (e.g. `ADR-0005`) $\longrightarrow$ `decision_breakdown`.
- Missing fields (e.g. `evidence_mappings` in `ADR-0001`) $\longrightarrow$ `[]` or `UNSET`, marked as `missing_information`. No historical trade-offs are invented.

---

## 3. Discrepancy & Gap Analysis (Phase E Specs vs. Filesystem Realities)

| Gap ID | Description | Specification Reference | Filesystem Reality | Required Action in Step 4 MODEL / PROPOSE |
| :--- | :--- | :--- | :--- | :--- |
| **`GAP-D1`** | **Absence of Machine-Readable JSON Containers for ADRs** | `PHASE_E_DECISION_ENGINE_DESIGN.md` defines `MachineReadableADR` JSON schema. | Existing `ADR-0001` .. `ADR-0005` in `docs/architecture/adrs/` exist ONLY as Markdown text. | Model Zero-Fiction Markdown-to-JSON Parser & Renderer. |
| **`GAP-D2`** | **Missing 6-Category Breakdown in Legacy ADR-0001..0004** | Phase E requires explicit 6-category breakdown. | Only `ADR-0005` has explicit 6-category breakdown; `ADR-0001` .. `ADR-0004` use standard context/decision headers. | Map missing breakdowns as `UNSET` / `UNKNOWN` without inventing facts. |
| **`GAP-D3`** | **Absence of Executable Decision Engine Module** | `EOS_CORE_MATURATION_STRATEGY.md` Step 4 requires executable ADR generator & parser. | No TypeScript/Node module exists in `src/core/` for ADR generation or parsing. | Model `src/core/adrEngine.js`. |

---

## 4. 6-Category Decision Classification of READ Findings

1. **`KNOWN_FACT`**:
   - 5 Markdown ADR files (`ADR-0001` .. `ADR-0005`) exist in `docs/architecture/adrs/`.
   - `ADR-0005` includes an explicit 6-Category Decision Breakdown; `ADR-0001` .. `ADR-0004` do not.
   - No `adrEngine.js` module exists yet in `src/core/`.
2. **`TRANSFERRED_PRINCIPLE`**:
   - `SYS-PRN-001` (Boundary Contracts): Ingested ADR JSONs must be schema-validated at the engine boundary.
3. **`HYPOTHESIS`**:
   - Creating a zero-dependency `ADREngine` module that parses Markdown ADRs into canonical JSON containers and renders Markdown from JSON deterministically will enable automated governance checks on architectural decisions without breaking human-readable Git tracking.
4. **`ASSUMPTION`**:
   - Markdown parsing and rendering of 100+ ADRs will execute rapidly in Node.js.
5. **`UNCERTAINTY`**:
   - Whether complex custom Markdown tables in future ADRs require custom AST parsing.
6. **`REVERSAL_CONDITION`**:
   - If Markdown rendering loses human formatting nuance or breaks Git diff readability, the renderer **MUST BE REVERSED** to produce strictly formatted template-based Markdown output.

---

## 5. Step 4 READ Exit Gate Check

EOS can answer with total precision:
- **Source of Truth:** JSON container is machine-readable source of truth; Markdown is derived representation.
- **Epistemic Integrity:** 6-category breakdown preserves `HYPOTHESIS` vs `KNOWN_FACT`.
- **Governance Interlock:** `checkADRRecommendation` intercepts ADR generation before status becomes `ACCEPTED`.
- **Zero-Fiction Rule:** Legacy Markdown ADRs ingested with missing fields marked `UNSET` / `UNKNOWN`.
