# Specification — Capability: Interactive 3-Step Qualification & Conversion Engine

**Capability ID:** `CAP-REMODELACIONES-QUALIFICATION`  
**Spec Version:** `1.0.0`  
**Standard:** OpenSpec / LIDR Observable Behavior Contract  

---

## 1. Observable Behavior & Requirements

### REQ-001: Step 1 — Tipo de Inmueble y Proyecto
* **Input:** Selección de botón/tarjeta accesible: `Apartamento`, `Casa en Parcelación`, `Oficina / Local Comercial`.
* **Behavior:** Al seleccionar, almacena la selección en el estado local, actualiza la región `aria-live="polite"`, y habilita la transición al Paso 2.
* **Acceptance Criteria:**
  ```gherkin
  Scenario: El usuario selecciona el tipo de proyecto
    Given el usuario está en el Paso 1 del cotizador
    When hace clic en la opción "Casa en Parcelación"
    Then el estado se actualiza con projectType = "CASA_PARCELACION"
    And el botón "Continuar al Paso 2" se activa inmediatamente
    And el lector de pantalla anuncia "Seleccionado: Casa en Parcelación"
  ```

---

### REQ-002: Step 2 — Alcance de la Obra y Rango Presupuestal
* **Input:** 
  - Alcance: `Cocina / Baños`, `Remodelación Integral`, `Obra Gris a Blanca`, `Adecuación Comercial`.
  - Presupuesto Aproximado: `$15M - $30M`, `$30M - $60M`, `$60M - $100M+ COP`, `A definir con asesor`.
* **Behavior:** Aplica sanitización en el edge (`BKM-CANARY-001`) sobre inputs numéricos/texto antes de calcular la precalificación en vivo (`OBS-CANARY-002`).

---

### REQ-003: Step 3 — Ubicación en Oriente Antioqueño y Contacto
* **Input:**
  - Municipio / Sector: `Rionegro (Llanogrande / San Antonio / Centro)`, `La Ceja`, `El Carmen de Viboral`, `Marinilla`, `Otro sector Oriente`.
  - Nombre del Cliente: Texto sanitizado (sin scripts ni caracteres de escape).
  - Teléfono / WhatsApp: Formato numérico colombiano (10 dígitos).
* **Behavior:** Valida cobertura geográfica. Si el municipio está fuera de cobertura (ej. Medellín / Bogotá), emite advertencia amable de cobertura limitada. Si está en cobertura, genera el payload de WhatsApp estructurado.

---

### REQ-004: Generación de Payload WhatsApp Calificado
* **Formato del Mensaje:**
  ```text
  ¡Hola Alexander! 👋 Quiero solicitar una cotización formal para mi remodelación:
  🏠 Tipo de Inmueble: Casa en Parcelación
  🔨 Alcance: Remodelación Integral
  📍 Ubicación: Rionegro (Llanogrande)
  💰 Presupuesto Estimado: $60M - $100M+ COP
  👤 Contacto: [Nombre del Cliente] ([Teléfono])
  ```
* **Behavior:** Al hacer clic en "Enviar Cotización por WhatsApp", abre `https://wa.me/573000000000?text=...` con el texto sanitizado y codificado en URL.
