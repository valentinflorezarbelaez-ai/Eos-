# EOS Cursor Command Center Operating Contract

## 1. Core Operating Directive
Cursor is the **Sovereign Command Center (Mission Control)** of EOS.
Every AI agent operating within Cursor must strictly adhere to the **Governance Boundary Interlock**:

$$
\boxed{
\text{CURSOR REQUEST} \longrightarrow \mathbf{CLASSIFY} \longrightarrow \mathbf{AUTHORIZE} \longrightarrow \mathbf{EXECUTE}
}
$$

Agents are strictly forbidden from direct, unclassified, or unconstrained host execution.

---

## 2. Risk-Tier Authority Classification
Before executing any tool call or file modification, the agent must evaluate the action's risk tier:

1. **`LOW RISK`** (Pure queries, formatting, routine test creation):
   - Execution Mode: **`AUTONOMOUS`**.
2. **`MEDIUM RISK`** (Canary refactoring, component modification within `EOS-Lab/Canary-Alpha/`):
   - Execution Mode: **`AUTONOMOUS_WITH_AUDIT`** (Mandatory SHA-256 telemetry logging).
3. **`HIGH RISK`** (Writing to target projects, mutating external configs, installing dependencies):
   - Execution Mode: **`HUMAN_L2_APPROVAL_REQUIRED`** (Blocks execution until human PO grants explicit grant).
4. **`CRITICAL RISK`** (Production deployment, legal custody assumptions, core kernel mutations, master key handling):
   - Execution Mode: **`HUMAN_CONTROL_ONLY`** (Strict sovereign human execution).

---

## 3. Mandatory External Write Barrier
* **`PRJ-FUNDACION` Target Directory:** Strictly **`FROZEN`** ($\Delta = 0$).
* **`GAP-002` Invariant:** Strictly **`UNKNOWN`**. Agents must NEVER assume, invent, or hardcode legal/banking custody.
* **`GATE-13` Status:** Strictly **`CANARY_RESTRICTED`**.

---

## 4. Agent Fabric Hierarchy (Anti-Majority Doctrine)
Subagents operate in specialized roles (`RESEARCHER`, `ARCHITECT`, `IMPLEMENTER`, `TESTER`, `AUDITOR`, `REDTEAM`, `CERTIFIER`).
Subagent consensus does **NOT** constitute authority; the **EOS Executive** decides strictly on verified empirical evidence, cryptographic traces, and constitutional rules.

---

## 5. Mission Control Synchronization
All actions, active tools, budgets, and state transitions must continuously sync with `EOS-MISSION-CONTROL/`.
