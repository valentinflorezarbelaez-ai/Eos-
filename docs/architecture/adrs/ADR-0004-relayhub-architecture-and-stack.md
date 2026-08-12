# ADR-0004: RelayHub Architecture, Concurrency Defense & Stack Selection

* **Status:** Proposed (Pending PO Level 2 Approval)
* **Date:** 2026-08-11
* **Author:** EOS Autonomous Engineering System
* **Target Project:** RelayHub (Physical Asset Reservation Platform)

## Context
RelayHub requires guaranteeing zero double bookings for shared physical assets under concurrent requests, idempotency for retries/double-clicks, strict role-based access control (IDOR prevention), half-open temporal range semantics $[start, end)$, and immutable audit logging.

## Architectural Decision
We recommend **Option A: Relational Monolith Engine with Layered Double-Booking Defense (Domain Engine + Transactional Persistence Layer)**.

## 6-Category Decision Breakdown

### 1. `KNOWN_FACT`
- Simultaneous booking requests for the same time window will occur (`Requester A` & `Requester B`).
- Half-open intervals $[start, end)$ mathematically prevent boundary ambiguity at exact hour transitions.

### 2. `TRANSFERRED_PRINCIPLE`
- **`SYS-PRN-001` (Boundary Contracts):** Inbound requests pass through Zod schema validation and Idempotency Key checks. Stale/Conflicting requests return structured `409 Conflict (TIME_SLOT_UNAVAILABLE)` and `403 Forbidden` responses.
- **`LSN-001` (Responsive Info Architecture):** Schedule presentations adapt to mobile viewports (< 640px) as low-density agenda cards without horizontal scrolling.

### 3. `HYPOTHESIS`
- A single-node relational monolith enforcing atomic transactions and interval overlap checks will guarantee zero double bookings and zero unhandled concurrency errors for RelayHub's scale.

### 4. `ASSUMPTION`
- Initial operational scale is < 500 assets and < 100 concurrent operators on a single persistent server node.

### 5. `UNCERTAINTY`
- Exact millisecond latency of atomic range transactions under 50 parallel concurrent worker threads (to be measured in Level 3).

### 6. `REVERSAL_CONDITION`
- If deployment requirements mandate horizontal multi-node auto-scaling or multi-region active-active writes, single-node relational persistence **MUST BE REVERSED** to distributed SQL or an external distributed locking service.

## Alternatives Evaluated

### Option B: Event-Sourced In-Memory Single-Threaded Actor Engine
* *Rejection Rationale:* High operational complexity for projection rebuilds and memory crash recovery without added business value for RelayHub's scale.

### Option C: Serverless Edge API + CAS Document Store
* *Rejection Rationale:* Compare-And-Swap (CAS) retries under high concurrency fail frequently, leading to poor user experience and complex KV TTL management.

## Double Booking Defense Implementation Detail

```sql
BEGIN TRANSACTION;

-- 1. Idempotency Check
SELECT response_body FROM idempotency_records WHERE key = ? AND user_id = ?;

-- 2. Range Overlap & Status Check
SELECT COUNT(*) FROM reservations 
WHERE asset_id = ? 
  AND status IN ('APPROVED', 'RESERVED', 'CHECKED_OUT')
  AND (start_time < ? AND end_time > ?);

-- 3. If overlap count > 0: ROLLBACK & RETURN 409 Conflict

-- 4. Insert Reservation & Operational Event
INSERT INTO reservations (id, asset_id, user_id, start_time, end_time, status) VALUES (...);
INSERT INTO operational_events (id, entity_id, actor_id, action, old_state, new_state) VALUES (...);

COMMIT;
```
