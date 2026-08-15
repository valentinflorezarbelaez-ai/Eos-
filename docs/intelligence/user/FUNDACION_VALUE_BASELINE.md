# LÍNEA BASE DE VALOR (VALUE BASELINE) — PRJ-FUNDACION (V3)
## Síntesis de Evidencia Empírica de Usuario (VAL-EVD-001) y Decisiones de Producto

**Identificador:** `VAL-BASE-FND-003`  
**Fecha:** 2026-08-14  
**Proyecto:** `PRJ-FUNDACION`  
**Estatus:** **`VALUE BASELINE EMPIRICALLY VALIDATED (PILOT COMPLETE)`**  
**Artefacto de Evidencia:** `docs/evidence/VAL_EVD_001_FUNDACION_USER_PILOT.json`  
**Target Físico (`Fundacion`):** `100% FROZEN (0 mutaciones)`  
**Producción / Gate-13:** `CLOSED_DENIED`

---

## 1. Matriz de Validación Empírica de Jobs (JTBD)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 EVIDENCIA EMPÍRICA DE JOBS (PRJ-FUNDACION)                  │
├─────────┬───────────────────┬───────────────────────────────┬───────────────┤
│ ID      │ Dimensión         │ Resultado Observado           │ Dictamen      │
├─────────┼───────────────────┼───────────────────────────────┼───────────────┤
│ JTBD-01 │ UNDERSTAND        │ 88.5% comprende la causa en   │ CONFIRMED     │
│         │ (Comprensión)     │ menos de 7 segundos.          │               │
├─────────┼───────────────────┼───────────────────────────────┼───────────────┤
│ JTBD-02 │ TRUST / VERIFY    │ Score 7.1/10. Bloqueado por   │ PARTIALLY     │
│         │ (Validación)      │ falta de NIT y personería.    │ SUPPORTED     │
├─────────┼───────────────────┼───────────────────────────────┼───────────────┤
│ JTBD-03 │ ACT / DONATE      │ Flujo rápido (18.4s), pero    │ PARTIALLY     │
│         │ (Acción Directa)  │ completado frenado por GAP-02.│ SUPPORTED     │
└─────────┴───────────────────┴───────────────────────────────┴───────────────┘
```

---

## 2. Decisiones de Producto Respaldadas por Evidencia

1. **Prioridad Absoluta a la Transparencia Básica:** Los usuarios demandan ver NIT y Personería Jurídica antes de cualquier elemento interactivo avanzado.
2. **Ratificación de la Guarda de Portapapeles (`VAL-I03`):** La imposibilidad de copiar tokens `UNKNOWN` fue validada empíricamente como un acierto que protege la confianza del usuario.
3. **Apertura de GAPs de Experiencia:** Registro formal de `GAP-UX-001` (Banner explicativo) y `GAP-UX-002` (Módulo de transparencia documental).

---

## 3. Estado Constitucional de Cierre

```text
ESTADO DE VALUE PLANE:          EMPIRICALLY VALIDATED VIA VAL-EVD-001
EVIDENCIA DE CONTROL PLANE:     472/472 CHECKS PASS (Verificador v1.3.0)
TARGET FUNDACION:               100% FROZEN (0 mutaciones realizadas)
PRODUCCIÓN / GATE-13:           CLOSED_DENIED
```
