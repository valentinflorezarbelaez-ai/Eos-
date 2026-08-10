import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const isStrict = args.includes('--strict');
const isJson = args.includes('--json');
const knownFlags = ['--strict', '--json'];

// Check for invalid flags
const unknownArgs = args.filter(arg => !knownFlags.includes(arg));
if (unknownArgs.length > 0) {
  console.error(`Invalid arguments: ${unknownArgs.join(', ')}`);
  process.exit(2);
}

const REQUIRED_PATHS = [
  '.git',
  '.gitignore',
  '.editorconfig',
  'package.json',
  '.agents/AGENTS.md',
  '.agents/skills/sdd/SKILL.md',
  '.agents/skills/evidence-auditor/SKILL.md',
  '.agents/skills/security-auditor/SKILL.md',
  '.agents/skills/quality-auditor/SKILL.md',
  '.agents/skills/accessibility-auditor/SKILL.md',
  '.agents/skills/performance-auditor/SKILL.md',
  '.agents/skills/seo-auditor/SKILL.md',
  '.agents/skills/browser-qa/SKILL.md',
  'docs/core/CONSTITUTION.md',
  'docs/core/GOVERNANCE.md',
  'docs/workflows/EOS_CYCLE.md',
  'docs/workflows/TRACEABILITY.md',
  'docs/architecture/adrs/ADR-0001-eos-workspace-initialization.md',
  'docs/evidence/schema.json',
  'docs/evidence/TEMPLATE.md',
  'docs/specs/TEMPLATE.md',
  'docs/projects/REGISTRY_MODEL.md',
  'docs/projects/TEMPLATE.json'
];

const REQUIRED_EVIDENCE_STATUSES = [
  'VERIFIED',
  'NOT VERIFIED',
  'PARTIALLY VERIFIED',
  'BLOCKED',
  'ASSUMPTION',
  'RISK'
];

function verifyWorkspace() {
  const report = {
    status: 'PASS',
    strictMode: isStrict,
    timestamp: new Date().toISOString(),
    checks: [],
    failures: [],
    warnings: []
  };

  // 1. Existence Checks
  for (const relPath of REQUIRED_PATHS) {
    const fullPath = path.join(rootDir, relPath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      report.checks.push({ path: relPath, status: 'VERIFIED', type: 'existence' });
    } else {
      report.failures.push({ path: relPath, message: 'Required path missing', type: 'existence' });
    }
  }

  // 2. Strict Mode Content & Consistency Audits
  if (isStrict) {
    // 2a. JSON Integrity Check
    const jsonFiles = ['package.json', 'docs/evidence/schema.json', 'docs/projects/TEMPLATE.json'];
    for (const jsonRel of jsonFiles) {
      const jsonPath = path.join(rootDir, jsonRel);
      if (fs.existsSync(jsonPath)) {
        try {
          JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          report.checks.push({ path: jsonRel, status: 'VERIFIED', type: 'json-validity' });
        } catch (err) {
          report.failures.push({ path: jsonRel, message: `Invalid JSON: ${err.message}`, type: 'json-validity' });
        }
      }
    }

    // 2b. Taxonomy Consistency Check
    const constitutionPath = path.join(rootDir, 'docs/core/CONSTITUTION.md');
    const agentsPath = path.join(rootDir, '.agents/AGENTS.md');

    if (fs.existsSync(constitutionPath) && fs.existsSync(agentsPath)) {
      const constitutionContent = fs.readFileSync(constitutionPath, 'utf-8');
      const agentsContent = fs.readFileSync(agentsPath, 'utf-8');

      for (const status of REQUIRED_EVIDENCE_STATUSES) {
        if (!constitutionContent.includes(status)) {
          report.failures.push({ path: 'docs/core/CONSTITUTION.md', message: `Missing taxonomy status: ${status}`, type: 'taxonomy' });
        }
        if (!agentsContent.includes(status)) {
          report.failures.push({ path: '.agents/AGENTS.md', message: `Missing taxonomy status: ${status}`, type: 'taxonomy' });
        }
      }
    }

    // 2c. Skill Frontmatter Validation
    const skillsDir = path.join(rootDir, '.agents/skills');
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir);
      for (const skillName of skills) {
        const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          const content = fs.readFileSync(skillPath, 'utf-8');
          if (!content.startsWith('---') || !content.includes('name:') || !content.includes('description:')) {
            report.failures.push({ path: `.agents/skills/${skillName}/SKILL.md`, message: 'Invalid YAML frontmatter', type: 'frontmatter' });
          } else {
            report.checks.push({ path: `.agents/skills/${skillName}/SKILL.md`, status: 'VERIFIED', type: 'frontmatter' });
          }
        }
      }
    }
  }

  // Set overall status
  if (report.failures.length > 0) {
    report.status = 'FAIL';
  }

  // Output formatting
  if (isJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('====================================================');
    console.log(`   EOS SYSTEM — WORKSPACE VERIFICATION & AUDIT      `);
    console.log(`   Mode: ${isStrict ? 'STRICT' : 'STANDARD'}                      `);
    console.log('====================================================\n');

    for (const check of report.checks) {
      console.log(`[VERIFIED]  ${check.path} (${check.type})`);
    }

    if (report.failures.length > 0) {
      console.log('\n---------------- FAILURES --------------------------');
      for (const failure of report.failures) {
        console.log(`[FAILED]    ${failure.path}: ${failure.message}`);
      }
    }

    console.log('\n----------------------------------------------------');
    console.log(`Checks Passed: ${report.checks.length} | Failures: ${report.failures.length}`);
    console.log('----------------------------------------------------');
    console.log(`STATUS: ${report.status === 'PASS' ? 'VERIFIED — All checks passed cleanly.' : 'UNVERIFIED — Failures detected.'}\n`);
  }

  process.exit(report.status === 'PASS' ? 0 : 1);
}

verifyWorkspace();
