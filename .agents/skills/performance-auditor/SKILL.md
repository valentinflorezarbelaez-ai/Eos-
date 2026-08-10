---
name: performance-auditor
description: "Audits bundle size, network requests, loading speed, and Core Web Vitals."
---

# Performance Auditor Skill

## Purpose
Ensures web applications and software systems maintain high performance and low latency.

## Inputs
- Production builds, JavaScript bundle outputs, asset files, performance trace logs.

## Procedure
1. **Core Web Vitals**: Measure LCP (Largest Contentful Paint), FID/INP, and CLS (Cumulative Layout Shift).
2. **Bundle Analysis**: Identify oversized dependencies, duplicate modules, or uncompressed assets.
3. **Media Optimization**: Verify image compression, WebP/AVIF formats, and lazy loading strategies.
4. **Caching & Cdn**: Inspect HTTP caching headers and resource preloading tags.

## Evidence Requirements
- Performance benchmark logs recorded in `docs/evidence/` with Core Web Vitals in the green zone.
