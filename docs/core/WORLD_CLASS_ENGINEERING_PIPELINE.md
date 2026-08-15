# EOS — Pipeline de Ingeniería de Élite dentro de Cursor

**Versión:** `2.0.0`  
**Estándar:** Emulación Consolidada (Google SRE + Stripe Idempotency + Microsoft SDL + Vercel Previews + Cursor Harness)  
**Centro de Operaciones:** Cursor IDE / Agent Workspace / Terminal  
**Gobernanza:** `LEVEL_2_SUPERVISED_AUTONOMY`  

---

## 1. El Ciclo de Vida de 21 Pasos de EOS

```text
[1. INTAKE] ───► [2. RECONNAISSANCE] ───► [3. CONTEXT UNDERSTANDING] ───► [4. REQUIREMENTS (JTBD)]
                                                                                  │
┌─────────────────────────────────────────────────────────────────────────────────┘
▼
[5. RESEARCH] ───► [6. ARCHITECTURE (OpenSpec)] ───► [7. DESIGN & ADR] ───► [8. TDD IMPLEMENTATION]
                                                                                      │
┌─────────────────────────────────────────────────────────────────────────────────────┘
▼
[9. TESTING (Red->Green)] ───► [10. SECURITY AUDIT] ───► [11. QUALITY AUDIT] ───► [12. ACCESSIBILITY]
                                                                                          │
┌─────────────────────────────────────────────────────────────────────────────────────────┘
▼
[13. PERFORMANCE] ──► [14. SEO AUDIT] ──► [15. BROWSER QA] ──► [16. EVIDENCE SEALING (SHA-256)]
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┘
▼
[17. DOCUMENTATION] ──► [18. DEPLOYMENT SANDBOX] ──► [19. TELEMETRY & SLOs] ──► [20. LEARNING (BKM)]
                                                                                         │
┌────────────────────────────────────────────────────────────────────────────────────────┘
▼
[21. CONTINUOUS IMPROVEMENT (No Privilege Escalation)]
```

---

## 2. Matriz de Operación de Pasos dentro de Cursor

| Paso del Ciclo | Herramienta Nativa en Cursor | Garantía de Calidad Emulada |
|---|---|---|
| **1–4: Intake & JTBD** | Cursor Chat / Modo Plan (`/enrich-us`) | Identifica dolor real antes de escribir código. Si no hay valor $\to$ `NO_BUILD`. |
| **5–7: Spec & Architecture** | OpenSpec (`proposal.md`, `spec.md`, `design.md`) | Amazon Working Backwards / Stripe API-First. |
| **8–9: TDD Implementation** | Cursor Agent + Terminal (`node --test`) | Red $\to$ Green $\to$ Refactor en tareas pequeñas. Cero código prematuro. |
| **10: Security (SDL)** | SAST / Sanitizer Engine (`SEC-001..005`) | Microsoft Secure Development Lifecycle: Cero secretos, sanitización de inputs. |
| **11–13: Quality, A11y & Perf** | Performance Auditor + WCAG Scanner | Google SRE & Web Vitals ($LCP \le 1.0\text{s}$, 100% WCAG 2.1 AA). |
| **14–15: SEO & Browser QA** | Automated Headless Flow QA | Vercel Edge Preview & Playwright-grade assertions. |
| **16–17: Evidence & Docs** | `EVD-*.json` + SHA-256 Signatures | GitHub SLSA Level 3 Provenance: Evidencia antes de reclamos. |
| **18–20: Telemetry & Learning** | Engram MCP + Mission Control Sync | Observación post-despliegue, revalidación de BKMs y aprendizaje negativo. |
| **21: Continuous Improvement** | Daily 16-Step Autonomous Cycle | Automejora continua sin auto-escalación de privilegios. |
