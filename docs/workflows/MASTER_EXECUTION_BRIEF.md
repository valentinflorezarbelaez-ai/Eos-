# EOS — MASTER EXECUTION BRIEF

**Próximo ciclo operacional:** Value Plane → Evidencia → Producto → Aprendizaje  
**Fecha:** 2026-08-14  
**Technical Baseline:** 287/287 `npm test` + 472/472 `verify:strict`  
**Isolation Invariant:** ZERO UNAUTHORIZED DELTA ($\Delta = 0$)  
**Target:** `PRJ-FUNDACION`  
**GAP-002:** `PENDING_PO_VALIDATION`  
**VAL-EXPERIMENT-002:** `READY / BLOCKED BY GAP-002`  
**Production:** `GATE-13 CLOSED`

---

## 1. Misión

No ampliar el Core por especulación. Mantener la baseline técnica y avanzar hacia evidencia real de valor para usuarios.

### Objetivos
1. Preservar la baseline técnica consolidada.
2. Resolver `GAP-002` con fuente oficial y validación formal del PO.
3. Ejecutar `VAL-EXPERIMENT-002` exactamente como fue congelado.
4. Generar `VAL-EVD-002`.
5. Auditar independientemente el experimento de valor.
6. Convertir los resultados en una decisión explícita de producto.
7. Implementar únicamente bajo autorización de alcance explícita.
8. Mantener los targets externos 100% protegidos e inmutables fuera de autorización.

---

## 2. Reglas Innegociables

* **UNKNOWN:** `UNKNOWN` permanece `UNKNOWN` hasta completar `SOURCE ➔ PROVENANCE ➔ PO VALIDATION ➔ EVIDENCE`.
* **ZERO UNAUTHORIZED DELTA:** Aislamiento = `BASELINE ➔ EXECUTION ➔ FINAL STATE ➔ UNAUTHORIZED DELTA = 0`.
* **NO POST-HOC CHANGES:** No cambiar hipótesis, variantes, población, métricas ni criterios después de observar resultados. Una modificación crea una nueva versión experimental.
* **USER VALUE FIRST:** Toda decisión debe responder: quién usa, qué quiere lograr, qué fricción existe, qué evidencia lo demuestra y qué outcome se quiere mejorar.
* **EVIDENCE > ASSERTION:** No reportar *verified*, *improved* o *successful* sin evidencia reproducible.
* **NO SELF-CERTIFICATION:** El ejecutor no puede ser la única autoridad que certifique su propia ejecución.
* **NO EXTERNAL WRITE WITHOUT GATE:** Toda escritura no prevista en una autorización requiere `STOP + GAP + NUEVA DECISIÓN`.

---

## 3. Pre-Flight Check

Antes de cualquier fase:
1. `npm test` (287/287 PASS requerido).
2. `npm run verify:strict` (472/472 PASS requerido).
3. Registrar `TreeHash` del target.
4. Registrar Git state (`git status`, working tree limpio).
5. Registrar hash del verificador.
6. Verificar `GATE-13 = CLOSED`.
7. Verificar que `GAP-002` sigue en el estado canónico.
8. Verificar que no existen modificaciones no autorizadas en targets externos.

> **Stop Condition:** Si falla la baseline: `STOP — BASELINE REGRESSION`.

---

## 4. Fase A — GAP-002 Provenance & Validation

* **Archivo canónico:** `docs/intelligence/user/FUNDACION_GAP_002_OFFICIAL_DATA.json` (inicialmente todos los campos en `UNKNOWN`).
* **Workflow:** `SOURCE ➔ PARSE ➔ PROVENANCE ➔ PO VALIDATION ➔ EVIDENCE ➔ GAP-002 CLOSED`
* **Prohibiciones absolutas:**
  * ❌ No inferir NIT.
  * ❌ No inferir personería o estado legal.
  * ❌ No inferir cuentas bancarias.
  * ❌ No inferir datos legales desde un dominio web.
  * ❌ No usar datos plausibles como si fueran oficiales.
* **Entregable:** `EVD-FUNDACION-GAP-002-001.json`

---

## 5. Fase B — VAL-EXPERIMENT-002

**Diseño congelado:** `CONTROL ➔ A ➔ A+B ➔ A+B+C`

* **CONTROL:** Baseline `VAL-EVD-001`.
* **VARIANTE A:** Solo datos institucionales oficiales validados.
* **VARIANTE B:** Variante A + banner de acreditación proactivo.
* **VARIANTE C:** Variante A + B + centro documental de transparencia.
* **Anti-Bloat Guard:** No agregar calculadora de impacto, animaciones ornamentales, SDKs de pago no especificados, ni despliegues a producción.

### Métricas
* **Outcomes:** Trust Score, Task Completion, Drop-off, Time-on-task, Comprehension.
* **Enablers Técnicos:** FCP, LCP, INP, Accesibilidad WCAG AA.
* *Regla:* No mezclar outcomes de usuario con enablers técnicos.

### Criterios Inmutables
* $\text{Trust} \ge 8.5 / 10$
* $\text{Completion} \ge 90\%$
* $\text{Drop-off} \le 10\%$
* *Veredictos válidos:* `CONFIRMED`, `PARTIALLY_SUPPORTED`, `REFUTED`, `INCONCLUSIVE`.

### Análisis Causal
Calcular:
* $\Delta A = A - \text{Control}$
* $\Delta B = B - A$
* $\Delta C = C - B$

---

## 6. Auditoría Independiente y Decisión de Producto

* **Auditoría:** Generar `docs/audits/FUNDACION_VAL_EXPERIMENT_002_INDEPENDENT_AUDIT.md`.
* **Decisión de Producto:** Únicamente posterior a la auditoría independiente:
  * `IMPLEMENT`
  * `ITERATE`
  * `DO_NOT_BUILD`
  * `INCONCLUSIVE`

### Pipeline de Implementación Autorizada
$$\text{USER EVIDENCE} \to \text{REQUIREMENTS} \to \text{UX} \to \text{PROPOSED DAG} \to \text{PO AUTHORIZATION} \to \text{CONTROLLED WRITE} \to \text{MUTATION AUDIT} \to \text{INDEPENDENT VERIFY} \to \text{USER RE-TEST}$$

---

## 7. Criterios de Parada Inmediata (Stop Conditions)

Ejecutar **STOP** inmediato si:
1. Aparece un intento de escritura fuera del scope autorizado.
2. Cambia el verificador durante el proceso de certificación.
3. Se detecta un secreto o credencial expuesta.
4. Ocurre egress de red no autorizado en modo sintético.
5. Un valor `UNKNOWN` es sustituido sin fuente oficial ni validación PO.
6. Se intenta modificar evidencia histórica.
7. Existe contradicción entre el DAG aprobado y la ejecución real.
8. Falla un rollback.
9. La autorización es ambigua, insuficiente o expiró.
10. Se intentan modificar los criterios de éxito *post-hoc*.

---

## 8. Definition of Done (DoD)

- [ ] `GAP-002` resuelto o rigurosamente documentado como bloqueado.
- [ ] `VAL-EXP-002` ejecutado sin contaminación ni mutaciones no autorizadas.
- [ ] `VAL-EVD-002` generado y versionado.
- [ ] Auditoría independiente completada.
- [ ] Decisión de producto formalizada.
- [ ] Baseline técnica intacta (`287/287` + `472/472`).
- [ ] Fundación con $\Delta = 0$ fuera de autorización.
- [ ] `GATE-13` cerrado.
