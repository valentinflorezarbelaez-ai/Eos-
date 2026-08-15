# REAL USER TELEMETRY & OUTCOME PROTOCOL — CANARY-REAL-001

* **Document ID:** `PROTO-CANARY-REAL-001-TELEMETRY-001`
* **Mission ID:** `CANARY-REAL-001`
* **Client Reference:** Alexander Rodríguez Remodelaciones (Rionegro & Oriente Antioqueño)
* **Epistemic Classification:** `PRE_REGISTERED_FROZEN_PROTOCOL`
* **Status:** `ACTIVE / FROZEN_BEFORE_USER_COHORT`
* **Date:** 2026-08-15T12:40:00-05:00

---

## 1. Constitutional Pre-Registration Principle

> **INVARIANT RULE:** Telemetry targets, success criteria, and statistical thresholds must be frozen and cryptographically hashed **BEFORE** observing live user cohort traffic. Modifying targets post-observation is strictly prohibited.

```text
STATUS QUO BASELINE (Observed Friction)
               ↓
TARGET SUCCESS CRITERIA (FROZEN)
               ↓
REAL USER TELEMETRY STREAM (Append-Only Sink)
               ↓
OUTCOME EVALUATION (Pass / Fail / Pivot)
```

---

## 2. Frozen Dual-Plane Metrics Baseline & Targets

### A. User Plane (Experience, Friction & Trust)

| Metric | Status Quo Baseline | Frozen Target (Success Threshold) | Unit / Measurement |
|:---|:---:|:---:|:---|
| **Form Abandonment Rate** | 72.0% | **$\le$ 25.0%** | Users initiating Step 1 who exit before Step 3 |
| **Time-to-Action (TTA)** | 95.0 s | **$\le$ 45.0 s** | Median elapsed seconds from landing view to CTA click |
| **Perceived Trust Score** | 5.4 / 10 | **$\ge$ 9.0 / 10** | Post-interaction rating on transparency & clarity |
| **Mobile LCP Load Time** | 4.8 s | **$\le$ 1.5 s** | Largest Contentful Paint on mobile 4G throttled |
| **A11y WCAG AA Compliance**| Partial | **100.0%** | Zero WCAG AA violations |

### B. Business Plane (Commercial Efficiency & Waste Reduction)

| Metric | Status Quo Baseline | Frozen Target (Success Threshold) | Unit / Measurement |
|:---|:---:|:---:|:---|
| **Qualified Quote Rate** | 8.5% | **$\ge$ 22.0%** | Total Qualified Leads / Total Landing Page Sessions |
| **Unqualified Lead Noise** | 65.0% | **$\le$ 20.0%** | Leads out-of-coverage or below minimum budget |
| **Response Time to Lead** | ~4.5 hours | **$\le$ 15 mins** | 1-Click WhatsApp enables immediate specialist chat |
| **Quote Conversion Rate** | 12.0% | **$\ge$ 30.0%** | Qualified inquiries converting to formal site diagnostic visits |
| **Wasted Conversations** | 58.0% | **$\le$ 15.0%** | Conversations aborted due to misaligned expectations |

---

## 3. Canonical Telemetry Event Stream Schema (13 Events)

Every telemetry event conforms to the `EOSTelemetryEvent/v1` envelope:

```json
{
  "event_id": "EVT-CR001-XXXX-YYYY",
  "timestamp": "2026-08-15T12:40:00.000Z",
  "mission_id": "CANARY-REAL-001",
  "anonymous_session_id": "sess_sha256_hash",
  "event_type": "EVENT_TYPE_ENUM",
  "step": 1,
  "metadata_minima": {},
  "schema_version": "1.0.0",
  "trace_id": "trc_uuid"
}
```

### The 13 Canonical Event Types:

1. `page_view` — User lands on the conversion header.
2. `qualification_started` — User selects Step 1 option (Property Type).
3. `qualification_step_completed` — User progresses to Step 2 / Step 3.
4. `qualification_step_abandoned` — User leaves form before completion.
5. `out_of_coverage` — User selects location outside Rionegro / Oriente Antioqueño.
6. `estimate_viewed` — Orientative price bracket displayed dynamically.
7. `estimate_disclaimer_viewed` — Non-binding legal disclaimer rendered.
8. `whatsapp_cta_clicked` — User clicks the 1-click WhatsApp dispatch button.
9. `qualified_lead_created` — Payload safely constructed with sanitized parameters.
10. `lead_response_time` — Latency between lead dispatch and Alexander's first response.
11. `lead_qualified_by_human` — Alexander confirms project meets residential/commercial criteria.
12. `quote_requested` — Technical in-person diagnostic visit scheduled.
13. `conversion_outcome` — Formal contract signed (`CONVERTED` vs `LOST_REASON`).

---

## 4. Privacy & Anonymization Policy (Zero Raw PII)

- **Client Name:** Stored only as SHA-256 hash in telemetry stream (`client_name_hash`).
- **Phone Number:** Stored only as anonymized phone prefix (`300***`) or hash in telemetry stream.
- **Payload Sanitization:** WhatsApp links are generated client-side directly into `window.open`; raw PII is never transmitted to any third-party analytics collector.

---

## 5. Causal Decision Gate Criteria

At the conclusion of the 50-session live cohort trial:

$$
\text{Verdict} = \begin{cases}
\mathbf{PROCEED\_TO\_SCALE} & \text{if Qualified Quote Rate} \ge 22\% \land \text{Noise} \le 20\% \land \text{TTA} \le 45\text{s} \\
\mathbf{EVIDENCED\_ITERATION} & \text{if Qualified Quote Rate} \in [15\%, 22\%) \\
\mathbf{NO\_BUILD\_PIVOT} & \text{if Qualified Quote Rate} < 15\% \lor \text{Drop-off} > 50\%
\end{cases}
$$

Modifying thresholds post-observation is strictly invalid.
