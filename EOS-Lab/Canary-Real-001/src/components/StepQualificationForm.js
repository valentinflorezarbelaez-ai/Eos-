// =========================================================================
// EOS-Lab/Canary-Real-001: StepQualificationEngine
// Implements BKM-COMPOSITION-CANARY-001 (A -> B Order: Sanitize -> ARIA)
// =========================================================================

const COVERED_LOCATIONS = [
  'RIONEGRO_LLANOGRANDE',
  'RIONEGRO_SAN_ANTONIO',
  'RIONEGRO_CENTRO',
  'LA_CEJA',
  'EL_CARMEN_DE_VIBORAL',
  'MARINILLA',
  'GUAPANTE',
  'EL_RETIRO'
];

export class StepQualificationEngine {
  constructor() {
    this.coveredLocations = new Set(COVERED_LOCATIONS);
  }

  // BKM-CANARY-001: Input Sanitization Engine at Input Boundary
  sanitizeInput(str = '') {
    if (typeof str !== 'string') return '';
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[;<>]/g, '')
      .trim();
  }

  sanitizePhone(phone = '') {
    if (typeof phone !== 'string') return '';
    const digits = phone.replace(/\D/g, '');
    return digits.slice(0, 10);
  }

  // Core Evaluation Pipeline
  evaluateQualification(input = {}) {
    // 1. Step A: Sanitize First (BKM-CANARY-001)
    const sanitizedClientName = this.sanitizeInput(input.clientName || '');
    const sanitizedPhone = this.sanitizePhone(input.phone || '');
    const location = (input.location || '').toUpperCase();
    const projectType = input.projectType || 'UNKNOWN';
    const scope = input.scope || 'UNKNOWN';
    const budgetRange = input.budgetRange || 'UNKNOWN';

    // 2. Geographic & Qualification Rules
    const isCovered = this.coveredLocations.has(location);
    const hasValidScope = scope !== 'UNKNOWN';
    const isQualified = isCovered && hasValidScope && sanitizedClientName.length > 0;

    const coverageStatus = isCovered ? 'IN_COVERAGE' : 'OUT_OF_COVERAGE';
    const advisoryMessage = isCovered
      ? 'Proyecto ubicado en zona de cobertura prioritaria (Rionegro / Oriente Antioqueño).'
      : 'Cobertura exclusiva en Rionegro y Oriente Antioqueño. Para proyectos fuera de zona podemos referirte a un colega aliado.';

    // 3. Step B: Accessible Live Feedback Announcement (OBS-CANARY-002)
    // Uses the sanitized data cleanly in the polite aria announcement
    let ariaAnnouncement = '';
    if (isQualified) {
      ariaAnnouncement = `Calificado para atención prioritaria: ${sanitizedClientName}, proyecto en ${location}. Cotización lista para enviar.`;
    } else if (!isCovered) {
      ariaAnnouncement = `Atención: La ubicación seleccionada está fuera de nuestra zona de cobertura principal en Oriente Antioqueño.`;
    } else {
      ariaAnnouncement = `Información en proceso: complete los campos obligatorios para recibir su cotización.`;
    }

    return {
      isQualified,
      coverageStatus,
      advisoryMessage,
      ariaAnnouncement,
      sanitizedData: {
        clientName: sanitizedClientName,
        phone: sanitizedPhone,
        projectType,
        scope,
        budgetRange,
        location
      }
    };
  }
}
