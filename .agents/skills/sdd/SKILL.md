---
name: sdd
description: "Spec Driven Development workflow skill for EOS workspace."
---

# Spec Driven Development (SDD) Skill

## Purpose
Enforces specification-first engineering for non-trivial features, refactoring, and subsystem implementations.

## Workflow

1. **Specification Phase**:
   - Write or update spec in `docs/specs/<feature-name>.md`.
   - Define exact user goals, component boundaries, inputs, outputs, error conditions, and acceptance criteria.

2. **Design Phase**:
   - Define module interfaces, data models, and architecture.
   - Document any architectural decisions in `docs/architecture/adrs/`.

3. **Implementation Phase**:
   - Write clean, type-safe, minimal code fulfilling the spec.
   - Implement incremental tests parallel to implementation.

4. **Validation Phase**:
   - Execute test suite and automated checks.
   - Record verification status in `docs/evidence/`.
