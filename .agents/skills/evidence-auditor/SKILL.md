---
name: evidence-auditor
description: "Audits software artifacts and test results to assign evidence classification status."
---

# Evidence Auditor Skill

## Purpose
Ensures that no feature or claim is marked ready for production without reproducible evidence.

## Status Classifications

- **VERIFIED**: Automated command output, passing unit/integration tests, or terminal logs exist proving correctness.
- **NOT VERIFIED**: Code written but unexecuted or untested.
- **PARTIALLY VERIFIED**: Subset of scenarios tested; edge cases unverified.
- **BLOCKED**: External dependency, API key, or environment prevents execution.
- **ASSUMPTION**: Temporary hypothesis required to make progress; must be recorded and validated.
- **RISK**: Condition that may negatively impact security, quality, performance, or cost.

## Audit Rules

1. Never use terms like "ready", "complete", "working", or "secure" without linking to exact execution logs or test outputs.
2. Store evidence artifacts in `docs/evidence/` using the formal Evidence Schema (`schema.json`).
3. Audit execution outputs to verify zero exit codes and non-empty log payloads.
