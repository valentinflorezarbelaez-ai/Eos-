# DEPENDENCY_POLICY — L0 NODE_BUILTINS_ONLY

```
RC: release/eos-mission-os-rc
Status: DRAFT in worktree (uncommitted)
```

## Policy

Mission OS + MCP Tier A on this RC declare:

```text
dependency_policy: NODE_BUILTINS_ONLY
npm_lockfile: NOT_REQUIRED_FOR_CORE
external_integrations: OUT_OF_SCOPE
```

`package.json` has no `dependencies` / `devDependencies` at base commit. Core modules use Node built-ins (`fs`, `path`, `crypto`, `readline`, etc.).

## Explicit exclusions

- `npm install` / lockfile generation → requires separate **NETWORK** gate
- `npx tsx` / EOS-Lab → not part of this RC
- Real provider / P4 adapters → blocked

## When this policy must change

If a future increment adds a real npm dependency, upgrade to a lockfile policy **L1/L2** with Director authorization before claiming clean-clone reproducibility for that dependency.
