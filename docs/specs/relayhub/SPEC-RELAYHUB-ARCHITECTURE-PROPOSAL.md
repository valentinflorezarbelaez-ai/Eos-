# SPEC-RELAYHUB: Level 2 Architecture Proposal & Trade-off Matrix

* **Project:** RelayHub (Physical Asset Reservation & Tracking Platform)
* **Phase:** LEVEL 2 — PROPOSAL & ARCHITECTURE
* **Status:** PROPOSED (PENDING PO REVIEW)
* **Date:** 2026-08-11
* **Engine:** EOS Engineering Operating System

---

## 1. Core Architectural Question & Guarantee Location

> **The Central Challenge:** *How to guarantee a single temporal reservation over a shared physical asset under concurrency, retries, multiple actor roles, offline handovers, and audit requirements?*

### Location of the "No Double Booking" Guarantee
EOS establishes that the guarantee must live in a **Layered Hybrid Strategy (Domain Validation + Database Constraint)**:
1. **Application / Domain Layer:** Fast in-memory interval overlap validation to catch invalid requests early.
2. **Persistence Layer (Primary Enforcement):** Native range exclusion constraint or serialized transactional write lock on `(asset_id, time_range)` to guarantee 100% impossibility of double booking, even if two application workers run concurrently.

```text
  [Requester Request]
          |
          v
  [1. Ingestion Boundary] ---> Validate Zod Schema & Idempotency Key (SYS-PRN-001)
          |
          v
  [2. Domain Engine]       ---> Validate Half-Open Interval [start, end) & Asset Status
          |
          v
  [3. DB Persistence]      ---> ATOMIC TRANSACTION + Exclusion Lock on (asset_id, interval)
          |
          +---> SUCCESS: Insert Reservation + Insert OperationalEvent (Same TX)
          |
          +---> CONFLICT: Rollback & return Structured 409 Conflict (TIME_SLOT_UNAVAILABLE)
```

---

## 2. Answers to Architectural Incógnitas (Level 1 Conditions)

### A. Concurrency & Double Booking (`UNK-01`)
- **Mechanism:** Atomic database transaction attempting `INSERT INTO reservations` with temporal range overlap check.
- **Conflict Handling:** If a concurrent transaction claims the window, the second transaction fails immediately and returns a structured `409 Conflict (TIME_SLOT_UNAVAILABLE)`.

### B. Command Idempotency (`UNK-05`)
- **Strategy:** Requesters include a unique `X-Idempotency-Key` header (or UUID generated on form load).
- **Enforcement:** The server checks an `idempotency_records` table (`key`, `user_id`, `response_body`, `status_code`, `created_at`).
- **Behavior:** Retries or double-clicks with the same key within 24 hours immediately return the cached response without re-executing the booking transaction.

### C. Temporal Semantics & Timezones (`UNK-06`)
- **Interval Definition:** All bookings use half-open intervals $[start\_time, end\_time)$ where $start\_time < end\_time$. This means a booking $[10:00, 12:00)$ and a booking $[12:00, 14:00)$ do NOT conflict.
- **Timezone Normalization:** Timestamps are normalized to **UTC ISO-8601** at the boundary and stored as `TIMESTAMPTZ` / UTC strings.
- **Physical vs Calendar State:** An asset in `CHECKED_OUT` or `INCIDENT_REPORTED` status has its physical availability blocked regardless of calendar slots.

### D. Role Authorization & IDOR Prevention (`UNK-07`)
- **Actor Matrix:**
  - `Requester`: Can read active assets, create requests, and modify/cancel ONLY requests where `user_id = current_user.id`.
  - `Coordinator`: Can approve/reject requests, record Check-Out / Return, and log Incidents across all assets.
  - `Auditor`: Read-only access to immutable `OperationalEvent` logs and historical trails.
- **IDOR Enforcement:** Middleware checks resource ownership at query level: `WHERE id = ? AND (user_id = current_user.id OR current_role IN ('COORDINATOR', 'AUDITOR'))`. Unmatched attempts return `403 Forbidden`.

### E. Physical Custody Offline / Online Handover (`UNK-02`)
- **Strategy:** Coordinators record Check-Out / Return using an explicit physical timestamp field (`actual_checkout_time`, `actual_return_time`).
- **Offline Resilience:** If network connectivity is lost at the field site, the Coordinator client queues the signed handover payload locally and syncs upon reconnection without invalidating the historical handover time.

### F. Incident Cascades (`UNK-03`) & Immutable Audit (`UNK-04`)
- **Incident Cascade:** Reporting an `INCIDENT` on return sets asset status to `MAINTENANCE_REQUIRED`, automatically notifying Coordinators to reassign or cancel upcoming `RESERVED` slots for that asset.
- **Audit Reconstruction:** Every state transition appends a record to `operational_events` inside the SAME database transaction.

---

## 3. Evaluation of Architectural Options

### Option A: Relational Exclusion Monolith (Node.js + Hono + Relational Engine)
* **Design:** Single-process application server coupled to a relational persistence engine supporting strict isolation and transactions.
* **Double Booking Defense:** Enforces range constraints or strict serializable transactions at DB level.

### Option B: Event-Sourced In-Memory Actor Engine (Single-Threaded Process + Event Log)
* **Design:** In-memory single-threaded domain process queuing all reservation commands sequentially before appending to a log file.
* **Double Booking Defense:** Guaranteed single-threaded processing in memory; zero DB locks required.

### Option C: Serverless Edge API + Document Store with Optimistic Compare-And-Swap (CAS)
* **Design:** Stateless serverless functions updating JSON documents with CAS version attributes.
* **Double Booking Defense:** Client CAS retries on version collision.

---

## 4. Comprehensive Trade-off Matrix

| Evaluation Criterion | Option A (Relational Monolith) | Option B (In-Memory Event Engine) | Option C (Serverless CAS Document Store) |
| :--- | :--- | :--- | :--- |
| **Double Booking Guarantee** | **ABSOLUTE** (Enforced at DB transaction layer) | **ABSOLUTE** (Single-threaded in-memory queue) | **WEAK / COMPLEX** (CAS retries fail under high overlap) |
| **Idempotency Enforcement** | **SIMPLE** (Table unique constraint) | **SIMPLE** (In-memory map) | **COMPLEX** (KV store expiration management) |
| **Audit Reconstruction** | **NATIVE** (Append-only `operational_events` table) | **NATIVE** (Event Sourcing log is primary) | **COMPLEX** (Dual writing to event collection) |
| **System Complexity** | **LOW** | **HIGH** (Event sourcing projection rebuilds) | **MEDIUM** (Distributed state challenges) |
| **Single Point of Failure** | Single DB node | In-memory state crash recovery | Vendor service availability |
| **Testing DX** | **FAST** (In-memory or local test DB) | **FAST** (Pure memory state) | **SLOW** (Cloud emulators required) |

---

## 5. 6-Category Decision Classification for Recommended Option (Option A)

EOS classifies every architectural choice into 6 strict categories:

1. **`KNOWN_FACT`**:
   - Simultaneous requests for the same time window will occur (`Requester A` & `Requester B`).
   - SQLite and PostgreSQL support atomic transactions (`BEGIN TRANSACTION ... COMMIT`).
2. **`TRANSFERRED_PRINCIPLE`**:
   - `SYS-PRN-001` (Boundary Contracts): API boundary validates Zod schemas and Idempotency Keys, returning deterministic error codes (`400`, `409`, `403`).
   - `LSN-001` (Responsive Info Architecture): Schedules on 375px viewports adapt to low-density mobile views (agenda/list) without horizontal scrolling.
3. **`HYPOTHESIS`**:
   - A single-node relational monolith using atomic transactions and optimistic/exclusion constraints will guarantee zero double bookings and 0ms IPC hops for RelayHub's scale.
4. **`ASSUMPTION`**:
   - RelayHub initial scale operates on a single organization with < 500 assets and < 100 concurrent operators.
5. **`UNCERTAINTY`**:
   - Real-world performance impact of range queries vs ID locks under 100 concurrent write workers (to be measured in Phase 37).
6. **`REVERSAL_CONDITION`**:
   - If RelayHub scale requires multi-region active-active write replication or zero-downtime horizontal multi-node auto-scaling, the single-node relational deployment **MUST BE REVERSED** to distributed SQL (e.g. CockroachDB / PostgreSQL cluster).

---

## 6. Next Steps
Awaiting Product Owner review of this Level 2 Proposal, Trade-off Matrix, and 6-Category ADRs before requesting Level 3 authorization.
