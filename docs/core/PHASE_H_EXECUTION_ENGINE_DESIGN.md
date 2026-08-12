# PHASE H: EOS EXECUTION & AUTONOMOUS ORCHESTRATION ENGINE DESIGN

* **Phase:** PHASE H — EXECUTION & AUTONOMOUS ORCHESTRATION ENGINE
* **Status:** DESIGN SPECIFIED (PHASE H DESIGN COMPLETE)
* **Date:** 2026-08-11
* **Scope:** Internal Execution & Orchestration Engine Architecture (`C:\Users\valen\Documents\Eos system`)

---

## 1. Core Architectural Invariant

> [!IMPORTANT]
> **The Workspace Isolation & Permanence Invariant:**
> EOS Core (`C:\Users\valen\Documents\Eos system`) remains permanent and strictly external to all target project workspaces.
>
> EOS Core orchestrates work in target workspaces through a strictly bounded **Workspace Isolation Barrier**, preventing target project code from contaminating EOS Core.

```text
                                EOS CORE SYSTEM
                    (Permanent Engineering OS Engine)
                                   │
                                   ▼
                   WORKSPACE ISOLATION BOUNDARY
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
   Target Workspace 1      Target Workspace 2      Target Workspace N
   (Andes-Retreat)         (Sonrisa-Nova)          (FlowDesk / Future)
```

---

## 2. The Complete End-to-End Autonomous Cycle

```text
                       EOS CORE ENGINE
                              │
                              ▼
                     INTENT / TASK INGEST
                              │
                              ▼
                     CONTEXT ASSEMBLER & KNOWLEDGE QUERY
                              │
                              ▼
                     DECISION ENGINE (ADR Generation & Governance Check)
                              │
                              ▼
                     EXECUTION PLAN (Dynamic Subagent DAG)
                              │
                  ┌───────────┼───────────┐
                  ▼           ▼           ▼
             [Plan Phase] [Build Phase] [Test Phase]
                  │           │           │
                  └───────────┼───────────┘
                              ▼
                    DUAL-PATH VALIDATION (Phase G)
                              │
                              ▼
                    EVIDENCE ENGINE (Phase C)
                              │
                              ▼
                    GOVERNANCE & LIFECYCLE (Phase D)
                              │
                              ▼
                    KNOWLEDGE PLANE UPDATE (Phase B)
```

---

## 3. Orchestrator State Machine

```text
  [IDLE]
    │
    v (Receive Task & Target Workspace)
  [DIAGNOSING] (Level 1: Domain & Context Assembly)
    │
    v (PO Approval / Gate Pass)
  [PROPOSING]  (Level 2: Decision Engine & ADR Generation)
    │
    v (PO Approval / Gate Pass)
  [EXECUTING]  (Level 3: Dynamic Subagent DAG Execution)
    │
    v (Build Complete)
  [VALIDATING] (Phase G: Dual-Path Product & Knowledge Validation)
    │
    v (Evidence Collected)
  [LEARNING]   (Phase C & D: Epistemic Assessment & Knowledge Promotion)
    │
    v
  [COMPLETED] / [BLOCKED]
```

---

## 4. Entity & Type Specifications (TypeScript)

```typescript
export type AuthorizationLevel = 
  | 'LEVEL_1_READ_ONLY' 
  | 'LEVEL_2_PROPOSAL' 
  | 'LEVEL_3_IMPLEMENTATION';

export interface ExecutionTask {
  task_id: string;
  intent: string;
  target_workspace_path: string; // Absolute path to external project
  authorization_level: AuthorizationLevel;
  constraints: string[];
  created_at: string;
}

export interface ContextBundle {
  task_id: string;
  target_workspace_path: string;
  workspace_files_snapshot: string[];
  retrieved_knowledge_assets: string[]; // Asset IDs from Phase B
  active_governance_policies: string[];  // Policy IDs from Phase D
}

export interface SubagentTaskNode {
  node_id: string;
  subagent_role: 'sdd-planner' | 'sdd-apply' | 'sdd-verify' | 'quality-auditor' | 'browser-qa';
  input_context: Record<string, any>;
  depends_on: string[]; // Parent node_ids in DAG
  expected_artifact_path: string;
}

export interface ExecutionPlanDAG {
  plan_id: string;
  task_id: string;
  nodes: SubagentTaskNode[];
  execution_order: string[]; // Topologically sorted node_ids
}
```

---

## 5. Phase H Exit Check

- **Core Invariant:** Enforced (EOS Core is permanent & external; target projects are bounded workspaces).
- **End-to-End Cycle:** Formally specified (`Ingest -> Context -> Decision -> Plan -> Build -> Test -> Validate -> Evidence -> Governance -> Learn`).
- **Orchestrator State Machine:** Specified (`IDLE` -> `DIAGNOSING` -> `PROPOSING` -> `EXECUTING` -> `VALIDATING` -> `LEARNING` -> `COMPLETED`).
- **Isolation Barrier:** Enforced (Explicit path boundary checking prevents external code contamination into `Eos system`).
