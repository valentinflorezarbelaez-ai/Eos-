# SPEC-0007 — OpenSpec Master Index: Sistema de Precalificación y Conversión para Alexander Rodríguez Remodelaciones

**Mission:** `CANARY-REAL-001`  
**Client:** Alexander Rodríguez Remodelaciones  
**Market:** Rionegro y Oriente Antioqueño, Colombia  
**Status:** `OPENSPEC_APPROVED`  
**Command Center:** Cursor IDE / Agent Workspace  
**Autonomy Level:** `LEVEL_2_SUPERVISED_AUTONOMY`  
**PRJ-FUNDACION:** `FROZEN`  
**GATE-13:** `CANARY_RESTRICTED`  

---

## 1. OpenSpec Artifact Package Structure

* **Proposal:** [`proposal.md`](file:///c:/Users/valen/Documents/Eos%20system/docs/specs/canary/SPEC-0007-canary-remodelaciones/proposal.md) — Business context, JTBD, user persona, problem analysis, scope boundaries.
* **Specification:** [`specs/qualification/spec.md`](file:///c:/Users/valen/Documents/Eos%20system/docs/specs/canary/SPEC-0007-canary-remodelaciones/specs/qualification/spec.md) — Observable behavior, Gherkin acceptance criteria, 3-step qualification flow.
* **Design:** [`design.md`](file:///c:/Users/valen/Documents/Eos%20system/docs/specs/canary/SPEC-0007-canary-remodelaciones/design.md) — Component architecture, state transitions, $A \to B$ BKM composition.
* **Tasks:** [`tasks.md`](file:///c:/Users/valen/Documents/Eos%20system/docs/specs/canary/SPEC-0007-canary-remodelaciones/tasks.md) — Task DAG T01–T21, 100% TDD small testable tasks.

---

## 2. Frozen Baseline & Target Success Metrics

$$
\boxed{
\text{DONE} = \text{SPEC} + \text{IMPLEMENTATION} + \text{EVIDENCE} + \text{USER OUTCOME}
}
$$

| Metric | Baseline Status Quo | Target Objective |
|---|---|---|
| **Qualified Quote Conversion** | $8.5\%$ | $\mathbf{\ge 22.0\%}$ |
| **Time-to-Action on Page** | $95.0\text{ s}$ | $\mathbf{\le 45.0\text{ s}}$ |
| **User Trust Score** | $5.4 / 10$ | $\mathbf{\ge 9.0 / 10}$ |
| **Form Drop-off Rate** | $72.0\%$ | $\mathbf{\le 25.0\%}$ |
| **Mobile LCP Speed** | $4.8\text{ s}$ | $\mathbf{\le 1.5\text{ s}}$ |
| **Accessibility Compliance** | $< 50\%$ | $\mathbf{100.0\% \text{ (WCAG AA)}}$ |

---

## 3. Governance & Sovereign Approvals
* **Core Kernel State:** Strictly **`FROZEN`** (0 mutations).
* **PRJ-FUNDACION Target:** Strictly **`FROZEN`** ($\Delta = 0$).
* **Execution Boundary:** Strictly isolated to `EOS-Lab/Canary-Real-001/` and `docs/`.
