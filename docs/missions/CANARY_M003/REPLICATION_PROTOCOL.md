# CANARY-M003: Third Replication Protocol & Methodological Limits

**Mission ID:** `CANARY-M003`  
**Candidate Observation:** `OBS-CANARY-001`  
**Protocol Version:** `3.0.0`  
**Date:** 2026-08-14  

---

## 1. Explicit Methodological Limit on Relative Retention Ratios

> [!IMPORTANT]
> **Methodological Note on Retention Ratios:**  
> The descriptive metric $\frac{\Delta\text{Outcome}_{Mx}}{\Delta\text{Outcome}_{My}}$ represents a descriptive relative change indicator, but **cannot be interpreted as a direct causal comparative measure across distinct missions**. M001, M002, and M003 evaluate different task definitions, different user cohorts, and different control baselines. True replication evidence is established by **consistent positive direction**, **absence of safety regressions**, and **reproducible containment under novel adversarial conditions**, not arithmetic parity of delta ratios.

---

## 2. Invariants vs. Distinct Domain Variables (M001 vs M002 vs M003)

| Dimension | CANARY-M001 | CANARY-M002 | CANARY-M003 (Replication #3) |
|---|---|---|---|
| **Underlying Principle** | Edge-level sanitization + friction reduction | Edge-level sanitization + friction reduction | **INVARIANT:** Deterministic client-side sanitization |
| **Component Name** | `DiagnosticReporter.js` | `ContactSupportDispatcher.js` | `ConfigPayloadImporter.js` |
| **Domain / JTBD** | Error reporting & feedback | Multi-field structured support | Deep nested configuration import & batch metadata |
| **Data Complexity** | 1 string + environment context | 4 form inputs + PII (PAN/SSN) | Deep nested objects (5+ levels), arrays, Base64 strings, circular refs |
| **Cohort** | `COHORT-CANARY-A1` ($N=15$) | `COHORT-CANARY-B2` ($N=20$) | `COHORT-CANARY-C3` ($N=25$) |
| **Control Baseline** | $58.0\%$ | $52.0\%$ | $48.0\%$ |
| **Adversarial Category** | Unicode, token, XSS | Double-URL, PANs, Prototype keys | Base64 token injection, circular recursion, null bytes, escaped shell chars |

---

## 3. Five Core Verification Questions for M003
1. **Context Transfer:** Does the strategy work when parsing deeply nested config payloads?
2. **Directional Benefit:** Is completion rate improvement $> +30\%$ over baseline?
3. **Safety Preservation:** Zero secret leaks out of 25 cohort sessions and 5 novel adversarial attacks?
4. **Economic Efficiency:** Component size $< 35\text{ KB}$, latency $< 15\text{ms}$?
5. **Epistemic Qualification:** Does evidence warrant global `BKM` or contextual `BKM_FOR_CLIENT_SIDE_INPUT_SANITIZATION`?
