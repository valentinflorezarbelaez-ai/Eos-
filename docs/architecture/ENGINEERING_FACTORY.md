# EOS ENGINEERING FACTORY ARCHITECTURE

* **Status:** APPROVED
* **Date:** 2026-08-11
* **Authority:** EOS System Architect & Engineering Factory Governance

---

## 1. Architectural Overview
The **Engineering Factory** transforms an engineering mission into candidate execution strategies, simulates each candidate path, scores them across an 18-dimensional matrix, and selects the optimal path backed by transparent decision records.

```text
                     +----------------------------+
                     |      MISSION INGESTION     |
                     +----------------------------+
                                   |
                     +----------------------------+
                     |    STRATEGY GENERATOR      |
                     |  (Candidate Strategies)    |
                     +----------------------------+
                                   |
         +-------------------------+-------------------------+
         |                         |                         |
+------------------+      +-------------------+      +-------------------+
|    STRATEGY A    |      |    STRATEGY B     |      |    STRATEGY C     |
+------------------+      +-------------------+      +-------------------+
         |                         |                         |
         +-------------------------+-------------------------+
                                   |
                     +----------------------------+
                     |     STRATEGY SIMULATOR     |
                     | (Risk, Cost, Reversibility)|
                     +----------------------------+
                                   |
                     +----------------------------+
                     | 18-DIMENSIONAL OPTIMIZER   |
                     | (Scoring & Policy Check)   |
                     +----------------------------+
                                   |
                     +----------------------------+
                     | AUDITABLE DECISION LOG     |
                     | (WHY_SELECTED / REJECTED)  |
                     +----------------------------+
```

---

## 2. Core Components
1. **Strategy Engine (`scripts/engine/strategy-engine.js`)**: Generates candidate execution strategies (`STRATEGY-A`, `STRATEGY-B`, `STRATEGY-C`).
2. **Strategy Simulator (`scripts/engine/strategy-simulator.js`)**: Simulates candidate paths without side effects.
3. **Strategy Selection Engine (`scripts/engine/strategy-selection-engine.js`)**: Scores candidates across 18 dimensions and outputs structured decision records.
4. **Engineering Economics Model (`docs/intelligence/ENGINEERING_ECONOMICS.md`)**: Evaluates token, API, duration, review, and failure costs.
5. **Agent & Tool Performance Memory (`docs/intelligence/`)**: Tracks synthetic reliability and evidence quality metrics.
