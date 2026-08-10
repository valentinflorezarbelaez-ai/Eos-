# EOS META-VERIFICATION SYSTEM ("VERIFY THE VERIFIER")

* **Status:** APPROVED
* **Date:** 2026-08-10

---

## 1. Meta-Verification Principle
The Meta-Verification System ensures that EOS never accepts claims, research findings, or agent assertions as factual truth without performing automated self-audit against raw execution evidence.

```text
CLAIM / AGENT ASSERTION
          ↓
SOURCE INDEPENDENCE AUDIT
          ↓
RAW EVIDENCE AUDIT (EVD-*.json)
          ↓
CONTRADICTION DETECTION
          ↓
INFERENCE vs FACT SEPARATION
          ↓
CONFIDENCE SCORE ASSIGNMENT
          ↓
VERIFIED CLASSIFICATION / REJECTION
```

---

## 2. Mandatory Meta-Verification Rules
1. **Evidence Backing Rule**: No claim marked `VERIFIED` may exist without a direct link to a passing test run or verifiable execution output.
2. **Source Independence Rule**: Multiple claims deriving from the same single vendor blog or press release count as 1 source, not multiple independent sources.
3. **Contradiction Freeze Rule**: When two valid sources produce contradictory claims, the claim status MUST remain `CONTRADICTION_DETECTED` until executable empirical evidence resolves the conflict.
4. **Zero Unbacked Promotion Rule**: A candidate capability (`CAP-*`) cannot be promoted to `ADOPTED` without an explicit `DEC-INT-*` record backed by `VERIFIED` evidence.
