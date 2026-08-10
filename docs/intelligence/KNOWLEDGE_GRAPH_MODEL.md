# EOS KNOWLEDGE GRAPH MODEL

* **Status:** APPROVED
* **Date:** 2026-08-10

---

## 1. Overview
The EOS Knowledge Graph Model defines the logical relationships governing how raw external research is refined into actionable agent skills, governance policies, and verified execution outcomes.

---

## 2. Relational Schema Hierarchy

```text
SOURCE (SRC-*)
  ↓ validates
CLAIM / RESEARCH (RSC-*)
  ↓ produces
EVIDENCE (EVD-*)
  ↓ distills into
PATTERN (PAT-*) / ANTI-PATTERN (ANT-*)
  ↓ extracts
CAPABILITY (CAP-*)
  ↓ evaluates via
DECISION (DEC-INT-*)
  ↓ implements as
SKILL / POLICY (POL-*)
  ↓ executes through
AGENT (AGT-*) & WORKFLOW
  ↓ generates
NEW EVIDENCE (EVD-*)
  ↓ feeds
CONTINUOUS LEARNING LOOP
```

---

## 3. Node Identifiers & Relationship Integrity
- `Source`: `SRC-0001` through `SRC-9999` (`docs/intelligence/sources/`)
- `Research`: `RSC-0001` through `RSC-9999` (`docs/intelligence/research/`)
- `Pattern`: `PAT-0001` through `PAT-9999` (`docs/intelligence/patterns/`)
- `AntiPattern`: `ANT-0001` through `ANT-9999` (`docs/intelligence/anti-patterns/`)
- `Capability`: `CAP-0001` through `CAP-9999` (`docs/intelligence/capabilities/`)
- `Decision`: `DEC-INT-0001` through `DEC-INT-9999` (`docs/intelligence/decisions/`)
- `Policy`: `POL-001` through `POL-999` (`docs/policies/`)
- `Evidence`: `EVD-0001` through `EVD-9999` (`docs/evidence/`)
