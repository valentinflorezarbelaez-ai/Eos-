# EOS GOVERNANCE & ESCALATION MODEL

## Overview
This document defines the decision matrix governing autonomous operations versus operations requiring human intervention from the Product Owner.

---

## Decision Escalation Matrix

| Decision Level | Category | Examples | Execution Mode |
| --- | --- | --- | --- |
| **Level 0** | Routine Engineering | Code formatting, refactoring, writing unit tests, creating documentation | Autonomous Execution |
| **Level 1** | Architectural Choices | Module boundaries, ADR creation, internal interface design | Autonomous Execution (with ADR) |
| **Level 2** | Dependencies & Packages | Installing npm packages, dev tooling, framework setup | Autonomous Execution (with lockfile audit) |
| **Level 3** | Fundamental Business Requirements | Changing core application scope, removing core features | Human Escalation Required |
| **Level 4** | High-Risk & Security | Permanent data deletion, committing secrets, external production deployments | Human Escalation Required |
| **Level 5** | Financial & External | Purchasing services, external communications, domain changes | Human Escalation Required |

---

## Evidence & Promotion Gates

Before declaring any task or phase complete, the following gates must pass:

1. **Lint & Build Gate**: Clean build with zero syntax or compilation errors.
2. **Verification Gate**: Execution of test script (`npm run verify -- --strict`) or automated evidence log.
3. **Classification Gate**: Every claim assigned one of the 6 formal statuses (`VERIFIED`, `NOT VERIFIED`, `PARTIALLY VERIFIED`, `BLOCKED`, `ASSUMPTION`, `RISK`).
4. **Traceability Gate**: Commit created with clear conventional commit messaging.

---

## Human Decision Authority

The human Product Owner retains exclusive authority over:
- Product direction & business scope.
- Financial transactions & service purchases.
- Production releases & public deployments.
- Irreversible infrastructure actions & data destruction.
- Credential & secret rotation.
