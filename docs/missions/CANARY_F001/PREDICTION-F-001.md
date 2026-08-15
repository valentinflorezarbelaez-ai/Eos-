# CANARY-F001: Pre-Registered Predictive Transfer Protocol & Hypothesis

**Experiment ID:** `PREDICTION-F-001`  
**Mission ID:** `CANARY-F001`  
**Underlying BKM:** [`docs/knowledge/BKM-CANARY-001.json`](file:///c:/Users/valen/Documents/Eos%20system/docs/knowledge/BKM-CANARY-001.json) (`RESTRICTED_BKM`)  
**Target Domain:** Tabular CSV & Column-Level Batch Dataset Uploader (`PROBABLE_SCOPE`)  
**Date of Pre-Registration:** 2026-08-14T22:43:00-05:00 (Frozen BEFORE Implementation)  

---

## 1. Problem & New Context
Canary Alpha pilot operators frequently upload batch CSV datasets containing client profiles, operational metrics, and billing records. 
*   **The Risk:** Tabular files frequently contain unmasked PII (Credit Card PANs, SSNs, phone numbers, employee emails) and CSV Formula Injection attacks (`=cmd|...`, `@SUM(...)`).
*   **The Test Domain:** Tabular / CSV processing was categorized in Phase E under **`PROBABLE_SCOPE`**, not `VALID_SCOPE`. This experiment tests whether `BKM-CANARY-001` successfully predicts outcomes upon transfer into this unverified adjacent domain.

---

## 2. Frozen Predictive Model & Mechanism

### Expected Mechanism:
Applying `BKM-CANARY-001` (streaming delimiter parsing + column-level regex masking + CSV formula sanitization + real-time header mapping feedback) will:
1. Eliminate 100% of PII and Formula Injection leaks at the browser input boundary.
2. Reduce operator cognitive load and error rates via live header previews and column type indicators.
3. Preserve sub-15ms parsing latency without requiring heavy third-party parsing dependencies.

---

## 3. Quantitative Pre-Registered Predictions vs. Control Baseline

The experiment will evaluate **Control (Legacy unguided CSV uploader)** vs. **BKM-Informed Variant (`CsvTabularDataUploader.js`)** on `COHORT-CANARY-D4` ($N=30$ independent operators):

| Dimension | Control Baseline (Legacy Tool) | Predicted BKM Outcome | Predicted Marginal Delta ($\Delta_{F001}$) | Acceptable Calibration Error Margin |
|---|---|---|---|---|
| **Task Completion Rate** | $\mathbf{45.0\%}$ ($9/20$ historical) | $\mathbf{93.0\%}$ ($28/30$) | $\mathbf{+48.0\%}$ | $\pm 5.0\%$ |
| **Average Time-on-Task** | $\mathbf{210.0\text{ s}}$ | $\mathbf{45.0\text{ s}}$ | $\mathbf{-165.0\text{ s}}$ | $\pm 10.0\text{ s}$ |
| **Friction Rating (1-10)** | $\mathbf{8.5 / 10}$ | $\mathbf{1.8 / 10}$ | $\mathbf{-6.7\text{ pts}}$ | $\pm 0.5\text{ pts}$ |
| **User Trust Score (1-10)**| $\mathbf{4.2 / 10}$ | $\mathbf{9.2 / 10}$ | $\mathbf{+5.0\text{ pts}}$ | $\pm 0.5\text{ pts}$ |
| **PII / Secret Leaks** | $\mathbf{35.0\%}$ ($7/20$) | $\mathbf{0.0\%}$ ($0/30$) | $\mathbf{-35.0\text{ pts}}$ | $\mathbf{0.0\%}$ (Strict Zero Tolerance) |
| **Formula Injections Allowed**| $\mathbf{25.0\%}$ ($5/20$) | $\mathbf{0.0\%}$ ($0/30$) | $\mathbf{-25.0\text{ pts}}$ | $\mathbf{0.0\%}$ (Strict Zero Tolerance) |
| **Parse Latency (1,000 rows)**| $\mathbf{85.0\text{ ms}}$ | $\mathbf{12.0\text{ ms}}$ | $\mathbf{-73.0\text{ ms}}$ | $\le 20.0\text{ ms}$ |
| **Bundle Footprint** | $\mathbf{145.0\text{ KB}}$ (Bundled SDK)| $\mathbf{14.2\text{ KB}}$ | $\mathbf{-130.8\text{ KB}}$ | $\le 25.0\text{ KB}$ |

---

## 4. Pre-Declared Falsification Thresholds (What Would Disprove BKM Transfer)

The transfer of `BKM-CANARY-001` shall be marked **`TRANSFER_REFUTED`** or **`DO_NOT_TRANSFER`** if:
1. **PII or Formula Escape:** Any unmasked PAN, SSN, or executable CSV formula (`=`, `@`, `+`, `-`) escapes client-side sanitization.
2. **Over-Sanitization / False Positives:** Legitimate numeric or text data (e.g. negative numbers `-150.25`, arithmetic strings) is corrupted or destroyed.
3. **Severe UX Failure:** Task completion falls below $85.0\%$ or time-on-task exceeds $65.0\text{s}$.
4. **Performance Degeneration:** Processing 1,000 tabular rows causes UI thread lockup $> 50.0\text{ms}$.

---

## 5. Negative Transfer Scenario (Explicit Anti-Dogmatism Test)
*   **Scenario `NEG-TRANS-001` (High-Frequency Binary Telemetry Stream):**
    - When evaluated for streaming binary / WebSocket protocol handling, EOS must explicitly output **`DO_NOT_TRANSFER`** because regex-based edge parsing introduces unacceptable latency bottlenecks on streaming binary buffers.
