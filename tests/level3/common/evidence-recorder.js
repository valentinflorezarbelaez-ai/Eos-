import fs from 'fs';
import path from 'path';

/**
 * Emits an evidence record JSON file.
 * @param {string} evidenceId - e.g. "EC-007-EVIDENCE"
 * @param {object} payload - Evidence payload
 * @param {string} [outputDir='docs/evidence']
 */
export function recordEvidence(evidenceId, payload, outputDir = 'docs/evidence') {
  const fullPayload = {
    schema: 'https://eos.system/schemas/evidence.json',
    evidence_id: evidenceId,
    timestamp: new Date().toISOString(),
    evaluation_environment: 'CONTROL_PLANE_SANDBOX_ONLY',
    production_containment: {
      gate_13_status: 'CLOSED',
      cloud_egress: 'DENIED',
      external_target_writes: 'FROZEN'
    },
    ...payload
  };

  const targetFile = path.join(outputDir, `${evidenceId}.json`);
  fs.writeFileSync(targetFile, JSON.stringify(fullPayload, null, 2), 'utf8');
  return fullPayload;
}
