import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_PATHS = [
  '.git',
  '.gitignore',
  '.editorconfig',
  'package.json',
  '.agents/AGENTS.md',
  '.agents/skills/sdd/SKILL.md',
  '.agents/skills/evidence-auditor/SKILL.md',
  'docs/core/CONSTITUTION.md',
  'docs/core/GOVERNANCE.md',
  'docs/workflows/EOS_CYCLE.md',
  'docs/architecture/adrs/ADR-0001-eos-workspace-initialization.md'
];

function verifyWorkspace() {
  console.log('====================================================');
  console.log('   EOS SYSTEM — WORKSPACE VERIFICATION & AUDIT      ');
  console.log('====================================================\n');

  let missingCount = 0;
  let verifiedCount = 0;

  for (const relPath of REQUIRED_PATHS) {
    const fullPath = path.join(rootDir, relPath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      console.log(`[VERIFIED]  ${relPath}`);
      verifiedCount++;
    } else {
      console.log(`[MISSING]   ${relPath}`);
      missingCount++;
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Total Required Items: ${REQUIRED_PATHS.length}`);
  console.log(`Verified: ${verifiedCount} | Missing: ${missingCount}`);
  console.log('----------------------------------------------------');

  if (missingCount > 0) {
    console.error('\nSTATUS: UNVERIFIED — Missing required EOS baseline artifacts.');
    process.exit(1);
  } else {
    console.log('\nSTATUS: VERIFIED — EOS System workspace baseline complete.');
    process.exit(0);
  }
}

verifyWorkspace();
