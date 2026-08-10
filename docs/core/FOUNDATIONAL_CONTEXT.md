# EOS — FOUNDATIONAL CONTEXT
## Tool-Agnostic Engineering Intelligence & Control Plane Architecture

* **Status:** APPROVED PERMANENT ARCHITECTURAL CONTEXT
* **Date:** 2026-08-10
* **Authority:** EOS System Architect & Product Owner Directive

---

## 1. Executive Summary & Purpose
EOS (Engineering Operating System) is an autonomous, tool-agnostic **Engineering Intelligence & Control Plane**. It is NOT a chatbot, coding agent, SDK wrapper, prompt collection, or Cursor/Claude replacement. EOS operates above specific tools, coordinating knowledge, research, specifications, agents, policies, dry-run simulations, execution, verification, evidence, and continuous learning to automate engineering lifecycles safely.

---

## 2. Core Architectural Principles

### P1. Tool-Agnostic Hierarchy
The engineering process defines capability requirements; capabilities determine candidate agents and tools:
```text
BUSINESS INTENT -> RESEARCH -> SPECIFICATION -> TASK GRAPH -> CAPABILITY MATCH -> AGENT/TOOL ADAPTER -> EXECUTION -> EVIDENCE -> META-VERIFICATION -> LEARNING
```

### P2. Capability-First Decision Engine
EOS selects tools dynamically based on **Capabilities, Cost, Latency, Reliability, Security, Evidence Requirements, and Risk** rather than hardcoded vendor brand bindings.

### P3. Multi-Level Progressive Autonomy
Autonomy is earned through verifiable evidence, progressing across 6 levels:
- **L0 Observe**: Read-only monitoring.
- **L1 Analyze**: Intake discovery & gap classification.
- **L2 Propose**: SPEC & ADR drafting.
- **L3 Simulate**: Dry-run policy evaluation.
- **L4 Execute Controlled**: Authorized local target writes (`LEVEL 2+`).
- **L5 Execute Autonomous**: Pre-authorized Control Plane self-development.
- **L6 Self-Optimize**: Evidence-based policy & blueprint evolution.

### P4. Non-Destructive Operation & Absolute Isolation
- **EOS Development Mode**: External projects are strictly `READ-ONLY / FROZEN` (`WRITE = FORBIDDEN`).
- **Read -> Analyze -> Plan -> Dry Run -> Authorize -> Write** sequence enforced prior to any physical state mutation.

### P5. Meta-Engineering & Continuous Research
EOS continuously investigates industry best practices (Google SRE, OpenAI, Anthropic, Microsoft, Netflix, Gentleman/Engram) separating `SOURCE -> OBSERVATION -> CLAIM -> EVIDENCE -> INFERENCE -> PATTERN -> DECISION`.

### P6. Project Agnosticism
EOS is built **before** external target projects. External projects are intake targets governed by EOS, never sandboxes for inventing EOS.

---

## 3. Mandatory Verification Contract
No capability or claim is valid until backed by reproducible execution evidence (`VERIFIED`).
```text
DESIGNED != IMPLEMENTED != EXECUTABLE != TESTED != VERIFIED != EMPIRICALLY VALIDATED != PRODUCTION PROVEN
```
