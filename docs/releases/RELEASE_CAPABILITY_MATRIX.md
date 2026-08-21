# EOS Local Release — Capability Matrix

```text
document: RELEASE_CAPABILITY_MATRIX
release_branch: release/eos-mission-os-rc
evaluated_tip: d7cd6fa8406ce57dcafeb761cb57ad7687229753
dictamen: COMPLETE_FOR_LOCAL_GOVERNED_USE
main_protected: 1b269932943c46849e463b293ace471a9745d3f1
```

| Capability | Status | Evidence class |
| --- | --- | --- |
| RC reproducible Mission OS package | COMPLETE | VERIFIED |
| `node bin/eos.js` / `npm run eos:mission` | COMPLETE | MEASURED |
| Legacy `npm run eos` | COMPLETE_WITH_CONDITIONS | Documented non-Mission entry |
| AuthorityTruthSource + commitTransition | COMPLETE | VERIFIED |
| Canonical FSM plan path (no bridge in runtime) | COMPLETE | VERIFIED (ATS-07, E2E-01/05) |
| Deprecated `runtime.plan_mission` retained for compat tests | COMPLETE_WITH_CONDITIONS | Explicit `deprecated: true` |
| HitlGatekeeper + local/external receipts | COMPLETE | VERIFIED (E2E-02/04/05) |
| IntegrationGatekeeper FDIR on close | COMPLETE | VERIFIED (NEG-03) |
| Epistemic honesty (PLANNED / NOT_PROVEN) | COMPLETE | MEASURED |
| Local schema validation (direction + package + HITL) | COMPLETE | VERIFIED (SCHEMA-01/02) |
| Full enterprise schemas aligned to runtime | NOT_READY | FUTURE (local MVP schemas only) |
| Tutor-Maestro on create/plan/close | COMPLETE | MEASURED |
| Canonical rules index v0 | COMPLETE | VERIFIED (RULES-01) |
| Negative governance suite | COMPLETE | VERIFIED (NEG + ATS) |
| E2E fixture + HITL reject/approve + checkpoint | COMPLETE | VERIFIED (E2E-01..05) |
| Production / network / credentials | FUTURE | BLOCKED |
| Merge to main | FUTURE | BLOCKED |

## Dictamen

```text
COMPLETE_FOR_LOCAL_GOVERNED_USE: YES
COMPLETE_WITH_CONDITIONS: (subset)
  - Local schemas under docs/schemas/local (not full enterprise schema set)
  - Default plan may issue MEASURED_LOCAL_FIXTURE HITL receipt (LOCAL_BOUNDED)
  - Use --require-hitl / --hitl-receipt for external director receipt
  - Deprecated bridge exists for compat tests only; runtime does not call it
  - No merge to main; no network; no Fundación mutation; fixture projects only
PRODUCTION_READY: NO
```

## Evidence command

```text
node --test tests/authority-truth-source.test.js tests/eos-negative-governance.test.js tests/eos-e2e-local-fixture.test.js tests/eos-local-contracts.test.js
→ 20/20 pass (at freeze)
```
