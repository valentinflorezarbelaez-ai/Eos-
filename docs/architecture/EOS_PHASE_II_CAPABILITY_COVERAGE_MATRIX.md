# EOS PHASE II: CAPABILITY COVERAGE MATRIX & PROJECT SELECTION BLUEPRINT

* **Status:** APPROVED PHASE II CAPABILITY COVERAGE MATRIX
* **Date:** 2026-08-11
* **Purpose:** Map empirical capability coverage vs un-tested gaps to select Phase II Candidate #2 based on learning delta rather than convenience.
* **Epistemic Verdict:** `SPECIFICATION_APPROVED`

---

## 1. Universal Capability Coverage Matrix

```text
                               CAPABILITY COVERAGE MAP
                                          │
    ┌─────────────────────────────────────┼─────────────────────────────────────┐
    ▼                                     ▼                                     ▼
HIGH COVERAGE (DEMONSTRATED)            DESIGNED (UN-TESTED)                  ZERO COVERAGE (GAP)
- Software / Transactional APIs         - Universal Capability Adapters       - Video Generation & Editing
- Concurrency & Multi-Tenancy           - Provider Selection Trade-offs       - Music / Audio Composition
- Evidence / Governance Engines         - Multimodal QA Pipeline              - MCP Dynamic Discovery
- Self-Hosting Operating Loop           - Open-World Research Synthesis       - High-Uncertainty Replanning
```

| Domain / Capability | Empirical Status | Tested In | Gap Severity | Phase II Priority |
| :--- | :---: | :---: | :---: | :---: |
| **Software Engineering / APIs** | `HIGH` | Luxe Registry, Core Steps 1–11 | `LOW` | Lower (Sufficiently Verified) |
| **Multi-Tenancy & Security** | `HIGH` | Luxe Registry, Negative Suite | `LOW` | Lower (Sufficiently Verified) |
| **Concurrency & Locks** | `HIGH` | Luxe Registry (`LSN-LUXE-001`) | `LOW` | Lower (Sufficiently Verified) |
| **Evidence & Governance** | `HIGH` | Core Steps 1–11 | `LOW` | Lower (Sufficiently Verified) |
| **Self-Hosting Loop** | `HIGH` | Core Step 11 | `LOW` | Lower (Sufficiently Verified) |
| **Research & Open Synthesis** | `LOW-MEDIUM` | Step 5 Synthesis | `HIGH` | **Candidate A Target** |
| **Document Production** | `LOW-MEDIUM` | Core Specs | `MEDIUM` | **Candidate A Target** |
| **Image Generation & Editing** | `LOW` | Browser QA Artifacts | `HIGH` | **Candidate B Target** |
| **Video Generation & QA** | `NONE` | Un-tested | `HIGH` | **Candidate B Target** |
| **Music / Audio Generation** | `NONE` | Un-tested | `HIGH` | **Candidate B Target** |
| **Multimodal Workflows** | `NONE` | Un-tested | `HIGH` | **Candidate B Target** |
| **External Capability Providers** | `NONE` | Un-tested | `HIGH` | **Candidate B Target** |
| **MCP Dynamic Discovery** | `NONE` | Un-tested | `HIGH` | **Candidate B Target** |
| **High-Uncertainty Reasoning** | `LOW` | Level 1 Discovery | `HIGH` | **Candidate C Target** |

---

## 2. Phase II Strategic Candidate Profiles

```text
               PHASE II EXPERIMENTAL CANDIDATE ROADMAP
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    ▼                             ▼                             ▼
[PROJECT #1: Luxe Registry]  [PROJECT #2: Research / Intel] [PROJECT #3: Multimodal Creative]
(Software & Concurrency)     (Deep Synthesis & Evidence)   (Image / Video / Audio / MCP)
  Status: CLOSED ✅            Status: PROPOSED CANDIDATE    Status: FUTURE CANDIDATE
```

### Profile A: Research & Intelligence Engine (`Candidate A`)
- **Focus:** Open-world research, deep multi-source synthesis, conflicting evidence resolution, citation & provenance tracking.
- **Coverage Delta:** Bridges Research, Open Reasoning, Document Production, and Epistemic Contradiction Resolution gaps.

### Profile B: Multimodal Creative Production Suite (`Candidate B`)
- **Focus:** Multi-media production pipeline combining text + branding + images + video + audio/music + MCP external providers.
- **Coverage Delta:** Bridges Image, Video, Music, Multimodal QA, External Provider Selection, and MCP Dynamic Discovery gaps.

### Profile C: High-Uncertainty Enterprise Problem (`Candidate C`)
- **Focus:** Operating under ambiguous goals, incomplete constraints, changing requirements, and dynamic replanning.
- **Coverage Delta:** Bridges High-Uncertainty Reasoning, Dynamic Re-planning, and Multi-actor Governance gaps.

---

## 3. Decision Gate for Candidate #2 Selection
Candidate #2 MUST NOT be a traditional SaaS web application or landing page. It MUST be chosen explicitly to test an un-tested capability domain (Profile A or Profile B).
