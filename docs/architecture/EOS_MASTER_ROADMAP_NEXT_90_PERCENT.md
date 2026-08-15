# EOS MASTER ROADMAP — THE OPERATIONAL & MULTI-PROJECT HORIZON

* **Referencia:** `EOS-ROADMAP-V2`
* **Baseline Actual:** `v0.3.0` (Control Plane 100% Saneado / L3 Acreditado en Scope)
* **Objetivo Estratégico:** Demostrar que EOS opera como una fábrica de ingeniería repetible, orientada al valor de usuario y validada en el mundo real.

---

## 1. Secuencia de Fases Canónica (23 Pasos)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SECUENCIA DE EJECUCIÓN OPERACIONAL                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. PRE-FLIGHT (Baseline verification 287/287 & 472/472)                │
│ 2. GAP-002 PROVENANCE (Captura de fuente y trazabilidad)               │
│ 3. PO VALIDATION (Validación formal de datos institucionales)          │
│ 4. EVD-GAP-002 (Generación de evidencia documental)                   │
│ 5. DESBLOQUEAR VAL-EXP-002 (Transición de estado en registry)          │
│ 6. CONTROL (Medición de línea base sin mutaciones)                     │
│ 7. VARIANTE A (Medición con datos oficiales verificados)               │
│ 8. VARIANTE B (Medición acumulada con banner de acreditación)          │
│ 9. VARIANTE C (Medición acumulada con centro de transparencia)         │
│ 10. VAL-EVD-002 (Generación y hash-pinning de evidencia experimental)   │
│ 11. INDEPENDENT VALUE AUDIT (Auditoría desacoplada del experimento)    │
│ 12. PRODUCT DECISION (IMPLEMENT / ITERATE / DO_NOT_BUILD)              │
│ 13. REQUIREMENTS / UX DESIGN (Especificación orientada a necesidades)  │
│ 14. PROPUESTA DE IMPLEMENTACIÓN (DAG de acciones y reversibilidad)     │
│ 15. AUTORIZACIÓN (Firma formal de alcance y permisos)                  │
│ 16. CONTROLLED WRITE (Escritura en sandbox / target autorizado)        │
│ 17. MUTATION AUDIT (Verificación de delta esperado vs delta real)      │
│ 18. USER RE-VALIDATION (Re-evaluación post-implementación)             │
│ 19. MULTI-PROJECT (Repetición en Andes-Retreat, Luxe, Multimodal)      │
│ 20. REAL PROVIDERS (Conexión de LLMs comerciales y browser real)       │
│ 21. LONG-RUN OPERATION (Tolerancia a fallos, crashes y timeouts)       │
│ 22. PRODUCTION READINESS (Paquete completo de seguridad y QA)          │
│ 23. GATE-13 (Compuerta formal de liberación a producción)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Los 7 Grandes Bloques de Madurez

```text
                      EOS MATURITY HORIZON
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
 [BLOQUE 1]               [BLOQUE 2]              [BLOQUE 3]
Value Plane Closure    Multi-Project Factory    Real Providers & Infra
 (PRJ-FUNDACION)       (Andes, Luxe, Multi)     (LLMs, Browser QA, SDK)
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
                          [BLOQUE 4]
                   Long-Run Operability & Telemetry
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
 [BLOQUE 5]               [BLOQUE 6]              [BLOQUE 7]
Strategy Calibration     Product Outcome Loop    Production Readiness
(Real Execution Data)    (Measure ➔ Learn Loop)       (GATE-13)
```

---

## 3. Principio Rector

> **Regla de Oro de EOS:** No construir por ansiedad. No convertir `UNKNOWN` en una suposición conveniente. No confundir "tests verdes" con valor para el usuario. Y no modificar un proyecto real sin una autorización explícita y trazable.
