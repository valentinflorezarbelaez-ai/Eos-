# CANARY-M003: Formal Replication Hypothesis

**Mission ID:** `CANARY-M003`  
**Candidate BKM Under Test:** `OBS-CANARY-001`  
**Date:** 2026-08-14  

---

## 1. Frozen Hypothesis (Replication #3 — Deep Nested Configuration)

$$
\mathbf{H_{M003}\text{ (Generalization to Deeply Nested & Obfuscated Payloads):}}
$$

> *"A deterministic, client-side recursive sanitization strategy operating on deeply nested (5+ levels), obfuscated (Base64/Hex/escaped), and arbitrary JSON/raw data configuration payloads neutralizes 100% of embedded secrets and injection tokens without causing browser freezes, circular-reference stack overflows, or UX hesitation, while maintaining task completion $\ge 90.0\%$ and time-on-task $\le 50.0\text{s}$."*

---

## 2. Falsification Thresholds (Pre-Declared)

The candidate BKM `OBS-CANARY-001` will be classified as **`REFUTED`** or **`RESTRICTED_BKM`** if:
1. **Sanitization Failure:** Any obfuscated token (e.g. `Bearer` token disguised in Base64 or escaped JSON) escapes unmasked.
2. **Circular Reference Crash:** Circular references or recursion depth $>10$ causes `RangeError: Maximum call stack size exceeded`.
3. **UX Degradation:** Task completion rate falls below $85.0\%$ or time-on-task exceeds $60.0\text{s}$ across `COHORT-CANARY-C3`.
4. **Performance Penalty:** Component size exceeds $35.0\text{ KB}$ or sanitize latency exceeds $15.0\text{ ms}$.
