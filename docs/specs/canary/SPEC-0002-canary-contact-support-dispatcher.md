# SPEC-0002: Canary Alpha Contact & Support Dispatcher

**Specification ID:** `SPEC-0002-CANARY-CONTACT-SUPPORT-DISPATCHER`  
**Mission ID:** `CANARY-M002`  
**Target Project:** `PRJ-CANARY-ALPHA`  
**Status:** `APPROVED_FOR_IMPLEMENTATION`  
**Date:** 2026-08-14  

---

## 1. Objectives & Scope

### Objective
Implement an accessible, lightweight ($< 15\text{ KB}$), multi-field `ContactSupportDispatcher` web component for `PRJ-CANARY-ALPHA` that captures structured operator tickets, sanitizes PII (Credit card PANs, SSNs, phone numbers) and credentials in real-time, and dispatches to the append-only telemetry sink.

### Scope Boundary
*   Target files strictly within `EOS-Lab/Canary-Alpha/`.
*   Zero writes to `PRJ-FUNDACION` or external core systems.

---

## 2. Frozen Acceptance Criteria

$$
\begin{aligned}
\text{Task Completion Rate} &\ge 90.0\% \quad (18/20 \text{ target}) \\
\text{Average Time-on-Task} &\le 50.0\text{ s} \\
\text{Friction Score} &\le 2.5 / 10 \\
\text{Trust Score} &\ge 8.5 / 10 \\
\text{Secret / PII Leakage Rate} &= 0.0\% \\
\text{WCAG 2.1 AA Compliance} &= 100\% \text{ (Zero violations)} \\
\text{Adversarial Novelty Resilience} &= 5/5 \text{ attacks neutralized} \\
\text{Bundle Size} &< 35.0\text{ KB}
\end{aligned}
$$

---

## 3. Technical Architecture

### Component API (`ContactSupportDispatcher`)
*   `sanitizeStructuredPayload(ticketData)`: Deep sanitization across strings, arrays, and nested objects. Masks credit card numbers, SSNs, phone numbers, bearer tokens, passwords, and sanitizes prototype keys (`__proto__`, `constructor`).
*   `validateFields(ticketData)`: Validates required fields (`category`, `email`, `priority`, `message`), verifies email format with homoglyph normalization, and enforces max lengths.
*   `dispatchTicket(ticketData)`: Assigns unique idempotency key (`TCK-timestamp-random`), sanitizes payload, and queues or dispatches to telemetry sink.
*   `renderTemplate()`: Emits semantic HTML with accessible `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<select>`, `<input>`, `<textarea>`, and `aria-live="polite"` status region.
