# EOS AUTONOMOUS ENGINEERING OPERATING LOOP ARCHITECTURE

* **Status:** APPROVED
* **Date:** 2026-08-11
* **Authority:** EOS Systems Architect & Operating Loop Lead

---

## 1. Architectural Overview
The **Autonomous Engineering Operating Loop** unifies all EOS engines built across Phases 13–19 into a single, auditable, evidence-first, tool-agnostic engineering lifecycle controller.

```text
                  +-----------------------------------+
                  |         MISSION INGESTION         |
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  |   DISCOVERY, RESEARCH, SPEC & ARCH|
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  |    STRATEGY & DECISION OPTIMIZER  |
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  | AGENT COUNCIL & TOOL ROUTING ENGINE|
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  | AUTHORIZATION & 3-LEVEL SCOPE GATE|
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  | EXECUTION RUNTIME & RECOVERY LOOP |
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  | VERIFICATION, EVIDENCE & AUDIT    |
                  +-----------------------------------+
                                    |
                  +-----------------------------------+
                  | LEARNING & SELF-EVALUATION LOOP   |
                  +-----------------------------------+
```

---

## 2. 27-State Lifecycle Transition Pipeline
1. `RECEIVED`
2. `DISCOVERING`
3. `RESEARCHING`
4. `REQUIREMENTS_READY`
5. `SPECIFICATION_READY`
6. `ARCHITECTURE_READY`
7. `STRATEGIES_READY`
8. `DECISION_READY`
9. `AGENTS_ASSIGNED`
10. `CAPABILITIES_RESOLVED`
11. `TOOLS_RESOLVED`
12. `AUTHORIZATION_PENDING`
13. `AUTHORIZED`
14. `PLANNED`
15. `EXECUTING`
16. `VERIFYING`
17. `EVIDENCE_PENDING`
18. `AUDITING`
19. `RELEASE_REVIEW`
20. `LEARNING`
21. `SELF_EVALUATING`
22. `EVOLUTION_PENDING`
23. `COMPLETED`
24. `BLOCKED`
25. `FAILED`
26. `ABORTED`
27. `ROLLED_BACK`

---

## 3. 3-Level Read/Write Scope Isolation
- `READ_ONLY`: Inspection, research, discovery, analysis. No file modifications allowed.
- `SANDBOX_WRITE`: Execution restricted exclusively to synthetic mock fixtures under `tests/fixtures/`.
- `EXTERNAL_WRITE`: Writing to external repositories (e.g. `Fundacion`) strictly **FORBIDDEN** during EOS Development Mode. Requires explicit `IMPLEMENTATION_AUTHORIZED` Level 2+ record.
