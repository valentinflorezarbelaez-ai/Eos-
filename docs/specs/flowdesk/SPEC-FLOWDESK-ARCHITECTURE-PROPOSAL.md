# SPEC-FLOWDESK: FlowDesk Architecture Proposal & Trade-off Matrix

* **Project:** FlowDesk (Mini-SaaS Lead Management)
* **Phase:** LEVEL 2 — PROPOSAL & ARCHITECTURE
* **Status:** APPROVED WITH ARCHITECTURAL CONDITIONS
* **Date:** 2026-08-11
* **Engine:** EOS Engineering Operating System

---

## 1. Domain Model & Core Requirements

### Domain Entities & Relations
```text
  +------------------+         1:N         +------------------+
  |    User/Tenant   | ------------------->|       Lead       |
  | (id, email, hash)|                     | (id, name, status|
  +------------------+                     |  phone, email,   |
                                           |  updated_at)     |
                                           +--------+---------+
                                                    | 1:N
                                                    v
                                           +------------------+
                                           |   LeadActivity   |
                                           | (id, lead_id,    |
                                           |  from_status,    |
                                           |  to_status, time)|
                                           +------------------+
```

---

## 2. Updated Architectural Hypothesis (Option A)

The proposal treats **Option A (Node.js + Hono/Fastify + SQLite WAL)** as a working hypothesis to be empirically validated during implementation.

### A. Deployment Topology & Persistence Boundaries
- **Topology:** Single persistent node (single container / VPS instance with attached persistent block volume).
- **Hard Reversal Condition:** If business or operational requirements change to require multi-node horizontal auto-scaling or stateless serverless edge functions, SQLite **MUST BE REVERSED** to PostgreSQL or a managed distributed relational database.

### B. Atomic Optimistic Concurrency Query
```sql
BEGIN TRANSACTION;

UPDATE leads 
SET status = ?, updated_at = CURRENT_TIMESTAMP 
WHERE id = ? AND updated_at = ?;

-- Driver checks `changes()` count:
-- If changes() == 0:
--   ROLLBACK;
--   RETURN 409 CONFLICT (Optimistic Concurrency Failure);

INSERT INTO lead_activities (id, lead_id, user_id, from_status, to_status, created_at)
VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);

COMMIT;
```

### C. Multi-Tier Testing Strategy
- **Unit & Domain Tests:** Executed against in-memory SQLite (`:memory:`).
- **Concurrent Writer Tests:** Executed against ephemeral file-backed DBs with WAL mode enabled to simulate concurrent process contention.
- **End-to-End Tests:** Executed against full filesystem persistence.

---

## 3. Empirical Language & Terminology Cleanup
1. Replaced "0 ms" with *"Elimination of network socket / IPC hops (in-process direct memory binding)"*. Latency will be empirically measured in Phase 36.
2. Replaced "10x over-engineering" with *"Design Hypothesis: Multi-tier SPA + API + Postgres introduces operational complexity that requires empirical validation to justify for mini-SaaS scope"*.

---

## 4. EOS Constitutional Rule Incorporated
> *"An architectural decision recommended by EOS remains a working hypothesis; it is not accepted as established truth until empirical implementation and operational evidence confirm its underlying assumptions."*
