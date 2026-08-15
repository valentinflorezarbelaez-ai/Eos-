// =========================================================================
// EOS-Lab/Canary-Real-001: WhatsAppPayloadDispatcher
// Encodes and formats prequalified quote payloads into 1-Click WhatsApp links
// =========================================================================

export class WhatsAppPayloadDispatcher {
  constructor(config = {}) {
    this.businessPhone = config.businessPhone || '573001234567';
  }

  generateWhatsAppLink(lead = {}) {
    const rawMessage = [
      '¡Hola Alexander! 👋 Quiero solicitar una cotización formal para mi remodelación:',
      `🏠 Tipo de Inmueble: ${lead.projectType || 'No especificado'}`,
      `🔨 Alcance: ${lead.scope || 'No especificado'}`,
      `📍 Ubicación: ${lead.location || 'No especificada'}`,
      `💰 Presupuesto Estimado: ${lead.budgetRange || 'A convenir'}`,
      `👤 Contacto: ${lead.clientName || 'Cliente'} (${lead.phone || 'Sin teléfono'})`
    ].join('\n');

    const encodedText = encodeURIComponent(rawMessage);
    const url = `https://wa.me/${this.businessPhone}?text=${encodedText}`;

    return {
      url,
      rawMessage,
      encodedText
    };
  }
}
