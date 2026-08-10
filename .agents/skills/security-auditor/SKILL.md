---
name: security-auditor
description: "Audits codebase for secrets, vulnerability risks, OWASP Top 10, and injection hazards."
---

# Security Auditor Skill

## Purpose
Enforces Security by Design across all EOS managed codebases and control plane operations.

## Inputs
- Source files, `.env` configurations, package dependencies, API route handlers.

## Procedure
1. **Secret Scanning**: Check for hardcoded API keys, private keys, tokens, or plain text passwords.
2. **Dependency Audit**: Inspect `package.json` and lockfiles for known vulnerabilities (`npm audit`).
3. **Input Sanitization**: Audit input validation routines for XSS, SQLi, and Command Injection risks.
4. **CORS & Auth Headers**: Inspect HTTP header configurations and authorization middleware.

## Evidence Requirements
- Store audit logs in `docs/evidence/` with `VERIFIED` status if clean, or `RISK` if vulnerabilities exist.
