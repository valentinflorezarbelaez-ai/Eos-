# CANARY-M002: Formal Replication Protocol

**Mission ID:** `CANARY-M002`  
**Candidate Observation:** `OBS-CANARY-001`  
**Protocol Version:** `2.0.0`  
**Date:** 2026-08-14  

---

## 1. What is Being Replicated vs. What Changes

| Dimension | CANARY-M001 | CANARY-M002 (Replication #2) | Rationale |
|---|---|---|---|
| **Core Principle** | Deterministic, client-side input sanitization + UX friction reduction | Deterministic, client-side input sanitization + UX friction reduction | **INVARIANT:** Test if the fundamental design rule holds |
| **Component Name** | `DiagnosticReporter.js` | `ContactSupportDispatcher.js` | **NEW:** Multi-field structured form instead of single-comment modal |
| **Form Surface** | 1 textarea + environment context | 4 inputs: Category, Contact Email, Priority, Structured Payload | **NEW:** Multi-field data validation & structured JSON sanitization |
| **Data Types** | Freeform text + error stacks + auth headers | Structured form fields + PII (PANs, SSNs, phone numbers) + Token query params | **NEW:** PII patterns & multi-format data structures |
| **User Cohort** | `COHORT-CANARY-A1` ($N=15$) | `COHORT-CANARY-B2` ($N=20$) | **NEW:** Independent operator cohort to avoid familiarity bias |
| **Adversarial Suite** | 5 attacks (Unicode, XSS, token, timeout, path) | 5 **NEW** attacks (Double-URL XSS, PAN regex bypass, Prototype pollution, Homoglyphs, Burst flood) | **NEW:** Prevent test memorization; test true robustness |

---

## 2. Replication Retention Formula

$$
\text{Replication Retention} = \frac{\Delta \text{Outcome}_{M002}}{\Delta \text{Outcome}_{M001}}
$$

*   **Context Similarity:** `0.70` (both within `PRJ-CANARY-ALPHA` web interface)
*   **Task Similarity:** `0.65` (structured multi-field vs. error modal)
*   **Population Similarity:** `0.85` (equivalent pilot operator profile)
*   **Tool Similarity:** `0.95` (vanilla web standard component + regex engine)
