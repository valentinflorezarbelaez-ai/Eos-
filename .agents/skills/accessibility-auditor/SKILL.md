---
name: accessibility-auditor
description: "Audits frontend interfaces for WCAG AA compliance, semantic HTML, and screen reader readiness."
---

# Accessibility Auditor Skill

## Purpose
Guarantees accessible, inclusive user experiences complying with WCAG AA standards.

## Inputs
- HTML templates, JSX/TSX components, CSS stylesheets, live web application URLs.

## Procedure
1. **Semantic HTML**: Verify proper heading hierarchy (`h1`-`h6`), landmark elements (`main`, `nav`), and form labels.
2. **Keyboard Navigation**: Ensure all interactive elements are focusable with visible focus rings.
3. **Contrast Ratio**: Verify color contrast ratios meet minimum WCAG AA thresholds (4.5:1 text, 3:1 UI controls).
4. **ARIA & Screen Readers**: Check `aria-*` attributes and image `alt` text.

## Evidence Requirements
- Log accessibility audit reports in `docs/evidence/` with zero critical WCAG AA violations.
