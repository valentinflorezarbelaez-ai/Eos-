# EXP-037-001: RelayHub — Level 1 Domain Model & Diagnosis

* **Status:** LEVEL 1 — APPROVED WITH ARCHITECTURAL CONDITIONS (READ_ONLY MODE)
* **Target Project:** `RelayHub` (Physical Asset Reservation & Tracking Platform)
* **Date:** 2026-08-11
* **Auditor:** EOS Architectural Auditor & Domain Reasoning Engine

---

## 1. Domain Model & Workflows

### A. Actors & Role Authorization Matrix
```text
  +-------------------+       +-------------------+       +-------------------+
  |     Requester     |       |    Coordinator    |       |      Auditor      |
  +-------------------+       +-------------------+       +-------------------+
  | • Search assets   |       | • Review requests |       | • Query audit log |
  | • Check schedule  |       | • Approve / Reject|       | • Reconstruct history|
  | • Request booking |       | • Log Check-Out   |       | • Inspect who/when|
  | • Cancel OWN req  |       | • Log Return      |       +-------------------+
  +-------------------+       | • Log Incident    |
                              +-------------------+
```

### B. Core Entities & Operational Relationships
```text
  +------------------+         1:N         +------------------------+
  |      Asset       | ------------------->|   ReservationRequest   |
  | (id, name, status|                     | (id, asset_id, user_id |
  |  serial, location|                     |  start_time, end_time) |
  +------------------+                     +-----------+------------+
                                                       | 1:1
                                                       v
  +------------------+         1:N         +------------------------+
  | OperationalEvent | <------------------ |  PhysicalCustodyRecord |
  | (id, entity_id,  |                     | (id, checkout_time,    |
  |  actor_id, action|                     |  return_time, condition|
  |  old_st, new_st) |                     |  incident_notes)       |
  +------------------+                     +------------------------+
```

### C. Operational State Machine
```text
  [REQUESTED] -------> (APPROVED) -------> [RESERVED] -------> [CHECKED_OUT] -------> [RETURNED] -------> [CLOSED]
       |                    |                  |                    |
       +---> [REJECTED]     +---> [CANCELLED]  +---> [CANCELLED]    +---> [INCIDENT_REPORTED] ---> [CLOSED]
       |
       +---> [CANCELLED]
```

### D. Critical Domain Invariants
1. **No Double Booking Invariant:** For any given asset $A$, no two approved/reserved operations $R_1$ and $R_2$ may exist such that $[start_1, end_1) \cap [start_2, end_2) \neq \emptyset$.
2. **Temporal Integrity Invariant:** $end\_time > start\_time$ must hold for all requests. Past time intervals cannot be booked retroactively. Interval boundaries are strictly half-open $[start\_time, end\_time)$.
3. **Custody Chain Invariant:** An asset cannot transition to `CHECKED_OUT` unless its status is `RESERVED` and it is not currently held physically by another user or blocked in maintenance.
4. **Audit Immutability Invariant:** Status transitions cannot mutate previous history in place; every state change appends an immutable `OperationalEvent`.

---

## 2. Updated Unknowns Register (Incorporating Conditions)

| Unknown ID | Question | Business Importance | Risk Level | Information Needed to Resolve | Potential Architecture Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UNK-01** | How should time-slot overlap checking be structured for concurrent requests? | Prevents double booking (Core Requirement #7). | **CRITICAL** | Concurrency volume & reservation time granularity. | Determines DB query index strategy & transaction locking model. |
| **UNK-02** | How to handle physical check-out when network connectivity is absent at handover? | Prevents digital/physical desynchronization (#10). | **HIGH** | Field site connectivity conditions. | Offline queue vs Coordinator manual timestamp override. |
| **UNK-03** | Should an `INCIDENT` automatically block future reservations for that asset? | Prevents handing out damaged equipment (#11). | **HIGH** | Organization maintenance policies. | Automated state cascades (`ASSET_MAINTENANCE_BLOCKED`). |
| **UNK-04** | What strategy should be used to reconstruct full operational history? | Enables audit reconstruction for Auditor (#12, #13). | **MEDIUM** | Compliance & audit query frequency. | Event Sourcing vs Audit Event Log table vs Temporal Tables. |
| **UNK-05** | **Command Idempotency:** How to prevent retries, double-clicks, or network reconnects from creating duplicate requests? | Prevents accidental duplicate bookings from the same Requester. | **HIGH** | Client network retry & submission semantics. | Idempotency Key header/token strategy & DB uniqueness constraint. |
| **UNK-06** | **Temporal Semantics & Timezones:** How are half-open intervals $[start, end)$, timezones, and midnight crossings handled? | Ensures consistent global scheduling across locations. | **HIGH** | User timezone variance and operational shifts. | UTC timestamp normalization & ISO interval validation rules. |
| **UNK-07** | **Authorization & IDOR Prevention:** How are resource-level access controls enforced per actor role? | Prevents Requester A from viewing/canceling Requester B's bookings. | **CRITICAL** | Actor role hierarchy & resource ownership model. | Middleware RBAC + ABAC query filters (`WHERE user_id = current_user`). |

---

## 3. Refined Knowledge Transfer Matrix

| Previous Knowledge | High-Level Abstraction | Hypothesis for RelayHub | Predictive Testable Assertion | Falsification Condition |
| :--- | :--- | :--- | :--- | :--- |
| **`LSN-001`** (Visual Density) | **Responsive Information Architecture Strategy:** Viewport density determines component representation from Day 1. | Available schedule presentation on small viewports (< 640px) must reduce cognitive density and preserve critical action targets without horizontal overflow. | Designing responsive layouts for mobile screens will yield 0 horizontal scrolling and legible time intervals during Browser QA across 375px, 768px, and 1440px. | Viewport 375px exhibits horizontal overflow or unreadable overlapping text. |
| **`SYS-PRN-001`** (Boundary Contracts) | **System Boundary Contract & Observable Failure:** Every system boundary must enforce explicit contracts and return deterministic failure states. | Overlapping booking attempts at the API boundary must fail deterministically with a structured error response without corrupting state. | Concurrent requests for overlapping intervals will result in exactly 1 successful booking and 1 deterministic error response. | System allows 2 overlapping bookings OR returns an unhandled 500 error. |
| **`ENV-001`** (Runtime Probing) | **Native Runtime Capability Probing:** Probe native environment primitives before adding external dependencies. | Before adding external dependencies to solve a core domain requirement, EOS will evaluate whether the runtime provides sufficient native primitives to fulfill it within required scope. | Core domain logic, temporal overlap checks, and idempotency can be validated using native runtime capabilities with fast test execution. | Domain validation requires external heavy container/framework emulators to run basic unit tests. |
| **Data Minimization** (Sonrisa Nova) | **Operational Data Minimization:** Collect only data essential to transaction execution. | Booking forms should collect strictly reservation window, asset ID, and operational purpose, eliminating unnecessary PII. | Payload surface reduction simplifies sanitization and maintains compact audit logs. | Unsanitized or unnecessary PII leaks in public audit queries. |

---

## 4. Level 1 Exit Criteria Check

1. **Problem Being Solved:** Eliminating double-booking, physical custody ambiguity, and un-audited state mutations for shared physical assets.
2. **Domain Reality Represented:** Stateful physical asset lifecycle (`REQUESTED` -> `APPROVED` -> `RESERVED` -> `CHECKED_OUT` -> `RETURNED` -> `CLOSED`) with half-open temporal boundaries $[start, end)$, role authorization boundaries, and immutable audit history.
3. **What Remains Unknown:** Conflict detection algorithm (UNK-01), offline handover (UNK-02), incident maintenance cascades (UNK-03), audit reconstruction (UNK-04), command idempotency (UNK-05), temporal timezones (UNK-06), and IDOR authorization implementation (UNK-07).
4. **Forbidden Actions Enforced:**
   - 🚫 NO project created.
   - 🚫 NO npm packages installed.
   - 🚫 NO framework selected (No Astro, React, Hono).
   - 🚫 NO database selected (No SQLite, Postgres).
   - 🚫 NO ORM selected (No Prisma, Drizzle).
   - 🚫 NO cloud provider selected.
   - 🚫 NO production code written.
   - 🚫 NO Level 3 execution.
