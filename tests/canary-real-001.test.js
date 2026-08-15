import test from 'node:test';
import assert from 'node:assert/strict';
import { StepQualificationEngine } from '../EOS-Lab/Canary-Real-001/src/components/StepQualificationForm.js';
import { WhatsAppPayloadDispatcher } from '../EOS-Lab/Canary-Real-001/src/components/WhatsAppPayloadDispatcher.js';
import { LiveQuoteCalculator } from '../EOS-Lab/Canary-Real-001/src/components/LiveQuoteCalculator.js';
import { HeroConversionHeader } from '../EOS-Lab/Canary-Real-001/src/components/HeroConversionHeader.js';
import { TrustProofSection } from '../EOS-Lab/Canary-Real-001/src/components/TrustProofSection.js';

// =========================================================================
// CANARY-REAL-001: TDD CONTRACT TESTS (TDD-01 & TDD-02)
// Target: Alexander Rodríguez Remodelaciones - Precalificación y Conversión
// =========================================================================

test('TDD-01: Qualification Engine accepts valid residential project in Rionegro/Llanogrande', () => {
  const engine = new StepQualificationEngine();

  const input = {
    projectType: 'CASA_PARCELACION',
    scope: 'REMODELACION_INTEGRAL',
    budgetRange: '60M_100M',
    location: 'RIONEGRO_LLANOGRANDE',
    clientName: 'Carlos Montoya',
    phone: '3001234567'
  };

  const result = engine.evaluateQualification(input);

  assert.equal(result.isQualified, true);
  assert.equal(result.coverageStatus, 'IN_COVERAGE');
  assert.equal(result.sanitizedData.clientName, 'Carlos Montoya');
  assert.equal(result.sanitizedData.phone, '3001234567');
  assert.ok(result.ariaAnnouncement.includes('Calificado para atención'));
});

test('TDD-02: Qualification Engine rejects and warns for out-of-coverage locations', () => {
  const engine = new StepQualificationEngine();

  const input = {
    projectType: 'APARTAMENTO',
    scope: 'COCINA_BANOS',
    budgetRange: '15M_30M',
    location: 'BOGOTA_DC',
    clientName: 'Pedro Gómez',
    phone: '3109876543'
  };

  const result = engine.evaluateQualification(input);

  assert.equal(result.isQualified, false);
  assert.equal(result.coverageStatus, 'OUT_OF_COVERAGE');
  assert.ok(result.advisoryMessage.includes('Cobertura exclusiva en Rionegro y Oriente Antioqueño'));
});

test('TDD-03: Composition Order (A -> B) enforces Edge Sanitization BEFORE Live ARIA Feedback', () => {
  const engine = new StepQualificationEngine();

  const maliciousInput = {
    projectType: 'APARTAMENTO',
    scope: 'REMODELACION_INTEGRAL',
    budgetRange: '30M_60M',
    location: 'RIONEGRO_SAN_ANTONIO',
    clientName: 'María <script>alert("XSS")</script> Restrepo',
    phone: '3015551234; DROP TABLE leads;'
  };

  const result = engine.evaluateQualification(maliciousInput);

  assert.equal(result.isQualified, true);
  // BKM-CANARY-001 (Sanitize First)
  assert.equal(result.sanitizedData.clientName, 'María  Restrepo');
  assert.equal(result.sanitizedData.phone, '3015551234');
  // OBS-CANARY-002 (Accessible live feedback uses clean data)
  assert.ok(!result.ariaAnnouncement.includes('<script>'));
  assert.ok(result.ariaAnnouncement.includes('María  Restrepo'));
});

test('TDD-04: WhatsApp Payload Dispatcher generates structured, URL-encoded 1-click CTA link', () => {
  const dispatcher = new WhatsAppPayloadDispatcher({
    businessPhone: '573001234567'
  });

  const qualifiedLead = {
    projectType: 'Casa en Parcelación',
    scope: 'Remodelación Integral',
    budgetRange: '$60M - $100M+ COP',
    location: 'Rionegro (Llanogrande)',
    clientName: 'Carlos Montoya',
    phone: '3001234567'
  };

  const cta = dispatcher.generateWhatsAppLink(qualifiedLead);

  assert.ok(cta.url.startsWith('https://wa.me/573001234567?text='));
  assert.ok(cta.rawMessage.includes('¡Hola Alexander!'));
  assert.ok(cta.rawMessage.includes('🏠 Tipo de Inmueble: Casa en Parcelación'));
  assert.ok(cta.rawMessage.includes('🔨 Alcance: Remodelación Integral'));
  assert.ok(cta.rawMessage.includes('📍 Ubicación: Rionegro (Llanogrande)'));
  assert.ok(cta.rawMessage.includes('💰 Presupuesto Estimado: $60M - $100M+ COP'));
  assert.ok(cta.rawMessage.includes('👤 Contacto: Carlos Montoya (3001234567)'));
});

test('TDD-06: LiveQuoteCalculator computes orientative brackets and enforces ESTIMATE !== QUOTE disclaimer', () => {
  const calculator = new LiveQuoteCalculator();

  // 1. Valid residential full renovation
  const res1 = calculator.calculateEstimate({
    projectType: 'CASA_PARCELACION',
    scope: 'REMODELACION_INTEGRAL',
    approxAreaM2: 120
  });

  assert.equal(res1.status, 'ESTIMATE_CALCULATED');
  assert.equal(res1.isExactQuote, false);
  assert.ok(res1.bracketMinCop >= 60000000);
  assert.ok(res1.bracketMaxCop <= 150000000);
  assert.ok(res1.legalDisclaimer.includes('estimación orientativa'));
  assert.ok(res1.legalDisclaimer.includes('no constituye cotización final'));

  // 2. Incomplete data -> REQUIRES_SITE_VISIT
  const res2 = calculator.calculateEstimate({
    projectType: 'CASA_PARCELACION',
    scope: 'UNKNOWN'
  });

  assert.equal(res2.status, 'INSUFFICIENT_DATA_REQUIRES_SITE_VISIT');
  assert.equal(res2.bracketMinCop, null);
  assert.equal(res2.bracketMaxCop, null);
});

test('TDD-09: HeroConversionHeader communicates clarity, local market, and valid CTA anchor', () => {
  const hero = new HeroConversionHeader({
    businessName: 'Alexander Rodríguez Remodelaciones',
    location: 'Rionegro y Oriente Antioqueño'
  });

  const html = hero.render();

  assert.ok(html.includes('Alexander Rodríguez Remodelaciones'));
  assert.ok(html.includes('Rionegro y Oriente Antioqueño'));
  assert.ok(html.includes('href="#cotizador"'));
  assert.ok(html.includes('Calcular Cotización en 3 Pasos'));
});

test('TDD-11: TrustProofSection enforces Evidence Gate (Only verified claims displayed, unverified blocked)', () => {
  const trustSection = new TrustProofSection();

  const rawClaims = [
    { claimId: 'CLM-001', text: 'Atención presencial en Rionegro y Llanogrande', source: 'CLIENT_REGISTRATION', verified: true },
    { claimId: 'CLM-002', text: 'Presupuesto cerrado por contrato sin sobrecostos sorpresa', source: 'SERVICE_AGREEMENT', verified: true },
    { claimId: 'CLM-003', text: '500+ clientes felices en toda Colombia', source: 'NONE_UNSUBSTANTIATED', verified: false }
  ];

  const gated = trustSection.filterVerifiedClaims(rawClaims);

  assert.equal(gated.displayedClaims.length, 2);
  assert.equal(gated.blockedClaims.length, 1);
  assert.equal(gated.blockedClaims[0].claimId, 'CLM-003');
  assert.equal(gated.displayedClaims[0].claimId, 'CLM-001');
  assert.equal(gated.displayedClaims[1].claimId, 'CLM-002');
});


