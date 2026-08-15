# CANARY-I001: Pre-Registered Control Baseline & Surface Definition

**Mission ID:** `CANARY-I001`  
**Target Domain:** Batch Operational Parameter & Environment Migration Console (`BatchParamMigrationConsole.js`)  
**Cohort:** `COHORT-CANARY-E5` ($N=40$ independent operators randomized across 4 arms)  
**Date:** 2026-08-14  

---

## 1. Problem Domain & Human Task
Operators in Canary Alpha configure complex environment migration envelopes mapping staging variables, API keys, database connection strings, and feature flags to canary clusters.
*   **The UX Problem:** Legacy consoles provide raw unguided textboxes with no live validation, leading to parsing errors, unclosed brackets, confusion over required keys, and frequent abandonment.
*   **The Security Problem:** Raw connection strings (`postgres://admin:pass@...`) and secret keys are frequently committed unmasked into telemetry or migration records.

---

## 2. Pre-Registered Historical Control Measurements (Arm 0)

| Metric | Arm 0 (Control Baseline) | Measurement Standard |
|---|---|---|
| **Task Completion Rate** | $\mathbf{40.0\%}$ ($4 / 10$ sessions) | Operator successfully compiles and migrates batch envelope without fatal errors or abandonment |
| **Time-on-Task** | $\mathbf{240.0\text{ seconds}}$ | Elapsed time from console open to migration confirmation |
| **Friction Rating (1-10)** | $\mathbf{8.8 / 10}$ | Subjective operator friction score (higher = worse) |
| **User Trust Score (1-10)**| $\mathbf{4.0 / 10}$ | Operator confidence in migration safety |
| **Secret Leakage Rate** | $\mathbf{40.0\%}$ ($4 / 10$ sessions) | Percentage of records leaking unmasked credentials |
| **Component Footprint** | $\mathbf{155.0\text{ KB}}$ | Legacy heavy schema bundle |
