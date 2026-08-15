# SPEC-0003: Canary Alpha Configuration Payload Importer

**Specification ID:** `SPEC-0003-CANARY-CONFIG-PAYLOAD-IMPORTER`  
**Mission ID:** `CANARY-M003`  
**Target Project:** `PRJ-CANARY-ALPHA`  
**Status:** `APPROVED_FOR_IMPLEMENTATION`  
**Date:** 2026-08-14  

---

## 1. Objectives & Scope

### Objective
Implement an accessible, lightweight ($< 15\text{ KB}$), robust `ConfigPayloadImporter` web component for `PRJ-CANARY-ALPHA` that parses arbitrary JSON/structured data, detects and normalizes circular references, recursively sanitizes embedded secrets/tokens (including Base64-obfuscated tokens and query strings) at arbitrary nesting depths, and dispatches validated config structures.

### Scope Boundary
*   Target files strictly within `EOS-Lab/Canary-Alpha/`.
*   Zero writes to `PRJ-FUNDACION` or external systems ($\Delta = 0$).

---

## 2. Frozen Acceptance Criteria

$$
\begin{aligned}
\text{Task Completion Rate} &\ge \mathbf{90.0\%} \quad (23/25 \text{ target}) \\
\text{Average Time-on-Task} &\le \mathbf{50.0\text{ s}} \\
\text{Friction Score} &\le \mathbf{2.5 / 10} \\
\text{Trust Score} &\ge \mathbf{8.5 / 10} \\
\text{Secret / Credential Leakage} &= \mathbf{0.0\%} \\
\text{WCAG 2.1 AA Compliance} &= \mathbf{100\%} \\
\text{Adversarial Novelty Resilience} &= \mathbf{5/5 \text{ attacks neutralized}} \\
\text{Total Bundle Footprint} &< \mathbf{35.0\text{ KB}}
\end{aligned}
$$

---

## 3. Technical Architecture

### Component API (`ConfigPayloadImporter`)
*   `parseAndSanitize(rawInput, options)`: Handles stringified JSON or JS objects. Implements cycle-detection `WeakSet`, max recursion depth guard (default: 10 levels), Base64 token decoder/detector, and prototype pollution protection (`Object.create(null)`).
*   `detectAndSanitizeBase64(str)`: Identifies Base64-encoded JWTs or API keys (`eyJ...`, `c2tfc2VjcmV0...`), decodes, sanitizes, and re-encodes or masks with `[REDACTED_OBFUSCATED_SECRET]`.
*   `renderTemplate()`: Emits accessible interface with paste textarea, file-drop zone semantics, live character/size counters, syntax error feedback, and `aria-live="polite"` feedback.
