# PHASE G: EOS DUAL-PATH VALIDATION ENGINE DESIGN

* **Phase:** PHASE G — DUAL-PATH VALIDATION ENGINE
* **Status:** DESIGN SPECIFIED & FROZEN WITH CONDITIONS
* **Date:** 2026-08-11
* **Scope:** Internal Dual-Path Validation Engine Architecture (`C:\Users\valen\Documents\Eos system`)

---

## 1. Core Architectural Invariants

> [!IMPORTANT]
> **1. The Dual-Path Separation Invariant:**
> EOS **MUST** strictly decouple **Product Validation** from **Knowledge Validation**.
> A product can pass all dynamic tests while refuting an engineering hypothesis, and a hypothesis can prove valid even if a specific product implementation contains an unrelated bug.
>
> **2. The Single Epistemic Authority Invariant:**
> Product Validation **NEVER** mutates epistemic state directly. Product Validation produces raw evidence payloads (`DualValidationResult`). The **Evidence Engine (Phase C)** remains the sole authority for assessing evidence sufficiency and performing epistemic state promotions or demotions.

```text
                        EOS DUAL-PATH VALIDATION
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
       PRODUCT VALIDATION                     KNOWLEDGE VALIDATION
 (Requisitos funcionales, concurrencia,     (Hipótesis falsable, consistencia de
  Browser QA, seguridad, UX, datos)          predicción, límites de borde)
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   ▼
                            EVIDENCE ENGINE
                                   │
                                   v
                          EPISTEMIC ASSESSMENT
```

---

## 2. The 4 Combinatorial Validation Outcomes Matrix

| Scenario | Product Validation | Knowledge Validation | Interpretation & Epistemic Action |
| :--- | :--- | :--- | :--- |
| **S1** | **`PASS`** | **`PASS`** | **Éxito Completo:** El producto satisface sus requisitos Y la hipótesis transferida se confirma en este nuevo alcance. |
| **S2** | **`PASS`** | **`FAIL`** | **Éxito de Producto por Vía Alternativa / Falsación de Conocimiento:** El producto funcionó por otra mecánica; la hipótesis queda **REFUTADA** o **CONTRADICTA** para este alcance. |
| **S3** | **`FAIL`** | **`PASS`** | **Bug de Producto / Confirmación de Conocimiento:** El producto falló por un bug no relacionado (ej. glitch visual); el principio técnico (ej. transacción atómica en DB) se confirmó válido. |
| **S4** | **`FAIL`** | **`FAIL`** | **Doble Falla:** Falló el producto y se falsó la hipótesis. |

---

## 3. Schema & Entity Specifications (TypeScript)

```typescript
export interface ProductValidationSuite {
  suite_id: string;
  project_id: string;
  functional_invariants_tested: string[];
  test_commands: string[];
  browser_qa_scenarios: string[];
  expected_outcomes: Record<string, string>;
}

export interface KnowledgeValidationSuite {
  suite_id: string;
  hypothesis_asset_id: string; // SYS-PRN-XXXX or LSN-XXXX
  prediction_id: string;
  testable_assertion: string;
  falsification_triggers: string[];
  domain_independence_checks: {
    source_domain: string;
    target_domain: string;
    environmental_delta: string[];
  };
}

export interface DualValidationResult {
  validation_id: string;
  timestamp: string;
  project_id: string;
  
  // Path A: Product Validation Result
  product_result: {
    status: 'PASS' | 'FAIL';
    passed_invariants: string[];
    failed_invariants: string[];
    raw_logs: string[];
  };

  // Path B: Knowledge Validation Result
  knowledge_result: {
    hypothesis_asset_id: string;
    status: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
    falsification_triggered: boolean;
    falsification_reason?: string;
    raw_logs: string[];
  };

  // Epistemic Routing Payload to Phase C Evidence Engine
  evidence_payload: {
    evidence_id: string; // EVD-XXXX
    combinatorial_scenario: 'S1' | 'S2' | 'S3' | 'S4';
    summary: string;
  };
}
```
