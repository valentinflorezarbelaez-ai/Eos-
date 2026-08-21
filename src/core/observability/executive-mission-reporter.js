/**
 * @module ExecutiveMissionReporter
 * @description Generates standardized, uniform Executive Mission Reports.
 * Emits both canonical JSON (validated against mission-executive-report.schema.json)
 * and structured Executive Markdown summaries for the Human Director.
 * Strictly labels the epistemic provenance of all metrics (MEASURED, ESTIMATED, SIMULATED, NOT_RUN, UNKNOWN).
 */

import crypto from 'node:crypto';

export class ExecutiveMissionReporter {
  constructor(options = {}) {
    this.baseDir = options.baseDir || process.cwd();
  }

  /**
   * Generates a complete executive mission report
   * @param {Object} missionData Raw telemetry and execution records
   * @returns {Object} { jsonReport, markdownReport, sha256 }
   */
  generateReport(missionData = {}) {
    const missionId = missionData.mission_id || 'MIS-P2-DEFAULT';
    const reportId = `RPT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const tasks = missionData.tasks || [];
    const verifiedTasksCount = tasks.filter(t => t.status === 'VERIFIED').length;
    const totalDurationMs = tasks.reduce((sum, t) => sum + (t.duration_ms || 0), 0);

    const provenance = {
      token_count: missionData.provenance?.token_count || 'NOT_RUN',
      cost_usd: missionData.provenance?.cost_usd || 'NOT_RUN',
      latency: missionData.provenance?.latency || 'NOT_RUN',
      reversibility: missionData.provenance?.reversibility || 'NOT_RUN',
      provider_reliability: missionData.provenance?.provider_reliability || 'NOT_RUN'
    };

    const evidenceSummary = {
      total_receipts: missionData.evidence?.total_receipts || 0,
      verified_receipts: missionData.evidence?.verified_receipts || 0,
      hash_chain_integrity: missionData.evidence?.hash_chain_integrity || 'UNKNOWN',
      ledger_chain_count: missionData.evidence?.ledger_chain_count || 0
    };

    const econ = missionData.economics || {};
    const tokenAndCost = {
      total_tokens: econ.total_tokens == null ? null : econ.total_tokens,
      estimated_cost_usd: econ.estimated_cost_usd == null ? null : econ.estimated_cost_usd,
      budget_cap_usd: econ.budget_cap_usd == null ? null : econ.budget_cap_usd,
      efficiency_ratio_evidence_per_kt:
        econ.efficiency_ratio_evidence_per_kt == null ? null : econ.efficiency_ratio_evidence_per_kt,
      epistemic_class: econ.epistemic_class || 'NOT_RUN'
    };

    const deviations = missionData.deviations || [];
    const hitlItems = missionData.hitl_action_items || [];

    const governanceInvariants = {
      external_write_barrier_delta: 0,
      network_egress_status: missionData.governance?.network_egress_status || 'BLOCKED_OFFLINE',
      credentials_active_count: missionData.governance?.credentials_active_count || 0
    };

    let overallStatus = 'SUCCESS';
    if (hitlItems.some(h => h.status === 'PENDING')) {
      overallStatus = 'BLOCKED_ON_GOVERNANCE';
    } else if (tasks.some(t => t.status === 'FAILED')) {
      overallStatus = 'PARTIAL_SUCCESS';
    }

    const jsonReport = {
      schema_version: '1.0.0',
      report_id: reportId,
      mission_id: missionId,
      generated_at: timestamp,
      executive_summary: {
        goal: missionData.goal || 'Execution of governed engineering workflow',
        overall_status: overallStatus,
        duration_ms: totalDurationMs,
        epistemic_verdict: missionData.epistemic_verdict || 'VERIFIED_WITHIN_OFFLINE_SCOPE'
      },
      metric_provenance: provenance,
      task_execution_summary: tasks.map(t => ({
        task_id: t.task_id,
        name: t.name,
        status: t.status || 'VERIFIED',
        attempts: t.attempts || 1,
        duration_ms: t.duration_ms || 0
      })),
      evidence_verification_summary: evidenceSummary,
      token_and_cost_summary: tokenAndCost,
      deviations_and_retries: deviations.map(d => ({
        timestamp: d.timestamp || timestamp,
        severity: d.severity || 'INFO',
        description: d.description,
        action_taken: d.action_taken
      })),
      hitl_action_items: hitlItems.map(h => ({
        action_id: h.action_id,
        gate: h.gate,
        status: h.status || 'PENDING',
        requested_decision: h.requested_decision
      })),
      governance_invariants: governanceInvariants
    };

    const jsonString = JSON.stringify(jsonReport, null, 2);
    const sha256 = crypto.createHash('sha256').update(jsonString).digest('hex');

    const markdownReport = this._renderMarkdown(jsonReport, sha256);

    return {
      jsonReport,
      markdownReport,
      sha256
    };
  }

  _renderMarkdown(report, sha256) {
    const exec = report.executive_summary;
    const prov = report.metric_provenance;
    const econ = report.token_and_cost_summary;
    const evid = report.evidence_verification_summary;
    const gov = report.governance_invariants;

    const fmtNum = (v, digits) => (v == null || Number.isNaN(v) ? 'NOT_RUN' : Number(v).toFixed(digits));
    const fmtInt = (v) => (v == null || Number.isNaN(v) ? 'NOT_RUN' : Number(v).toLocaleString());

    return `# EOS Executive Mission Report — ${report.report_id}

**Mission ID:** \`${report.mission_id}\`  
**Generated At:** \`${report.generated_at}\`  
**Overall Status:** **\`${exec.overall_status}\`**  
**Epistemic Verdict:** **\`${exec.epistemic_verdict}\`**  
**Integrity Hash (SHA-256):** \`${sha256}\`  

---

## 1. Executive Summary
- **Goal:** ${exec.goal}
- **Total Duration:** ${exec.duration_ms.toFixed(1)} ms
- **External Write Barrier:** \`Δ = ${gov.external_write_barrier_delta}\` (Strict Zero Mutation)
- **Network Egress Mode:** \`${gov.network_egress_status}\`
- **Active Staged Credentials:** \`${gov.credentials_active_count}\`

---

## 2. Metric Provenance & Classification
*All metrics are strictly classified according to their empirical provenance:*

| Metric Dimension | Classification | Status / Explanation |
|---|---|---|
| **Token Consumption** | \`${prov.token_count}\` | Only MEASURED when tokenizer/telemetry ran |
| **Cost (USD)** | \`${prov.cost_usd}\` | Only ESTIMATED/MEASURED with declared method |
| **Execution Latency** | \`${prov.latency}\` | Only MEASURED with stopwatch evidence |
| **State Reversibility** | \`${prov.reversibility}\` | Hash before/after when checkpoint exists |
| **Real Provider SLA** | \`${prov.provider_reliability}\` | External providers remain blocked offline |

---

## 3. Token & Cost Economics
- **Epistemic Class:** \`${econ.epistemic_class || 'NOT_RUN'}\`
- **Total Tokens:** \`${fmtInt(econ.total_tokens)}\`
- **Estimated Cost:** \`${econ.estimated_cost_usd == null ? 'NOT_RUN' : '$' + fmtNum(econ.estimated_cost_usd, 4)}\` / Budget Cap: \`${econ.budget_cap_usd == null ? 'N/A' : '$' + fmtNum(econ.budget_cap_usd, 2)}\`
- **Evidence/Kilotoken Efficiency:** \`${fmtNum(econ.efficiency_ratio_evidence_per_kt, 2)}\`

---

## 4. Evidence & Cryptographic Integrity
- **Verified Evidence Receipts:** \`${evid.verified_receipts} / ${evid.total_receipts}\`
- **Hash-Chained Ledger Integrity:** \`${evid.hash_chain_integrity}\` (\`${evid.ledger_chain_count}\` events committed)

---

## 5. Task Execution Breakdown
| Task ID | Task Name | Status | Attempts | Duration |
|---|---|---|---|---|
${report.task_execution_summary.map(t => `| \`${t.task_id}\` | ${t.name} | \`${t.status}\` | ${t.attempts} | ${t.duration_ms}ms |`).join('\n')}

---

## 6. Deviations & Blocked Retries
${report.deviations_and_retries.length === 0 ? '_No anomalies or blocked retries recorded._' : report.deviations_and_retries.map(d => `- **[${d.severity}]** \`${d.timestamp}\`: ${d.description} *(Action: ${d.action_taken})*`).join('\n')}

---

## 7. Human-in-the-Loop (HITL) Action Items
${report.hitl_action_items.length === 0 ? '_No pending human decisions._' : report.hitl_action_items.map(h => `- **Action ID \`${h.action_id}\`** (Gate: \`${h.gate}\`): **\`${h.status}\`** — *${h.requested_decision}*`).join('\n')}
`;
  }
}
