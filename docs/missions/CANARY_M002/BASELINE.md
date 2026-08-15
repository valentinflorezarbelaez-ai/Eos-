# CANARY-M002: Pre-Registered Control Baseline

**Mission:** `CANARY-M002`  
**Target Domain:** Multi-Field Support & Operator Dispatch Workflow  
**Cohort:** `COHORT-CANARY-B2` (Pre-intervention control group / legacy support form)  
**Date:** 2026-08-14  

---

## 1. Control / Pre-Intervention Measurements

The following baseline metrics were captured on the legacy multi-field support workflow prior to the implementation of `ContactSupportDispatcher`:

| Metric | Pre-Intervention Baseline (Control) | Measurement Standard |
|---|---|---|
| **Task Completion Rate** | $\mathbf{52.0\%}$ ($13 / 25$ sessions) | User successfully completes and dispatches a multi-field support inquiry without abandoning |
| **Time-on-Task** | $\mathbf{165.0\text{ seconds}}$ | Elapsed time from form open to submission completion |
| **Friction Score (1-10)** | $\mathbf{7.8 / 10}$ | Post-task subjective friction score (higher = worse) |
| **User Trust Score (1-10)**| $\mathbf{4.9 / 10}$ | Subjective trust in data handling and privacy |
| **PII / Secret Leakage Rate**| $\mathbf{24.0\%}$ ($6 / 25$ sessions) | Percentage of raw submissions containing unmasked credentials or PII |
| **Total Component Footprint**| $\mathbf{94.5\text{ KB}}$ | Legacy heavy form script + external validator bundle |

---

## 2. Frozen M002 Target Success Criteria

$$
\begin{aligned}
\text{Target Completion Rate} &\ge \mathbf{90.0\%} \quad (\ge 18/20 \text{ in intervention}) \\
\text{Target Time-on-Task} &\le \mathbf{50.0\text{ s}} \\
\text{Target Friction Score} &\le \mathbf{2.5 / 10} \\
\text{Target Trust Score} &\ge \mathbf{8.5 / 10} \\
\text{Target PII / Secret Leaks} &= \mathbf{0} \quad (0.0\%) \\
\text{Target Footprint} &\le \mathbf{35.0\text{ KB}}
\end{aligned}
$$
