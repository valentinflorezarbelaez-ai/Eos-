# EOS CORE MATURATION: STEP 8 — MODEL & PROPOSAL (EXECUTABLE POLICY ENGINE & CONSTITUTION RULES)

* **Step:** STEP 8 — MODEL & PROPOSE
* **Status:** PROPOSED (PENDING PO LEVEL 3 IMPLEMENTATION AUTHORIZATION)
* **Date:** 2026-08-11
* **Target:** Executable Constitution & Declarative Policy Evaluator (`src/core/constitutionEngine.js`)
* **Mode:** NO PRODUCTION CODE WRITTEN YET (SPECIFICATION & ARCHITECTURE PROPOSAL ONLY)

---

## 1. Core Decoupling Invariants & Architectural Separation

```text
  [CONSTITUTION.md] (Written Rule Baseline)
         │
         ▼
  [POLICY_ENGINE.json] (Declarative Predicate Trees)
         │
         ▼
  [ConstitutionEngine] ───> Predicate Evaluator ("What does the rule say?")
         │
         ▼
  [GovernanceEngine] ─────> Operational Consequence Engine ("ALLOW, BLOCK, REQUIRE_HUMAN_APPROVAL")
         │
         ▼
  [ExecutionOrchestrator] ─> Operational Task Execution Engine (Worktree DAG Nodes)
```

1. **Decoupling Invariant:** `ConstitutionEngine` does NOT issue capability tokens or enforce operational actions. It ingests declarative JSON policy declarations and evaluates boolean predicate trees ("What does the rule say?"). `GovernanceEngine` consumes the evaluated rule result to issue operational decisions (`ALLOW`, `BLOCK`, `REQUIRE_HUMAN_APPROVAL`).
2. **Closed Operator Set Invariant:** Predicate evaluation is strictly deterministic. Use of `eval()`, `Function(...)`, or dynamic JS string execution is **STRICTLY FORBIDDEN**.
3. **Fail-Closed Parse Error Invariant:** If `POLICY_ENGINE.json` is missing, corrupted, or contains invalid syntax, evaluation MUST immediately fail-closed:
   $$\text{Parse Error} \implies \text{is\_approved} = \text{false} \land \text{effect} = \text{REQUIRE\_HUMAN\_APPROVAL}$$

---

## 2. Closed Safe Operator Set for Predicate Evaluator

To prevent code injection vulnerabilities, `ConstitutionEngine` supports ONLY the following closed set of 14 boolean operators:

| Operator | Category | Description & Evaluator Logic |
| :--- | :--- | :--- |
| **`EQUALS`** | Comparison | `actualValue === expectedValue` |
| **`NOT_EQUALS`** | Comparison | `actualValue !== expectedValue` |
| **`IN`** | Collection | `expectedArray.includes(actualValue)` |
| **`NOT_IN`** | Collection | `!expectedArray.includes(actualValue)` |
| **`AND`** | Logic | All child predicates evaluate to `true` |
| **`OR`** | Logic | At least one child predicate evaluates to `true` |
| **`NOT`** | Logic | Inverts child predicate truth value |
| **`PATH_IS_OUTSIDE`** | Path Boundary | `!actualPath.startsWith(allowedBasePath)` |
| **`AUTH_LEVEL_AT_LEAST`** | Authorization | `actualLevelRank >= requiredLevelRank` |
| **`HAS_CAPABILITY`** | Token | `activeTokens.has(requestedCapabilityToken)` |
| **`KNOWLEDGE_STATE_IS`** | Epistemic | `actualState === requiredEpistemicState` |
| **`ACTION_IS`** | Action | `requestAction === policyTargetAction` |
| **`MODE_IS`** | System Mode | `currentSystemMode === requiredMode` |
| **`HUMAN_AUTHORIZED`** | PO Gate | `token === 'HUMAN_PO_SECRET_TOKEN'` |

---

## 3. Canonical Policy Schema & Structured Explanation

```typescript
export type PredicateOperator = 
  | 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN'
  | 'AND' | 'OR' | 'NOT'
  | 'PATH_IS_OUTSIDE' | 'AUTH_LEVEL_AT_LEAST' | 'HAS_CAPABILITY'
  | 'KNOWLEDGE_STATE_IS' | 'ACTION_IS' | 'MODE_IS' | 'HUMAN_AUTHORIZED';

export interface PredicateNode {
  operator: PredicateOperator;
  field?: string;
  value?: any;
  predicates?: PredicateNode[]; // Child nodes for AND, OR, NOT
}

export interface PolicyRule {
  policy_id: string; // POL-001..POL-010
  name: string;
  constitution_article_ref: string; // e.g. "Article III.1"
  description: string;
  predicate_tree: PredicateNode;
  consequence: {
    result: 'ALLOW' | 'DENY' | 'ESCALATE';
    effect: 'ALLOW' | 'BLOCK' | 'REQUIRE_HUMAN_APPROVAL' | 'REQUIRE_SCOPE_NARROWING';
    reason: string;
  };
}

export interface PolicyEvaluationExplanation {
  evaluation_id: string;
  timestamp: string;
  policy_id: string;
  rule_name: string;
  matched_predicates: string[];
  failed_predicates: string[];
  context_snapshot: Record<string, any>;
  decision_effect: 'ALLOW' | 'BLOCK' | 'REQUIRE_HUMAN_APPROVAL' | 'REQUIRE_SCOPE_NARROWING';
  required_authority: 'SYSTEM_AUTONOMOUS' | 'HUMAN_PRODUCT_OWNER';
}
```

---

## 4. Layered I/O Enforcement Architecture (Option F)

```text
  [High-Level Task Action]
             │
             ▼
  [Layer 1: Capability-Based Engine APIs] (saveAssetAuthorized / executeDAGPlan)
             │
             ▼
  [Layer 2: Policy Middleware Interceptor] (ConstitutionEngine Predicate Evaluation)
             │
             ▼
  [Layer 3: Workspace Isolation Boundary] (.gemini/self-hosting-workspace/ & Git Worktrees)
```

- **Analysis of Enforcement Options:**
  - *Option A (Global fs Patching):* Frangible, monkey-patches Node built-ins. Rejected.
  - *Option F (Layered Capability APIs + Policy Middleware + Workspace Isolation):* Clean, auditable, zero-dependency. Chosen baseline.

---

## 5. 7-Level Rule Maturity Scale per `CR-*` Rule

| Rule ID & Title | 1. Written | 2. Structured | 3. Validatable | 4. Executable | 5. Enforced | 6. Observed | 7. Refined |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`CR-001` Evidence Over Claims** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-002` Autonomous Boundary** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-003` Preserve Before Modify** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-004` Proportionality & Anti-Bloat** | ✅ | ⏳ | ✅ | ❌ Manual | ❌ Manual | ❌ Manual | ❌ |
| **`CR-005` EOS Control Plane Boundary** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-006` Dev Mode Write Barrier** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-007` Implementation Preconditions**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-008` Non-Self-Expansion Authority** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-009` Fail-Closed Default Deny** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |
| **`CR-010` Anti-Overgeneralization** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⏳ |

---

## 6. Conceptual API for `src/core/constitutionEngine.js`

```javascript
export class ConstitutionEngine {
  /** Ingests and validates POLICY_ENGINE.json declarations */
  loadPolicyDeclarations(policyFilePath) {}

  /** Evaluates a single PredicateNode recursively using closed operator set */
  evaluatePredicateNode(node, context) {}

  /** Evaluates all policies against a request context */
  evaluatePolicies(context) {}

  /** Generates a structured PolicyEvaluationExplanation payload */
  explainPolicyDecision(policyId, matched, failed, context, effect) {}
}
```

---

## 7. Negative & Boundary Test Cases for Level 3 Implementation

1. **`FAIL_CLOSED_ON_POLICY_PARSE_ERROR`:** Corrupted `POLICY_ENGINE.json` -> Must fail-closed returning `effect = 'REQUIRE_HUMAN_APPROVAL'`.
2. **`UNKNOWN_OPERATOR_REJECTED`:** Predicate containing unknown operator `EXECUTE_SHELL` -> Must throw `INVALID_PREDICATE_OPERATOR`.
3. **`EVAL_DYNAMIC_JS_FORBIDDEN`:** Policy attempting dynamic string evaluation -> Must fail schema validation.
4. **`POLICY_CONFLICT_PRECEDENCE`:** Deny rules taking precedence over allow rules -> Must return `effect = 'BLOCK'`.
5. **`MISSING_AUTHORITY_CONTEXT`:** Evaluating Level 3 implementation without PO secret token -> Must fail-closed.
6. **`CONSTITUTION_MUTATION_REJECTED`:** Attempting to alter `CONSTITUTION.md` -> Must throw `AUTHORITY_VIOLATION`.
7. **`POLICY_SELF_MUTATION_REJECTED`:** Attempting to alter `POLICY_ENGINE.json` -> Must throw `AUTHORITY_VIOLATION`.
8. **`BYPASS_GOVERNANCE_PATH_BLOCKED`:** Un-governed action request -> Must hit `FAIL_CLOSED_DEFAULT`.
9. **`STRUCTURED_EXPLANATION_GENERATED`:** Every policy evaluation -> Must generate a complete `PolicyEvaluationExplanation` payload.
10. **`DYNAMIC_POLICY_RELOAD_DETERMINISTIC`:** Reloading identical `POLICY_ENGINE.json` -> Must produce 100% identical evaluation outcomes.
11. **`UNHANDLED_ACTION_DEFAULT_DENY`:** Requesting unknown action `DO_SOMETHING_NEW` -> Must return `effect = 'REQUIRE_HUMAN_APPROVAL'`.
12. **`PATH_IS_OUTSIDE_ENFORCEMENT`:** Target path outside workspace -> Must evaluate `PATH_IS_OUTSIDE = true` and return `DENY`.

---

## 8. 6-Category Decision Classification of Proposal

1. **`KNOWN_FACT`**: `CONSTITUTION.md` and `POLICY_ENGINE.json` exist in docs. No `constitutionEngine.js` module exists yet in `src/core/`.
2. **`TRANSFERRED_PRINCIPLE`**: `SYS-PRN-001` (Boundary Contracts): Ingested policy JSON declarations must be schema-validated at the engine boundary.
3. **`HYPOTHESIS`**: Building `ConstitutionEngine` with a closed, safe set of 14 boolean operators will eliminate ad-hoc IF statements while preventing dynamic JS execution vulnerabilities.
4. **`ASSUMPTION`**: Recursive evaluation of predicate trees over 50+ rules will execute rapidly in Node.js.
5. **`UNCERTAINTY`**: Defining complex multi-variable policy precedence rules declaratively without dynamic code.
6. **`REVERSAL_CONDITION`**: If declarative predicate evaluation fails to evaluate complex policy conditions correctly in $> 5\%$ of cases, dynamic predicate rules **MUST BE REVERSED** to strict hardcoded validator modules.
