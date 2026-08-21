/**
 * @module RoleSkillRegistryEngine
 * @description Operational runtime catalog for agent roles, technical capabilities,
 * tool access boundaries, and multi-dimensional selection algorithms with independent reviewer assignment.
 */

import { calculateSha256 } from '../sdd/epistemic-evidence-engine.js';

export const CANONICAL_ROLES = [
  {
    schema_version: '1.0.0',
    role_id: 'ROLE-SYSTEM-ARCHITECT',
    name: 'System Architect',
    description: 'Decomposes systems, defines component contracts, verifies stack fitness, and formulates ADRs.',
    capabilities: [
      { domain: 'architecture', technologies: ['System Design', 'ADR', 'Spec-Driven Development'], evidence_level: 'PROVEN' },
      { domain: 'contracts', technologies: ['JSON Schema', 'OpenAPI', 'FSM'], evidence_level: 'PROVEN' }
    ],
    allowed_tools: ['read_file', 'grep_search', 'list_dir'],
    prohibited_tools: ['exec_command', 'write_external'],
    max_authority_level: 'LEVEL_2',
    protected_surfaces: ['docs/governance/**', 'src/core/**'],
    budget_tier: 'STANDARD',
    performance_metrics: { tasks_completed: 45, correction_rate: 0.02, average_score: 9.8 }
  },
  {
    schema_version: '1.0.0',
    role_id: 'ROLE-FRONTEND-ENGINEER',
    name: 'Frontend Engineer',
    description: 'Implements semantic, accessible, and high-performance UI components, client logic, and responsive layouts.',
    capabilities: [
      { domain: 'frontend', technologies: ['TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'React', 'Astro'], evidence_level: 'PROVEN' },
      { domain: 'accessibility', technologies: ['WCAG 2.1 AA', 'ARIA'], evidence_level: 'PROVEN' }
    ],
    allowed_tools: ['read_file', 'write_file', 'grep_search', 'list_dir'],
    prohibited_tools: ['exec_root_commands', 'external_network'],
    max_authority_level: 'LEVEL_1',
    protected_surfaces: ['docs/governance/**', 'src/core/**', '.eos/ledger/**'],
    budget_tier: 'STANDARD',
    performance_metrics: { tasks_completed: 120, correction_rate: 0.04, average_score: 9.4 }
  },
  {
    schema_version: '1.0.0',
    role_id: 'ROLE-BACKEND-ENGINEER',
    name: 'Backend Engineer',
    description: 'Develops server-side business logic, database integrations, APIs, and background processing.',
    capabilities: [
      { domain: 'backend', technologies: ['Node.js', 'Express', 'Fastify', 'Python', 'Go', 'PostgreSQL', 'SQLite'], evidence_level: 'PROVEN' },
      { domain: 'api', technologies: ['REST', 'RPC', 'JSON-RPC'], evidence_level: 'PROVEN' }
    ],
    allowed_tools: ['read_file', 'write_file', 'grep_search', 'list_dir'],
    prohibited_tools: ['exec_root_commands', 'external_network'],
    max_authority_level: 'LEVEL_1',
    protected_surfaces: ['docs/governance/**', 'src/core/**', '.eos/ledger/**'],
    budget_tier: 'STANDARD',
    performance_metrics: { tasks_completed: 98, correction_rate: 0.05, average_score: 9.3 }
  },
  {
    schema_version: '1.0.0',
    role_id: 'ROLE-QA-ENGINEER',
    name: 'QA & Test Engineer',
    description: 'Writes and executes unit, integration, and regression test suites, ensuring 100% pass rates and boundary verification.',
    capabilities: [
      { domain: 'testing', technologies: ['node:test', 'vitest', 'jest', 'pytest', 'TDD'], evidence_level: 'PROVEN' },
      { domain: 'falsification', technologies: ['Negative Testing', 'Boundary Audit'], evidence_level: 'PROVEN' }
    ],
    allowed_tools: ['read_file', 'write_file', 'exec_test_command', 'grep_search', 'list_dir'],
    prohibited_tools: ['external_network', 'production_deploy'],
    max_authority_level: 'LEVEL_1',
    protected_surfaces: ['docs/governance/**', 'src/core/**'],
    budget_tier: 'LEAN',
    performance_metrics: { tasks_completed: 160, correction_rate: 0.01, average_score: 9.9 }
  },
  {
    schema_version: '1.0.0',
    role_id: 'ROLE-SECURITY-AUDITOR',
    name: 'Security & Governance Auditor',
    description: 'Audits secrets, OWASP compliance, protected surfaces, and enforces epistemic validation invariants.',
    capabilities: [
      { domain: 'security', technologies: ['Secret Scanning', 'SSRF Prevention', 'OWASP Top 10', 'Replay Protection'], evidence_level: 'PROVEN' },
      { domain: 'governance', technologies: ['HITL Enforcement', 'Epistemic Evidence'], evidence_level: 'PROVEN' }
    ],
    allowed_tools: ['read_file', 'grep_search', 'list_dir'],
    prohibited_tools: ['write_file', 'exec_command', 'external_network'],
    max_authority_level: 'LEVEL_2',
    protected_surfaces: [],
    budget_tier: 'HIGH_STAKES',
    performance_metrics: { tasks_completed: 85, correction_rate: 0.01, average_score: 9.9 }
  }
];

export class RoleSkillRegistryEngine {
  constructor(options = {}) {
    this.roles = new Map();
    const initialRoles = options.roles || CANONICAL_ROLES;
    for (const role of initialRoles) {
      this.registerRole(role);
    }
  }

  registerRole(roleProfile) {
    if (!roleProfile.role_id) throw new Error('MISSING_ROLE_ID: Role must have a unique role_id');
    this.roles.set(roleProfile.role_id, roleProfile);
  }

  getRole(roleId) {
    return this.roles.get(roleId) || null;
  }

  listRoles() {
    return Array.from(this.roles.values());
  }

  /**
   * Evaluates and selects the optimal agent role for a given task and assigns an independent reviewer
   * @param {Object} task Task contract requirement or object
   * @param {Object} projectProfile Discovered project profile
   * @returns {Object} Canonical AgentSelectionRecord
   */
  selectAgentForTask(task = {}, projectProfile = {}) {
    const taskId = task.task_id || 'TASK-UNSPECIFIED';
    const missionId = task.mission_id || 'MIS-UNSPECIFIED';
    const taskDomain = (task.domain || this._inferDomainFromTask(task)).toLowerCase();
    const requiredAuthority = task.authority_level || 'LEVEL_0';

    const scoringBreakdown = [];
    const whyRejected = [];

    for (const role of this.roles.values()) {
      // 1. Capability Fit (0-100)
      let capabilityFit = 20.0;
      for (const cap of role.capabilities) {
        if (cap.domain.toLowerCase() === taskDomain || taskDomain.includes(cap.domain.toLowerCase())) {
          const multiplier = cap.evidence_level === 'PROVEN' ? 1.0 : (cap.evidence_level === 'DISCOVERED' ? 0.8 : 0.5);
          capabilityFit = 95.0 * multiplier;
          break;
        }
      }

      // 2. Security & Authority Fit (0-100)
      let securityFit = 90.0;
      const authorityRank = { LEVEL_0: 0, LEVEL_1: 1, LEVEL_2: 2, LEVEL_3: 3 };
      if (authorityRank[role.max_authority_level] < authorityRank[requiredAuthority]) {
        securityFit = 0.0;
        whyRejected.push({
          role_id: role.role_id,
          reason: `Insufficient authority level (${role.max_authority_level} < required ${requiredAuthority})`
        });
      }

      // 3. Cost & Performance Fit (0-100)
      const reliabilityFit = (role.performance_metrics.average_score / 10.0) * 100.0;
      const costFit = role.budget_tier === 'LEAN' ? 95.0 : (role.budget_tier === 'STANDARD' ? 85.0 : 70.0);

      // Total Weighted Score
      const totalScore = (capabilityFit * 0.50) + (securityFit * 0.30) + (reliabilityFit * 0.10) + (costFit * 0.10);

      scoringBreakdown.push({
        role_id: role.role_id,
        total_score: parseFloat(totalScore.toFixed(1)),
        capability_fit: parseFloat(capabilityFit.toFixed(1)),
        security_fit: parseFloat(securityFit.toFixed(1)),
        cost_fit: parseFloat(costFit.toFixed(1))
      });
    }

    // Sort descending by score
    scoringBreakdown.sort((a, b) => b.total_score - a.total_score);

    const winner = scoringBreakdown[0];
    const runnerUp = scoringBreakdown.length > 1 ? scoringBreakdown[1] : null;

    // Check if HITL escalation is required (winner score below threshold or authority mismatch)
    const hitlEscalation = winner.total_score < 60.0 || winner.security_fit === 0;

    // Assign independent reviewer (author != reviewer)
    let reviewerRoleId = 'ROLE-QA-ENGINEER';
    if (winner.role_id === 'ROLE-QA-ENGINEER') {
      reviewerRoleId = 'ROLE-SECURITY-AUDITOR';
    } else if (winner.role_id === 'ROLE-SECURITY-AUDITOR') {
      reviewerRoleId = 'ROLE-SYSTEM-ARCHITECT';
    }

    const whySelected = `Selected ${winner.role_id} with total score of ${winner.total_score} (Capability fit: ${winner.capability_fit}%, Security fit: ${winner.security_fit}%). Assigned independent reviewer ${reviewerRoleId}.`;

    return {
      schema_version: '1.0.0',
      selection_id: `SEL-${Date.now()}-${taskId.replace('TASK-', '')}`,
      task_id: taskId,
      mission_id: missionId,
      selected_role_id: winner.role_id,
      runner_up_role_id: runnerUp ? runnerUp.role_id : null,
      author_role_id: winner.role_id,
      reviewer_role_id: reviewerRoleId,
      scoring_breakdown: scoringBreakdown,
      why_selected: whySelected,
      why_rejected: whyRejected,
      hitl_escalation_required: hitlEscalation
    };
  }

  _inferDomainFromTask(task) {
    const text = `${task.name || ''} ${task.objective || ''}`.toLowerCase();
    if (/\b(ui|frontend|html|css|react|landing|accessibility|aria)\b/i.test(text)) {
      return 'frontend';
    }
    if (/\b(api|backend|database|server|endpoint|postgres|sqlite|rest|rpc)\b/i.test(text)) {
      return 'backend';
    }
    if (/\b(test|tests|testing|qa|falsification|regression|fuzz)\b/i.test(text)) {
      return 'testing';
    }
    if (/\b(security|audit|secret|vulnerability|ssrf|owasp)\b/i.test(text)) {
      return 'security';
    }
    if (/\b(architecture|design|decompose|adr|contract|contracts)\b/i.test(text)) {
      return 'architecture';
    }
    return 'general';
  }
}
