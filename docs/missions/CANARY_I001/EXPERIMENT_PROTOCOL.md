# CANARY-I001: 4-Arm Experimental Protocol & Randomization

**Mission ID:** `CANARY-I001`  
**Protocol Version:** `1.0.0`  
**Date:** 2026-08-14  

---

## 1. 4-Arm Factorial Experimental Design

```text
COHORT-CANARY-E5 (N = 40 Independent Operators)
                   │
                   ▼  [Randomized 1:1:1:1 Allocation]
    ┌──────────────┬──────────────┬──────────────┐
    │              │              │              │
    ▼              ▼              ▼              ▼
  ARM 0          ARM A          ARM B          ARM AB
(Control)     (Sanitizer)     (Feedback)    (Composite)
  n = 10         n = 10         n = 10         n = 10
```

### Arm Definitions:
1. **`Arm 0 (Control)`**: Raw unguided console without sanitization or accessible live feedback.
2. **`Arm A (BKM-CANARY-001 Only)`**: Edge sanitization active (credentials masked); static unguided UI.
3. **`Arm B (OBS-CANARY-002 Only)`**: Real-time accessible live region guidance, syntax tooltips, and live validation active; unmasked raw string passthrough.
4. **`Arm AB (Composite Integration)`**: Both edge sanitization AND real-time accessible live guidance active simultaneously.

---

## 2. Experimental Controls
*   **Identical Task:** Every participant receives the exact same batch migration payload specification.
*   **Randomization:** Operators are assigned via pseudorandom round-robin to eliminate cohort selection bias.
*   **Independent Telemetry:** Lineage tracked via `AppendOnlyTelemetrySink` with cryptographic SHA-256 block hashes tagged by arm ID.
