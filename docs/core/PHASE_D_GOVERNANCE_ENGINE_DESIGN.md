# PHASE D: EOS GOVERNANCE & LIFECYCLE ENFORCEMENT ENGINE DESIGN

* **Phase:** PHASE D — GOVERNANCE & LIFECYCLE ENFORCEMENT ENGINE
* **Status:** DESIGN SPECIFIED & FROZEN WITH CONDITIONS
* **Date:** 2026-08-11
* **Scope:** Internal Governance & Enforcement Engine for EOS (`C:\Users\valen\Documents\Eos system`)

---

## 1. Core Operational Invariant

> [!IMPORTANT]
> **The Governance Enforcement Directive:**
> Epistemic states are not passive labels; **they produce binding operational consequences inside EOS.** Governance enforces the Constitution, preventing unverified, contradicted, or refuted knowledge from corrupting architectural decisions.

```text
  [Epistemic State from Phase C] ──> [Governance Policy Engine] ──> [Binding Operational Enforcement]
```

---

## 2. Epistemic State Operational Consequence Matrix

| Epistemic State | Usage in ADR Recommendations | Usage in Domain Modeling | Automated System Action |
| :--- | :--- | :--- | :--- |
| `UNVERIFIED` | **FORBIDDEN** as established rationale. Allowed ONLY as `HYPOTHESIS` or `ASSUMPTION`. | Requires Level 3 verification before promotion. | Triggers validation test requirement. |
| `SUPPORTED_IN_SCOPE` | **ALLOWED ONLY** for projects matching exact `scope_boundaries`. | Allowed within matching domain scope. | Permits single-project architectural use. |
| `CONFIRMED_IN_SCOPE` | **ALLOWED ONLY** when target context satisfies applicability, independence, and risk transfer policies (`CONFIRMED_IN_SCOPE != UNIVERSALLY_TRUE`). | Allowed across matching domains. | Permits policy-governed principle transfer. |
| `CONTRADICTED` | **BLOCKED** for new ADR proposals. | Frozen. | Triggers Mandatory Scope Narrowing Review. |
| `REFUTED` | **STRICTLY BLOCKED** everywhere. | Forbidden. | Genera `GovernanceEvent` → Marca ADRs como `REVIEW_REQUIRED` (Sin modificación silenciosa). |
| `INCONCLUSIVE` | Preserva estado epistemológico anterior. | Preserva estado anterior. | Registra evaluación inconclusa y programa re-test sin destruir conocimiento. |
| `SUPERSEDED` / `RETIRED` | **BLOCKED** para nuevas propuestas. | Prohibido. | Genera aviso de migración a proyectos activos. |

---

## 3. Governance Schema & Type Definitions

```typescript
export type EnforcementEffect =
  | 'ALLOW'
  | 'BLOCK_ADR_RECOMMENDATION'
  | 'DEGRADE_KNOWLEDGE_STATE'
  | 'REQUIRE_SCOPE_NARROWING'
  | 'EMIT_DEPRECATION_NOTICE'
  | 'SCHEDULE_TEST_RERUN';

export interface GovernancePolicy {
  policy_id: string; // e.g. POL-CONFIRMATION-CROSS-DOMAIN
  name: string;
  min_evidence_quality_score: number;
  min_independent_transfers: number; // Configurable per risk tier
  allow_unverified_hypotheses_in_adrs: boolean;
  enforce_strict_scope_matching: boolean;
}

export interface GovernanceCheckRequest {
  request_id: string;
  proposed_action: 'ADR_RECOMMENDATION' | 'KNOWLEDGE_PROMOTION' | 'KNOWLEDGE_DEMOTION';
  asset_id: string;
  target_project_id: string;
  target_scope_boundaries: Record<string, string>;
}

export interface EnforcementResult {
  request_id: string;
  asset_id: string;
  effect: EnforcementEffect;
  policy_applied: string;
  is_approved: boolean;
  reason: string;
  required_remediations?: string[];
  timestamp: string;
}

export interface GovernanceAuditLogEntry {
  audit_id: string;
  timestamp: string;
  action_type: string;
  asset_id: string;
  effect: EnforcementEffect;
  reason: string;
}
```

---

## 4. Operational Enforcement Engine Workflows

### A. ADR Recommendation Enforcement
Before the Decision Engine (Phase E) can finalize an ADR recommending a Knowledge Asset:
1. Decision Engine queries `GovernanceEngine.checkADRRecommendation(asset_id, project_scope)`.
2. Governance Engine checks `asset.lifecycle_state`:
   - If `REFUTED`, `RETIRED`, or `CONTRADICTED` -> **`BLOCK_ADR_RECOMMENDATION`**.
   - If `SUPPORTED_IN_SCOPE` and `project_scope` does NOT match `asset.scope_boundaries` -> **`BLOCK_ADR_RECOMMENDATION`**.
   - If `CONFIRMED_IN_SCOPE` and target satisfies transfer policies -> **`ALLOW`**.

### B. Auditable Deprecation Cascade (No Silent Modification)
When Phase C reports a `REFUTED` state for a `Prediction`:
1. Governance Engine receives the refutation event.
2. Updates `asset.lifecycle_state = 'REFUTED'`.
3. Emits an immutable `GovernanceEvent(asset_id, REFUTED)`.
4. Maps all active ADRs in `docs/architecture/adrs/` referencing the refuted asset.
5. Flags affected ADRs as `STATUS = REVIEW_REQUIRED` without silently rewriting their historical content.
6. Requires explicit decision by human or authorized workflow to accept, replace, or revoke the decision.
