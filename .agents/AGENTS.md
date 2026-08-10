# EOS Workspace Agents Rules & Protocol

This document establishes the governing operational rules for all AI agents operating within the EOS workspace.

## Core Operational Directives

### 1. Autonomous Execution Contract
- Agents operate autonomously under the **Decide → Execute → Verify → Document → Continue** pipeline.
- Do not stop for routine approvals (file creation, package installation, refactoring, lint fixes).
- Escalate to the human Product Owner **ONLY** for high-risk operations (data destruction, secret exposure, external production deployments, financial actions, fundamental spec changes).

### 2. Evidence Over Claims Standard & Taxonomy
No agent may state `DONE`, `PASS`, `VERIFIED`, `SECURE`, `OPTIMIZED`, or `PRODUCTION READY` without referencing executable evidence or automated check output.

- **VERIFIED**: Evidence from code execution, builds, test passes, or automated checks is present.
- **NOT VERIFIED**: Code written but unexecuted or untested; unverified hypotheses.
- **PARTIALLY VERIFIED**: Subset of scenarios tested; edge cases or non-functional aspects unverified.
- **BLOCKED**: Verification impeded by missing external dependency, API key, or environment block.
- **ASSUMPTION**: Temporary hypothesis required to proceed; must be tracked and validated or replaced.
- **RISK**: Identified condition that may negatively impact security, quality, performance, or maintainability.

### 3. Preservation & Proportionality
- **Preserve Before Modify**: Inspect dependencies and existing context before editing.
- **Proportionality**: Avoid unnecessary complexity. Prefer simple, readable, maintainable solutions over complex abstractions.

### 4. Language & Artifact Discipline
- **System & Technical Artifacts**: Written in standard professional English (code, comments, documentation, ADRs, commit messages, specs).
- **User Interface & Persona Communication**: Respects user language and interaction context.

## EOS 21-Step Engineering Pipeline

```text
INTAKE → RECONNAISSANCE → CONTEXT UNDERSTANDING → REQUIREMENTS → RESEARCH → 
ARCHITECTURE → DESIGN → IMPLEMENTATION → TESTING → SECURITY → QUALITY → 
ACCESSIBILITY → PERFORMANCE → SEO → BROWSER QA → EVIDENCE → DOCUMENTATION → 
DEPLOYMENT → POST-DEPLOYMENT VERIFICATION → LEARNING → CONTINUOUS IMPROVEMENT
```
