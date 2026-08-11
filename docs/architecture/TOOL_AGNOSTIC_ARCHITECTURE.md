# EOS TOOL-AGNOSTIC CAPABILITY & ADAPTER ARCHITECTURE

* **Status:** APPROVED
* **Date:** 2026-08-10

---

## 1. Architectural Overview
EOS separates engineering intent from vendor-specific tool implementations by applying a **Hexagonal Ports & Adapters Architecture**. EOS does NOT depend structurally on Claude, Codex, Gemini, or Cursor. These tools are secondary infrastructure implementations connected via standardized Capability Ports.

```text
                  +--------------------------------+
                  |    EOS CONTROL PLANE CORE      |
                  +--------------------------------+
                                  |
         +------------------------+------------------------+
         |                        |                        |
+------------------+    +------------------+    +------------------+
| CAPABILITY PORT  |    | AUTHORIZATION    |    | EVIDENCE PORT    |
| (Intent & Scope) |    | PORT (Policy)    |    | (Verification)   |
+------------------+    +------------------+    +------------------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                     +--------------------------+
                     | SYNTHETIC & TOOL ADAPTERS|
                     +--------------------------+
                                  |
       +------------------+-------+--------+------------------+
       |                  |                |                  |
+--------------+   +--------------+   +--------------+   +--------------+
| MOCK CODE    |   | MOCK RESEARCH|   | MOCK TEST    |   | MOCK BROWSER |
| ADAPTER      |   | ADAPTER      |   | ADAPTER      |   | ADAPTER      |
+--------------+   +--------------+   +--------------+   +--------------+
```

---

## 2. Core Separation of Responsibilities
1. **Capability Port (`docs/capabilities/`)**: Defines abstract engineering intent, required inputs, outputs, and safety constraints without referencing tool vendors.
2. **Tool Registry (`docs/tools/`)**: Registers tool identities, interfaces, risk levels, and capability mappings.
3. **Adapter Registry (`docs/adapters/`)**: Maps abstract capabilities to concrete tool adapter wrappers.
4. **Provider Registry (`docs/providers/`)**: Tracks vendor/provider identities, trust levels, and authority constraints.
5. **Fallback Engine**: Evaluates alternative tools when primary adapters fail, maintaining strict security and write barrier invariants.
