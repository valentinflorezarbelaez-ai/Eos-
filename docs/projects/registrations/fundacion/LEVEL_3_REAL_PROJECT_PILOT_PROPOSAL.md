# REGISTRO DE PROPUESTA DE PILOTO REAL — PRJ-FUNDACION (V2)
## Propuesta de DAG Encadenado y Matriz de Permisos por Operación (Nivel 3)

**Identificador de Propuesta:** `PROP-L3-FUNDACION-REAL-V2`  
**DAG ID:** `DAG-L3-FUNDACION-PILOT-V2`  
**Fecha:** 2026-08-14  
**Proyecto Target:** `PRJ-FUNDACION` (`C:\Users\valen\Documents\Fundacion`)  
**Estatus:** `PROPOSAL — AWAITING PO DECISION-GATE-L3-REAL-001`  
**Modo de Operación:** `LEVEL_3_CONTROLLED_REAL_PILOT`  
**Escritura en Repositorio Real:** `BLOCKED (Hasta autorización explícita)`  
**Producción / Gate-13:** `CLOSED`

---

## 1. Matriz Granular de Permisos por Operación y Path

Se erradica la ambigüedad clasificando taxativamente cada ruta entre **Existente Solo Lectura**, **Existente con Mutación Delimitada** y **Nueva Creación Autorizada**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MATRIZ DE PERMISOS POR OPERACIÓN Y PATH (V2)                │
├──────────────────────────┬──────────────────────┬───────────────────────────┤
│ Path                     │ Categoría            │ Operaciones Permitidas    │
├──────────────────────────┼──────────────────────┼───────────────────────────┤
│ .gitignore               │ EXISTING_READ_ONLY   │ READ ONLY                 │
│ .editorconfig            │ EXISTING_READ_ONLY   │ READ ONLY                 │
│ index.html               │ EXISTING_READ_ONLY   │ READ ONLY (INMUTABLE)     │
│ src/styles/main.css      │ EXISTING_READ_ONLY   │ READ ONLY (INMUTABLE)     │
│ src/config/legal.json    │ EXISTING_READ_ONLY   │ READ ONLY (GAP-002 PROT.) │
├──────────────────────────┼──────────────────────┼───────────────────────────┤
│ package.json             │ EXISTING_MODIFY      │ READ, MODIFY (scripts.test│
│                          │                      │ exclusivamente; NO deps)  │
│ src/js/main.js           │ EXISTING_MODIFY      │ READ, MODIFY (Orquestador)│
│ deployment.manifest.json │ EXISTING_MODIFY      │ READ, MODIFY (Metadata L3)│
├──────────────────────────┼──────────────────────┼───────────────────────────┤
│ src/js/modules/dom.js    │ NEW_CREATE           │ CREATE, READ              │
│ src/js/modules/theme.js  │ NEW_CREATE           │ CREATE, READ              │
│ src/js/modules/clipboard │ NEW_CREATE           │ CREATE, READ              │
│ tests/unit/dom.test.js   │ NEW_CREATE           │ CREATE, READ (Test único) │
└──────────────────────────┴──────────────────────┴───────────────────────────┘
```

> **PROTECCIONES ESTRICTAS:**
> - `index.html`, `legal.json` y `main.css` permanecen **estrictamente de solo lectura**, garantizando la neutralidad semántica alcanzada en `REM-001A`.
> - `package.json` solo permite mutación en la clave `scripts.test`. **Cero instalación o alteración de dependencias.**

---

## 2. DAG Encadenado y Trazabilidad de Tareas (`DAG-L3-FUNDACION-PILOT-V2`)

```mermaid
graph TD
    P0[PRE-FLIGHT: Snapshot0 + Verifier Parity SHA-256] --> T1[TASK-001: CREATE Submódulos JS en src/js/modules/]
    T1 --> T2[TASK-002: MODIFY src/js/main.js como Orquestador Limpio]
    T2 --> T3[TASK-003: CREATE tests/unit/dom.test.js Hermético]
    T3 --> T4[TASK-004: MODIFY package.json solo scripts.test]
    T4 --> T5[TASK-005: EXECUTE npm test local hermético]
    T5 --> T6[TASK-006: MODIFY deployment.manifest.json Metadata L3]
    T6 --> T7[TASK-007: AUDIT Target Mutation Audit + Evidence]
    
    style P0 fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    style T1 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    style T2 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    style T3 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    style T4 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    style T5 fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    style T6 fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    style T7 fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
```

---

## 3. Modelo Tripartito Consolidado

- **`authorized_files` (12 archivos):** 8 existentes + 3 módulos JS + 1 test unitario hermético.
- **`authorized_metadata_dirs` (1 directorio):** `.git/`.
- **`authorized_container_dirs` (7 directorios):** `src/`, `src/styles/`, `src/config/`, `src/js/`, `src/js/modules/`, `tests/`, `tests/unit/`.
- **`forbidden_scope`:** Todo path no listado, operaciones no concedidas a su categoría, conexiones de red, secretos, DNS o producción.

---

## 4. Estado de la Propuesta

```text
COMPUERTA:              DECISION-GATE-L3-REAL-001 (PENDIENTE)
ESTADO DE EJECUCIÓN:    BLOCKED
TARGET FUNDACION:       100% FROZEN (0 mutaciones)
PRODUCCIÓN / GATE-13:   CLOSED
```
