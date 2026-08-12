# EOS CORE MATURATION: STEP 7 — MODEL & PROPOSAL (AUTONOMOUS EXECUTION ORCHESTRATOR)

* **Step:** STEP 7 — MODEL & PROPOSE
* **Status:** APPROVED WITH CONDITIONS (STEP 7 IMPLEMENTATION AUTHORIZED IN ISOLATED WORKSPACE)
* **Date:** 2026-08-11
* **Target:** Executable Autonomous Execution Orchestrator (`src/core/executionOrchestrator.js`)
* **Mode:** ISOLATED EXPERIMENT WORKSPACE ONLY (`.gemini/self-hosting-workspace/`)

---

## 1. Single Governance Intercept & Rollback Evidence Invariants

```text
  [ExecutionTask Ingest] ───> [Context Bundle Assembler] ───> [ExecutionPlanDAG]
                                                                     │
                                                                     ▼
                                                   [Governance Engine Gate]
                                                     (evaluateRequest / token)
                                                                     │
                                             ┌───────────────────────┴───────────────────────┐
                                             ▼                                               ▼
                                      [effect == ALLOW]                               [effect == BLOCK]
                                             │                                               │
                                             ▼                                               ▼
                                  [Execute DAG Nodes]                                [Halt & Set BLOCKED]
                                             │
                                     ┌───────┴───────┐
                                     ▼               ▼
                                 [SUCCESS]       [FAILURE / DIVERGENCE]
                                     │               │
                                     │               ├───────────────┐
                                     │               ▼               ▼
                                     │          [Scenario S4]   [Scenario S2]
                                     │         (Double Fail)    (Alt Mechanism)
                                     │               │               │
                                     │               ▼               ▼
                                     │     [Auto Rollback]    [Freeze Promotion]
                                     │               │               │
                                     │               └───────┬───────┘
                                     │                       ▼
                                     │             [1. Persist OOB Evidence (EVD-XXXX)]
                                     │             [2. Certify Evidence Integrity]
                                     │             [3. Governance Policy Decides Action]
                                     │                       │
                                     └───────────────────────┼───────────────────────┘
                                                             ▼
                                                   [DualValidationEngine (Phase G)]
```

1. **Governance Capability Intercept Invariant:** `ExecutionOrchestrator` **NEVER** self-authorizes task execution. Before transitioning from `PROPOSING` to `EXECUTING`, it MUST request authorization from `GovernanceEngine`. If Governance returns `BLOCK` or `REQUIRE_HUMAN_APPROVAL`, execution is immediately halted.
2. **Out-of-Band Evidence Persistence Before Rollback:** In the event of execution failure, `ObservationRecord` payloads are captured, persisted, and certified as `EVD-XXXX` in `docs/evidence/` **BEFORE** triggering clean rollback. Failure evidence is NEVER lost.
3. **`S2` vs `S4` Rollback Policy:** Scenario `S2` (Product PASS, Knowledge FAIL) does NOT automatically trigger rollback (the product functions via alternative mechanisms); it freezes promotion and delegates to Governance. Scenario `S4` (Double Failure) triggers clean rollback.
4. **No Shell Command Injection in Rollback:** Nodes specify `rollback_intent` enums (e.g. `'REVERT_WORKTREE'`). Nodes CANNOT supply arbitrary shell commands to execute during rollback.
5. **Non-Self-Expansion Authority Boundary:** The Orchestrator can execute authorized tasks within bounded target workspaces; it **CANNOT** modify `CONSTITUTION.md`, alter `POLICY_ENGINE.json`, or grant itself elevated execution privileges.

---

## 2. Canonical `ExecutionPlanDAG` & Task Schemas

```typescript
export type AuthorizationLevel = 
  | 'LEVEL_1_READ_ONLY' 
  | 'LEVEL_2_PROPOSAL' 
  | 'LEVEL_3_IMPLEMENTATION';

export type OrchestratorState = 
  | 'IDLE' 
  | 'DIAGNOSING' 
  | 'PROPOSING' 
  | 'EXECUTING' 
  | 'VALIDATING' 
  | 'LEARNING' 
  | 'COMPLETED' 
  | 'BLOCKED' 
  | 'ROLLBACK_TRIGGERED';

export type RollbackIntent = 
  | 'NONE'
  | 'REVERT_WORKTREE'
  | 'RESTORE_BASELINE_TAG';

export interface SubagentTaskNode {
  node_id: string;
  subagent_role: 'sdd-planner' | 'sdd-apply' | 'sdd-verify' | 'quality-auditor' | 'browser-qa';
  input_context: Record<string, any>;
  depends_on: string[]; // Parent node_ids in DAG
  timeout_ms: number;
  expected_artifact_path: string;
  rollback_intent: RollbackIntent; // SAFE ENUM ONLY (No Shell Strings!)
}

export interface ExecutionPlanDAG {
  plan_id: string;
  task_id: string;
  target_workspace_path: string;
  authorization_level: AuthorizationLevel;
  nodes: SubagentTaskNode[];
  execution_order: string[]; // Topologically sorted node_ids
  audit_metadata: {
    created_at: string;
    author: string;
    schema_version: string;
  };
}
```

---

## 3. Topologically Sorted Deterministic DAG Execution

```text
  Example Subagent DAG:
  
  [Node-01: sdd-planner] (Level 1 Context & Requirements)
        │
        ▼
  [Node-02: sdd-apply]   (Level 3 Code Implementation in Worktree)
        │
        ├───────────────────────────────┐
        ▼                               ▼
  [Node-03: quality-auditor]     [Node-04: browser-qa]
        │                               │
        └───────────────┬───────────────┘
                        ▼
  [Node-05: sdd-verify]  (Phase G Dual-Path Validation)
```

---

## 4. System Integration & Decoupled Authority Matrix

```text
  [ExecutionTask Ingest]
            │
            ▼
  [ExecutionOrchestrator] ───> Assembles Context, generates DAG, requests Governance Token
            │
            ▼
  [GovernanceEngine Module] ──> Checks policy risk & issues capability token (ALLOW / BLOCK)
            │
            ▼
  [Subagent Task Execution] ──> Executes DAG nodes in isolated worktree, captures observations
            │
            ▼
  [DualValidationEngine] ────> Executes Path A & B, verifies independence, outputs S1..S4
            │
            ▼
   [EvidenceEngine Module] ───> Assesses evidence sufficiency & assigns Epistemic State
```

| Action | ExecutionOrchestrator | GovernanceEngine | DualValidationEngine | EvidenceEngine |
| :--- | :---: | :---: | :---: | :---: |
| **Ingest Task & Assemble Context** | ✅ | ❌ | ❌ | ❌ |
| **Generate Topologically Sorted DAG** | ✅ | ❌ | ❌ | ❌ |
| **Issue Execution Capability Token** | ❌ | ✅ | ❌ | ❌ |
| **Execute Worktree Code Mutations** | ✅ | ❌ | ❌ | ❌ |
| **Verify Path Independence (S1..S4)** | ❌ | ❌ | ✅ | ❌ |
| **Assign Epistemic State** | ❌ | ❌ | ❌ | ✅ |

---

## 5. Conceptual API for `src/core/executionOrchestrator.js`

```javascript
export class ExecutionOrchestrator {
  /** Ingests ExecutionTask and validates target workspace path */
  ingestTask(task) {}

  /** Assembles ContextBundle with knowledge assets and active policies */
  buildContextBundle(task, knowledgePlaneEngine, governanceEngine) {}

  /** Generates a topologically sorted ExecutionPlanDAG */
  generateExecutionPlanDAG(contextBundle, nodes) {}

  /** Requests execution capability token from GovernanceEngine before Level 3 execution */
  async requestGovernanceAuthorization(dag, governanceEngine) {}

  /** Executes DAG nodes sequentially in isolated worktree workspace */
  async executeDAGPlan(dag, governanceToken) {}

  /** Executes out-of-band evidence persistence before clean Git rollback */
  async rollbackExecution(dag, failedNodeId, rawError, evidenceEngine) {}
}
```

---

## 6. Negative & Boundary Test Cases for Level 3 Implementation

1. **`UNAUTHORIZED_LEVEL_3_MUTATION`:** Attempting to execute Level 3 code mutations without a valid Governance capability token -> Must throw `AUTHORITY_VIOLATION` and set state to `BLOCKED`.
2. **`OOB_EVIDENCE_SAVED_BEFORE_ROLLBACK`:** Simulating a DAG node failure -> Must verify that `EVD-XXXX` evidence is written to disk BEFORE clean rollback occurs.
3. **`CIRCULAR_DAG_DEPENDENCY_REJECTED`:** Subagent DAG containing circular dependencies (`Node A -> Node B -> Node A`) -> Must fail topological sort with `CIRCULAR_DAG_DEPENDENCY`.
4. **`NODE_TIMEOUT_TRIGGER_ROLLBACK`:** Subagent task exceeding `timeout_ms` -> Must halt execution, persist timeout evidence, and trigger rollback.
5. **`WORKSPACE_ISOLATION_VIOLATION`:** Task attempting to mutate files inside EOS Core root (`C:\Users\valen\Documents\Eos system\src\`) during task execution -> Must throw `WORKSPACE_ISOLATION_VIOLATION`.
6. **`SELF_GOVERNANCE_MUTATION_ATTEMPT`:** Subagent node attempting to modify `POLICY_ENGINE.json` or `CONSTITUTION.md` -> Must throw `AUTHORITY_VIOLATION`.
7. **`S2_FREEZES_PROMOTION_S4_ROLLS_BACK`:** Scenario `S2` freezes promotion without automatic rollback; Scenario `S4` triggers clean rollback.
8. **`ORCHESTRATOR_EPISTEMIC_MUTATION_GUARD`:** Attempting to force `ExecutionOrchestrator` to assign `CONFIRMED_IN_SCOPE` directly -> Must throw `AUTHORITY_VIOLATION`.
9. **`ROLLBACK_COMMAND_INJECTION`:** Subagent node attempting to supply arbitrary shell execution strings during rollback -> Must throw `AUTHORITY_VIOLATION`.
