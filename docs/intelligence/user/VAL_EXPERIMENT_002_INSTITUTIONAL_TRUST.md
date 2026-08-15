# EXPERIMENTO DE VALOR — PRJ-FUNDACION
## VAL-EXPERIMENT-002: Diseño Experimental Incremental y Acumulativo de Confianza y Completion

**Identificador:** `VAL-EXP-FND-002`  
**Fecha:** 2026-08-14  
**Versión:** `1.2.0` (Diseño Experimental Incremental y Acumulativo)  
**Proyecto:** `PRJ-FUNDACION`  
**Línea Base (Control):** `VAL-EVD-001` (74.0% Task Completion / 7.1/10 Trust Score)  
**Estatus:** **`READY — AWAITING OFFICIAL PO INSTITUTIONAL DATA`**  
**Modo Operacional:** `READ_ONLY_RESEARCH_ONLY` (Target físico 100% congelado)  
**Producción / Gate-13:** `CLOSED`

---

## 1. Modelo de Intervención Incremental y Acumulativa

Se ajusta la terminología metodológica: no es un factorial $2 \times 2 \times 2$, sino un **diseño experimental secuencial de intervenciones acumuladas** para medir los deltas marginales ($\Delta$):

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│              DISEÑO DE INTERVENCIONES ACUMULADAS (VAL-EXP-002)              │
├───────────┬───────────────────────────────────┬─────────────────────────────┤
│ Variante  │ Composición de la Intervención    │ Efecto Marginal Medido      │
├───────────┼───────────────────────────────────┼─────────────────────────────┤
│ CONTROL   │ Línea base actual (VAL-EVD-001)   │ Rendimiento base con        │
│           │ con tokens UNKNOWN protegidos.    │ incertidumbre abierta.      │
├───────────┼───────────────────────────────────┼─────────────────────────────┤
│ VARIANTE A│ Control + Datos Oficiales Reales  │ ΔA = Efecto exclusivo de    │
│           │ (NIT, Personería y Banco del PO). │ información oficial.        │
├───────────┼───────────────────────────────────┼─────────────────────────────┤
│ VARIANTE B│ Variante A + Banner Acreditación  │ ΔB = Efecto adicional de    │
│           │ Proactivo (GAP-UX-001).           │ comunicación en curso.      │
├───────────┼───────────────────────────────────┼─────────────────────────────┤
│ VARIANTE C│ Variante B + Centro Documental de │ ΔC = Efecto adicional de    │
│           │ Transparencia PDF (GAP-UX-002).   │ reportes auditados públicos.│
└──────────┴───────────────────────────────────┴─────────────────────────────┘
```

---

## 2. Invariantes de los Criterios de Éxito (Targets Inmutables)

Para evitar sesgos de confirmación o alteración de metas *post-hoc*, los umbrales de éxito se fijan inmutablemente:

- **Meta de Confianza (Trust Target):** $\mathbf{\ge 8.5 / 10.0}$
- **Meta de Finalización de Tarea (Completion Target):** $\mathbf{\ge 90.0\%}$
- **Meta de Abandono (Drop-off Target):** $\mathbf{\le 10.0\%}$

> **Veredictos Posibles por Variante:**  
> `CONFIRMED` $\mid$ `PARTIALLY_SUPPORTED` $\mid$ `REFUTED` $\mid$ `INCONCLUSIVE`

---

## 3. Estado Constitucional y Precondiciones

```text
COMPUERTA:              VAL-EXPERIMENT-002 (LISTO PARA EJECUCIÓN)
GAP-002:                OPEN (A la espera de NIT/Personería/Banco oficial del PO)
DATOS INSTITUCIONALES:  STRICTLY UNKNOWN (Cero datos simulados o provisionales)
PRJ-FUNDACION:          100% FROZEN (0 mutaciones ejecutadas)
CONTROL PLANE:          VERIFIED (472/472 checks PASS — Verificador v1.3.0)
PRODUCCIÓN / GATE-13:   CLOSED_DENIED
```
