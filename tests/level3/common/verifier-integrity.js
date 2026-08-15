import fs from 'fs';
import crypto from 'crypto';

export const FROZEN_VERIFIER_HASH = '861186BF55EE96ED7A020C58F4A31C493A86A1C0727713F6C4FD82B0350D96B5';

/**
 * Validates cryptographic parity of the EOS Verifier script.
 * @param {string} [verifierPath='scripts/verify-eos.js']
 * @returns {{ valid: boolean, expected: string, actual: string, parityDelta: number }}
 */
export function checkVerifierIntegrity(verifierPath = 'scripts/verify-eos.js') {
  if (!fs.existsSync(verifierPath)) {
    return {
      valid: false,
      expected: FROZEN_VERIFIER_HASH,
      actual: 'FILE_NOT_FOUND',
      parityDelta: -1
    };
  }

  const content = fs.readFileSync(verifierPath);
  const hash = crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
  const valid = hash === FROZEN_VERIFIER_HASH;

  return {
    valid,
    expected: FROZEN_VERIFIER_HASH,
    actual: hash,
    parityDelta: valid ? 0 : 1
  };
}
