# EOS — Policy: Multi-BKM Composition Governance (H-01 to H-08)

**Document ID:** `POL-MULTI-BKM-COMPOSITION`  
**Status:** `ACTIVE_MANDATORY_GOVERNANCE`  
**Scope:** Multi-BKM Composition, Strategy Synthesis, and Knowledge Interaction  
**Date:** 2026-08-14  

---

## 1. Composition vs. Concatenation Standard (H-03)
*   **Sequential Concatenation:** Applying Pattern A and Pattern B in linear order without semantic integration or context awareness.
*   **True Composition:** The system explicitly reasons about how the data transformations, assumptions, and error states of BKM-A impact BKM-B, verifying that composite benefits exceed individual maxima:

$$
\Delta_{\text{composition}} = \text{Outcome}_{A+B} - \max(\text{Outcome}_A, \text{Outcome}_B) > 0
$$

---

## 2. Mandatory 4-Arm Experimental Design (H-05)
Every formal composition experiment (e.g. `CANARY-I001`) must evaluate 4 distinct arms:
1. **`Control Arm`**: Legacy / unguided baseline.
2. **`Arm A`**: Single BKM-A in isolation.
3. **`Arm B`**: Single BKM-B / Candidate in isolation.
4. **`Arm A+B`**: Composite integration under test.

### Interaction Effect Formula:

$$
\text{Interaction} = \text{Outcome}(A+B) - \text{Outcome}(A) - \text{Outcome}(B) + \text{Outcome}(\text{Control})
$$

---

## 3. Anti-Composition Guards & Rejection Rules (H-06)
EOS must immediately emit **`DO_NOT_COMPOSE`** if any of the following occur:
1. **Negative Knowledge Conflict:** Any constituent pattern intersects with [`docs/knowledge/NEGATIVE_BKM_CATALOG.json`](file:///c:/Users/valen/Documents/Eos%20system/docs/knowledge/NEGATIVE_BKM_CATALOG.json).
2. **Latency Bloat:** Composite latency increases by $> 50\%$ relative to $\max(\text{Latency}_A, \text{Latency}_B)$.
3. **Security Degradation:** Composite introduces any newly exposed secret, token, or injection vector.
4. **Disproportionate Cost:** Composition cost increases by $> 100\%$ for $< 2\%$ outcome gain.

---

## 4. Blast Radius & Authority Invariant (H-08)

> [!CAUTION]
> **CONSTITUTIONAL INVARIANT:**  
> **Knowledge May Transfer; Authority MUST NOT Transfer.**  
> Composing two knowledge patterns never grants elevated filesystem, network, or production execution authority. Core Control Plane remains **`FROZEN`**. External physical targets (e.g. `PRJ-FUNDACION`) remain strictly protected with zero modifications ($\Delta = 0$).
