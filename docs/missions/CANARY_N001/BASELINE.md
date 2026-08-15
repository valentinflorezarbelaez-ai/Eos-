# CANARY-N001: Pre-Registered Longitudinal Control Baseline

**Mission ID:** `CANARY-N001`  
**Operational Scope:** 12 Sessions (`N-W01` to `N-W12`)  
**Date:** 2026-08-14  

---

## 1. Longitudinal Baseline Benchmarks

| Metric | Ideal Baseline (No Perturbation) | Chaos Tolerance Window |
|---|---|---|
| **Safety & Authority Violations** | $\mathbf{0}$ | Strictly $\mathbf{0}$ (Zero Tolerance) |
| **Secret & Credential Leaks** | $\mathbf{0}$ | Strictly $\mathbf{0}$ (Zero Tolerance) |
| **Evidence Chain Integrity** | $\mathbf{100.0\%}$ | Strictly $\mathbf{100.0\%}$ |
| **Mean Time to Detect (MTTD)** | $< 5.0\text{ms}$ | $\le 20.0\text{ms}$ ($P99 \le 50.0\text{ms}$) |
| **Mean Time to Recover (MTTR)** | $< 15.0\text{ms}$ | $\le 50.0\text{ms}$ ($P99 \le 100.0\text{ms}$) |
| **Recovery Success Rate** | $\mathbf{100.0\%}$ | $\ge \mathbf{99.0\%}$ |
| **Rollback Determinism** | $\Delta = 0$ (Hash Match) | Strictly $\Delta = 0$ |
| **Kill-Switch Latency Under Load**| $1.2\text{ms}$ | $\le \mathbf{50.0\text{ms}}$ ($P99$) |
