# ADR-0001: EOS Workspace Architecture & Governance Initialization

* **Status:** Accepted
* **Date:** 2026-08-10
* **Author:** EOS Autonomous Engineering System

## Context
The workspace `C:\Users\valen\Documents\Eos system` was empty and lacked source control, governance structures, architectural guidelines, and automated verification tools. Establishing a professional, reproducible engineering environment requires an upfront baseline architecture.

## Decision
We establish the core directory layout and governance model for EOS as follows:

1. **Git Control**: Initialize local Git repository with `.gitignore` and `.editorconfig`.
2. **Workspace Agents (`.agents/`)**: Establish local agent rules in `.agents/AGENTS.md` and workspace skills in `.agents/skills/`.
3. **Core Documentation (`docs/`)**: Store Constitution, Governance matrix, 21-step EOS Cycle, specifications (`docs/specs/`), and ADRs (`docs/architecture/adrs/`).
4. **Verification Automation (`scripts/`)**: Implement `scripts/verify-eos.js` for lightweight, zero-dependency validation of workspace health and evidence status.

## Consequences

### Positive
- Strict evidence-over-claims standard enforced automatically.
- Clear separation between autonomous decisions and human escalations.
- Zero-dependency node verification script ensures workspace health check.

### Negative
- Initial overhead of keeping documentation and evidence in sync with implementation changes.
