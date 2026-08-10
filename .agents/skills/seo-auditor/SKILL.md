---
name: seo-auditor
description: "Audits search engine optimization, metadata, Open Graph tags, sitemaps, and semantic tags."
---

# SEO Auditor Skill

## Purpose
Ensures public web applications rank effectively and display structured social metadata.

## Inputs
- HTML pages, meta tags, Open Graph tags, `sitemap.xml`, `robots.txt`, structured JSON-LD data.

## Procedure
1. **Meta Tags**: Verify presence of unique `<title>`, `<meta name="description">`, and `<link rel="canonical">`.
2. **Open Graph**: Check `og:title`, `og:description`, `og:image`, and `twitter:card` tags.
3. **Structured Data**: Validate JSON-LD schema against Schema.org standards.
4. **Indexability**: Check `robots.txt` and `sitemap.xml` for crawl blocking errors.

## Evidence Requirements
- SEO checklist log saved in `docs/evidence/` with `VERIFIED` status.
