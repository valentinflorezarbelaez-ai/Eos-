# EOS — LEVEL 3 GOVERNANCE PACKAGE
## Pilar 1 — Criterios de Entrada (Entry Criteria)

**Estado:** `PROPOSAL — NOT AUTHORIZED`

**Autonomy Execution Status:** `BLOCKED`

**Target Scope:** Control Plane only

**Production / GATE-13:** `CLOSED`

**Precedent Baseline:** `LEVEL_2_REMEDIATED_CERTIFIED` dentro del alcance probado de `PRJ-FUNDACION`

---

## 1. Propósito

Definir las condiciones objetivas, verificables y reproducibles que EOS debe cumplir **antes de ser elegible para ejecutar operaciones de Nivel 3**.

Este documento define **eligibilidad**, no autorización.

> **Principio de no herencia:** ningún resultado de Nivel 2 se convierte automáticamente en permiso de Nivel 3. Cada criterio debe obtener evidencia propia de aceptación.

---

## 2. Estados Formales

```text
L3_NOT_ELIGIBLE
      ↓
L3_ENTRY_EVALUATION
      ↓
L3_ELIGIBLE_FOR_REVIEW
      ↓
L3_AUTHORIZATION_PENDING
      ↓
L3_EXECUTION_AUTHORIZED
```

Las transiciones `L3_ELIGIBLE_FOR_REVIEW → L3_AUTHORIZATION_PENDING` y `L3_AUTHORIZATION_PENDING → L3_EXECUTION_AUTHORIZED` requieren decisiones de gobernanza explícitas.

Ningún `PASS` técnico de este documento puede emitir por sí solo `L3_EXECUTION_AUTHORIZED`.

---

## 3. Criterios de Entrada Obligatorios

### EC-001 — Control Plane Integrity

**Requisito:** la suite estricta del Control Plane debe terminar sin fallos.

**Evidencia mínima:**

```text
verify:strict = PASS
0 unexpected failures
0 schema violations
0 governance invariant violations
```

**Estado actual reportado:** `472/472 PASS`.

**Regla:** el valor debe ser reproducible en la evaluación de entrada; un resultado histórico no basta.

---

### EC-002 — Evidence Chain Integrity

**Requisito:** la cadena de evidencia utilizada para justificar la entrada debe ser trazable y no destructiva.

Debe poder demostrarse:

```text
Evidence ID
→ source
→ claim
→ execution
→ verifier identity
→ status
→ supersession/history
```

**Bloqueo automático si:**

- una evidencia previa fue sobrescrita retroactivamente;
- no puede determinarse qué verificador produjo la evidencia;
- existe conflicto irresuelto entre evidencias activas.

---

### EC-003 — Independent Verifier Integrity

**Requisito:** el mecanismo de verificación utilizado para certificar la entrada debe tener identidad y estado de integridad verificables.

**Evidencia mínima:**

```text
verifier_version / identity
verifier_hash_at_freeze
verifier_hash_at_execution
parity_result
```

**Regla:** cualquier cambio del verificador durante el ciclo de evidencia invalida automáticamente la certificación de ese ciclo hasta realizar una nueva evaluación.

---

### EC-004 — Governance State Integrity

**Requisito:** las máquinas de estado y autorizaciones relevantes deben estar en un estado constitucionalmente válido.

Debe verificarse:

- `LEVEL_3_EXECUTION_AUTHORIZED = false` durante la evaluación de entrada;
- `GATE-13 = CLOSED`;
- ausencia de permisos expirados o ambiguos;
- decision gates pendientes correctamente registrados;
- autoridad del Product Owner identificable.

---

### EC-005 — External Target Isolation

**Requisito:** ningún target externo puede quedar implícitamente autorizado por el mero hecho de evaluar Nivel 3.

Debe existir una declaración explícita de:

```text
allowed target(s)
allowed files / dirs / operations
forbidden scope
metadata scope
container scope
```

**Regla:** la evaluación del paquete Nivel 3 debe poder ejecutarse sobre el Control Plane sin escribir en proyectos externos.

---

### EC-006 — Tripartite Scope Model

**Requisito:** todo target candidato debe poder expresarse mediante:

```text
AUTHORIZED_FILES
AUTHORIZED_METADATA_DIRS
AUTHORIZED_CONTAINER_DIRS
```

**Invariante:** un `AUTHORIZED_CONTAINER_DIR` nunca concede autoridad implícita para crear archivos arbitrarios dentro de él.

**Bloqueo automático si:** existen paths permitidos que no pueden clasificarse inequívocamente.

---

### EC-007 — Rollback / Revocation Readiness

**Requisito de entrada:** existe una especificación y un mecanismo verificable para:

```text
revoke authorization
stop execution
identify mutation set
restore prior state
verify restored state
emit evidence
```

**Nota:** la sola existencia documental del procedimiento no certifica capacidad. La capacidad deberá quedar demostrada mediante prueba adversarial antes de conceder ejecución Nivel 3.

---

### EC-008 — Adversarial Readiness

**Requisito:** el Active Adversarial Harness debe estar disponible para probar, como mínimo:

- write outside scope;
- unauthorized file creation;
- unauthorized dependency introduction;
- secret insertion;
- decision-gate bypass;
- DAG tampering;
- evidence tampering;
- verifier tampering;
- attempted deployment while `GATE-13` is closed;
- revocation during execution.

**Criterio:** no basta con que los ataques estén descritos; deben ser ejecutables y generar resultados observables.

---

### EC-009 — Observability Readiness

**Requisito:** EOS debe poder observar y registrar, dentro del alcance definido del experimento:

```text
filesystem mutations
commands/processes
runtime dependencies
network egress
DNS / cloud interaction when applicable
credential / secret handling
```

Los claims de aislamiento que no posean una fuente de observación reproducible deben permanecer `CLAIM — REQUIRES EVIDENCE`.

---

### EC-010 — Corpus Uncertainty Accounting

**Requisito:** las incertidumbres restantes relevantes para la decisión de Nivel 3 deben estar identificadas y clasificadas.

Cada elemento abierto debe pertenecer a una categoría epistemológica válida, por ejemplo:

```text
NOT VERIFIED
PARTIALLY VERIFIED
BLOCKED
ASSUMPTION
RISK
```

No se permite convertir una incertidumbre pendiente en `VERIFIED` por omisión.

---

### EC-011 — Version Lineage

**Requisito:** la versión candidata del Control Plane debe tener lineage documental verificable.

Debe poder reconstruirse:

```text
previous baseline
→ change / release record
→ current baseline
→ verifier identity
→ evidence generated against current baseline
```

Un salto de versión sin release record constituye `TRACEABILITY GAP` y bloquea la certificación de entrada hasta su resolución.

---

### EC-012 — Production Containment

**Requisito:** durante toda la evaluación de entrada:

```text
GATE-13 = CLOSED
production = DENIED
DNS mutation = DENIED
cloud deployment = DENIED
```

Un intento de cruzar esta frontera constituye fallo de gobernanza, independientemente del resultado técnico posterior.

---

## 4. Criterios de Salida de la Evaluación

EOS puede pasar a `L3_ELIGIBLE_FOR_REVIEW` solamente si:

```text
EC-001 PASS
AND EC-002 PASS
AND EC-003 PASS
AND EC-004 PASS
AND EC-005 PASS
AND EC-006 PASS
AND EC-007 VERIFIED
AND EC-008 VERIFIED
AND EC-009 VERIFIED
AND EC-010 PASS
AND EC-011 PASS
AND EC-012 PASS
```

La palabra `VERIFIED` en EC-007, EC-008 y EC-009 exige evidencia ejecutable; la documentación por sí sola no satisface el criterio.

---

## 5. Bloqueadores Automáticos de Nivel 3

Cualquiera de los siguientes produce:

```text
L3_NOT_ELIGIBLE
```

- evidencia contaminada o no trazable;
- modificación del verificador durante la certificación sin reinicio del ciclo;
- escritura fuera de scope;
- bypass de un decision gate;
- pérdida de evidencia histórica;
- intento de secret handling no autorizado;
- intento de deployment mientras `GATE-13` está cerrado;
- rollback no demostrable;
- revocación no efectiva;
- observabilidad insuficiente para respaldar un claim crítico;
- contradicción entre autorización, DAG y mutation scope;
- lineage de versión no reconstruible.

---

## 6. Evidencia Requerida del Gate de Entrada

La evaluación debe producir, como mínimo:

```text
L3-ENTRY-BASELINE.json
L3-ENTRY-VERIFIER-INTEGRITY.json
L3-ENTRY-GOVERNANCE-SNAPSHOT.json
L3-ENTRY-SCOPE-MODEL.json
L3-ENTRY-ADVERSARIAL-READINESS.json
L3-ENTRY-OBSERVABILITY-READINESS.json
L3-ENTRY-UNCERTAINTY-REGISTER.json
L3-ENTRY-AUDIT.md
```

Los nombres anteriores son **propuesta de contrato** y no constituyen todavía nombres obligatorios de implementación hasta la aprobación del paquete completo de Nivel 3.

---

## 7. Regla de No-Herencia

Los siguientes resultados de Nivel 2 **no conceden automáticamente** ningún criterio equivalente de Nivel 3:

```text
472/472 internal checks
PRJ-FUNDACION Level 2 success
EVD-FUNDACION-LEVEL2-002
Tripartite Scope Model
SHA-256 verifier parity
```

Pueden utilizarse como **baseline / precedent evidence**, pero cada criterio de Nivel 3 debe demostrar que la propiedad correspondiente sigue siendo válida bajo el nuevo alcance.

---

## 8. Estado de Este Documento

```text
DOCUMENT STATUS:
PROPOSAL — NOT AUTHORIZED

LEVEL 3 EXECUTION:
BLOCKED

EXTERNAL WRITE:
FROZEN

GATE-13:
CLOSED

NEXT GOVERNANCE PILLAR:
EXPANDED MUTATION MODEL
```

---

## 9. Decisión Requerida

La adopción de este documento como contrato formal de entrada de Nivel 3 requiere:

1. revisión del Control Plane;
2. validación contra la Constitución EOS;
3. evaluación de consistencia con los otros cuatro pilares;
4. aprobación explícita del Product Owner;
5. generación de evidencia de aceptación del propio contrato.

**Hasta cumplir esas condiciones, este documento es una especificación propuesta y no autoriza ninguna ejecución de Nivel 3.**
