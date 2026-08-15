# CANARY-I001: Formal Multi-BKM Composition Hypothesis

**Mission ID:** `CANARY-I001`  
**BKMs Evaluated:** `BKM-CANARY-001` (Edge Sanitization) + `OBS-CANARY-002` (Accessible Cognitive Feedback)  
**Date of Pre-Registration:** 2026-08-14T22:54:00-05:00 (Frozen BEFORE Implementation)  

---

## 1. Frozen Primary Hypothesis ($H_{I001}$)

$$
\mathbf{H_{I001}\text{ (Synergistic Multi-BKM Composition):}}
$$

> *"The composite integration of `BKM-CANARY-001` (Edge Sanitization) and `OBS-CANARY-002` (Accessible Cognitive Guidance) yields a statistically superior task completion rate compared to either BKM in isolation ($\Delta_{\text{composition}} = \text{Outcome}_{AB} - \max(\text{Outcome}_A, \text{Outcome}_B) > 0$), while preserving zero secret/PII leaks, sub-45s time-on-task, 100% WCAG AA compliance, and an interaction cost overhead $\le \$0.15$."*

---

## 2. Pre-Declared Success & Falsification Thresholds

1. **Composition Benefit ($\Delta_{\text{comp}}$):** $\text{Completion}_{AB} - \max(\text{Completion}_A, \text{Completion}_B) \ge \mathbf{+10.0\%}$.
2. **Lexicographic Security Requirement:** Exactly $\mathbf{0}$ secret, token, or PII leaks in Arm AB.
3. **Accessibility Standard:** $\mathbf{100\%}$ WCAG 2.1 AA compliant across screen reader, focus trap, and ARIA live regions.
4. **Latency & Performance Guard:** Arm AB total component size $\le \mathbf{25.0\text{ KB}}$ and render latency $\le \mathbf{20.0\text{ ms}}$.
5. **Anti-Composition Guard Verification:** Live refusal (`DO_NOT_COMPOSE`) when composite is paired with `NEG-BKM-001`.
