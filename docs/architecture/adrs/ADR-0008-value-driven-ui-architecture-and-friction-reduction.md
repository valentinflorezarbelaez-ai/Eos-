# ADR-0008: Value-Driven UI Architecture & Epistemic Separation

* **Status:** Accepted
* **Date:** 2026-08-14
* **Author:** EOS Principal Systems Architect

---

## 1. Context
User validation experiments (`VAL-EVD-001`) revealed that UI complexity without verified user justification causes cognitive friction, lower task completion, and reduced institutional trust. Furthermore, past iterations occasionally mixed raw behavioral telemetry with subjective design opinions.

---

## 2. Decision
We mandate a strict **Value-Driven Component Architecture** across all EOS target projects:

1. **Evidence-Linked Components:** No UI component or section may be introduced unless linked to an authorized requirement derived from verified user research (`JTBD`) or compliance mandates.
2. **Epistemic Layer Separation:** UI telemetry and instrumentation must separate raw interaction observations from qualitative interpretations and product decisions.
3. **Progressive Disclosure Pattern:** Critical legal and identity proofs (NIT, Chamber of Commerce, accreditation) must be immediately accessible in top-level viewports/footers without requiring multi-step navigation.
4. **Zero Ornamental Bloat:** Visual styling, micro-animations, and interactions must serve task clarity and WCAG AA contrast; purely decorative elements with zero functional outcome are rejected by the Product Decision Engine.

---

## 3. Consequences

### Positive
- Direct tracing from user friction to code structure.
- Prevents scope creep and ornamental complexity.
- Consistent, auditable user outcomes across multi-project targets.

### Negative
- Requires upfront user research evidence before drafting UI code.
- Slight overhead in maintaining explicit requirement-to-evidence links.
