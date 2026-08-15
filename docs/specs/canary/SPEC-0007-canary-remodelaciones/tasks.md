# Tasks — OpenSpec SPEC-0007: Task DAG & TDD Implementation Plan

**Mission ID:** `CANARY-REAL-001`  
**Execution Standard:** Small Tasks, 100% TDD (Red -> Green -> Refactor), Zero Premature Code  

---

## 1. Task DAG Execution Sequence

```text
PHASE 1: ENVIRONMENT & BASELINE SETUP
 ├── [x] T01: Freeze mission, hypothesis, and baseline metrics (COMPLETED)
 ├── [ ] T02: Create isolated sandbox workspace `EOS-Lab/Canary-Real-001/`
 └── [ ] T03: Configure test harness and mock fixtures

PHASE 2: TDD COMPONENT IMPLEMENTATION
 ├── [ ] T04: [TDD-RED] Write unit tests for StepQualificationForm & state transitions
 ├── [ ] T05: [TDD-GREEN] Implement StepQualificationForm component
 ├── [ ] T06: [TDD-RED] Write unit tests for LiveQuoteCalculator & A->B composition
 ├── [ ] T07: [TDD-GREEN] Implement LiveQuoteCalculator component
 ├── [ ] T08: [TDD-RED] Write unit tests for WhatsAppPayloadDispatcher & URL encoding
 ├── [ ] T09: [TDD-GREEN] Implement WhatsAppPayloadDispatcher component
 ├── [ ] T10: [TDD-RED] Write unit tests for HeroConversionHeader & TrustProofSection
 └── [ ] T11: [TDD-GREEN] Implement HeroConversionHeader & TrustProofSection components

PHASE 3: INTEGRATION & AUDITS
 ├── [ ] T12: Assemble landing page integration in `EOS-Lab/Canary-Real-001/src/index.html`
 ├── [ ] T13: Implement Vanilla CSS design system (`remodelaciones.css`)
 ├── [ ] T14: Execute unit & integration test suite (`npm test`)
 ├── [ ] T15: Security audit (SEC-001..SEC-005, secret sanitization)
 ├── [ ] T16: Accessibility audit (100% WCAG 2.1 AA compliance, keyboard navigation)
 ├── [ ] T17: Performance & bundle size audit (LCP <= 1.5s mobile)
 └── [ ] T18: Browser QA automated flow verification

PHASE 4: OUTCOME & GOVERNANCE
 ├── [ ] T19: Generate independent evidence package `EVD-CANARY-REAL-001.json`
 ├── [ ] T20: Produce master audit report `CANARY_REAL_001_COMPLETION_REPORT.md`
 └── [ ] T21: Record learning updates in BKM portfolio and commit via conventional commit
```
