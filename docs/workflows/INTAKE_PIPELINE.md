# EOS PROJECT INTAKE PIPELINE

## Purpose
Establishes a systematic, non-destructive pipeline for ingesting, classifying, and extracting engineering requirements from raw, heterogeneous client assets (images, PDFs, documents, text, brand references, videos).

---

## Data Classification Model

Material ingested into EOS must be tagged under one of 7 formal categories:

1. **RAW**: Original unmodified source asset (e.g., client logo, raw photo, raw PDF).
2. **OBSERVED**: Directly observed structural or textual facts (e.g., "Image contains text: Foundation Services").
3. **EXTRACTED**: Structured data extracted from raw material (e.g., color hex codes, pricing tables).
4. **INFERRED**: Logical conclusions derived from extracted data (e.g., "Primary audience is residential clients").
5. **ASSUMPTION**: Necessary temporary working hypothesis (e.g., "Form submissions require email notification").
6. **VERIFIED**: Ingested data confirmed by explicit Product Owner feedback or execution evidence.
7. **NOT VERIFIED**: Ingested data awaiting validation or confirmation.

---

## 9-Step Intake Execution Flow

```text
 1. RAW MATERIAL INGESTION   (Save to project intake directory)
 2. ASSET INVENTORY         (Log metadata, format, resolution, source)
 3. CLASSIFICATION          (Tag asset purpose: UI, Brand, Content, Spec)
 4. CONTEXT EXTRACTION       (Extract text, brand colors, business rules)
 5. REQUIREMENTS DISCOVERY   (Map extracted facts to Functional/Non-Functional Specs)
 6. GAP DETECTION           (Identify missing assets, vague copy, unstated rules)
 7. RESEARCH & BENCHMARKING (Evaluate industry patterns for missing context)
 8. SPECIFICATION DRAFT     (Produce SPEC-XXXX in docs/specs/)
 9. INTAKE CERTIFICATION    (Mark intake COMPLETE upon verification)
```

---

## Asset Inventory Structure

Each registered project maintains an inventory under `docs/intake/<project-id>-inventory.json`:

```json
{
  "project_id": "PRJ-EXAMPLE",
  "assets": [
    {
      "asset_id": "AST-001",
      "filename": "hero_logo.png",
      "type": "IMAGE",
      "classification": "RAW",
      "source": "Client Email",
      "purpose": "Brand Identity / Hero Section",
      "extracted_data": "Primary color #1E3A8A",
      "verification_status": "VERIFIED"
    }
  ]
}
```
