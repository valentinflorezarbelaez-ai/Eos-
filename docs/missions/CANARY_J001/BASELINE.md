# CANARY-J001: Pre-Registered Control Baseline & Surface Definition

**Mission ID:** `CANARY-J001`  
**Target Domain:** Interactive Webhook & API Endpoint Payload Dispatcher (`WebhookPayloadDispatcher.js`)  
**Cohort:** `COHORT-CANARY-F6` ($N=50$ independent developers randomized across 5 arms)  
**Date:** 2026-08-14  

---

## 1. Problem Domain & Developer Task
Developers configure custom outgoing webhooks containing HMAC signature secrets (`X-Hub-Signature-256`), Bearer authorization tokens, and JSON payloads with dynamic template variables.
*   **The UX Problem:** Incomplete bracket matching and syntax errors cause dispatch failures, leading to developer frustration.
*   **The Security Problem:** Developers inadvertently leak raw client secret tokens or authorization credentials into webhook payload bodies and request logging headers.

---

## 2. Pre-Registered Historical Control Measurements (Arm 0)
*   **Completion Rate:** $\mathbf{40.0\%}$ ($4/10$)
*   **Avg Time-on-Task:** $\mathbf{215.0\text{s}}$
*   **Friction Rating:** $\mathbf{8.5 / 10}$
*   **Trust Score:** $\mathbf{4.1 / 10}$
*   **Secret Leaks:** $\mathbf{40.0\%}$ ($4/10$)
