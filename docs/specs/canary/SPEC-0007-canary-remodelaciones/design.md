# Design — OpenSpec SPEC-0007: Architecture, Component Tree & Knowledge Integration

**Mission ID:** `CANARY-REAL-001`  
**Standard:** OpenSpec / LIDR Architectural Design Document  

---

## 1. Component Architecture & Hierarchy

```text
EOS-Lab/Canary-Real-001/src/
 ├── components/
 │    ├── HeroConversionHeader.js      [Visual Value Proposition + Local Proof Badges]
 │    ├── StepQualificationForm.js     [3-Step Prequalification Engine & State Machine]
 │    ├── LiveQuoteCalculator.js       [BKM-CANARY-001 Sanitization -> OBS-CANARY-002 ARIA Preview]
 │    ├── TrustProofSection.js         [Guaranteed Contracts, Before/After Local Case Studies]
 │    └── WhatsAppPayloadDispatcher.js [Sanitized 1-Click WhatsApp Lead Generator]
 └── styles/
      └── remodelaciones.css           [Vanilla CSS Design System: Tokens, Responsive, High Contrast]
```

---

## 2. Knowledge Graph & Composition Integration
* **Composition Rule:** Applies `BKM-COMPOSITION-CANARY-001` under strict verified order ($A \to B$):
  1. Input Sanitization Engine (`BKM-CANARY-001`): Strips XSS tags, phone injection escapes, and format anomalies at the input boundary.
  2. Accessible Live Region (`OBS-CANARY-002`): Computes project prequalification preview and announces validation state via `aria-live="polite"`.
* **Negative Guard:** Strictly enforces `NEG-BKM-001` (avoids synchronous blocking regular expressions on large buffers).

---

## 3. State Machine & Transition Flow

```text
[STEP_1: TIPO_PROYECTO]
        │
        ▼ (onSelect: Valid Selection)
[STEP_2: ALCANCE_Y_PRESUPUESTO]
        │
        ▼ (onSelect: Scope & Budget Range)
[STEP_3: UBICACION_Y_CONTACTO]
        │
        ├── (if Outside Coverage: Warn & Suggest Referral)
        └── (if In Coverage: Qualify Lead)
        │
        ▼
[QUALIFIED_WHATSAPP_DISPATCH]
```

---

## 4. Architectural Decisions & Trade-Offs (ADR Summary)
* **ADR-0007.1: Zero External Backend / Pure Client-Side Dispatch:** Since the goal is direct communication with Alexander Rodríguez without database custody risks or server overhead, all prequalification is executed client-side with URL-encoded WhatsApp routing.
* **ADR-0007.2: Vanilla CSS & Zero Framework Overhead:** Maximizes mobile page load speed ($LCP \le 1.0\text{s}$) with zero bundle bloat.
