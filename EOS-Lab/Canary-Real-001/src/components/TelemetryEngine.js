// =========================================================================
// EOS-Lab/Canary-Real-001: TelemetryEngine
// Lightweight, privacy-preserving, zero-dependency telemetry dispatcher
// Conforms to: PROTO-CANARY-REAL-001-TELEMETRY-001 & EOSTelemetryEvent/v1
// =========================================================================

export class TelemetryEngine {
  constructor(options = {}) {
    this.missionId = options.missionId || 'CANARY-REAL-001';
    this.schemaVersion = '1.0.0';
    this.sessionId = options.sessionId || this.generateAnonymousSessionId();
    this.eventBuffer = [];
    this.sinkCallback = options.sinkCallback || null;
    this.startTime = performance.now();
  }

  generateAnonymousSessionId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  generateTraceId() {
    return 'trc_' + Math.random().toString(36).substring(2, 10);
  }

  // Simple string hash helper for PII anonymization
  hashString(str = '') {
    if (!str) return 'none';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'h_' + Math.abs(hash).toString(16);
  }

  // Canonical Event Dispatcher
  recordEvent(eventType, step = 0, metadata = {}) {
    const elapsedSec = Number(((performance.now() - this.startTime) / 1000).toFixed(2));
    const eventId = `EVT-CR001-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Anonymize sensitive fields in metadata
    const sanitizedMeta = { ...metadata, elapsedSec };
    if (sanitizedMeta.clientName) {
      sanitizedMeta.clientNameHash = this.hashString(sanitizedMeta.clientName);
      delete sanitizedMeta.clientName;
    }
    if (sanitizedMeta.phone) {
      sanitizedMeta.phonePrefix = sanitizedMeta.phone.substring(0, 3) + '***';
      delete sanitizedMeta.phone;
    }

    const event = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      mission_id: this.missionId,
      anonymous_session_id: this.sessionId,
      event_type: eventType,
      step: Number(step),
      metadata_minima: sanitizedMeta,
      schema_version: this.schemaVersion,
      trace_id: this.generateTraceId()
    };

    this.eventBuffer.push(event);

    if (typeof this.sinkCallback === 'function') {
      try {
        this.sinkCallback(event);
      } catch (err) {
        // Silent catch: Telemetry errors must never crash the user UI
      }
    } else if (typeof fetch !== 'undefined' && typeof window !== 'undefined') {
      try {
        fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          keepalive: true
        }).catch(() => {});
      } catch (err) {
        // Non-blocking telemetry
      }
    }

    return event;
  }

  // Event Helper Shortcuts for the 13 Canonical Events
  recordPageView(path = null) {
    const currentPath = path || (typeof window !== 'undefined' && window.location ? window.location.pathname : '/');
    return this.recordEvent('page_view', 0, { url: currentPath });
  }

  recordQualificationStarted(projectType) {
    return this.recordEvent('qualification_started', 1, { projectType });
  }

  recordStepCompleted(stepNumber, data = {}) {
    return this.recordEvent('qualification_step_completed', stepNumber, data);
  }

  recordStepAbandoned(stepNumber, reason = '') {
    return this.recordEvent('qualification_step_abandoned', stepNumber, { reason });
  }

  recordOutOfCoverage(location) {
    return this.recordEvent('out_of_coverage', 3, { location });
  }

  recordEstimateViewed(projectType, scope, bracketText) {
    return this.recordEvent('estimate_viewed', 2, { projectType, scope, bracketText });
  }

  recordEstimateDisclaimerViewed() {
    return this.recordEvent('estimate_disclaimer_viewed', 2, { disclaimerAcknowledged: true });
  }

  recordWhatsAppCtaClicked(leadSummary = {}) {
    return this.recordEvent('whatsapp_cta_clicked', 3, leadSummary);
  }

  recordQualifiedLeadCreated(leadData = {}) {
    return this.recordEvent('qualified_lead_created', 3, leadData);
  }

  getBufferedEvents() {
    return [...this.eventBuffer];
  }
}
