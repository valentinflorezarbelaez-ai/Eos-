# EOS AUTONOMOUS EXECUTION RUNTIME & ORCHESTRATION ARCHITECTURE

* **Status:** APPROVED
* **Date:** 2026-08-11
* **Authority:** EOS System Architect & Execution Governance

---

## 1. Architectural Overview
The **Autonomous Execution Runtime** decouples the **Control Plane** (intent, policy, risk, authorization, planning) from the **Execution Plane** (tool adapters, synthetic actions, execution graph).

```text
                  +-----------------------------------+
                  |        EOS CONTROL PLANE          |
                  | (Plan, Policy, Autonomy, Risk)    |
                  +-----------------------------------+
                                    |
                         Versioned Execution Plan
                                    v
                  +-----------------------------------+
                  |    AUTONOMOUS EXECUTION RUNTIME   |
                  | (Dependency DAG & State Engine)   |
                  +-----------------------------------+
                                    |
         +--------------------------+--------------------------+
         |                          |                          |
+-------------------+      +-------------------+      +-------------------+
| ACTION EXECUTION  |      |  FAILURE & REPLAN |      | EVIDENCE & STATE  |
| (Adapters & Tools)|      |   ENGINE (R1/R2)  |      | AUDITOR (EVD-0014)|
+-------------------+      +-------------------+      +-------------------+
```

---

## 2. 16-State Action Lifecycle Machine
Every action in the execution graph progresses through a strict 16-state machine:
1. `PLANNED`
2. `VALIDATING`
3. `AUTHORIZED`
4. `READY`
5. `RUNNING`
6. `SUCCEEDED`
7. `FAILED`
8. `RETRYING`
9. `BLOCKED`
10. `REPLANNING`
11. `VERIFICATION_PENDING`
12. `VERIFIED`
13. `PARTIALLY_VERIFIED`
14. `ROLLBACK_PENDING`
15. `ROLLED_BACK`
16. `ABORTED`

---

## 3. Core Execution Principles
- **Prerequisite Enforcement**: Dependent actions cannot enter `RUNNING` until all antecedent tasks are in `VERIFIED` or `SUCCEEDED` state.
- **Versioned Replanning**: Failures that trigger replanning emit versioned revisions (`PLAN-001-R1`) preserving historical execution logs.
- **Strict Write Barrier**: Actions targeting unauthorized external paths (`C:\Users\valen\Documents\Fundacion`) immediately transition to `BLOCKED` / `ABORTED`.
- **Evidence Gating**: Final execution verification requires an immutable evidence payload (`EVD-0014.json`).
