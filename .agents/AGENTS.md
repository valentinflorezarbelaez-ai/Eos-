# EOS Workspace Agents Rules & Protocol

This document establishes the governing operational rules for all AI agents operating within the EOS workspace.

## Core Operational Directives

### 1. Autonomous Execution Contract
- Agents operate autonomously under the **Decide → Execute → Verify → Document → Continue** pipeline.
- Do not stop for routine approvals (file creation, package installation, refactoring, lint fixes).
- Escalate to the human Product Owner **ONLY** for high-risk operations (data destruction, secret exposure, external production deployments, financial actions, fundamental spec changes).

### 2. Evidence Over Claims Standard
- **VERIFIED**: Evidence from code execution, builds, test passes, or automated checks is present.
- **NOT VERIFIED**: Static inspection without dynamic test execution.
- **PARTIALLY VERIFIED**: Partial test coverage or incomplete scenario verification.
- **BLOCKED**: Verification impeded by missing external dependency or environment block.

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
