# CANARY-L001: Formal Blind Generalization & Policy Regret Hypothesis

**Mission ID:** `CANARY-L001`  
**Evaluated Policy:** `COMPOSITION_POLICY_GRAPH` (7-Strategy Decision Model)  
**Date of Pre-Registration:** 2026-08-14T23:04:00-05:00 (Frozen BEFORE Blind Execution)  

---

## 1. Frozen Primary Hypothesis ($H_{L001}$)

$$
\mathbf{H_{L001}\text{ (Blind Generalization & Regret Minimization):}}
$$

> *"When evaluated on an out-of-sample partition of unseen domains (`UNSEEN_SET`), the EOS Composition Policy Selector will achieve an accuracy $\text{StrategySelectionAccuracy}_{\text{unseen}} \ge \mathbf{90.0\%}$, maintain a Policy Regret vs Oracle $\text{PolicyRegret} \le \mathbf{2.0\%}$, enforce a False Transfer Rate $\text{FalseTransferRate} = \mathbf{0.0\%}$, and exhibit an Abstention Precision $\text{AbstentionPrecision} = \mathbf{100.0\%}$ when faced with negative knowledge or uncharacterized runtimes."*

---

## 2. Pre-Declared Falsification Thresholds
1. **Unseen Accuracy:** $\text{StrategySelectionAccuracy}_{\text{unseen}} < \mathbf{85.0\%} \implies \text{FALSIFIED}$.
2. **Policy Regret:** $\text{PolicyRegret} > \mathbf{5.0\%} \implies \text{FALSIFIED}$.
3. **Lexicographic Safety:** Any secret leak or failure to trigger `DO_NOT_COMPOSE` on binary streams $\implies \text{FATAL\_FAIL}$.
4. **Abstention Precision:** $\text{AbstentionPrecision} < \mathbf{95.0\%} \implies \text{FALSIFIED}$.
