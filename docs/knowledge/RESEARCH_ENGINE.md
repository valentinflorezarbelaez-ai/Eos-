# EOS RESEARCH ENGINE ARCHITECTURE

* **Status:** APPROVED
* **Date:** 2026-08-10

---

## 1. Overview
The EOS Research Engine governs technical discovery, RFC lookup, and competitor analysis, enforcing clear separation between raw sources, observations, interpretations, and actionable recommendations.

---

## 2. Research Data Hierarchy
Every research output produced by `AGT-RESEARCH` must separate:

1. **SOURCE**: Primary URL, RFC number, official documentation reference, or file path.
2. **OBSERVATION**: Direct verbatim quote or measurable fact extracted from the source.
3. **INTERPRETATION**: Technical reasoning regarding applicability to the target project.
4. **RECOMMENDATION**: Concrete architectural proposal or requirement specification draft.
