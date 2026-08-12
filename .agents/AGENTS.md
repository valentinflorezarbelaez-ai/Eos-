# EOS Workspace Agents Rules & Protocol

This document establishes the governing operational rules for all AI agents operating within the EOS workspace.

## Core Operational Directives

### 1. Autonomous Execution Contract
- Agents operate autonomously under the **Decide → Execute → Verify → Document → Continue** pipeline.
- Do not stop for routine approvals (file creation, package installation, refactoring, lint fixes).
- Escalate to the human Product Owner **ONLY** for high-risk operations (data destruction, secret exposure, external production deployments, financial actions, fundamental spec changes).

### 2. Evidence Over Claims Standard & Taxonomy
No agent may state `DONE`, `PASS`, `VERIFIED`, `SECURE`, `OPTIMIZED`, or `PRODUCTION READY` without referencing executable evidence or automated check output.

**Epistemic Validation States (MANDATORY)**:
- `AUDIT_EXECUTED`: Tests/checks have run; raw results gathered.
- `FINDINGS_IDENTIFIED`: Bugs or regressions have been documented from the audit.
- `REMEDIATION_REQUIRED`: A plan to fix findings is needed.
- `REMEDIATION_IN_PROGRESS`: Fixes are currently being developed/applied.
- `REVALIDATION_REQUIRED`: Fixes applied, awaiting regression tests.
- `VERIFIED`: Evidence from code execution, builds, test passes, or automated checks confirms fixes worked.
- `PRODUCTION_READY_WITHIN_TESTED_SCOPE`: Zero open findings strictly within executed scenarios and recorded evidence.
- `PRODUCTION_READY`: Zero open findings across all required production quality dimensions.

**Evidence Confidence Levels**:
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

### 5. Mandatory External Write Barrier & Autonomous Scope Limits
- **EOS Development Mode**: During Control Plane self-development or framework audits, writing to external target project directories (e.g., `C:\Users\valen\Documents\Fundacion`) is strictly **FORBIDDEN**.
- **External Write Preconditions**: Writing to an external project repository requires verified evidence of:
  1. `REGISTERED` status in `docs/projects/registry.json`.
  2. `INTAKE_COMPLETE` status in `docs/intake/`.
  3. `SPECIFICATION_APPROVED` status in `docs/specs/`.
  4. `AUDIT_COMPLETE` status in `docs/audits/`.
  5. `OWNER_APPROVAL` recorded in decision records.
  6. `IMPLEMENTATION_AUTHORIZED` status (`LEVEL 2` or higher) in `IMPLEMENTATION_AUTHORIZATION.md`.
- **Autonomy Boundaries**: `AUTONOMOUS` operational mode grants authority within authorized Control Plane scope. Autonomy does NOT permit modifying external code without an explicit `IMPLEMENTATION_AUTHORIZED` record or an approved `EXTERNAL_PROJECT_WRITE_EXCEPTION`.

## EOS 21-Step Engineering Pipeline

```text
INTAKE → RECONNAISSANCE → CONTEXT UNDERSTANDING → REQUIREMENTS → RESEARCH → 
ARCHITECTURE → DESIGN → IMPLEMENTATION → TESTING → SECURITY → QUALITY → 
ACCESSIBILITY → PERFORMANCE → SEO → BROWSER QA → EVIDENCE → DOCUMENTATION → 
DEPLOYMENT → POST-DEPLOYMENT VERIFICATION → LEARNING → CONTINUOUS IMPROVEMENT
```

