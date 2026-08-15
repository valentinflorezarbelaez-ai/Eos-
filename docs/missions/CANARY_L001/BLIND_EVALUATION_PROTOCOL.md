# CANARY-L001: Blind Generalization Evaluation Protocol & Partitioning (L-01 & L-02)

**Mission ID:** `CANARY-L001`  
**Protocol Version:** `1.0.0`  
**Date:** 2026-08-14  

---

## 1. 3-Tier Partitioning Standard (L-01)
1. **`KNOWN_SET`**: Historical benchmark tasks (`CANARY-M001`, `CANARY-M002`, `CANARY-M003`, `CANARY-F001`, `CANARY-I001`, `CANARY-J001`). Used solely for model training/policy formulation.
2. **`PROBABLE_SET`**: Adjacent forms with minor schema modifications.
3. **`UNSEEN_SET`**: Completely novel, out-of-sample tasks with structural variations, unfamiliar latencies, and diverse threat boundaries.

---

## 2. Blind Evaluation Enforcement (L-02)
*   The strategy evaluation harness passes strictly `context`, `constraints`, `user_goal`, `tools`, and `portfolio` to the policy engine.
*   **Zero Leakage:** The engine has zero runtime visibility of `expected_strategy`, `oracle_outcome`, or benchmark labels.
*   Decisions are locked and signed before comparing against Oracle simulations.
