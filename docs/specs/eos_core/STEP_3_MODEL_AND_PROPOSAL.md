# EOS CORE MATURATION: STEP 3 — MODEL & PROPOSAL (GOVERNANCE ENGINE & HARD ENFORCEMENT)

* **Step:** STEP 3 — MODEL & PROPOSE
* **Status:** APPROVED WITH CONDITIONS (STEP 3 IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Executable Governance Engine (`src/core/governanceEngine.js`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Multi-Layer Boundary Defense Strategy

To eliminate system leakage points without relying on fragile global runtime monkey-patching, EOS specifies a **3-Layer Defense-in-Depth Architecture**:

```text
  +-----------------------------------------------------------------------------------+
  | LAYER 1: Boundary API & Capability-Based Tokens (Kernel Layer)                   |
  | Core write methods (saveAssetAuthorized, etc.) REQUIRE cryptographic token.      |
  +-----------------------------------------------------------------------------------+
                                            │
                                            ▼
  +-----------------------------------------------------------------------------------+
  | LAYER 2: Policy Engine Middleware Interceptors (Application Layer)               |
  | Intercepts ADR proposals, Knowledge Promotions, & External Write requests.       |
  +-----------------------------------------------------------------------------------+
                                            │
                                            ▼
  +-----------------------------------------------------------------------------------+
  | LAYER 3: Process Harness Isolation & Git Status Audits (Environment Layer)       |
  | Worktree isolation (.gemini/self-hosting-workspace/) + post-exec diff audits.     |
  +-----------------------------------------------------------------------------------+
```

---

## 2. Fail-Closed Invariant & Precedence Model

```text
  [Incoming Request]
          │
          ▼
  [Policy Engine Evaluation]
          │
          ├── Explicit Match -> Result (ALLOW, BLOCK, REQUIRE_SCOPE_NARROWING, REQUIRE_HUMAN_APPROVAL)
          │
          └── Ambiguous / Unknown / Error
                  │
                  ▼
          [FAIL-CLOSED INVARIANT]
          Result: BLOCK / REQUIRE_HUMAN_APPROVAL
          Reason: UNHANDLED_POLICY_REQUEST_DEFAULT_DENY
```

1. **Fail-Closed Rule:** Default permission is **`DENY`**. If a policy request is unhandled, ambiguous, or encounters an internal evaluation error, the Governance Engine **MUST** return `is_approved = false` and `effect = 'REQUIRE_HUMAN_APPROVAL'` or `'BLOCK'`.
2. **Scope Narrowing vs. Hard Block:**
   - **`REQUIRE_SCOPE_NARROWING`:** Asset is `SUPPORTED_IN_SCOPE` in Scope A, but requested for Scope B. The claim may be valid, but exceeds tested scope boundaries. `is_approved = false` until scope is narrowed.
   - **`BLOCK`:** Operation is strictly forbidden (e.g. `REFUTED` asset ADR recommendation, un-authorized external write). `is_approved = false`.

---

## 3. Human Authority Boundary & Non-Self-Expansion Invariant

```text
  AUTONOMOUS CAPABILITIES (EOS Core Authority):
  - Ingest, validate, and normalize Knowledge & Evidence.
  - Execute isolated experiments in .gemini/self-hosting-workspace/.
  - Run automated tests & capture raw observations.
  - Assess epistemic states (SUPPORTED_IN_SCOPE, REFUTED, CONTRADICTED).
  - Issue ephemeral capability tokens for authorized isolated operations.
  - Perform automatic rollbacks when experiments fail.

  NON-DELEGABLE HUMAN BOUNDARIES (Product Owner Sole Authority):
  - Mutating CONSTITUTION.md or core governance policies.
  - Granting external project write permissions (IMPLEMENTATION_AUTHORIZED).
  - Approving production deployments.
  - Redefining core business specs or domain boundaries.
  - Self-authorizing an expansion of EOS constitutional power.
```

**Non-Self-Expansion Invariant:** `GovernanceEngine` **CANNOT** issue a capability token or execute an operation that modifies `POLICY_ENGINE.json` or `CONSTITUTION.md`. Governance can apply authority; it CANNOT become the authority that redefines its own governing rules.

---

## 4. Canonical Contracts & Data Models

### A. Core Governance Types & Interfaces

```typescript
export type GovernanceEffect =
  | 'ALLOW'
  | 'BLOCK'
  | 'REQUIRE_SCOPE_NARROWING'
  | 'REQUIRE_HUMAN_APPROVAL'
  | 'REQUIRE_REVALIDATION';

export interface GovernanceCheckRequest {
  request_id: string;
  action_type: 
    | 'CONSTITUTION_MUTATION'
    | 'EXTERNAL_PROJECT_WRITE'
    | 'ADR_RECOMMENDATION'
    | 'KNOWLEDGE_PROMOTION'
    | 'POLICY_MUTATION'
    | 'GIT_SOURCE_MUTATION';
  asset_id?: string;
  target_path?: string;
  proposed_state?: string;
  epistemic_assessment?: unknown;
  human_authorization_token?: string;
}

export interface GovernanceDecision {
  request_id: string;
  is_approved: boolean;
  effect: GovernanceEffect;
  policy_id: string;
  reason: string;
  capability_token?: string;
  timestamp: string;
}
```

---

## 5. Conceptual API for `src/core/governanceEngine.js`

```javascript
export class GovernanceEngine {
  /** Ingests structured policies from docs/policies/POLICY_ENGINE.json */
  loadPolicies(policyDir) {}

  /** Evaluates a GovernanceCheckRequest against policy hierarchy with Fail-Closed guarantee */
  evaluateRequest(request) {}

  /** Interceptor for Decision Engine: Checks if an asset can be recommended in an ADR */
  checkADRRecommendation(assetId, epistemicState, targetScope) {}

  /** Interceptor for Knowledge Plane: Checks if a KnowledgeAsset lifecycle_state promotion is valid */
  checkKnowledgePromotion(assetId, currentState, proposedState, evidenceAssessment) {}

  /** Interceptor for System Mutations: Checks if path write is authorized */
  checkPathWriteAuthorization(targetPath, isDevelopmentMode, humanToken) {}

  /** Capability Token Generator: Issues ephemeral single-use tokens for authorized persistence */
  issueCapabilityToken(requestId, validDurationMs) {}

  /** Token Validator: Used by KnowledgePlaneEngine.saveAssetAuthorized */
  verifyCapabilityToken(token) {}
}
```

---

## 6. Negative & Boundary Test Cases for Level 3 Implementation

1. **`UNAUTHORIZED_CONSTITUTION_MUTATION`:** Requesting write access to `docs/core/CONSTITUTION.md` without human token -> Must return `effect = 'REQUIRE_HUMAN_APPROVAL'` and `is_approved = false`.
2. **`RECOMMEND_REFUTED_ASSET_IN_ADR`:** Requesting ADR recommendation for asset with `lifecycle_state = 'REFUTED'` -> Must return `effect = 'BLOCK'` and `is_approved = false`.
3. **`UNAUTHORIZED_PROMOTION_WITHOUT_PREDICTIONS`:** Requesting promotion to `CONFIRMED_IN_SCOPE` for legacy asset missing predictions -> Must return `effect = 'REQUIRE_SCOPE_NARROWING'` and `is_approved = false`.
4. **`FAIL_CLOSED_ON_UNKNOWN_REQUEST`:** Passing an invalid/unhandled `action_type = 'MAGIC_ACTION'` -> Must trigger Fail-Closed rule and return `effect = 'BLOCK'` / `REQUIRE_HUMAN_APPROVAL` and `is_approved = false`.
5. **`INVALID_CAPABILITY_TOKEN`:** Calling token verification with expired/forged token -> Must throw `UNAUTHORIZED` error.
6. **`EXTERNAL_WRITE_WITHOUT_AUTHORIZATION`:** Attempting external project write during EOS Development Mode -> Must return `effect = 'BLOCK'` (`POL-001`).
7. **`GOVERNANCE_SELF_AUTHORIZATION_LOOP`:** Attempting to self-authorize modification to `POLICY_ENGINE.json` or core policies -> **MUST THROW `AUTHORITY_VIOLATION` ERROR**.
