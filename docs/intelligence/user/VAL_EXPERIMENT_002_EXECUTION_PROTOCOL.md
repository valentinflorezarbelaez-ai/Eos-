# EOS — VAL-EXPERIMENT-002 EXECUTION PROTOCOL
## Institutional Trust & Task Completion Accumulative Experiment

* **Identificador:** `VAL-EXP-FND-002`
* **Proyecto:** `PRJ-FUNDACION`
* **Status:** `READY / BLOCKED BY GAP-002`
* **Diseño:** Secuencial Acumulado (`CONTROL ➔ A ➔ A+B ➔ A+B+C`)

---

## 1. Variantes Experimentales Congeladas

```text
┌─────────────┬─────────────────────────────────┬───────────────────────────────┐
│ Variante    │ Intervención                    │ Registro de Evidencia         │
├─────────────┼─────────────────────────────────┼───────────────────────────────┤
│ CONTROL     │ Baseline VAL-EVD-001            │ VAL-EVD-002-CONTROL.json      │
│ VARIANTE A  │ Control + Datos Oficiales       │ VAL-EVD-002-A.json            │
│ VARIANTE B  │ Variante A + Banner Acreditación│ VAL-EVD-002-B.json            │
│ VARIANTE C  │ Variante B + Transparencia Doc  │ VAL-EVD-002-C.json            │
└─────────────┴─────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Invariantes de Medición (Target Inmutable)
* **Trust Score Target:** $\ge 8.5 / 10.0$
* **Task Completion Target:** $\ge 90.0\%$
* **Drop-off Target:** $\le 10.0\%$

### Separación de Métricas
* **Outcomes Primarios:** Trust, Completion, Drop-off, Time-on-task, Comprehension.
* **Enablers Técnicos:** FCP, LCP, INP, Accesibilidad WCAG AA.
* *Regla:* Mantener estrictamente separados los outcomes de usuario de las métricas de rendimiento web.

---

## 3. Pre-Flight Check por Variante
Antes de inicializar la medición de cada variante:
1. `TreeHash` de los artefactos de la variante.
2. Git state limpio.
3. Hash del verificador.
4. Versión del experimento (`v1.2.0`).
5. Versión de la línea base de valor (`VAL-EVD-001`).
6. Identificador de variante (`CONTROL`, `VAR-A`, `VAR-B`, `VAR-C`).
7. Estado de compuerta `GATE-13 = CLOSED`.

---

## 4. Metodología Think-Aloud y Clasificación de Hallazgos
Para evitar sesgos interpretativos, todo feedback cualitativo se categoriza en:
1. **OBSERVATION:** Hecho empírico observable (qué hizo el usuario, dónde clickeó, qué leyó).
2. **INTERPRETATION:** Significado contextual de la acción.
3. **HYPOTHESIS:** Causa subyacente que motiva el comportamiento.
4. **INSIGHT:** Principio general aplicable a la experiencia de usuario.

> Prohibido universalizar una única observación aislada como verdad absoluta.

---

## 5. Análisis Causal por Deltas Marginales
El análisis no evalúa únicamente el salto final ($C - \text{Control}$), sino los aportes marginales exactos de cada elemento:

$$\Delta A = A - \text{Control} \quad (\text{Efecto exclusivo de datos institucionales})$$
$$\Delta B = B - A \quad (\text{Efecto incremental de comunicación de acreditación})$$
$$\Delta C = C - B \quad (\text{Efecto incremental de centro documental})$$

### Veredictos Epistémicos Admitidos
* `CONFIRMED`: Todas las métricas superaron los umbrales inmutables con significancia clara.
* `PARTIALLY_SUPPORTED`: Mejora observada pero sin alcanzar todos los umbrales fijados.
* `REFUTED`: La intervención no produjo mejora o incrementó el drop-off.
* `INCONCLUSIVE`: Variabilidad alta o muestra insuficiente para determinar causalidad.

---

## 6. Auditoría Independiente y Decisión de Producto
* Generar `docs/audits/FUNDACION_VAL_EXPERIMENT_002_INDEPENDENT_AUDIT.md`.
* La auditoría verificará: integridad de variantes, congelamiento de métricas, ausencia de alteraciones post-hoc y trazabilidad de UNKNOWNs.
* **Decisiones de Producto posibles:** `IMPLEMENT` | `ITERATE` | `DO_NOT_BUILD` | `INCONCLUSIVE`.

> **Regla de Oro:** El experimento existe para descubrir si la hipótesis es correcta, no para forzar una demostración de que lo era.
