import type { Lead } from '../services/leadService.js';
import { renderLayout } from './layout.js';

export function renderDashboard(userEmail: string, leads: Lead[], currentFilter?: string, currentSearch?: string, errorMessage?: string): string {
  const stats = {
    total: leads.length,
    nuevo: leads.filter(l => l.status === 'NUEVO').length,
    contactado: leads.filter(l => l.status === 'CONTACTADO').length,
    calificado: leads.filter(l => l.status === 'CALIFICADO').length,
    ganado: leads.filter(l => l.status === 'GANADO').length,
  };

  const content = `
    ${errorMessage ? `<div class="alert-error">${errorMessage}</div>` : ''}

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <h2>Gestión de Leads</h2>
      <button class="btn" onclick="document.getElementById('newLeadModal').style.display='block'">+ Nuevo Lead</button>
    </div>

    <!-- Quick Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div class="card" style="text-align: center; padding: 1rem;">
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">TOTAL LEADS</span>
        <h3 style="font-size: 1.5rem;">${stats.total}</h3>
      </div>
      <div class="card" style="text-align: center; padding: 1rem;">
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">NUEVOS</span>
        <h3 style="font-size: 1.5rem; color: var(--status-nuevo);">${stats.nuevo}</h3>
      </div>
      <div class="card" style="text-align: center; padding: 1rem;">
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">CONTACTADOS</span>
        <h3 style="font-size: 1.5rem; color: var(--status-contactado);">${stats.contactado}</h3>
      </div>
      <div class="card" style="text-align: center; padding: 1rem;">
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">GANADOS</span>
        <h3 style="font-size: 1.5rem; color: var(--status-ganado);">${stats.ganado}</h3>
      </div>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom: 2rem; padding: 1rem 1.5rem;">
      <form action="/dashboard" method="GET" style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
        <input type="text" name="q" placeholder="Buscar por nombre, email..." value="${currentSearch || ''}" style="padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: 4px; flex: 1; min-width: 200px;">
        
        <select name="status" style="padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: 4px;">
          <option value="">Todos los Estados</option>
          <option value="NUEVO" ${currentFilter === 'NUEVO' ? 'selected' : ''}>NUEVO</option>
          <option value="CONTACTADO" ${currentFilter === 'CONTACTADO' ? 'selected' : ''}>CONTACTADO</option>
          <option value="CALIFICADO" ${currentFilter === 'CALIFICADO' ? 'selected' : ''}>CALIFICADO</option>
          <option value="GANADO" ${currentFilter === 'GANADO' ? 'selected' : ''}>GANADO</option>
          <option value="PERDIDO" ${currentFilter === 'PERDIDO' ? 'selected' : ''}>PERDIDO</option>
        </select>

        <button type="submit" class="btn" style="padding: 0.5rem 1rem;">Filtrar</button>
      </form>
    </div>

    <!-- Desktop Table View -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <table class="desktop-table">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; border-bottom: 1px solid var(--color-border);">
            <th style="padding: 1rem;">Nombre</th>
            <th style="padding: 1rem;">Contacto</th>
            <th style="padding: 1rem;">Estado</th>
            <th style="padding: 1rem;">Última Mutación</th>
            <th style="padding: 1rem; text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${leads.length === 0 ? `
            <tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">No se encontraron leads con los criterios seleccionados.</td></tr>
          ` : leads.map(lead => `
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 1rem; font-weight: 600;">${escapeHtml(lead.name)}</td>
              <td style="padding: 1rem; font-size: 0.9rem; color: var(--color-text-muted);">
                <div>${escapeHtml(lead.email)}</div>
                <div>${escapeHtml(lead.phone)}</div>
              </td>
              <td style="padding: 1rem;">
                <span class="badge badge-${lead.status}">${lead.status}</span>
              </td>
              <td style="padding: 1rem; font-size: 0.85rem; color: var(--color-text-muted);">${lead.updated_at}</td>
              <td style="padding: 1rem; text-align: right;">
                <form action="/leads/${lead.id}/status" method="POST" style="display: inline-flex; gap: 0.5rem; align-items: center;">
                  <input type="hidden" name="expected_updated_at" value="${lead.updated_at}">
                  <select name="status" style="padding: 0.3rem 0.5rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--color-border);">
                    <option value="NUEVO" ${lead.status === 'NUEVO' ? 'selected' : ''}>NUEVO</option>
                    <option value="CONTACTADO" ${lead.status === 'CONTACTADO' ? 'selected' : ''}>CONTACTADO</option>
                    <option value="CALIFICADO" ${lead.status === 'CALIFICADO' ? 'selected' : ''}>CALIFICADO</option>
                    <option value="GANADO" ${lead.status === 'GANADO' ? 'selected' : ''}>GANADO</option>
                    <option value="PERDIDO" ${lead.status === 'PERDIDO' ? 'selected' : ''}>PERDIDO</option>
                  </select>
                  <button type="submit" class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Cambiar</button>
                </form>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Mobile Responsive Cards (< 640px) -->
      <div class="mobile-cards" style="padding: 1rem;">
        ${leads.length === 0 ? `
          <div style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">No hay leads disponibles.</div>
        ` : leads.map(lead => `
          <div class="card" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <strong style="font-size: 1.05rem;">${escapeHtml(lead.name)}</strong>
              <span class="badge badge-${lead.status}">${lead.status}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted);">
              📧 ${escapeHtml(lead.email)}<br>
              📞 ${escapeHtml(lead.phone)}
            </div>
            <form action="/leads/${lead.id}/status" method="POST" style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <input type="hidden" name="expected_updated_at" value="${lead.updated_at}">
              <select name="status" style="flex: 1; padding: 0.5rem; font-size: 0.9rem; border-radius: 4px; border: 1px solid var(--color-border);">
                <option value="NUEVO" ${lead.status === 'NUEVO' ? 'selected' : ''}>NUEVO</option>
                <option value="CONTACTADO" ${lead.status === 'CONTACTADO' ? 'selected' : ''}>CONTACTADO</option>
                <option value="CALIFICADO" ${lead.status === 'CALIFICADO' ? 'selected' : ''}>CALIFICADO</option>
                <option value="GANADO" ${lead.status === 'GANADO' ? 'selected' : ''}>GANADO</option>
                <option value="PERDIDO" ${lead.status === 'PERDIDO' ? 'selected' : ''}>PERDIDO</option>
              </select>
              <button type="submit" class="btn" style="padding: 0.5rem 1rem;">Actualizar</button>
            </form>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Create Lead Modal -->
    <div id="newLeadModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100;">
      <div class="card" style="max-width: 450px; margin: 10% auto; padding: 2rem;">
        <h3 style="margin-bottom: 1rem;">Crear Nuevo Lead</h3>
        <form action="/leads" method="POST" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Nombre Completo</label>
            <input type="text" name="name" required style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Correo Electrónico</label>
            <input type="email" name="email" required style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Teléfono</label>
            <input type="tel" name="phone" required style="width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: 4px;">
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
            <button type="button" class="btn" style="background: #94a3b8;" onclick="document.getElementById('newLeadModal').style.display='none'">Cancelar</button>
            <button type="submit" class="btn">Guardar Lead</button>
          </div>
        </form>
      </div>
    </div>
  `;

  return renderLayout('Dashboard', content, userEmail);
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, m => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}
