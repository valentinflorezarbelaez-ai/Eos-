import { renderLayout } from './layout.js';

export function renderLogin(errorMessage?: string): string {
  const content = `
    <div style="max-width: 400px; margin: 3rem auto;">
      <div class="card">
        <h2 style="margin-bottom: 0.5rem; text-align: center;">Acceso a FlowDesk</h2>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; text-align: center; margin-bottom: 1.5rem;">Gestión de leads de alta velocidad</p>

        ${errorMessage ? `<div class="alert-error">${errorMessage}</div>` : ''}

        <form action="/login" method="POST" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Correo Electrónico</label>
            <input type="email" name="email" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--color-border); border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem;">Contraseña</label>
            <input type="password" name="password" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--color-border); border-radius: 4px;">
          </div>
          <button type="submit" class="btn" style="width: 100%; padding: 0.75rem; margin-top: 0.5rem;">Iniciar Sesión</button>
        </form>

        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border); text-align: center; font-size: 0.85rem; color: var(--color-text-muted);">
          ¿No tienes cuenta? Se creará automáticamente en el primer login de demostración.
        </div>
      </div>
    </div>
  `;
  return renderLayout('Iniciar Sesión', content);
}
