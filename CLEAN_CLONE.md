# CLEAN_CLONE — EOS Mission OS Release Candidate (draft, uncommitted)

```
Branch: release/eos-mission-os-rc
Base: 1b269932943c46849e463b293ace471a9745d3f1
Lockfile policy: L0_NODE_BUILTINS_ONLY
package.json entrypoint fix: NOT applied (authorized NO)
RC_COVERAGE: VERIFIED_WITH_CONDITIONS
```

## What this RC is (and is not)

```text
Tier A empaquetado: sí
Worktree completamente aislado de otros proyectos: no
Fundacion/EOS-Lab heredados de la base: no añadidos ni eliminados por C1.5
`.missions/` creado por `--help`: efecto colateral documentado
Schemas canónicos en RC: insuficientes para declarar schema-validated
```

| Claim | Status |
| --- | --- |
| Mission OS Tier A files present and hashed (`RC_FILE_MANIFEST.json`, 27 paths) | Yes |
| Worktree is a slim, product-only tree with no sibling projects | **No** — inherits full monorepo checkout at base |
| `Fundacion/`, `EOS-Lab/`, and similar top-level trees | Present if tracked at `1b26993`; **not** added by C1.5 packaging; **not** removed by C1.5 |
| This document proves a self-contained shipping package | **No** — it documents how to load Mission OS on the RC branch |
| Schema-validated RC | **No** — few schemas at base; not enough to claim schema validation |

C1.5 packaging **copied** previously untracked Mission OS Tier A files onto a worktree created from base `1b26993`. It did **not** strip inherited monorepo directories.

## Supported Mission OS entry

```text
node bin/eos.js --help
```

**Do not** treat `npm run eos` as Mission OS on this RC: it still points at the legacy harness (`scripts/cli/eos.js`). That is intentional for this packaging gate.

### Side effect of `--help`

Constructing the Mission CLI / runtime may create a local `.missions/` directory under the worktree root. That is a **filesystem side effect**, not proof of a full mission run and not a git commit. Treat `--help` as “entrypoint loads,” not “zero side effects.”

## MCP entry (optional smoke later)

```text
node src/mcp-server.js
```

## Prerequisites

- Node.js with ESM support (verified on packaging host: v24.16.0)
- **No** `npm install` required for Tier A core under L0 (`DEPENDENCY_POLICY_L0.md`)

## After a future commit of this RC

```text
git clone <repo>
git checkout release/eos-mission-os-rc   # or the RC tag
node bin/eos.js --help
```

Checking out **only** `1b26993` on `main` without the RC branch **does not** include Mission OS (`src/core`, `bin`, `src/cli`).

Checking out this RC branch **still** includes other projects tracked at the base commit unless a later mission authorizes a sparse/export packaging. Do not confuse “Mission OS loads” with “clean isolated product tree.”

## Verification artifacts

- `RC_FILE_MANIFEST.json` — SHA-256 of every Tier A file in this worktree
- Syntax smoke (packaging host): `node --check` on bin, cli, runtime, mcp, fsm → exit 0
- Coverage audit (host): `RC_COVERAGE_AUDIT.json` / `EOS_C15_RC_COVERAGE_AUDIT.md`

## Explicitly out of this packaging gate

- Tier B tests (not copied)
- Network integrations
- `package.json` rewrite so `npm run eos` points at Mission OS
- Deleting or quarantining inherited `Fundacion/`, `EOS-Lab/`, or other base trees
- Declaring schema-validated release readiness
