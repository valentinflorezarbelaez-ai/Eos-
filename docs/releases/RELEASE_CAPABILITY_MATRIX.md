# EOS Local Release — Capability Matrix

```text
document: RELEASE_CAPABILITY_MATRIX
release_branch: release/eos-mission-os-rc
evaluated_tip: c6a8436bb96c370881908daf6c8991c0fcd98b73
dictamen: COMPLETE_WITH_CONDITIONS
main_protected: 1b269932943c46849e463b293ace471a9745d3f1
```

| Capability | Status | Evidence class |
| --- | --- | --- |
| RC reproducible Mission OS package | COMPLETE | VERIFIED (commit on RC branch) |
| `node bin/eos.js` entrypoint | COMPLETE | MEASURED |
| `npm run eos:mission` alias | COMPLETE | MEASURED (script present) |
| Legacy `npm run eos` | COMPLETE_WITH_CONDITIONS | Still legacy harness — documented |
| AuthorityTruthSource + commitTransition | COMPLETE | VERIFIED (tests 8/8 + call path) |
| Direct `pkg.phase` assignment in Runtime | COMPLETE | Removed / routed via ATS |
| Full FSM lifecycle in CLI (no bridge) | NOT_READY | `runtime.plan_mission` bridge remains |
| HitlGatekeeper on HITL-gated transitions | COMPLETE | VERIFIED (ATS pre-check + tests) |
| IntegrationGatekeeper FDIR on close | COMPLETE | VERIFIED (NEG-03) |
| Epistemic honesty (no VERIFIED-at-birth) | COMPLETE | MEASURED (PLANNED / NOT_PROVEN) |
| Schema validation at runtime | NOT_READY | Schemas exist; not loaded by src/ |
| Tutor-Maestro pre/post on create | COMPLETE | MEASURED (CLI wired) |
| Canonical rules index / projections | NOT_READY | FUTURE |
| Negative governance suite | COMPLETE_WITH_CONDITIONS | NEG-01..04 + ATS negatives |
| E2E fixture + HITL reject + checkpoint | COMPLETE_WITH_CONDITIONS | E2E-01..03 MEASURED |
| Production / network / credentials | FUTURE | BLOCKED by policy |
| Merge to main | FUTURE | BLOCKED |

## Dictamen

```text
COMPLETE_FOR_LOCAL_GOVERNED_USE: NO
COMPLETE_WITH_CONDITIONS: YES
Conditions:
  - Use tip on release/eos-mission-os-rc after this commit
  - Do not claim schema-validated or full FSM without bridge
  - Do not merge to main without separate gate
  - Operator must use fixture projects only
```
