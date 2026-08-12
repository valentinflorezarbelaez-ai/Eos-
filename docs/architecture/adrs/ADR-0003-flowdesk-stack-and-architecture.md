# ADR-0003: FlowDesk Stack & Architecture Hypothesis

* **Status:** Hypothesized (Approved with Architectural Conditions)
* **Date:** 2026-08-11
* **Author:** EOS Autonomous Engineering System
* **Target Project:** FlowDesk (Mini-SaaS Lead Management)

## Context
FlowDesk is a mini-SaaS application for lead tracking that introduces persistent state, relational data structures, user authentication, and multi-step UI workflows. Selecting an appropriate technology stack requires balancing system complexity, state consistency, testing speed, and operational overhead without introducing unverified assumptions.

## Architectural Hypothesis
We propose **Option A: Lightweight Full-Stack SSR Monolith (Node.js + Hono/Fastify + SQLite WAL)** as a working hypothesis to be empirically tested during implementation.

### 1. Deployment Topology & Persistence Boundaries
- **Deployment Topology:** Single persistent node (single container / VPS instance with attached persistent block volume).
- **Hard Reversal Condition:** If business or operational requirements change to require multi-node horizontal auto-scaling or stateless serverless edge functions, SQLite **MUST BE REVERSED** to PostgreSQL or a managed distributed relational database (e.g. CockroachDB / Turso).

### 2. Elimination of Network IPC Hops
- Storing SQLite in the same process eliminates network socket and IPC serialization hops between application and database, resulting in in-process direct memory binding. (Exact latency will be empirically measured in Phase 36).

### 3. Atomic Optimistic-Concurrency Mechanism
To prevent invalid concurrent state transitions when two operators update the same lead simultaneously:

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

### 4. Multi-Tier Testing Strategy
- **Unit & Domain Tests:** Executed against in-memory SQLite (`:memory:`) for instantaneous isolation.
- **Concurrent Writer Tests:** Executed against ephemeral file-backed DBs with WAL mode enabled to simulate concurrent process contention.
- **End-to-End Tests:** Executed against full filesystem persistence.

### 5. Backup & Disaster Recovery Strategy
- Automated online backup using SQLite's online backup API (`sqlite3_backup`) scheduled periodically, capturing hot snapshots without locking active WAL writers.

## Alternatives Evaluated

### Option B: React SPA + Decoupled Express API + PostgreSQL + Prisma
* *Design Hypothesis:* Multi-tier SPA + API + Postgres introduces operational complexity (dual build chains, CORS, API versioning, client hydration bugs) that requires empirical validation to justify for mini-SaaS scope.

### Option C: Serverless Edge Functions + Remote Cloud KV/Document DB
* *Design Hypothesis:* Cold starts, eventual consistency risks, and network latency on remote DB queries may degrade the responsiveness required by a lead operator.

## Consequences

### Positive
- Single runtime deployment simplifies operation on single-node topology.
- Atomic concurrency guarantees prevent race conditions.
- Zero network socket overhead between app and database.

### Negative / Risk Mitigation
- Must enforce strict single-node topology until empirical evidence justifies scaling.
