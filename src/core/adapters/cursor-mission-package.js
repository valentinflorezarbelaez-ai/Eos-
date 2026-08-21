/**
 * @module CursorMissionPackageGenerator
 * @description Compiles deterministic, compact, verifiable Mission Packages for Cursor.
 * Generates both machine-readable JSON (matching mission-package.schema.json)
 * and an ergonomic Markdown operator prompt (CURSOR_PROMPT.md) referencing files by path and SHA-256 hash.
 */

import crypto from 'node:crypto';
import path from 'node:path';
import { calculateSha256 } from '../sdd/epistemic-evidence-engine.js';

export class CursorMissionPackageGenerator {
  constructor(options = {}) {
    this.baseDir = options.baseDir || process.cwd();
  }

  /**
   * Generates the dual Cursor Mission Package
   * @param {Object} missionData Formulated mission context, project profile, plan, and tasks
   * @returns {Object} { jsonPackage, markdownPrompt, manifestHash }
   */
  generatePackage(missionData = {}) {
    if (!missionData.mission_id) {
      throw new Error('MISSING_MISSION_ID: missionData must contain a valid mission_id');
    }

    const missionId = missionData.mission_id;
    const contractId = missionData.contract_id || `CON-${missionId.replace('MIS-', '')}`;
    const timestamp = new Date().toISOString();
    const projectRoot = missionData.project_root || '.';
    const direction = missionData.direction || { goal: 'Execute governed engineering mission', constraints: [] };
    const authority = missionData.authority || { level: 'LEVEL_0', max_budget_usd: 0.10, allowed_effects: ['READ_ONLY'] };
    const tasks = missionData.tasks || [];
    const contextFiles = missionData.context_files || [];
    const allowedTools = missionData.allowed_tools || ['read_file', 'grep_search', 'list_dir'];
    const forbiddenSurfaces = missionData.protected_surfaces || ['docs/governance/**', '.eos/ledger/**', 'src/core/**'];

    // 1. Compile Canonical JSON Package matching mission-package.schema.json
    const jsonPackage = {
      schema_version: '1.0.0',
      mission_id: missionId,
      contract_id: contractId,
      parent_mission_id: missionData.parent_mission_id || null,
      status: missionData.status || 'active',
      phase: options.phase || 'PLAN',
      direction: {
        raw_prompt: direction.goal,
        interpreted_goal: direction.goal,
        business_context: direction.business_context || 'Autonomous Engineering Mission under EOS Governance',
        success_criteria: direction.success_criteria || ['Clean test execution', 'Zero regression', 'Cryptographic evidence'],
        constraints: direction.constraints || ['Strict read-only default on external projects', 'Deterministic outputs']
      },
      authority: {
        level: authority.level,
        delegated_to: 'CURSOR_AGENT_OPERATOR',
        valid_until: new Date(Date.now() + 86400000).toISOString(),
        restrictions: [
          'No external network egress without explicit P2/P3 gate receipt',
          'External target mutation blocked (Δ = 0)',
          'No secret leakage in logs or prompts'
        ]
      },
      budgets: {
        max_tokens: missionData.max_tokens || 50000,
        max_cost_usd: authority.max_budget_usd || 0.10,
        max_duration_seconds: 3600,
        max_retries_per_task: 2
      },
      scope: {
        project_id: missionData.project_id || 'PRJ-LOCAL',
        root_path: projectRoot,
        included_paths: missionData.included_paths || ['src/**', 'tests/**'],
        excluded_paths: forbiddenSurfaces,
        protected_surfaces: forbiddenSurfaces
      },
      artifacts: {
        required: ['evidence_receipts', 'test_results', 'summary_report'],
        produced: []
      },
      orchestration: {
        assigned_roles: missionData.assigned_roles || [
          { role: 'SYSTEM_ARCHITECT', purpose: 'Design and task decomposition' },
          { role: 'CORE_ENGINEER', purpose: 'Implementation and unit test verification' },
          { role: 'EVIDENCE_AUDITOR', purpose: 'Receipt verification and hash commitment' }
        ],
        tasks: tasks.map(t => ({
          task_id: t.task_id,
          name: t.name,
          assigned_role: t.assigned_role || 'CORE_ENGINEER',
          status: t.status || 'proposed',
          dependencies: t.dependencies || []
        }))
      },
      evidence_policy: {
        required_categories: ['UNIT_TEST', 'INTEGRATION_TEST', 'SECURITY_AUDIT'],
        hash_algorithm: 'SHA-256',
        chain_to_ledger: true
      }
    };

    // 2. Compile Operator Markdown Prompt (CURSOR_PROMPT.md)
    const markdownPrompt = this._renderMarkdownPrompt(jsonPackage, contextFiles, allowedTools, tasks);

    // 3. Compute deterministic manifest hash
    const manifestPayload = JSON.stringify({ jsonPackage, markdownPrompt });
    const manifestHash = calculateSha256(manifestPayload);

    return {
      jsonPackage,
      markdownPrompt,
      manifestHash
    };
  }

  _renderMarkdownPrompt(pkg, contextFiles, allowedTools, tasks) {
    return `# EOS MISSION PACKAGE: ${pkg.mission_id}
**Contract ID:** \`${pkg.contract_id}\`  
**Authority Level:** \`${pkg.authority.level}\` (Read-Only / Bounded Local Execution)  
**Budget Cap:** \`$${pkg.budgets.max_cost_usd.toFixed(2)}\` | **Max Tokens:** \`${pkg.budgets.max_tokens.toLocaleString()}\`  
**Target Project:** \`${pkg.scope.project_id}\` (\`${pkg.scope.root_path}\`)  

---

## 1. Human Direction & Objective
- **Goal:** ${pkg.direction.interpreted_goal}
- **Business Context:** ${pkg.direction.business_context}
- **Success Criteria:**
${pkg.direction.success_criteria.map(c => `  - [ ] ${c}`).join('\n')}

---

## 2. Scope & Security Invariants
- **Included Scope:** \`${pkg.scope.included_paths.join(', ')}\`
- **Protected Surfaces (Strict $\\Delta = 0$):**
${pkg.scope.protected_surfaces.map(s => `  - \`${s}\``).join('\n')}
- **Authority Constraints:**
${pkg.authority.restrictions.map(r => `  - ⚠️ ${r}`).join('\n')}

---

## 3. Context Files by Reference & Content Hash
*Files are referenced by relative path and SHA-256 hash to optimize context economy:*

| Relative Path | Content SHA-256 Hash | Purpose / Notes |
|---|---|---|
${contextFiles.length > 0 ? contextFiles.map(f => `| \`${f.path}\` | \`${f.sha256 ? f.sha256.substring(0, 16) + '...' : 'CALCULATED_ON_DEMAND'}\` | ${f.purpose || 'Context reference'} |`).join('\n') : '| `(No external files pinned)` | `N/A` | Static AST analysis will be used |'}

---

## 4. Assigned Roles & Task Breakdown
${tasks.length > 0 ? tasks.map((t, idx) => `### Task ${idx + 1}: \`${t.task_id}\` — ${t.name}
- **Assigned Role:** \`${t.assigned_role || 'CORE_ENGINEER'}\`
- **Objective:** ${t.objective || t.name}
- **Status:** \`${t.status || 'READY_FOR_EXECUTION'}\`
- **Required Outputs:** \`${(t.required_outputs || ['Code changes', 'Test passes']).join(', ')}\`
`).join('\n') : '_No granular tasks defined yet. Run \\`eos mission plan\\` to generate tasks._'}

---

## 5. Permitted Tools & Dispatcher Policy
- **Allowed Tools:** \`${allowedTools.join(', ')}\`
- **Prohibited Effects:** Live external API calls, unstaged credentials, mutations outside approved worktrees.

---

## 6. Definition of Done & Evidence Requirements
To complete each task, Cursor must provide:
1. **Deterministic Execution Output**: Raw command stdout/stderr with 0 failure exit code.
2. **Automated Test Results**: Passes verified with \`node --test\` or equivalent.
3. **Cryptographic Proof**: SHA-256 hash of modified artifacts.

---

## 7. Return Instructions for Cursor Operator
When returning completed work to EOS:
1. Report task status as \`VERIFIED\` or \`BLOCKED\` with explicit reasoning.
2. Provide unified diffs for modified files.
3. Provide raw test output logs.
4. Run \`eos mission report ${pkg.mission_id}\` to compile the executive report.
`;
  }
}
