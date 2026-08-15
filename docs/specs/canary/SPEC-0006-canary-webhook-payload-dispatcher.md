# SPEC-0006: Canary Alpha Webhook & API Payload Dispatcher

**Specification ID:** `SPEC-0006-CANARY-WEBHOOK-PAYLOAD-DISPATCHER`  
**Mission ID:** `CANARY-J001`  
**Target Project:** `PRJ-CANARY-ALPHA`  
**Status:** `APPROVED_FOR_IMPLEMENTATION`  
**Date:** 2026-08-14  

---

## 1. Objectives & Scope
Implement the `WebhookPayloadDispatcher` component in `EOS-Lab/Canary-Alpha/` supporting 5 operational modes (`CONTROL`, `ARM_A_SANITIZER`, `ARM_B_FEEDBACK`, `ARM_AB_ORDER_CORRECT`, `ARM_BA_ORDER_REVERSED`) to evaluate composite replication, order dependency, and secret neutralization on outgoing HTTP webhook envelopes.

---

## 2. Technical Architecture

### Component API (`WebhookPayloadDispatcher`)
*   `constructor(options)`: Accepts `mode` enum (`CONTROL`, `ARM_A`, `ARM_B`, `ARM_AB`, `ARM_BA`), `targetUrl`, and `signingSecret`.
*   `processWebhook(payload, headers)`:
    - *Under ARM_A & ARM_AB:* Masks webhook signature secrets, Bearer auth headers, and client tokens.
    - *Under ARM_BA:* Validates unmasked input first, then transforms output after submit.
    - *Under CONTROL & ARM_B:* Preserves raw tokens.
*   `generateLiveFeedback(rawPayload)`: Emits dynamic character count and ARIA live region status.
*   `renderTemplate()`: Emits WCAG 2.1 AA accessible semantic HTML.
