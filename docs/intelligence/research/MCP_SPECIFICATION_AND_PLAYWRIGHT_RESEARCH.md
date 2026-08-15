# RESEARCH REPORT: MCP SPECIFICATION (2026-07-28) & PLAYWRIGHT MCP ARCHITECTURE

* **Identificador:** `RSC-MCP-2026-001`
* **Fecha:** 2026-08-14
* **Auditor:** EOS Research & Capability Intelligence Engineer
* **Clasificación:** `PRIMARY_SOURCE_ANALYSIS`

---

## 1. Evolución del Protocolo MCP (Especificación 2026-07-28)

La revisión del protocolo Model Context Protocol (MCP) formaliza capacidades críticas para agentes autónomos:

### A. Núcleo Stateless & Header-Based Routing
* **Diseño:** Las conexiones ya no asumen una sesión con estado permanente por socket. Cada invocación incluye cabeceras de contexto y tokenización de enrutamiento (`X-MCP-Session-Id`, `X-MCP-Routing-Key`).
* **Ventaja:** Permite distribución horizontal de servidores MCP y reconexión transparente tras fallos transitorios.

### B. Protocolo `server/discover` & Cache Hints
* **Discovery Dinámico:** Los servidores exponen el endpoint `server/discover`, permitiendo que el cliente consulte dinámicamente las herramientas, recursos, prompts y tasks disponibles con sus metadatos de versión y hash de esquema.
* **Cacheabilidad:** Respuestas acompañadas de cabeceras de expiración (`max-age`, `etag`) para evitar roundtrips innecesarios.

### C. Soporte Estricto de JSON Schema 2020-12
* **Validación de Parámetros:** Las herramientas definen sus firmas usando el estándar JSON Schema 2020-12, permitiendo validación estricta de tipos, expresiones regulares, formatos y restricciones de rango antes de la invocación.

### D. Tasks & Extensiones Asíncronas
* **MCP Tasks:** Para operaciones de larga duración (ej. renders multimedia, auditorías masivas de accesibilidad), el servidor devuelve un `task_id` gestionable (`status`, `poll`, `cancel`).
* **Extensiones Negociadas:** Negociación de capacidades cliente/servidor en el handshake inicial (`capabilities.extensions`).

---

## 2. Arquitectura de Playwright MCP Server

### A. Capacidades Estándar Expuestas
1. `browser_navigate`: Carga de URLs con timeout configurable.
2. `browser_snapshot`: Captura de pantalla en formato buffer/base64 con hash forense.
3. `browser_accessibility_tree`: Extracción del árbol accesible simplificado para evaluación WCAG.
4. `browser_interact`: Clicks, escritura de texto, presiones de teclas y desplazamientos.
5. `browser_console_logs`: Captura estructurada de errores y advertencias de JavaScript en el cliente.

### B. Controles de Seguridad y Aislamiento en Sandbox
* **Aislamiento de Perfiles:** Cada sesión de prueba utiliza un `browserContext` efímero que se destruye al finalizar la tarea.
* **Allow/Block Origins:** Capacidad de restringir la navegación exclusivamente a `http://localhost:*` o dominios autorizados en el scope, bloqueando conexiones externas no auditadas.
* **Timeout Guards:** Límites estrictos por comando (default $30\,000\text{ms}$) para evitar bloqueos por deadlocks o bucles infinitos en el cliente.

---

## 3. Matriz de Decisión para EOS

| Criterio | Mock Local (`ADP-MOCK-BROWSER`) | Playwright Local Headless | Playwright MCP Server |
|---|---|---|---|
| **Velocidad de Ejecución** | Instantánea ($< 5\text{ms}$) | Rápida ($50-300\text{ms}$) | Moderada ($100-500\text{ms}$) |
| **Fidelidad DOM / Render** | Nula (Sintética) | Total (Chromium/WebKit) | Total (Chromium/WebKit) |
| **Aislamiento de Proceso** | Mismo hilo Node.js | Subproceso local | Proceso MCP desacoplado |
| **Adecuación en Sandbox EOS** | Pruebas Unitarias / CI | Pruebas de Integración | Discovery dinámico y Browser QA |
