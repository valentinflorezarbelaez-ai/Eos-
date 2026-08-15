# CANARY-M002: Formal Replication Hypothesis

**Mission:** `CANARY-M002`  
**Candidate BKM Under Test:** `OBS-CANARY-001`  
**Date:** 2026-08-14  

---

## 1. Frozen Replication Hypothesis

$$
\mathbf{H_{M002}\text{ (Generalization of Edge Sanitization):}}
$$

> *"A deterministic, client-side sanitization strategy operating on multi-field structured payloads reduces credential and PII leakage to 0% across complex form workflows, while maintaining task completion $\ge 90\%$, time-on-task $\le 50\text{s}$, and bundle overhead $< 35\text{ KB}$, without requiring heavy third-party vendor SDKs."*

---

## 2. Pre-Declared Falsification Thresholds

The candidate BKM `OBS-CANARY-001` shall be marked **`REFUTED`** or **`PARTIALLY_SUPPORTED`** if any of the following occur during `CANARY-M002`:

1. **Security Leakage:** Any plaintext credit card PAN (13-19 digits with Luhn pass), SSN, phone PII, Bearer token, or API key escapes client-side sanitization into the telemetry payload.
2. **Performance Bloat:** Total component footprint exceeds $35.0\text{ KB}$ or mount latency exceeds $10.0\text{ ms}$.
3. **UX Friction Breakdown:** Task completion rate falls below $85.0\%$ or average time-on-task exceeds $60.0\text{ seconds}$ across the independent cohort.
4. **Adversarial Novelty Failure:** Any novel attack class (Double-URL encoding, Prototype pollution payloads, Homoglyph spoofing) bypasses sanitization or crashes the component.
