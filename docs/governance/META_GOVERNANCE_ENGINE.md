# EOS META-GOVERNANCE ENGINE

* **Status:** APPROVED
* **Date:** 2026-08-11

---

## 1. Architectural Purpose
The **Meta-Governance Engine** answers the critical question: *"Was the process by which EOS decided a mission or strategy completed valid, uncorrupted, and backed by independent evidence?"*

---

## 2. Governance Rules & Invariants
1. **Verifier Independence**: An agent that executes an action cannot certify its own output without an independent verification check.
2. **Evidence Sufficiency**: No mission step may transition to `COMPLETED` or `VERIFIED` without a valid `EVD-*.json` evidence payload.
3. **Policy Consistency**: Actions must strictly conform to `POL-001` through `POL-004`. External write attempts trigger immediate `DENY`.
4. **Authorization Provenance**: Level 2+ authorization records must be traceable to explicit Product Owner sign-off.
5. **Contradiction Detection**: If agent outputs contain contradictory claims, execution halts immediately with state `BLOCKED`.
6. **Evidence-Backed Strategy Scoring**: Strategy selection scoring must be derived from verifiable capability and performance inputs.
7. **Explicit Weight Labelling**: Initial scoring matrix weights must be explicitly labelled as `ASSUMPTION` until empirical telemetry is recorded.
8. **Provider Neutrality**: No LLM vendor or provider may be artificially prioritized over equal candidates.
9. **Write Barrier Invariant**: Fallbacks, replans, and strategy substitutions must never bypass the external write barrier (`Fundacion`).
10. **Independent Certification Guard**: Self-promotion of strategies or self-certification of unverified claims freezes promotion immediately.
