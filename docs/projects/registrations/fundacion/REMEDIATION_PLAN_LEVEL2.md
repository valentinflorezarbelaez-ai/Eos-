# REMEDIATION PLAN & GOVERNANCE GATE — LEVEL 2 FIRST WRITE (PRJ-FUNDACION)

* **Project ID:** `PRJ-FUNDACION`
* **Plan ID:** `PLAN-REM-FUNDACION-001`
* **Date:** 2026-08-14
* **Status:** `REM-001_EXECUTED — AWAITING INDEPENDENT AUDIT`
* **Decision Gate:** `DECISION-GATE-REM-001` (`AUTHORIZED`)
* **Target Workspace:** `C:\Users\valen\Documents\Fundacion`

---

## 1. Decision Gate Definition: `DECISION-GATE-REM-001`

| Field | Value |
|---|---|
| **Gate ID** | `DECISION-GATE-REM-001` |
| **Name** | Level 2 Controlled Remediation Authorization |
| **Status** | `AUTHORIZED` (PO sign-off recorded) |
| **Authorized Scope** | `REM-001` (Semantic Cleanup of `index.html` ONLY) |
| **Production (Gate-13)** | `DENIED / CLOSED` |
| **Autonomy Expansion** | `DENIED / BLOCKED` |
| **Execution State** | `REM-001 EXECUTED` (Fresh Evidence `EVD-FUNDACION-LEVEL2-002` created) |

---

## 2. Remediation Sequence & Dependency DAG

```text
               CURRENT STATE (FROZEN BASELINE)
                             │
                             ▼
              CONTROL PLANE REMEDIATION (NO TARGET WRITES)
              ┌──────────────────────────────┬──────────────────────────────┐
              ▼                                                             ▼
     [REM-002] Verifier Independence                               [REM-003] Tripartite Scope Model
     - Document verify-eos.js change history                       - Define AUTHORIZED_FILES
     - Snapshot verifier hash                                      - Define AUTHORIZED_METADATA_DIRS
     - Freeze verifier baseline                                    - Define AUTHORIZED_CONTAINER_DIRS
              │                                                             │
              └──────────────────────────────┬──────────────────────────────┘
                                             ▼
                                    DECISION-GATE-REM-001
                                (PO Explicit Sign-off Barrier)
                                             │
                                             ▼
                               [REM-001] Semantic Target Cleanup
                               - Target: index.html ONLY
                               - Replace invented data with UNKNOWN
                               - Remove unbacked claims & disable copy btn
                                             │
                                             ▼
                                    Independent Audit
                                             │
                                             ▼
                               Fresh Evidence (EVD-FUNDACION-LEVEL2-002)
                               (EVD-001 preserved as historical NOT VERIFIED)
```

---

## 3. Detailed Work Breakdown

### REM-002: Verifier Independence & Evidence Baseline
* **Scope:** Control Plane only (`scripts/verify-eos.js`, `docs/audits/`).
* **Actions:**
  1. Record the exact audit trail of the in-flight patch applied to `verify-eos.js` in `docs/audits/EOS_VERIFIER_CHANGE_LOG.md`.
  2. Compute and freeze SHA-256 integrity hash of `scripts/verify-eos.js`.
  3. Guarantee that previous evidence `EVD-FUNDACION-LEVEL2-001.json` remains permanently immutable with status `NOT VERIFIED`.
  4. Establish that new certifications must produce `EVD-FUNDACION-LEVEL2-002.json` under the frozen verifier.

### REM-003: Tripartite Scope Governance Model
* **Scope:** Control Plane specification schemas (`docs/projects/schema.json`, `IMPLEMENTATION_AUTHORIZATION.md`).
* **Formal Taxonomy:**
  1. **`AUTHORIZED_FILES`:** Specific files authorized for creation/modification:
     - `.gitignore`, `.editorconfig`, `package.json`, `index.html`, `src/styles/main.css`, `src/config/legal.json`, `src/js/main.js`, `deployment.manifest.json`.
  2. **`AUTHORIZED_METADATA_DIRS`:** Specific directories with internal toolchain semantics:
     - `.git/`
  3. **`AUTHORIZED_CONTAINER_DIRS`:** Parent directories strictly required to hold authorized files:
     - `src/`, `src/styles/`, `src/config/`, `src/js/`.
* **Invariant Rule:** *An `AUTHORIZED_CONTAINER_DIR` does NOT grant authority to create arbitrary files inside it.*

### REM-001: Semantic Cleanup of Target `index.html`
* **Target:** `C:\Users\valen\Documents\Fundacion\index.html` exclusively.
* **Precondition:** `DECISION-GATE-REM-001` APPROVED.
* **Actions:**
  1. Replace `contacto@fundacion.org` with explicit `UNKNOWN` token.
  2. Replace `Bancolombia`, `Cuenta de Ahorros`, and `000-000000-00` with explicit `UNKNOWN` / pending validation tokens.
  3. Remove unbacked process claims (e.g. tax donation certificates) or mark as `[PENDING INSTITUTIONAL VALIDATION]`.
  4. Disable the copy button until verified account numbers are supplied.

---

## 4. Evidence & Historical Preservation

* `EVD-FUNDACION-LEVEL2-001.json` $\rightarrow$ **PERMANENT HISTORICAL RECORD (`NOT VERIFIED`)**.
* `EVD-FUNDACION-LEVEL2-002.json` $\rightarrow$ **FRESH CERTIFICATION RECORD** to be generated only after successful remediation and independent re-audit.
