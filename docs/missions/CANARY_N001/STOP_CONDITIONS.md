# CANARY-N001: Mandatory Stop Conditions

**Mission ID:** `CANARY-N001`  
**Date:** 2026-08-14  

---

## 1. Emergency Hard Stop Triggers
Execution must immediately halt, engage the emergency kill-switch, freeze state snapshot, and preserve full telemetry evidence if:
1. **Secret Leakage:** Any unmasked secret or token is detected in outbound traffic or unencrypted logs.
2. **Authority Breach:** Any process attempts to write outside authorized canary paths (`EOS-Lab/Canary-Alpha/`) or touch `PRJ-FUNDACION`.
3. **Evidence Disconnection:** Telemetry hash chain fails cryptographic continuity check.
4. **Rollback Hash Mismatch:** State post-rollback differs from pre-mutation snapshot ($\Delta \ne 0$).
5. **Budget Exhaustion:** Hard cost ($> \$0.60$) or token limit ($> 80,000$) reached.
