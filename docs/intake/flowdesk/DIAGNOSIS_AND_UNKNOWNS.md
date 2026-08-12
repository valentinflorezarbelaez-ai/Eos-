# EXP-036-001: FlowDesk — Level 1 Discovery & Architectural Diagnosis

* **Status:** LEVEL 1 — DISCOVERY & DIAGNOSIS ONLY (READ_ONLY MODE)
* **Domain:** SaaS / Software Product (B2B Lead Management)
* **Target Project:** `FlowDesk`
* **Date:** 2026-08-11
* **Auditor:** EOS Lead Architect & Engineering Reasoning Engine

---

## 1. Domain Analysis & Business Purpose

### Domain Characteristics (SaaS vs Hospitality / Healthcare)
FlowDesk introduces a fundamental shift from static, conversion-only landing pages to a **stateful, interactive software application**.

| Dimension | Hospitality (Andes) & Healthcare (Sonrisa) | SaaS Lead Management (FlowDesk) |
| :--- | :--- | :--- |
| **State Lifecycle** | Transient / Form submission | Persistent / Relational CRUD / Multi-state |
| **User Roles** | Anonymous visitor | Authenticated operators / Admins |
| **Data Boundaries** | Outbound deep link (WhatsApp) | Inbound ingestion, processing, internal storage, state mutations |
| **UI Complexity** | Linear scrolling / Marketing layout | Non-linear dashboard, tables/Kanban, filters, modal forms |
| **Failure Cost** | Broken CTA / Lost lead | Corrupted state, data leak between tenants, invalid transitions |

---

## 2. Structural Requirements & Functional Vectors

1. **Lead Ingestion & Inflow:**
   - Ability to capture leads via web form / API endpoint or manual creation.
   - Immediate validation and sanitization of input payload.
2. **Lifecycle & State Transitions:**
   - Lead Statuses: `NUEVO` → `CONTACTADO` → `CALIFICADO` → `GANADO` / `PERDIDO`.
   - Audit trail / status mutation timestamps.
3. **Operator Experience (Dashboard & UI):**
   - Filtering by status, date, or search query.
   - Quick status updates without page reload stutter or lost context.
   - Responsive presentation (table vs cards).
4. **Data Privacy & Security Boundaries:**
   - Multi-tenant or user-session isolation.
   - Input sanitization (XSS prevention) on notes and custom lead text.

---

## 3. Proactive Cross-Domain Memory Ingestion (EOS Global Knowledge)

Before proposing any architecture or stack, EOS checks its Global Knowledge Base for cross-domain principles to carry forward:

1. **Responsive Viewport Collapse (`LSN-001` Generalization):**
   - *Original Context:* Mobile header links overflow.
   - *FlowDesk Evolution:* Complex data grids/tables notoriously overflow on mobile viewports (< 640px). FlowDesk UI must feature an explicit mobile presentation strategy (card transformation or horizontal scroll containers) planned into Day-1 design.
2. **External & Internal Boundary Integrity (`LSN-002` Generalization):**
   - *Original Context:* Form parameters lost when linking to WhatsApp.
   - *FlowDesk Evolution:* Data crossing any boundary (Form → API → DB) must enforce strict schema validation and parameter encoding. Client state must match server state without silent data loss.
3. **Data Minimization & Explicit Consent (Sonrisa Nova Health Rule):**
   - *FlowDesk Evolution:* Lead capture forms must request only essential contact data and maintain strict opt-in consent for lead management tracking.

---

## 4. Architectural Unknowns & Critical Risk Vectors (Incógnitas)

Before proposing a stack or architecture in Level 2, EOS identifies the following open technical unknowns that must be evaluated:

### ❓ Unknown 1: Persistence Mechanism & Relational Boundaries
- *Question:* Should FlowDesk use an embedded zero-config database (SQLite / Turso / PGlite), a local JSON store for ultra-light footprint, or a full relational DB?
- *Risk:* Over-engineering with an external managed DB vs Under-engineering with unindexed local files.

### ❓ Unknown 2: Rendering Strategy & Hydration Model
- *Question:* Is a pure Server-Side Rendered (SSR) model with form actions sufficient, or does the dashboard demand a Client-Side Reactive Framework (React, Vue, Svelte, or Alpine/HTMX) for instant state transitions?
- *Risk:* Hydration bloat and slow TTI vs full-page reloads disrupting operator flow.

### 3 ❓ Unknown 3: Authentication & Session Boundary
- *Question:* How should multi-tenant / multi-user access be isolated? (Mock session token vs Cookie-based Auth vs LocalStorage JWT)?
- *Risk:* Security vulnerability (IDOR - Insecure Direct Object References) allowing User A to view/edit User B's leads.

### ❓ Unknown 4: Error Isolation & Fault Tolerance
- *Question:* If a lead update fails or the server throws an error during state transition, how does the UI communicate the failure without losing operator input?
- *Risk:* Silent failure or frozen UI state.

---

## 5. Next Steps
EOS remains in **LEVEL 1 READ_ONLY**. No code has been written, no stack has been selected, and no architecture has been imposed. Awaiting Product Owner evaluation of this diagnosis.
