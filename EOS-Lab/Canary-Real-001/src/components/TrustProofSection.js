// =========================================================================
// EOS-Lab/Canary-Real-001: TrustProofSection
// Enforces Constitutional Rule: Evidence Gate on All Social/Business Claims
// =========================================================================

export class TrustProofSection {
  constructor() {
    this.defaultVerifiedClaims = [
      {
        claimId: 'CLM-001',
        text: 'Atención presencial en Rionegro y Llanogrande',
        source: 'CLIENT_REGISTRATION',
        verified: true,
        icon: '📍'
      },
      {
        claimId: 'CLM-002',
        text: 'Presupuesto cerrado por contrato sin sobrecostos sorpresa',
        source: 'SERVICE_AGREEMENT',
        verified: true,
        icon: '📜'
      },
      {
        claimId: 'CLM-004',
        text: 'Visita técnica de diagnóstico para metraje y acabados',
        source: 'WORKFLOW_STANDARD',
        verified: true,
        icon: '📐'
      }
    ];
  }

  // Evidence Gate Filter: Rejects unverified or unsubstantiated claims
  filterVerifiedClaims(claims = []) {
    const list = Array.isArray(claims) && claims.length > 0 ? claims : this.defaultVerifiedClaims;

    const displayedClaims = [];
    const blockedClaims = [];

    for (const item of list) {
      if (item.verified === true && item.source && item.source !== 'NONE_UNSUBSTANTIATED') {
        displayedClaims.push(item);
      } else {
        blockedClaims.push(item);
      }
    }

    return {
      displayedClaims,
      blockedClaims
    };
  }

  render(claims = []) {
    const { displayedClaims } = this.filterVerifiedClaims(claims);

    const itemsHtml = displayedClaims
      .map(
        c => `
      <li class="trust-card" data-claim-id="${c.claimId}">
        <span class="trust-icon" aria-hidden="true">${c.icon || '✓'}</span>
        <span class="trust-text">${c.text}</span>
      </li>
    `
      )
      .join('');

    return `
      <section class="trust-proof-section" aria-labelledby="trust-heading">
        <h2 id="trust-heading" class="section-title">¿Por Qué Confiar en Nosotros?</h2>
        <ul class="trust-grid">
          ${itemsHtml}
        </ul>
      </section>
    `.trim();
  }
}
