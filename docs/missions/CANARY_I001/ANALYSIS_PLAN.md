# CANARY-I001: Pre-Registered Statistical Analysis Plan

**Mission ID:** `CANARY-I001`  
**Plan Version:** `1.0.0`  
**Date:** 2026-08-14  

---

## 1. Primary & Secondary Estimators

### 1. Composition Delta ($\Delta_{\text{composition}}$):

$$
\Delta_{\text{composition}} = \text{Outcome}_{AB} - \max(\text{Outcome}_A, \text{Outcome}_B)
$$

*   **Decision Criterion:**
    - $\Delta_{\text{composition}} > 0 \implies \mathbf{COMPOSITION\_SUPPORTED}$
    - $\Delta_{\text{composition}} \approx 0 \implies \mathbf{COMPOSITION\_NEUTRAL}$
    - $\Delta_{\text{composition}} < 0 \implies \mathbf{COMPOSITION\_DEGRADING}$

### 2. Interaction Effect ($\text{Interaction}$):

$$
\text{Interaction} = \text{Outcome}_{AB} - \text{Outcome}_A - \text{Outcome}_B + \text{Outcome}_0
$$

### 3. Composition Cost Overhead ($\text{Cost}_{\text{comp}}$):

$$
\text{Cost}_{\text{comp}} = \text{Cost}_{AB} - \min(\text{Cost}_A, \text{Cost}_B)
$$

---

## 2. Sample Size & Power Limitation Disclosure
*   **Sample Size:** $N=40$ ($10$ per arm) is sized to detect a large effect size ($\ge 20\%$ difference) in this high-fidelity canary pilot.
*   **Methodological Caveat:** For subtle effect sizes ($< 5\%$), a larger sample ($N \ge 120$) would be required. Statistical inferences are explicitly bound to the pilot cohort.
