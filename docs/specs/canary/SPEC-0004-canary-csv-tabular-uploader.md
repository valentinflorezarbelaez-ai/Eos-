# SPEC-0004: Canary Alpha Tabular CSV Data Uploader & Sanitizer

**Specification ID:** `SPEC-0004-CANARY-CSV-TABULAR-UPLOADER`  
**Mission ID:** `CANARY-F001`  
**Target Project:** `PRJ-CANARY-ALPHA`  
**Status:** `APPROVED_FOR_IMPLEMENTATION`  
**Date:** 2026-08-14  

---

## 1. Objectives & Scope

### Objective
Implement an accessible, lightweight ($< 15\text{ KB}$), high-performance `CsvTabularDataUploader` web component that parses delimiter-separated tabular data (CSV/TSV), recursively sanitizes confidential PII (Credit card PANs, SSNs, phone numbers), neutralizes CSV formula injection vulnerabilities (`=`, `@`, `+`, `-`), and renders an accessible preview table with column metadata.

### Scope Boundary
*   Target files strictly within `EOS-Lab/Canary-Alpha/`.
*   Zero writes to `PRJ-FUNDACION` or external systems ($\Delta = 0$).

---

## 2. Frozen Acceptance Criteria

$$
\begin{aligned}
\text{Task Completion Rate} &\ge \mathbf{90.0\%} \quad (\text{Predicted: } 93.0\%) \\
\text{Average Time-on-Task} &\le \mathbf{50.0\text{ s}} \quad (\text{Predicted: } 45.0\text{s}) \\
\text{Friction Score} &\le \mathbf{2.5 / 10} \quad (\text{Predicted: } 1.8 / 10) \\
\text{User Trust Score} &\ge \mathbf{8.5 / 10} \quad (\text{Predicted: } 9.2 / 10) \\
\text{PII / Secret Leaks} &= \mathbf{0.0\%} \quad (\text{Strict Zero Leaks}) \\
\text{Formula Injections Leaked} &= \mathbf{0.0\%} \quad (\text{Strict Zero Injections}) \\
\text{Parse Latency (1,000 rows)} &\le \mathbf{20.0\text{ ms}} \\
\text{Bundle Footprint} &< \mathbf{35.0\text{ KB}}
\end{aligned}
$$

---

## 3. Technical Architecture

### Component API (`CsvTabularDataUploader`)
*   `parseCsv(rawCsvString, delimiter)`: Streaming RFC-4180 parser that splits rows and fields, handling quotes, escaped quotes, and newlines inside quoted fields.
*   `sanitizeCell(value, columnName)`:
    - *Formula Injection Defense:* Escapes leading `=,+,-,@,\t,\r` with a leading single quote `'` if value is a string, while preserving legitimate numeric values (e.g. `-42.5` or `+100`).
    - *PII Scrubbing:* Masks PANs, SSNs, phone numbers, and Bearer tokens with `[REDACTED_PII]` or `[REDACTED_SECRET]`.
*   `renderPreviewTable(parsedData)`: Emits accessible `<table>`, `<caption>`, `<thead>`, `<th scope="col">`, `<tbody>`, `<tr scope="row">`, and live status indicators.
