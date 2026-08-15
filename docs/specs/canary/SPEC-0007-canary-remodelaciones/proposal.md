# Proposal — OpenSpec SPEC-0007: Sistema de Precalificación y Conversión para Alexander Rodríguez Remodelaciones

**Mission ID:** `CANARY-REAL-001`  
**Client:** Alexander Rodríguez Remodelaciones  
**Target Market:** Rionegro, Llanogrande y Oriente Antioqueño, Colombia  
**Status:** `PROPOSAL_APPROVED`  
**Lead Architect:** EOS Executive / Cursor Command Center  

---

## 1. Context & Business Intent
Alexander Rodríguez es un contratista técnico especializado en remodelaciones residenciales y comerciales de alto valor en el Oriente Antioqueño. El negocio enfrenta una tasa de abandono y ruido excesivo en canales directos: el 65% de las consultas por WhatsApp carecen de información básica (ubicación fuera de cobertura, falta de metraje, falta de presupuesto), consumiendo 6–10 horas semanales del equipo en atención de leads no viables.

Esta propuesta define la arquitectura y especificación observable de una **experiencia web de precalificación interactiva en 3 pasos** que filtra, estructura y transmite solicitudes de cotización calificadas directamente al WhatsApp comercial de Alexander Rodríguez.

---

## 2. Problem Statement & Jobs-To-Be-Done (JTBD)
* **JTBD Principal:** *"Cuando decido remodelar mi propiedad en Rionegro, quiero solicitar una cotización clara y transparente a un especialista local verificado, conociendo el alcance y presupuesto estimado en 3 pasos rápidos sin pérdidas de tiempo ni formularios invasivos."*
* **Fricciones a Resolver:**
  1. *Incertidumbre Geográfica:* Miedo a que el contratista no atienda en su sector.
  2. *Opacidad de Presupuesto:* Temor a sobrecostos sorpresa.
  3. *Fatiga de Formulario:* Formularios extensos que causan 72% de abandono.

---

## 3. Scope & Non-Goals

### In-Scope
* Landing page mobile-first ultra-rápida ($LCP \le 1.5\text{s}$).
* Cotizador interactivo guiado en 3 pasos con validación en el edge.
* Aplicación de la política validada de composición ($A \to B$): Sanitización en el edge $\to$ Live feedback accesible.
* Generador de payload estructurado para WhatsApp con precalificación completa.
* Panel de prueba de confianza local (garantía contractual, acabados antes/después).
* 100% WCAG 2.1 AA accesible y teclado-navegable.

### Non-Goals (Strictly Forbidden)
* Backend / Base de datos pesada o CMS innecesario.
* Pasarelas de pago o transacciones financieras en línea (las cotizaciones son personalizadas).
* Modificación de cualquier archivo fuera de `EOS-Lab/Canary-Real-001/` o `docs/`.
