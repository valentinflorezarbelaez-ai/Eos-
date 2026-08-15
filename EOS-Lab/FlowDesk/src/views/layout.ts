export function renderLayout(title: string, bodyContent: string, userEmail?: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | FlowDesk</title>
  <style>
    :root {
      --color-primary: #0f172a;
      --color-accent: #2563eb;
      --color-accent-hover: #1d4ed8;
      --color-bg: #f8fafc;
      --color-surface: #ffffff;
      --color-text: #0f172a;
      --color-text-muted: #64748b;
      --color-border: #e2e8f0;
      
      --status-nuevo: #3b82f6;
      --status-contactado: #eab308;
      --status-calificado: #8b5cf6;
      --status-ganado: #22c55e;
      --status-perdido: #ef4444;

      --font-family: system-ui, -apple-system, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-family); background-color: var(--color-bg); color: var(--color-text); line-height: 1.5; min-height: 100vh; display: flex; flex-direction: column; }

    .header { background: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 50; }
    .header-container { max-width: 1200px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.25rem; font-weight: 800; color: var(--color-primary); letter-spacing: -0.5px; }
    .user-info { display: flex; align-items: center; gap: 1rem; font-size: 0.9rem; color: var(--color-text-muted); }
    .btn-logout { background: none; border: 1px solid var(--color-border); padding: 0.35rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }

    .main-container { max-width: 1200px; margin: 2rem auto; padding: 0 1.5rem; width: 100%; flex: 1; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--color-accent); color: #fff; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; border: none; cursor: pointer; text-decoration: none; font-size: 0.9rem; }
    .btn:hover { background: var(--color-accent-hover); }
    
    .badge { display: inline-block; padding: 0.25rem 0.6rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; color: #fff; text-transform: uppercase; }
    .badge-NUEVO { background-color: var(--status-nuevo); }
    .badge-CONTACTADO { background-color: var(--status-contactado); }
    .badge-CALIFICADO { background-color: var(--status-calificado); }
    .badge-GANADO { background-color: var(--status-ganado); }
    .badge-PERDIDO { background-color: var(--status-perdido); }

    .alert-error { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }

    /* LSN-001 Evolution: Responsive Information Architecture (< 640px) */
    @media (max-width: 640px) {
      .header-container { padding: 0.75rem 1rem; }
      .main-container { margin: 1rem auto; padding: 0 1rem; }
      .desktop-table { display: none !important; }
      .mobile-cards { display: flex !important; flex-direction: column; gap: 1rem; }
    }

    @media (min-width: 641px) {
      .desktop-table { display: table !important; width: 100%; border-collapse: collapse; }
      .mobile-cards { display: none !important; }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-container">
      <div class="logo">⚡ FlowDesk</div>
      ${userEmail ? `
        <div class="user-info">
          <span>${userEmail}</span>
          <form action="/logout" method="POST" style="display:inline;">
            <button type="submit" class="btn-logout">Cerrar Sesión</button>
          </form>
        </div>
      ` : ''}
    </div>
  </header>

  <main class="main-container">
    ${bodyContent}
  </main>
</body>
</html>`;
}
