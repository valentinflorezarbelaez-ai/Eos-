# UNKNOWN & GAP REGISTER — FUNDACIÓN (PRJ-FUNDACION)

* **Project ID:** `PRJ-FUNDACION`
* **Status:** `OPEN_GAPS`
* **Date:** 2026-08-10

---

## Gap Log

### GAP-001: Missing Raw Client Assets
- **Description:** No physical brand logos, imagery, or institutional copy files have been placed in `C:\Users\valen\Documents\Fundacion`.
- **Classification:** `FACT`
- **Impact:** High — Visual design system and exact page copy cannot be finalized without raw assets.
- **Action Required:** Product Owner / Client must upload raw brand and content assets into target folder.

### GAP-002: Missing Contact & Legal Entity Details
- **Description:** Official legal name, Tax ID / NIT, physical address, phone numbers, and legal representative details are unstated.
- **Classification:** `FACT`
- **Impact:** Medium — Footer, contact page, and legal/transparency sections require verified data.
- **Action Required:** Request official contact and legal disclosure details from Product Owner.

### GAP-003: Donation Workflow Decision
- **Description:** It is unstated whether the foundation requires online payment gateway integration (e.g., Stripe, Wompi, PayPal) or simple direct bank transfer instructions / contact form.
- **Classification:** `FACT`
- **Impact:** High — Governs backend architecture, payment processing security, and PCI compliance requirements.
- **Action Required:** Escalate payment gateway decision to Product Owner (Level 3 Governance Decision).

### GAP-004: Hosting & Custom Domain Decision
- **Description:** Target domain name (e.g., `fundacion.org`) and hosting platform (e.g., Vercel, Netlify, VPS) are unstated.
- **Classification:** `FACT`
- **Impact:** Low during intake; High during deployment.
- **Action Required:** Define deployment target during Specification Approval phase.
