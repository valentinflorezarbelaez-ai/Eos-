# EOS — CURRENT EXTERNAL TOOLING & PROVIDER RESEARCH (2026)

* **Fecha de Investigación:** 2026-08-14
* **Auditor:** EOS Research & Intelligence Engineer
* **Clasificación:** `EXTERNAL_INTELLIGENCE_VERIFIED_PRIMARY_SOURCES`
* **Principio:** *"Las especificaciones investigadas son contratos de interfaz de referencia; no se declaran verificadas en EOS hasta ser implementadas y testeadas en sandbox."*

---

## 1. LLM Provider Interfaces & Protocols

### A. Anthropic (Messages API & Tool Use)
* **Fuente Primaria:** `docs.anthropic.com/en/api/messages`
* **Patrón de Interfaz:** Endpoint `/v1/messages` con `model`, `max_tokens`, `messages: [{ role, content }]`, `tools: [{ name, description, input_schema }]`.
* **Manejo de Errores:**
  * `429 (rate_limit_error)`: Exponencial backoff con header `retry-after`.
  * `529 (overloaded_error)`: Degradar inmediatamente a `ADP-MOCK-CODE` o proveedor alternativo.
* **Seguridad de Secretos:** Variable de entorno `ANTHROPIC_API_KEY`. Cero inclusión en prompts ni payloads de telemetría.

### B. OpenAI (Chat Completions & Structured Outputs)
* **Fuente Primaria:** `platform.openai.com/docs/api-reference/chat`
* **Patrón de Interfaz:** Endpoint `/v1/chat/completions` con `response_format: { type: "json_schema", json_schema: {...} }` (Strict Mode con $100\%$ adherencia a JSON Schema).
* **Manejo de Tokens:** Token counts retornados en `usage: { prompt_tokens, completion_tokens, total_tokens }`.

### C. Google Gemini (Gemini API & Function Calling)
* **Fuente Primaria:** `ai.google.dev/gemini-api/docs`
* **Patrón de Interfaz:** `generateContent` con `tools: [{ functionDeclarations: [...] }]` y `generationConfig: { responseMimeType: "application/json" }`.

---

## 2. Browser Automation & Acoustic Accessibility Tooling

### A. Playwright (Headless QA & Trace Recording)
* **Fuente Primaria:** `playwright.dev/docs/api/class-page`
* **Capacidades Clave:**
  * `page.accessibility.snapshot()`: Extracción del árbol accesible real para contrastar contra el DOM plano.
  * `page.route()`: Intercepción y bloqueo estricto de egress de red externo en modo de prueba sintético.
  * `tracing`: Generación de trazas ZIP reproducibles para adjuntar como evidencia forense en `docs/evidence/`.

### B. Axe-Core Accessibility Engine
* **Fuente Primaria:** `github.com/dequelabs/axe-core`
* **Reglas WCAG AA:** Evaluación de contraste cromático ($\ge 4.5:1$), etiquetas `aria-label`, trampas de foco en modales y navegación por teclado.

---

## 3. Runtime Test Tooling & Static Analysis

### A. Node.js Native Test Runner (`node:test` & `node:assert/strict`)
* **Fuente Primaria:** `nodejs.org/api/test.html`
* **Ventajas para EOS:** Zero-dependency, ejecución nativa ultrarrápida, soporte nativo para `subtests`, concurrencia controlada y aislamiento determinístico sin inflar `node_modules`.

### B. Diagnostics Channel & Resource Telemetry (`node:diagnostics_channel`, `perf_hooks`)
* **Fuente Primaria:** `nodejs.org/api/diagnostics_channel.html`
* **Capacidades Clave:** `process.resourceUsage()`, `process.memoryUsage()`, `performance.now()`. Medición precisa de CPU en user/system time y recolección de memoria heap sin overhead.

---

## 4. Deployment Platforms (Research Only — No Deployment Active)

### A. Vercel (Build Output API v3)
* **Fuente Primaria:** `vercel.com/docs/build-output-api/v3`
* **Estructura:** Directorio `.vercel/output/static` para contenido inmutable, con cabeceras `Cache-Control` declarativas en `config.json`.

### B. Cloudflare Pages
* **Fuente Primaria:** `developers.cloudflare.com/pages`
* **Estructura:** Directorio de distribución estática (`dist/`) con soporte de headers `_headers` y redirecciones `_redirects` declarativas en texto plano.

---

## 5. Matriz de Implicaciones para EOS

```text
┌─────────────────────────┬──────────────────────────────────────────┬─────────────────────────────┐
│ Dominio                 │ Implicación Arquitectónica en EOS        │ Estado en EOS               │
├─────────────────────────┼──────────────────────────────────────────┼─────────────────────────────┤
│ LLMs Comerciales        │ Circuit Breakers + Fallback a Mock       │ Contrato en WS-04           │
│ Browser QA              │ A11y Tree + Network Interception         │ Integrable en Browser QA    │
│ Telemetría Runtime      │ node:perf_hooks + process.resourceUsage()│ Implementable en WS-06 / Obs│
│ Static Deployments      │ Build Output estandarizado sin vendor lock│ Especificado para Fase E    │
└─────────────────────────┴──────────────────────────────────────────┴─────────────────────────────┘
```
