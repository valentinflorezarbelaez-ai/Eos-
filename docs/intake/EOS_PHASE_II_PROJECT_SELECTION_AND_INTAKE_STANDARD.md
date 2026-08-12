# EOS PHASE II — PROJECT SELECTION AND INTAKE STANDARD

* **Status:** APPROVED STANDARD SPECIFICATION
* **Date:** 2026-08-11
* **Scope:** Universal Project Intake & Benchmark Eligibility Standard for EOS Phase II
* **Primary Candidate Under Evaluation:** Luxe Registry (Pending Formal Intake Gate Pass)

---

## 1. Purpose of Phase II
Phase II shifts EOS from Core Maturation (`BUILD THE CORE`) to Real Engineering Operations (`OPERATE THE CORE`). The goal is to evaluate EOS across high-complexity, real-world projects to measure empirical value (defect reduction, rework hours saved, zero architectural debt) under controlled engineering conditions.

---

## 2. Selection Criteria (6 Dimensions)
A project candidate must be evaluated across 6 core dimensions:
1. **Real Complexity:** Data models, authentication/RBAC, REST/GraphQL APIs, UI state, concurrency, security, and observability.
2. **Business Value:** Delivers authentic utility and supports continuous evolution.
3. **Problem Diversity:** Forces EOS to solve multi-faceted engineering challenges beyond simple static pages.
4. **Technical Risk:** Sufficient architectural friction to stress Governance, Evidence, Security, and Orchestration.
5. **Measurability:** Clear baseline metrics to compare un-governed execution against EOS-assisted execution.
6. **Learning Potential:** Produces transferable engineering patterns for the global Knowledge Plane.

---

## 3. Project Readiness Classification & Explicable Scoring
Rather than an arbitrary numerical score (e.g. `83.7`), EOS assigns an explicable **Project Readiness State**:
- `NOT_READY`: Critical requirements or scope boundaries missing.
- `READY_FOR_DISCOVERY`: Initial intake contract signed; awaiting Level 1 Discovery.
- `READY_FOR_ARCHITECTURE`: Discovery complete; awaiting ADR & SPEC formulation.
- `READY_FOR_IMPLEMENTATION`: Spec approved, Governance authorization granted (Level 2+).
- `SUITABLE_FOR_PHASE_II_BENCHMARK`: Meets all 6 selection dimensions for Phase II operations.

---

## 4. Minimum Project Requirements & Exclusions
- **Minimum Requirements:** Clear business intent, defined owner, repository workspace, explicit security/data requirements, reproducible test environment.
- **Exclusions:** Single-file scripts, trivial static landing pages without backend/data, unmaintained legacy code lacking intent, projects with un-mitigatable legal/compliance hazards.

---

## 5. Intake Contract & Information Required from Product Owner
Every project must provide:
- `project_id` & `name`
- `business_goal` & `technical_intent`
- `target_workspace_path`
- `compliance_and_privacy_level`
- `required_authorizations`

---

## 6. Discovery Level 1 Protocol
1. Repository structure analysis.
2. Architecture & dependency tree mapping.
3. Security attack surface identification.
4. Existing test suite & coverage baseline audit.
5. Initial `Unknowns Register` and `Risk Register` creation.

---

## 7. Knowledge Retrieval Gate
Before architectural design or code execution begins, EOS queries the global Knowledge Plane (`KnowledgePlaneEngine.queryAssets()`) to retrieve transferred engineering principles, known gotchas, and applicable ADR blueprints.

---

## 8. Baseline Measurement Protocol
Prior to EOS intervention, the project's baseline is sampled:
- Initial build/test pass rate.
- Pre-implementation defect count.
- Initial latency/performance traces.
- Initial test coverage percentage.

---

## 9. Go / No-Go Gate
A formal decision record (`GO` or `NO_GO`) must be issued by the Governance Engine based on:
$$\text{Project Readiness State} = \text{SUITABLE\_FOR\_PHASE\_II\_BENCHMARK} \land \text{Risk Mitigation Plan Approved}$$

---

## 10. Workspace Isolation & Authorization Levels
- `LEVEL_1_READ_ONLY`: Discovery, research, code auditing.
- `LEVEL_2_PROPOSAL`: Architecture, SPEC, ADR, and test generation in isolated worktrees.
- `LEVEL_3_IMPLEMENTATION`: Code writing in authorized project workspace. Writing to unregistered external projects is strictly **FORBIDDEN**.

---

## 11. Success Metrics & Failure Conditions
- **Success:** $\ge 80\%$ pre-implementation defect capture, $\ge 50\%$ rework hours reduction, $100\%$ ADR adherence, $0\%$ security bypasses.
- **Failure Conditions:** Silent data corruption, un-mitigated security vulnerability, workspace escape attempt, un-authorized write operation.

---

## 12. Learning Extraction & Cross-Project Knowledge Transfer
Post-project closure, all verified execution observations (`EVD-XXXX`) are synthesized by `SynthesisEngine`. Transferable blueprints ascend to global KnowledgeAssets, while failed hypotheses are preserved as permanent `REFUTED` lessons.
