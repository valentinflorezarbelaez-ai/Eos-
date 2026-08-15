# EOS — LEVEL 3 GOVERNANCE PACKAGE
## Pilar 2 — Modelo de Perímetro y Mutación Ampliado (Expanded Mutation Model)

**Estado:** `PROPOSAL — NOT AUTHORIZED`

**Autonomy Execution Status:** `BLOCKED`

**Target Scope:** Control Plane only

**Production / GATE-13:** `CLOSED`

**Precedent Baseline:** `LEVEL_2_REMEDIATED_CERTIFIED` & Tripartite Scope Model

---

## 1. Propósito y Filosofía

Definir de manera formal, determinista e inequívoca el espacio de mutaciones admisibles en Nivel 3.

> **Invariantes Fundamentales:**
> 1. **`ALLOW` no significa `UNBOUNDED`:** Ningún nivel de autonomía confiere permisos genéricos o implícitos.
> 2. **Principio de Contención Estructural:** Un `AUTHORIZED_CONTAINER_DIR` nunca concede autoridad implícita sobre sus contenidos presentes o futuros.
> 3. **Trinidad Operacional:** Toda mutación admisible de Nivel 3 debe ser **atribuible (1:1 a una tarea autorizada)**, **observable (mediante fuente reproducible)** y **reversible (con rollback demostrado)**.

---

## 2. Las 7 Preguntas Cardinales de Mutación

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MATRIZ DE DECISIÓN DE MUTACIÓN                        │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. ¿QUÉ puede mutar EOS?      │ Exclusivamente elementos en AUTHORIZED_FILES│
│ 2. ¿QUIÉN lo autoriza?        │ Product Owner + Decision Gate explícita     │
│ 3. ¿BAJO QUÉ precondición?    │ Spec aprobada + Intake completo + Audit OK  │
│ 4. ¿CÓMO se observa?          │ Filesystem diff + Process & Egress monitor  │
│ 5. ¿CÓMO se atribuye?         │ 1:1 a Task ID en DAG inmutable              │
│ 6. ¿CÓMO se revierte?         │ Snapshot / Git Rollback con paridad SHA-256 │
│ 7. ¿QUÉ invalida la mutación? │ Discrepancia de scope, secreto o egress leak│
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 3. Especificación de Secciones (MM-001 a MM-012)

### MM-001 — Mutation Taxonomy

Se define la taxonomía estricta de acciones mutacionales. Toda operación ejecutada por un agente debe pertenecer a una de las siguientes clases discretas:

| Operación | Semántica | Nivel 2 | Nivel 3 (Propuesto) | Producción |
|---|---|---|---|---|
| `READ_ONLY` | Inspección pasiva de archivos, procesos o configuración. | Permitido | Permitido | Permitido |
| `PROPOSE` | Generación de planes, diffs o artefactos en Control Plane. | Permitido | Permitido | Permitido |
| `CREATE` | Creación de un archivo nuevo explícitamente listado. | Controlado | Controlado | Requiere PO Sign-off |
| `MODIFY` | Edición de contenido en archivo existente autorizado. | Controlado | Controlado | Requiere PO Sign-off |
| `DELETE` | Eliminación de archivos o carpetas. | **PROHIBIDO** | **RESTRINGIDO (Requiere Gate)** | **PROHIBIDO** |
| `RENAME` | Cambio de nombre de path autorizado. | **PROHIBIDO** | **RESTRINGIDO (Requiere Gate)** | **PROHIBIDO** |
| `MOVE` | Traslado de un archivo entre directorios. | **PROHIBIDO** | **RESTRINGIDO (Requiere Gate)** | **PROHIBIDO** |
| `EXECUTE` | Ejecución de comandos de build/test en entorno local. | Controlado | Controlado | Controlado |
| `DEPENDENCY_CHANGE` | Alteración de `package.json` o gestor de paquetes. | **PROHIBIDO** | **RESTRINGIDO (Solo devDeps)** | **PROHIBIDO** |
| `CONFIG_CHANGE` | Alteración de variables de entorno o configuraciones. | **PROHIBIDO** | **RESTRINGIDO (Solo dev/mock)**| **PROHIBIDO** |
| `NETWORK_ACCESS` | Egress a internet, endpoints externos o APIs. | **PROHIBIDO** | **PROHIBIDO** | **PROHIBIDO** |
| `SECRET_ACCESS` | Lectura o escritura de API keys, tokens o credenciales. | **PROHIBIDO** | **PROHIBIDO** | **PROHIBIDO** |
| `DEPLOYMENT` | Publicación en hosting, DNS o infraestructura cloud. | **PROHIBIDO** | **PROHIBIDO (GATE-13)** | **GATE-13 REQUIERE PO** |

---

### MM-002 — Scope Classes

El perímetro de cualquier operación se modela a través de cuatro clases disjuntas:

1. **`AUTHORIZED_FILES`:** Conjunto finito y explícito de rutas de archivo relativas a la raíz del target:
   $$\text{AuthorizedFiles} = \{ f_1, f_2, \dots, f_n \}$$
2. **`AUTHORIZED_METADATA_DIRS`:** Directorios con semántica propia de herramientas versionadoras locales (ej. `.git/`). Su estructura interna no es alterable directamente excepto mediante comandos de herramienta autorizados (`git init`).
3. **`AUTHORIZED_CONTAINER_DIRS`:** Directorios estructurales requeridos exclusivamente como contenedores jerárquicos de `AUTHORIZED_FILES`.
4. **`FORBIDDEN_SCOPE`:** Complemento universal de las clases anteriores. Todo path $p \notin (\text{Files} \cup \text{MetadataDirs} \cup \text{ContainerDirs})$ es estrictamente `FORBIDDEN`.

---

### MM-003 — Permission Semantics

- La concesión de un permiso de nivel superior (ej. `MODIFY`) **no implica** permisos de `DELETE`, `RENAME` o `DEPENDENCY_CHANGE`.
- Los permisos son **atómicamente asignados por tarea**:
  $$\text{TaskPermissions} = \langle \text{TaskID}, \text{TargetFile}, \text{AllowedOperations}, \text{PreconditionGate} \rangle$$
- Si una tarea declarada como `MODIFY` intenta un `DELETE`, el runtime debe abortar inmediatamente (`MUTATION_TRAP_TRIGGERED`).

---

### MM-004 — Precondition Gates

Ninguna mutación de Nivel 3 puede iniciarse sin la satisfacción verificable de su compuerta de precondición:

```text
[INTAKE_COMPLETE]
       ↓
[SPEC_APPROVED]
       ↓
[AUDIT_CLEAN]
       ↓
[OWNER_AUTHORIZATION]
       ↓
[PRE-FLIGHT_SNAPSHOT_TAKEN]
       ↓
MUTATION EXECUTION
```

Si el snapshot previo a la mutación falla, la ejecución se bloquea automáticamente (`MUTATION_ABORT_PRE_FLIGHT`).

---

### MM-005 — Mutation Attribution

Cada byte modificado en el sistema de archivos del target debe ser atribuible a un único registro de DAG:

$$\forall \Delta \in \text{ActualChangeset} \implies \exists ! \text{Task} \in \text{ApprovedDAG} \mid \Delta \subseteq \text{Task.target\_files}$$

Cualquier mutación no atribuible genera un veredicto inmediato de `MUTATION_AUDIT_FAIL`.

---

### MM-006 — Dependency Boundary

- **Runtime Dependencies:** Estrictamente `PROHIBIDAS` en Nivel 3 sin excepción expresa del Product Owner.
- **Dev / Tooling Dependencies:** Permitidas únicamente si están explícitamente declaradas en la especificación (`SPEC`) y validadas por el auditor de seguridad (`security-auditor`).
- **Instalación de paquetes:** Debe ejecutarse con flags de inmutabilidad (`--frozen-lockfile` o equivalente).

---

### MM-007 — Metadata Boundary

- La metadata de Git local (`.git/`) está autorizada exclusivamente para operaciones de rastreo de cambios locales (`git init`, `git status`, `git add`, `git commit`).
- Operaciones remotas (`git push`, `git remote add`, `git clone`, `git fetch`) están **ESTRICTAMENTE PROHIBIDAS**.
- Cero interacción con credenciales SSH o tokens de autenticación GitHub/GitLab.

---

### MM-008 — Runtime & Process Boundary

- Los procesos iniciados por EOS deben ser efímeros, acotados y monitoreados.
- Todo comando de shell debe ejecutarse dentro del workspace autorizado.
- Prohibida la ejecución de daemons no declarados o procesos en background no supervisados.

---

### MM-009 — Network & Egress Boundary

- **Egress Policy:** `DENY_ALL` por defecto.
- Toda operación de Nivel 3 debe poder completarse 100% offline.
- La ausencia de conexiones de red debe ser comprobable mediante el arnés de observabilidad (`OBSERVABILITY_EGRESS_PROOF`).

---

### MM-010 — Revocation Semantics

Si durante la ejecución ocurre cualquiera de los siguientes eventos:
1. Intento de escritura en `FORBIDDEN_SCOPE`.
2. Detección de clave/secreto en payload o código.
3. Señal de interrupción del Product Owner.
4. Fallo de invariante o regla epistemológica.

El sistema ejecuta la secuencia de **Revocación Inmediata**:
```text
SIGNAL RECEIVED / ANOMALY DETECTED
               │
               ▼
   [HALT ACTIVE SUBPROCESSES]
               │
               ▼
   [LOCK TARGET WRITE BARRIER]
               │
               ▼
[MARK TASK AS REVOKED_IN_FLIGHT]
               │
               ▼
    [TRIGGER ROLLBACK ENGINE]
```

---

### MM-011 — Rollback Semantics

El motor de reversión debe restaurar el target al estado exacto previo a la ejecución:

1. **Restauración Atómica:** Reversión de todos los archivos modificados/creados utilizando el snapshot pre-flight (`L3-PREFLIGHT-SNAPSHOT`).
2. **Eliminación de Residuos:** Limpieza estricta de archivos creados durante la tarea fallida.
3. **Verificación de Paridad:** Comprobación de que el hash del árbol de archivos coincide al 100% con el baseline pre-flight:
   $$\text{TreeHash}(\text{Current}) == \text{TreeHash}(\text{PreFlight}) \quad (\Delta = 0)$$
4. **Emisión de Evidencia:** Emisión del registro de reversión `EVD-ROLLBACK-*.json`.

---

### MM-012 — Evidence Requirements

Toda mutación de Nivel 3 concluida debe generar un artefacto de evidencia estructurado que contenga obligatoriamente:

```json
{
  "evidence_id": "EVD-L3-MUTATION-XXXX",
  "task_id": "TASK-XXX",
  "pre_flight_tree_hash": "SHA-256...",
  "post_flight_tree_hash": "SHA-256...",
  "authorized_changeset": ["file1", "file2"],
  "actual_changeset": ["file1", "file2"],
  "attribution_check": "100% PASS",
  "egress_monitoring_verdict": "ZERO_EGRESS_VERIFIED",
  "secrets_scan_verdict": "ZERO_SECRETS_VERIFIED",
  "verifier_cryptographic_parity": "VERIFIED_IDENTICAL"
}
```

---

## 4. Estado de Este Documento

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
ADVERSARIAL HARNESS SPECIFICATION (Pilar 3)
```

---

## 5. Decisión Requerida

La adopción formal de este modelo de mutación como estándar de Nivel 3 requiere aprobación explícita del Product Owner y su validación cruzada con los Pilares 1, 3, 4 y 5.
