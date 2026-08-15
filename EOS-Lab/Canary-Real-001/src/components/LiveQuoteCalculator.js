// =========================================================================
// EOS-Lab/Canary-Real-001: LiveQuoteCalculator
// Constitutional Rule: ESTIMATE !== QUOTE (Orientative brackets only)
// =========================================================================

export class LiveQuoteCalculator {
  constructor() {
    this.bracketCatalog = {
      CASA_PARCELACION: {
        REMODELACION_INTEGRAL: { min: 60000000, max: 150000000 },
        COCINA_BANOS: { min: 25000000, max: 55000000 },
        OBRA_GRIS_BLANCA: { min: 45000000, max: 90000000 }
      },
      APARTAMENTO: {
        REMODELACION_INTEGRAL: { min: 35000000, max: 80000000 },
        COCINA_BANOS: { min: 18000000, max: 40000000 },
        OBRA_GRIS_BLANCA: { min: 28000000, max: 60000000 }
      },
      OFICINA_COMERCIAL: {
        ADECUACION_COMERCIAL: { min: 20000000, max: 70000000 },
        REMODELACION_INTEGRAL: { min: 40000000, max: 100000000 }
      }
    };

    this.legalDisclaimer =
      'Esta es una estimación orientativa sujeta a verificación técnica en sitio. no constituye cotización final contractual ni promesa vinculante de precio.';
  }

  calculateEstimate(params = {}) {
    const { projectType, scope, approxAreaM2 } = params;

    if (!projectType || !scope || scope === 'UNKNOWN' || !this.bracketCatalog[projectType]) {
      return {
        status: 'INSUFFICIENT_DATA_REQUIRES_SITE_VISIT',
        isExactQuote: false,
        bracketMinCop: null,
        bracketMaxCop: null,
        legalDisclaimer: this.legalDisclaimer,
        guidance: 'Se requiere visita técnica de diagnóstico para determinar el metraje y alcance estructural.'
      };
    }

    const typeCat = this.bracketCatalog[projectType];
    const bracket = typeCat[scope] || { min: 20000000, max: 80000000 };

    return {
      status: 'ESTIMATE_CALCULATED',
      isExactQuote: false,
      projectType,
      scope,
      bracketMinCop: bracket.min,
      bracketMaxCop: bracket.max,
      formattedRangeText: `$${(bracket.min / 1000000).toFixed(0)}M - $${(bracket.max / 1000000).toFixed(0)}M COP`,
      legalDisclaimer: this.legalDisclaimer,
      nextStep: 'Agendar visita técnica presencial en Rionegro / Oriente para presupuesto detallado.'
    };
  }
}
