# CANARY-M003: Pre-Registered Control Baseline

**Mission:** `CANARY-M003`  
**Target Domain:** Deeply Nested Configuration & Raw Data Payload Import Workflow  
**Cohort:** `COHORT-CANARY-C3` (Pre-intervention control group on legacy raw JSON importer)  
**Date:** 2026-08-14  

---

## 1. Control / Pre-Intervention Measurements

The following baseline metrics were captured on the legacy raw configuration import tool prior to the introduction of `ConfigPayloadImporter`:

| Metric | Pre-Intervention Baseline (Control) | Measurement Standard |
|---|---|---|
| **Task Completion Rate** | $\mathbf{48.0\%}$ ($12 / 25$ sessions) | Operator successfully validates, sanitizes, and imports an external multi-level config payload without abandoning |
| **Time-on-Task** | $\mathbf{188.0\text{ seconds}}$ | Elapsed time to format, resolve parsing errors, and complete import |
| **Friction Score (1-10)** | $\mathbf{8.2 / 10}$ | Subjective operator friction rating (higher = worse) |
| **User Trust Score (1-10)**| $\mathbf{4.5 / 10}$ | Operator confidence that secret keys in configs won't leak |
| **Secret / Credential Leakage**| $\mathbf{32.0\%}$ ($8 / 25$ sessions) | Percentage of raw imports containing unmasked API keys or auth tokens |
| **Total Component Footprint**| $\mathbf{115.0\text{ KB}}$ | Legacy schema validator and bundler dependencies |

---

## 2. Frozen M003 Target Success Criteria

$$
\begin{aligned}
\text{Target Completion Rate} &\ge \mathbf{90.0\%} \quad (\ge 23/25 \text{ in intervention}) \\
\text{Target Time-on-Task} &\le \mathbf{50.0\text{ s}} \\
\text{Target Friction Score} &\le \mathbf{2.5 / 10} \\
\text{Target Trust Score} &\ge \mathbf{8.5 / 10} \\
\text{Target Secret Leaks} &= \mathbf{0} \quad (0.0\%) \\
\text{Target Component Footprint} &\le \mathbf{35.0\text{ KB}}
\end{aligned}
$$
