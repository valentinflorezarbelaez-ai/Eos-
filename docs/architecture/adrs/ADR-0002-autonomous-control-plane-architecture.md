# ADR-0002: Autonomous Engineering Control Plane Architecture

* **Status:** APPROVED
* **Date:** 2026-08-10
* **Context:** EOS Control Plane v0.2.0 requires an architectural evolution from single-agent execution to a local-first, multi-agent, evidence-driven Autonomous Engineering Control Plane capable of governing complex software projects safely without accidental external code mutations.

---

## 1. Problem Statement
Single-agent execution creates risks of premature external project modification, scope creep, and unverified completion claims. EOS requires a structured Control Plane architecture that enforces strict role separation, task decomposition, capability-based agent selection, dry-run simulation, policy evaluation (`ALLOW`, `DENY`, `ESCALATE`), and evidence-first traceability.

---

## 2. Decision
We adopt a **Local-First Autonomous Engineering Control Plane Architecture** composed of five core engines:

```text
               +----------------------------------+
               |     EOS CONTROL PLANE ENGINE     |
               +----------------------------------+
                                |
       +------------------------+------------------------+
       |                        |                        |
+--------------+        +---------------+        +---------------+
| AGENT        |        | POLICY        |        | DECISION &    |
| REGISTRY     |        | ENGINE        |        | AUTHORIZATION |
+--------------+        +---------------+        +---------------+
       |                        |                        |
+--------------+        +---------------+        +---------------+
| STATE        |        | DRY-RUN       |        | EVIDENCE &    |
| MACHINE      |        | ENGINE        |        | KNOWLEDGE     |
+--------------+        +---------------+        +---------------+
```

1. **Agent Registry & Selection Engine (`docs/agents/`)**: Manages 16 specialized agent roles and capability matching.
2. **Policy Engine (`docs/policies/`)**: Evaluates requested actions against governance rules, returning `ALLOW`, `DENY`, or `ESCALATE`.
3. **Project State Machine (`docs/projects/STATE_MACHINE.json`)**: Governs 19 formal project lifecycle states.
4. **Dry-Run Engine & Rollback Strategy (`docs/orchestration/`)**: Simulates external actions before execution and records reversible state changes.
5. **Knowledge & Learning System (`docs/knowledge/`)**: Transforms evidence into reusable governance policies and engineering standards.

---

## 3. Invariants & Safety Rules
- **EOS Development Mode**: External project `WRITE = FORBIDDEN` during self-development mode.
- **Evidence Requirement**: No status claim (`VERIFIED`, `DONE`, `SECURE`, `PASS`) is valid without executable evidence.
- **Scope Limitation**: Authorizations specify explicit paths, actions, and expiration timestamps (`WRITE_ANYWHERE` is strictly forbidden).

---

## 4. Consequences
- **Positive**: Complete isolation of external target repositories, zero risk of premature unapproved code creation, transparent multi-agent handoffs, and reproducible audit trails.
- **Negative**: Increased governance structure and schema validation requirements before external writes are permitted.
