# EOS MULTI-PROJECT CONTROL PLANE MODEL

## Architectural Principle
EOS operates as an **Engineering Control Plane**. It governs, audits, and orchestrates engineering practices across multiple software projects without absorbing their source repositories into EOS itself.

---

## Project Registration Schema

Target projects are registered under `docs/projects/registrations/<project-id>.json`.

Each project registration record defines:

```json
{
  "id": "project-id",
  "name": "Project Name",
  "repositoryPath": "C:\\Users\\valen\\Documents\\ProjectFolder",
  "repositoryType": "git",
  "technologyStack": ["Node.js", "React"],
  "lifecycleStage": "IN_DEVELOPMENT",
  "status": "NOT VERIFIED",
  "lastAuditDate": "2026-08-10",
  "activeSpec": "docs/specs/project-spec.md"
}
```

---

## Isolation & Non-Interference Rules

1. **Source Isolation**: Target projects maintain independent Git histories, branches, and remotes.
2. **Read-First Governance**: EOS inspects target project state before proposing any engineering changes.
3. **Explicit Scope Binding**: Every evidence record and specification must specify `related_project` to avoid cross-project context pollution.
