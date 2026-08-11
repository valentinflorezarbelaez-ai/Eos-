# EOS CAPABILITY INTELLIGENCE & AUTONOMOUS TOOL SELECTION ENGINE

* **Status:** APPROVED
* **Date:** 2026-08-11
* **Authority:** EOS System Architect & Capability Governance

---

## 1. Architectural Overview
The **Capability Intelligence Engine** is the decision core of the EOS Engineering Control Plane. It transforms high-level engineering intents into policy-governed execution plans.

```text
MISSION -> EPIC -> OBJECTIVE -> TASK
                |
     REQUIRED CAPABILITY DISCOVERY
                |
      CAPABILITY CONTRACT VALIDATION
                |
   TOOL & ADAPTER & PROVIDER DISCOVERY
                |
  12-DIMENSIONAL TOOL SCORING MATRIX
                |
  POLICY & AUTHORIZATION EVALUATION (POL-001 - POL-004)
                |
    RISK & AUTONOMY SCALING EVALUATION
                |
    EXECUTION PLAN & DRY-RUN GENERATION
                |
  DETERMINISTIC FALLBACK & FAILURE HANDLING
                |
   SYNTHETIC ADAPTER / TOOL EXECUTION
                |
  EVIDENCE COLLECTION & META-VERIFICATION (EVD-0013)
```

---

## 2. Core Components & Responsibilities
1. **Capability Registry (`docs/capabilities/REGISTRY.json`)**: Formally defines 24 abstract functional capabilities with explicit input/output schemas, required permissions, risk levels, autonomy requirements, evidence requirements, verification strategies, supported tools, adapters, providers, fallback capabilities, dependencies, and prohibited contexts.
2. **Evolved Selection Engine (`docs/tools/SELECTION_ENGINE.json`)**: Multi-stage pipeline evaluating capability fit, compatibility, permissions, environment, and scoring.
3. **Provider Selection Policy (`docs/providers/SELECTION_POLICY.json`)**: Governs provider trust levels (`LOCAL_SYSTEM`, `TRUSTED_VENDOR`, `EXPERIMENTAL`) and enforces vendor-agnostic capability isolation.
4. **Execution Planner (`docs/orchestration/EXECUTION_PLANNER.json`)**: Builds verifiable execution plans and dry-run simulations.
5. **Deterministic Fallback Engine (`docs/orchestration/FALLBACK_ENGINE.json`)**: Evaluates candidate tool substitutes upon execution failure without overriding security or write barriers.
