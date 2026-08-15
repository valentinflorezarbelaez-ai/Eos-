# CANARY-J001: 5-Arm Factorial Experimental Protocol & Randomization

**Mission ID:** `CANARY-J001`  
**Protocol Version:** `1.0.0`  
**Date:** 2026-08-14  

---

## 1. 5-Arm Factorial Allocation ($N=50$)

```text
COHORT-CANARY-F6 (N = 50 Independent Developers)
                        │
                        ▼  [Randomized 1:1:1:1:1 Allocation]
    ┌───────────┬───────────┬───────────┬───────────┬───────────┐
    │           │           │           │           │           │
    ▼           ▼           ▼           ▼           ▼           ▼
  ARM 0       ARM A       ARM B       ARM AB      ARM BA      (Anti-Guard Check)
(Control)   (Sanitizer) (Feedback)  (Order A->B) (Order B->A) (Pair with NEG-BKM-001)
  n = 10      n = 10      n = 10      n = 10      n = 10      (Automated Red Team)
```

### Arm Definitions:
1. **`Arm 0 (Control)`**: Raw unguided dispatcher.
2. **`Arm A (Sanitization Only)`**: Edge sanitization active; static unguided UI.
3. **`Arm B (Feedback Only)`**: Live ARIA feedback & syntax guidance active; raw secrets unmasked.
4. **`Arm AB (Correct Order: A -> B)`**: Edge sanitization masks secrets first, then accessible live guidance validates and displays sanitized preview.
5. **`Arm BA (Reversed Order: B -> A)`**: Feedback runs on raw text (announcing raw secrets), and sanitization is applied post-facto on submit, causing visual desynchronization and developer confusion.
