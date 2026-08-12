# EOS UNIVERSAL CAPABILITY PLANE SPECIFICATION

* **Step:** EOS PHASE II — TRACK 2 MASTER MISSION (MODEL, RESEARCH, DESIGN & SPECIFICATION)
* **Status:** SPECIFICATION APPROVED (`MODEL_COMPLETED`)
* **Date:** 2026-08-11
* **Scope:** Universal Multimodal, Multi-Provider & Tool-Agnostic Capability Subsystem
* **Epistemic Verdict:** `SUPPORTED_IN_SCOPE`
* **Mode:** NO PRODUCTION CODE WRITTEN YET (SPECIFICATION & DESIGN BLUEPRINT ONLY)

---

## 1. Global Architectural Principle & Subordination Invariant

> **Subordination Invariant:** EOS Core is permanent, tool-agnostic, provider-agnostic, and model-agnostic. The Universal Capability Plane is a **subordinate execution layer** that translates Core intents into external tool invocations. The Capability Plane can **NEVER** alter system governance policies, mutate `CONSTITUTION.md`, or self-authorize capability expansions.

```text
                         EOS CORE (PERMANENT SYSTEM)
         (Intent / Context / Reasoning / Governance / Evidence)
                                    │
                                    ▼
                     UNIVERSAL CAPABILITY DISPATCHER
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
   [Capability Contract]   [Provider Selection]    [Multimodal QA Engine]
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    ▼
                    UNIVERSAL CAPABILITY REGISTRY
                                    │
    ┌──────────┬──────────┬─────────┼─────────┬──────────┬──────────┐
    ▼          ▼          ▼         ▼         ▼          ▼          ▼
[Software]  [Image]    [Video]   [Audio]  [Research]  [Docs]   [Automation]
 (Cursor/   (Visual    (Scene/   (Codec/  (Web/Deep   (Specs/   (Browser/
  CLI)       QA)        Motion)   BPM)     Search)     Reports)  APIs)
```

---

## 2. Research-First Pattern Extraction Matrix

| Source | Practice | Problem Solved | EOS Resemblance | Key EOS Difference | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OpenAI Codex** | Sandboxing & Approval Boundaries | Un-bounded file access & credential leaks | Workspace Isolation Barrier | EOS persists out-of-band failure evidence before worktree rollback | **ADOPT** |
| **OpenAI Harness** | Agent Telemetry & Feedback Loops | Un-observable agent actions | Step 10 Observability Engine | EOS telemetry links tool invocations to immutable `EVD-XXXX` records | **ADAPT** |
| **Anthropic Evals** | Evaluator-Optimizer & Skills | Single-model self-confirmation bias | Dual Validation Engine ($S1..S4$) | EOS requires independent Path A & Path B non-circularity proof | **ADAPT** |
| **GitHub Copilot** | Asynchronous Coding Agent | Context drift during long execution | Step 7 Execution Orchestrator | EOS enforces strict 3-level authorization gates before writing code | **ADAPT** |
| **Model Context Protocol (MCP)** | Open Tool Discovery Standard | Hardcoded provider API dependencies | Capability Adapter Layer | EOS wraps MCP servers in schema-validated `ExternalCapabilityAdapter` | **ADOPT** |
| **Naive Auto-Agents** | Single-agent self-approval | Self-certification of un-tested code | Governance Engine Interlock | **REJECTED**: EOS strictly prohibits single-agent self-authorization | **REJECT** |

---

## 3. Canonical `CapabilityContract` (31 Governance Fields)

```typescript
export interface CapabilityContract {
  capability_id: string; // e.g. "CAP-IMAGE-GEN-V1"
  version: string; // "1.0.0"
  name: string;
  category: 
    | 'SOFTWARE_ENGINEERING' | 'WEB_RESEARCH' | 'IMAGE_GENERATION' | 'IMAGE_EDITING'
    | 'VIDEO_GENERATION' | 'VIDEO_EDITING' | 'MUSIC_GENERATION' | 'AUDIO_GENERATION'
    | 'AUDIO_EDITING' | 'DOCUMENT_CREATION' | 'PRESENTATION_CREATION' | 'DATA_ANALYSIS'
    | 'BROWSER_AUTOMATION' | 'DESIGN' | 'SIMULATION' | 'OCR_DOCUMENT_UNDERSTANDING'
    | 'TRANSCRIPTION' | 'TRANSLATION' | 'CONTENT_GENERATION' | 'AUTOMATION'
    | 'KNOWLEDGE_RESEARCH' | 'UNKNOWN_FUTURE_CAPABILITY';
  description: string;
  inputs: Record<string, { type: string; required: boolean; description: string }>;
  outputs: Record<string, { type: string; description: string }>;
  accepted_formats: string[]; // e.g. ["png", "jpg", "webp", "prompt_text"]
  produced_formats: string[]; // e.g. ["png", "webp"]
  quality_dimensions: string[]; // e.g. ["prompt_adherence", "resolution", "artifact_absence"]
  constraints: {
    max_payload_bytes: number;
    timeout_ms: number;
    disallowed_content_types: string[];
  };
  safety_requirements: {
    content_filter_active: boolean;
    privacy_scrub_required: boolean;
  };
  privacy_requirements: {
    data_retention_days: number;
    allow_external_training: boolean;
  };
  network_requirements: {
    internet_access_required: boolean;
    allowed_domain_globs: string[];
  };
  compute_requirements: {
    gpu_accelerated: boolean;
    local_execution_possible: boolean;
  };
  environment_requirements: {
    os_platform: string[];
    required_executables: string[];
  };
  is_deterministic: boolean;
  validation_strategy: 'AUTOMATED_UNIT_TEST' | 'MULTIMODAL_QA' | 'HUMAN_AUDIT' | 'DUAL_VALIDATION';
  cost_model: {
    pricing_type: 'FREE' | 'PER_CALL' | 'PER_TOKEN' | 'SUBSCRIPTION';
    cost_per_call_usd: number;
  };
  latency_model: {
    expected_mean_ms: number;
    p95_ms: number;
  };
  provider_requirements: string[]; // Array of compatible provider_ids
  authorization_level: 'LEVEL_1_READ_ONLY' | 'LEVEL_2_PROPOSAL' | 'LEVEL_3_IMPLEMENTATION';
  evidence_requirements: string[]; // e.g. ["EVD_OUTPUT_HASH", "EVD_QA_SCORE"]
  failure_modes: string[]; // e.g. ["PROVIDER_UNAVAILABLE", "TIMEOUT", "QUALITY_DEGRADED"]
  rollback_semantics: 'REVERT_ARTIFACT' | 'PURGE_CACHE' | 'NO_OP';
  capability_dependencies: string[]; // Dependency capability_ids
  compatibility: {
    min_eos_version: string;
  };
  provenance: {
    registered_at: string;
    registered_by: string;
  };
  lifecycle_state: 
    | 'DISCOVERED' | 'REGISTERED' | 'TESTING' | 'SUPPORTED_IN_SCOPE'
    | 'AVAILABLE' | 'DEGRADED' | 'SUSPENDED' | 'REFUTED' | 'RETIRED';
}
```

---

## 4. Canonical `ProviderContract` & Provider Isolation

```typescript
export interface ProviderContract {
  provider_id: string; // e.g. "PRV-STABILITY-AI", "PRV-CURSOR-CLI"
  name: string;
  capabilities_offered: string[]; // Array of capability_ids
  adapter_type: 'REST_API' | 'CLI_EXECUTABLE' | 'MCP_SERVER' | 'LOCAL_MODULE';
  adapter_endpoint: string;
  auth_model: {
    auth_type: 'API_KEY' | 'OAUTH2' | 'LOCAL_SECRET' | 'NONE';
    secret_vault_key: string;
  };
  latency_characteristics: { mean_latency_ms: number; p95_ms: number };
  cost_characteristics: { cost_per_unit_usd: number; currency: string };
  quality_evidence_refs: string[];
  supported_formats: string[];
  rate_limits: { max_calls_per_minute: number; max_concurrent: number };
  privacy_policy: {
    data_residency: string;
    zero_data_retention: boolean;
  };
  security_risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  version: string;
  reversal_conditions: string[];
}
```

---

## 5. Subordinated Adapter Boundary (`CapabilityAdapter`)

```text
                           CANONICAL ADAPTER BOUNDARY
EOS Core Dispatcher
       │
       ▼
[CapabilityAdapter]  ──> 1. Validate Input against CapabilityContract Schema
       │             ──> 2. Normalize Parameters into Provider Payload
       ▼             ──> 3. Enforce Timeout & Network Scoping
[External Provider]  ──> 4. Intercept Response & Handle HTTP / Process Errors
       │             ──> 5. Normalize Output into Standard ArtifactRecord
       ▼             ──> 6. Compute Cryptographic Output Hash (SHA-256)
Evidence Engine      ──> 7. Export CapabilityEvidenceRecord (EVD-CAP-XXXX)
```

---

## 6. 9-Step Capability Discovery Protocol (`CapabilityDiscoveryEngine`)

When EOS encounters a missing capability during task planning:
1. **Gap Recognition:** Core identifies `REQUIRED_CAPABILITY_NOT_FOUND`.
2. **MCP / Provider Search:** Scans registered MCP servers and local adapter manifests.
3. **Candidate Synthesis:** Generates a structured `CapabilityCandidateProposal`.
4. **Risk & Privacy Assessment:** Evaluates network, cost, and security risks.
5. **Human Approval Interlock:** If provider requires network expansion or paid API keys, halts for `REQUIRE_HUMAN_APPROVAL`.
6. **Isolated Sandbox Testing:** Executes test fixtures against the candidate provider.
7. **Multimodal QA Inspection:** Evaluates candidate output quality.
8. **Evidence Certification:** Writes `EVD-DISCOVERY-XXXX` artifact.
9. **Registry Ingestion:** Promotes capability to `SUPPORTED_IN_SCOPE` in `docs/capabilities/registry.json`.

---

## 7. Multimodal QA Engine Specifications

```text
                               MULTIMODAL QA ENGINE
                                        │
      ┌─────────────┬─────────────┬─────┴───────┬─────────────┬─────────────┐
      ▼             ▼             ▼             ▼             ▼             ▼
   [IMAGE]       [VIDEO]       [AUDIO]      [DOCS]       [SOFTWARE]     [DATA]
  ├─ Resolution ├─ Duration   ├─ Codec/Bit ├─ Structure ├─ Build/Pass  ├─ Schema
  ├─ Artifacts  ├─ Frame Integrity├─ Clipping  ├─ Syntax    ├─ Sec Audit   ├─ Null Rate
  └─ Prompt-Adh └─ Motion Sync └─ BPM Sync  └─ Refs Hash └─ Browser QA  └─ Outliers
```

---

## 8. Human Approval & Governance Interlock Matrix

| Capability Operation | Governance Action | Human Approval Required? |
| :--- | :--- | :---: |
| **Execute Registered Free Capability** | `ALLOW` | **NO** (Automated) |
| **Execute Paid API Provider** | `REQUIRE_HUMAN_APPROVAL` | **YES** (PO Budget Gate) |
| **Discover & Connect New MCP Server**| `REQUIRE_HUMAN_APPROVAL` | **YES** (PO Security Gate) |
| **Grant Network / File Scope** | `REQUIRE_HUMAN_APPROVAL` | **YES** (PO Isolation Gate) |
| **Modify CapabilityContract Schema** | `BLOCK` | **YES** (Constitutional Gate) |
| **Mutate Capability Lifecycle to REFUTED** | `ALLOW` | **NO** (Automated on Test Fail) |

---

## 9. 9-State Capability Lifecycle Machine

```text
  [DISCOVERED] ───> [REGISTERED] ───> [TESTING] ───> [SUPPORTED_IN_SCOPE] ───> [AVAILABLE]
                                                                                     │
  [RETIRED] <─── [REFUTED] <─── [SUSPENDED] <─── [DEGRADED] <────────────────────────┘
```

---

## 10. Conceptual API for `src/core/capabilityRegistry.js`

```javascript
export class CapabilityRegistryEngine {
  /** Loads canonical capabilities from Git source of truth (docs/capabilities/registry.json) */
  async loadRegistry() {}

  /** Resolves optimal provider for a given capability request */
  selectProvider(capabilityId, taskConstraints) {}

  /** Executes capability via adapter wrapper with telemetry and evidence capture */
  async executeCapability(capabilityId, providerId, inputs, context) {}

  /** Evaluates Multimodal QA for generated artifacts */
  evaluateMultimodalQA(artifactRecord, domainRules) {}

  /** Updates capability lifecycle state based on empirical evidence */
  updateLifecycleState(capabilityId, newState, evidenceRef) {}
}
```

---

## 11. 6-Category Decision Classification

1. **`KNOWN_FACT`**: Model Context Protocol (MCP) and OpenAPI schemas provide industry standards for tool discovery. No `src/core/capabilityRegistry.js` module exists yet.
2. **`TRANSFERRED_PRINCIPLE`**: `SYS-PRN-001` (Boundary Contracts): Input/output payloads for external capability providers MUST be validated at the adapter boundary.
3. **`HYPOTHESIS`**: Decoupling `CapabilityContract` from `ProviderContract` allows EOS to swap execution runtimes (Cursor, Claude, Midjourney, Suno) without altering system governance.
4. **`ASSUMPTION`**: External provider REST APIs will adhere to documented payload schemas.
5. **`UNCERTAINTY`**: Media generation latencies and transient rate limits across third-party AI APIs.
6. **`REVERSAL_CONDITION`**: If an external provider introduces non-deterministic output drift exceeding $>20\%$ QA failure rate, the provider **MUST BE REVERSED** to `SUSPENDED` status.

---

## 12. Exit Criteria & Double Verdict

* **Implementation Result:** `MODEL_COMPLETED` (Phase II Track 2 Architecture & Capability Contract Specified)
* **Epistemic Verdict:** `SUPPORTED_IN_SCOPE`
