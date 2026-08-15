# CANARY-J001: Pre-Registered Predictive Composite Model (J-10)

**Document ID:** `PRED-CANARY-J001`  
**Mission ID:** `CANARY-J001`  
**Evaluated Composition:** `BKM-COMPOSITION-CANARY-001`  
**Target Domain:** Interactive Webhook & API Payload Dispatcher (`WebhookPayloadDispatcher.js`)  
**Frozen At:** 2026-08-14T22:58:00-05:00 (Authored prior to coding)  

---

## 1. Quantitative Frozen Predictions

| Arm | Predicted Completion Rate | Predicted Time-on-Task | Predicted Secret Leaks | Predicted Friction |
|---|---|---|---|---|
| **Arm 0 (Control)** | $\mathbf{45.0\%}$ ($95\%\text{ CI: } [30\%, 60\%]$) | $\mathbf{210.0\text{s}}$ | $\ge 30.0\%$ | $8.5 / 10$ |
| **Arm A (Sanitizer Only)** | $\mathbf{70.0\%}$ ($95\%\text{ CI: } [55\%, 85\%]$) | $\mathbf{85.0\text{s}}$ | $\mathbf{0.0\%}$ | $5.5 / 10$ |
| **Arm B (Feedback Only)** | $\mathbf{65.0\%}$ ($95\%\text{ CI: } [50\%, 80\%]$) | $\mathbf{75.0\text{s}}$ | $\ge 20.0\%$ | $4.5 / 10$ |
| **Arm AB (Correct Order $A \to B$)** | $\mathbf{92.0\%}$ ($95\%\text{ CI: } [80\%, 98\%]$) | $\mathbf{40.0\text{s}}$ | $\mathbf{0.0\%}$ | $\mathbf{1.8 / 10}$ |
| **Arm BA (Reversed Order $B \to A$)** | $\mathbf{60.0\%}$ ($95\%\text{ CI: } [45\%, 75\%]$) | $\mathbf{110.0\text{s}}$ | $\mathbf{0.0\%}$ | $6.5 / 10$ |

*Predicted Composition Delta ($\Delta_{\text{comp}}$):* $92.0\% - 70.0\% = \mathbf{+22.0\%}$.  
*Predicted Order Degradation Penalty:* $92.0\% - 60.0\% = \mathbf{+32.0\%}$ degradation in reversed order.
