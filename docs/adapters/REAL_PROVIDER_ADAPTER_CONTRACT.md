# EOS — REAL PROVIDER ADAPTER CONTRACT & READINESS SPECIFICATION

* **Status:** `READINESS_CONTRACT_ESTABLISHED` (Zero live credentials required)
* **Epistemic Classification:** `REAL_PROVIDER_OPERATION = NOT_YET_VERIFIED`
* **Purpose:** Specify exact interfaces, fault taxonomy, rate limits, secret boundaries, and fallback behavior for live external providers before commercial activation.

---

## 1. Adapter Architecture Matrix

```text
┌───────────────┬─────────────────┬──────────────────┬─────────────────┬─────────────────┐
│ Adapter Type  │ Mock Mode       │ Local Mode       │ Live Provider   │ Secret Boundary │
├───────────────┼─────────────────┼──────────────────┼─────────────────┼─────────────────┤
│ LLM Reasoner  │ ADP-MOCK-LLM    │ Local Ollama     │ Anthropic/OpenAI│ ENV_VAR Only    │
│ Code Engine   │ ADP-MOCK-CODE   │ Node.js Sandbox  │ Anthropic Sonnet│ ENV_VAR Only    │
│ Browser QA    │ ADP-MOCK-BROWSER│ Local Playwright │ Cloud Headless  │ ENV_VAR Only    │
│ Test Runner   │ ADP-MOCK-TEST   │ Node Test Runner │ Vitest/Jest     │ Local Filesystem│
└───────────────┴─────────────────┴──────────────────┴─────────────────┴─────────────────┘
```

---

## 2. Interface Contract (Input / Output / Evidence)

Every Provider Adapter MUST implement the canonical signature:

```typescript
interface ProviderAdapter {
  adapterId: string;
  providerName: 'ANTHROPIC' | 'OPENAI' | 'GEMINI' | 'PLAYWRIGHT' | 'LOCAL';
  execute(request: AdapterRequest): Promise<AdapterResponse>;
  checkHealth(): Promise<HealthStatus>;
  getCostMetadata(): CostMetadata;
}

interface AdapterRequest {
  requestId: string;
  actionType: string;
  payload: Record<string, unknown>;
  timeoutMs: number; // Mandatory timeout (Default: 30000ms)
  maxRetries: number; // Mandatory bound (Max: 3)
}

interface AdapterResponse {
  requestId: string;
  status: 'SUCCESS' | 'FAILED' | 'CIRCUIT_BROKEN' | 'TIMEOUT';
  output: unknown;
  evidencePayload: {
    durationMs: number;
    tokenCount?: { input: number; output: number };
    costUsd?: number;
    modelIdentifier?: string;
    evidenceHash: string;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
```

---

## 3. Failure Modes & Circuit Breaker Policy

1. **Rate Limit (`HTTP 429`):**
   * Exponential backoff: $t = \min(\text{base} \times 2^{\text{attempt}}, \text{max\_wait})$.
   * Max 3 retries before switching to `FALLBACK_PROVIDER`.
2. **Timeout (`HTTP 408 / Socket Timeout`):**
   * Hard stop at `timeoutMs`.
   * Never hang or block execution loops indefinitely.
3. **Authentication / Quota Failure (`HTTP 401 / 402`):**
   * Immediate `CIRCUIT_BREAKER_OPEN`.
   * Zero retries (non-retryable error).
   * Emit `SECURITY_ALERT_LOG`.
4. **Provider Outage (`HTTP 500 / 503`):**
   * Graceful downgrade to designated fallback adapter.

---

## 4. Secret & Network Boundaries

* **No Hardcoded Keys:** All API tokens must be read dynamically from environment variables (`process.env.ANTHROPIC_API_KEY`, etc.).
* **Zero Key Leakage in Logs:** Evidence payloads must scrub all headers containing authorization tokens.
* **Network Isolation in Synthetic Mode:** During `EOS Development Mode` or synthetic test runs, external network access is blocked by policy.
