// =========================================================================
// EOS-Lab/Canary-Real-001: HeroConversionHeader
// Philosophy: CLARITY > TRUST > ACTION
// =========================================================================

export class HeroConversionHeader {
  constructor(props = {}) {
    this.businessName = props.businessName || 'Alexander Rodríguez Remodelaciones';
    this.location = props.location || 'Rionegro y Oriente Antioqueño';
    this.tagline = 'Especialistas en remodelación de casas en parcelaciones, apartamentos y adecuaciones comerciales.';
  }

  render() {
    return `
      <header class="hero-section" role="banner">
        <div class="hero-badge">📍 Cobertura Exclusiva: ${this.location}</div>
        <h1 class="hero-title">${this.businessName}</h1>
        <p class="hero-tagline">${this.tagline}</p>
        <div class="hero-trust-bullets">
          <span>✓ Presupuesto Cerrado por Contrato</span>
          <span>✓ Cronograma Garantizado</span>
          <span>✓ Acabados de Primera Calidad</span>
        </div>
        <div class="hero-cta-wrapper">
          <a href="#cotizador" class="btn-primary-cta" id="hero-cta-btn">
            Calcular Cotización en 3 Pasos ➔
          </a>
        </div>
      </header>
    `.trim();
  }
}
