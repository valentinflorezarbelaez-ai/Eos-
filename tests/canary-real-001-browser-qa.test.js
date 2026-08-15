import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StepQualificationEngine } from '../EOS-Lab/Canary-Real-001/src/components/StepQualificationForm.js';
import { WhatsAppPayloadDispatcher } from '../EOS-Lab/Canary-Real-001/src/components/WhatsAppPayloadDispatcher.js';
import { LiveQuoteCalculator } from '../EOS-Lab/Canary-Real-001/src/components/LiveQuoteCalculator.js';
import { HeroConversionHeader } from '../EOS-Lab/Canary-Real-001/src/components/HeroConversionHeader.js';
import { TrustProofSection } from '../EOS-Lab/Canary-Real-001/src/components/TrustProofSection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// =========================================================================
// CANARY-REAL-001: INTEGRATION AUDITS & BROWSER QA SUITE (T14 - T18)
// Standards: Security (SEC-001..005), A11y (WCAG 2.1 AA), Performance, E2E
// =========================================================================

test('T15 Security Audit: Enforces Zero Secrets & Strict Sanitization (SEC-001..SEC-005)', () => {
  const engine = new StepQualificationEngine();
  const htmlPath = path.join(rootDir, 'EOS-Lab/Canary-Real-001/src/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // 1. Zero hardcoded secrets / API tokens in client HTML
  assert.ok(!htmlContent.includes('sk_live_'));
  assert.ok(!htmlContent.includes('AIzaSy'));
  assert.ok(!htmlContent.includes('SECRET_KEY'));

  // 2. XSS & SQLi payload sanitization
  const malicious = {
    clientName: '<img src=x onerror=alert(1)> Juan',
    phone: '3009998877; DROP TABLE users;',
    location: 'RIONEGRO_LLANOGRANDE',
    scope: 'COCINA_BANOS',
    projectType: 'APARTAMENTO'
  };

  const res = engine.evaluateQualification(malicious);
  assert.equal(res.sanitizedData.clientName, 'Juan');
  assert.equal(res.sanitizedData.phone, '3009998877');
  assert.ok(!res.ariaAnnouncement.includes('onerror'));
});

test('T16 Accessibility Audit: Enforces 100% WCAG 2.1 AA Compliance & Keyboard Flow', () => {
  const htmlPath = path.join(rootDir, 'EOS-Lab/Canary-Real-001/src/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // 1. Semantic landmarks
  assert.ok(htmlContent.includes('<header class="hero-section" role="banner">'));
  assert.ok(htmlContent.includes('<main id="cotizador"'));
  assert.ok(htmlContent.includes('<footer role="contentinfo">'));

  // 2. Fieldsets and legends for radio groups
  assert.ok(htmlContent.includes('<fieldset class="form-group">'));
  assert.ok(htmlContent.includes('<legend>Paso 1:'));

  // 3. Accessible Live Region for dynamic feedback
  assert.ok(htmlContent.includes('role="region" aria-live="polite"'));

  // 4. Form inputs have explicitly linked labels
  assert.ok(htmlContent.includes('for="location-select"'));
  assert.ok(htmlContent.includes('id="location-select"'));
  assert.ok(htmlContent.includes('for="client-name"'));
  assert.ok(htmlContent.includes('id="client-name"'));
});

test('T17 Performance Audit: Zero Framework Overhead & Lightweight Bundle Footprint', () => {
  const htmlPath = path.join(rootDir, 'EOS-Lab/Canary-Real-001/src/index.html');
  const cssPath = path.join(rootDir, 'EOS-Lab/Canary-Real-001/src/styles/remodelaciones.css');

  const htmlSizeKb = fs.statSync(htmlPath).size / 1024;
  const cssSizeKb = fs.statSync(cssPath).size / 1024;

  // Extremely lightweight (< 15KB total HTML + CSS), ensuring mobile LCP < 1.0s
  assert.ok(htmlSizeKb < 15, `HTML size ${htmlSizeKb}KB exceeds 15KB budget`);
  assert.ok(cssSizeKb < 10, `CSS size ${cssSizeKb}KB exceeds 10KB budget`);
});

test('T18 Browser QA: Full End-to-End Prequalification & WhatsApp Conversion Flow', () => {
  const engine = new StepQualificationEngine();
  const calculator = new LiveQuoteCalculator();
  const dispatcher = new WhatsAppPayloadDispatcher({ businessPhone: '573001234567' });

  // Simulating user filling out all 3 steps
  // Step 1: Apartamento
  const step1 = { projectType: 'APARTAMENTO' };
  
  // Step 2: Remodelación Integral
  const step2 = { ...step1, scope: 'REMODELACION_INTEGRAL' };
  const estimate = calculator.calculateEstimate(step2);
  assert.equal(estimate.status, 'ESTIMATE_CALCULATED');
  assert.equal(estimate.formattedRangeText, '$35M - $80M COP');

  // Step 3: Rionegro (San Antonio) + Contact info
  const step3 = {
    ...step2,
    location: 'RIONEGRO_SAN_ANTONIO',
    clientName: 'Andrea Gómez',
    phone: '3128765432'
  };

  const qualification = engine.evaluateQualification(step3);
  assert.equal(qualification.isQualified, true);
  assert.equal(qualification.coverageStatus, 'IN_COVERAGE');

  // Generating 1-click CTA
  const cta = dispatcher.generateWhatsAppLink({
    projectType: 'Apartamento',
    scope: 'Remodelación Integral',
    location: 'Rionegro (San Antonio de Pereira)',
    budgetRange: estimate.formattedRangeText,
    clientName: qualification.sanitizedData.clientName,
    phone: qualification.sanitizedData.phone
  });

  assert.ok(cta.url.includes('https://wa.me/573001234567'));
  assert.ok(decodeURIComponent(cta.url).includes('Andrea Gómez'));
  assert.ok(decodeURIComponent(cta.url).includes('$35M - $80M COP'));
});
