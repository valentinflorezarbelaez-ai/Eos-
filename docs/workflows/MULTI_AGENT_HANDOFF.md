# EOS MULTI-AGENT HANDOFF SPECIFICATION

## Overview
Defines the inter-agent delegation protocols, responsibilities, and structured handoff schemas across specialized EOS agents.

---

## Agent Topology & Roles

1. **RECON AGENT**: Workspace & dependency discovery (`list_dir`, `git status`).
2. **RESEARCH AGENT**: Industry benchmarking & documentation research (`search_web`).
3. **PRODUCT & INTAKE AGENT**: Client asset classification & requirements discovery.
4. **ARCHITECT AGENT**: System boundaries, data schemas, and ADR creation.
5. **IMPLEMENTATION AGENT**: Source code writing & refactoring.
6. **QA & TEST AGENT**: Unit, integration, and E2E test execution.
7. **SECURITY AUDITOR**: Secret scanning, SAST, dependency auditing.
8. **QUALITY AUDITOR**: Type safety, linting, cyclomatic complexity audits.
9. **ACCESSIBILITY AUDITOR**: WCAG AA compliance & screen reader auditing.
10. **PERFORMANCE AUDITOR**: Core Web Vitals & bundle budget audits.
11. **SEO AUDITOR**: Meta tags, Open Graph, & structured JSON-LD audits.
12. **BROWSER QA AGENT**: Visual QA & real browser flow verification.
13. **EVIDENCE AUDITOR**: Execution log validation & evidence record generation.
14. **RELEASE & DEPLOYMENT AGENT**: Production release & post-deployment smoke tests.

---

## Formal Handoff Schema

Inter-agent handoffs must be formatted under `docs/handoffs/<project-id>-<handoff-id>.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EOSAgentHandoff",
  "type": "object",
  "required": [
    "handoff_id",
    "project_id",
    "source_agent",
    "target_agent",
    "phase",
    "task",
    "context",
    "requirements",
    "constraints",
    "artifacts",
    "decisions",
    "assumptions",
    "risks",
    "expected_output",
    "verification_requirements",
    "status"
  ],
  "properties": {
    "handoff_id": { "type": "string" },
    "project_id": { "type": "string" },
    "source_agent": { "type": "string" },
    "target_agent": { "type": "string" },
    "phase": { "type": "string" },
    "task": { "type": "string" },
    "context": { "type": "string" },
    "requirements": { "type": "array", "items": { "type": "string" } },
    "constraints": { "type": "array", "items": { "type": "string" } },
    "artifacts": { "type": "array", "items": { "type": "string" } },
    "decisions": { "type": "array", "items": { "type": "string" } },
    "assumptions": { "type": "array", "items": { "type": "string" } },
    "risks": { "type": "array", "items": { "type": "string" } },
    "expected_output": { "type": "string" },
    "verification_requirements": { "type": "array", "items": { "type": "string" } },
    "evidence": { "type": "array", "items": { "type": "string" } },
    "status": { "type": "string", "enum": ["PENDING", "ACCEPTED", "COMPLETED", "REJECTED", "BLOCKED"] }
  }
}
