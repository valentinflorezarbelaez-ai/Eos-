import crypto from 'crypto';
import { computeTreeHash } from './tree-hash.js';
import { checkVerifierIntegrity } from './verifier-integrity.js';

/**
 * Captures an immutable pre-flight execution baseline.
 * @param {string} targetDir
 * @param {object} authorization
 * @param {object} taskDag
 * @returns {object}
 */
export function capturePreFlightBaseline(targetDir, authorization, taskDag) {
  const treeState = computeTreeHash(targetDir);
  const verifierState = checkVerifierIntegrity();
  
  const authString = JSON.stringify(authorization || {});
  const authHash = crypto.createHash('sha256').update(authString).digest('hex');

  const dagString = JSON.stringify(taskDag || {});
  const dagHash = crypto.createHash('sha256').update(dagString).digest('hex');

  return {
    timestamp: new Date().toISOString(),
    tree_hash_0: treeState.treeHash,
    file_count_0: treeState.fileCount,
    manifest_0: treeState.manifest,
    verifier_hash_0: verifierState.actual,
    verifier_parity_0: verifierState.valid,
    auth_hash_0: authHash,
    dag_hash_0: dagHash,
    status: 'BASELINE_CAPTURED'
  };
}
