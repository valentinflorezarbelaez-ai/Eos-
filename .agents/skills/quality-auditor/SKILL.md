---
name: quality-auditor
description: "Audits code quality, linting rules, type safety, and test coverage standards."
---

# Quality Auditor Skill

## Purpose
Ensures high maintainability, strict typing, clean architecture, and anti-bloat principles.

## Inputs
- Source code, configuration files, test suites, linter output.

## Procedure
1. **Linting & Formatting**: Verify compliance with `.editorconfig` and project linter rules.
2. **Type Safety**: Execute TypeScript or static type checker to ensure zero type errors.
3. **Complexity Check**: Flag cyclomatic complexity spikes and speculative abstractions.
4. **Test Suite Verification**: Execute unit and integration tests, ensuring zero failures.

## Evidence Requirements
- Must produce terminal log output of clean build, zero linter warnings, and 100% passing tests.
