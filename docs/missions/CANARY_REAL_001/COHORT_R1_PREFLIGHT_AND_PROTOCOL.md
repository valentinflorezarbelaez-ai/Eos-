# CANARY-REAL-001 — COHORT-R1 PRE-FLIGHT AUDIT & REAL USER EXECUTION PROTOCOL

* **Mission ID:** `CANARY-REAL-001`
* **Cohort ID:** `COHORT-R1`
* **Target:** Alexander Rodríguez Remodelaciones (`EOS-Lab/Canary-Real-001`)
* **Market Context:** Rionegro, Llanogrande, San Antonio de Pereira, La Ceja, El Carmen de Viboral, El Retiro
* **Command Center:** Cursor IDE / EOS Mission Control
* **Pre-Flight Timestamp:** 2026-08-15T12:44:00-05:00
* **Status:** `PRE_FLIGHT_CERTIFIED_READY_FOR_COHORT`
* **Epistemic Classification:** `REAL_HUMAN_COHORT_PRE_REGISTERED`

---

## 1. D1 — Pre-Flight Checklist & Operational Gates

Before directing any live user traffic, every item below was verified:

```text
╔═════════════════════════════════════════════════════════════════════════╗
║ PRE-FLIGHT VERIFICATION MATRIX (CERTIFIED & VERIFIED)                   ║
╠═════════════════════════════════════════════════════════════════════════╣
║ 1. DOMAIN / HOST         ✅ https://b2f38e4a800c81.lhr.life (HTTPS TLS) ║
║ 2. LOCAL BIND            ✅ http://localhost:3456 & 192.168.1.5:3456    ║
║ 3. PROTOCOL / TLS        ✅ TLS Termination Verified (200 OK)           ║
║ 4. ANALYTICS ENDPOINT    ✅ /api/telemetry (POST) Verified Over HTTPS    ║
║ 5. TELEMETRY SINK        ✅ Append-Only Cryptographic Chain (SHA-256)   ║
║ 6. CONSENT & PRIVACY     ✅ Zero Raw PII (Name Hashes, Masked Phones)   ║
║ 7. WHATSAPP CTA LINK     ✅ wa.me/573001234567 (1-Click Lead Dispatch)  ║
║ 8. MOBILE RENDERING      ✅ Viewport 375px–430px Tested & Responsive    ║
║ 9. ROLLBACK PLAN         ✅ Git Revert Baseline (Commit 03e2ce2)        ║
║ 10. KILL-SWITCH          ✅ /api/admin/kill-switch (Token Protected)    ║
╚═════════════════════════════════════════════════════════════════════════╝
```

---

## 2. D2 — Cohorte Real R1 Specification

* **Cohort Size:** $N = 15$ real user interactions.
* **Target Audience:** Property owners and residents in Oriente Antioqueño interested in residential renovations (houses in parcelaciones, apartments, commercial units).
* **Evaluation Window:** Real live cohort session execution.
* **Consent Model:** Transparent, non-intrusive prequalification interaction. User data is processed client-side for WhatsApp dispatch without storing raw identity on remote servers.

---

## 3. D3 — Frozen Success Criteria (Immutable)

```text
USER PLANE TARGETS:
- Form Abandonment Rate:     <= 25.0%
- Median Time-to-Action:     <= 45.0 s
- User Trust Score:          >= 9.0 / 10
- Mobile Performance (LCP):  <= 1.5 s
- Accessibility Standard:    100% WCAG AA

BUSINESS PLANE TARGETS:
- Qualified Quote Rate:      >= 22.0%
- Unqualified Noise Rate:    <= 20.0%
- Wasted Conversations:      <= 15.0%
- Response Time:             <= 15 minutes
```

---

## 4. D4 & D5 — Separation of Observation vs Interpretation

Raw event telemetry is preserved in immutable append-only JSONL format:
`docs/evidence/raw_telemetry/CANARY_REAL_001_COHORT_R1.jsonl`

The decision pipeline enforces four discrete, non-overlapping stages:

$$
\boxed{\text{RAW TELEMETRY}} \longrightarrow \boxed{\text{AGGREGATION}} \longrightarrow \boxed{\text{STATISTICAL REPORT}} \longrightarrow \boxed{\text{BUSINESS OUTCOME & DECISION}}
$$

---

## 5. D6 — Decision Matrix for Post-Cohort Evaluation

* **PASS (Expand Cohort):**
  $\text{Qualified Rate} \ge 22.0\% \land \text{Noise} \le 20.0\% \land \text{TTA} \le 45.0\text{s} \land \text{Abandonment} \le 25.0\%$
  $\longrightarrow$ Authorize COHORT-R2 expansion ($N=50$) and initiate second client replication.
* **MIXED (Investigate & Evidenced Iteration):**
  $\text{Qualified Rate} \in [15.0\%, 22.0\%) \lor \text{Abandonment} \in (25.0\%, 40.0\%]$
  $\longrightarrow$ Perform qualitative friction diagnosis; iterate copy or step structure based strictly on observed drop-off evidence.
* **FAIL (No-Build / Rollback):**
  $\text{Qualified Rate} < 15.0\% \lor \text{Abandonment} > 50.0\%$
  $\longrightarrow$ Halt deployment; declare NO_BUILD; preserve all learning in BKM registry.
