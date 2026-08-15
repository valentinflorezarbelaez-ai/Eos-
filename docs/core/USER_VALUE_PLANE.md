# EOS VALUE PLANE — CONSTITUCIÓN DEL VALOR PARA EL USUARIO
## Principio Rector: USER VALUE FIRST en el Sistema EOS

**Identificador:** `CORE-VAL-001`  
**Fecha:** 2026-08-14  
**Versión:** `1.1.0`  
**Propósito:** Definir el **Value Plane** de EOS como co-igual del **Control Plane**, asegurando que la excelencia técnica y la gobernanza estén siempre al servicio de la resolución de problemas reales y experiencias humanas excepcionales.

---

## 1. La Arquitectura Dual de EOS

```text
                             SISTEMA EOS
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
                ▼                                   ▼
          VALUE PLANE                         CONTROL PLANE
  (¿Qué valor real creamos?)            (¿Cómo lo gobernamos?)
                │                                   │
  • Descubrimiento e hipótesis         • Gobernanza y barreras
  • Jobs-to-be-Done (JTBD)             • Límites de mutación
  • Experiencia de Usuario (UX)        • Verificación criptográfica
  • Fricción mínima y accesibilidad    • Invariantes y reversibilidad
  • Confianza y transparencia          • Resiliencia adversarial
  • Evidencia de valor (VAL-EVD)       • Aislamiento y producción
                │                                   │
                └─────────────────┬─────────────────┘
                                  ▼
                            PRODUCTO REAL
                  (Útil, Seguro, Usable, Valioso)
```

---

## 2. El Pipeline de Ingeniería Centrado en el Usuario (23 Pasos)

```text
USER NEED & DISCOVERY 
   ↓
HYPOTHESES & JTBD MODELING 
   ↓
USER RESEARCH & QUALITATIVE VALIDATION 
   ↓
VALUE EVIDENCE GATE (VAL-EVD) 
   ↓
PRODUCT DECISION & REQUIREMENTS 
   ↓
ARCHITECTURE → DESIGN → IMPLEMENTATION → TESTING → 
SECURITY → QUALITY → ACCESSIBILITY → PERFORMANCE → SEO → 
BROWSER QA → EVIDENCE → DEPLOYMENT → 
USER OUTCOME MEASUREMENT → LEARNING & CONTINUOUS IMPROVEMENT
```

---

## 3. Los 7 Invariantes del Value Plane (`VAL-I01` a `VAL-I07`)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INVARIANTES DEL VALUE PLANE                           │
├──────────┬──────────────────────────────────────────────────────────────────┤
│ VAL-I01  │ PROBLEM VERIFICATION: No se implementa ninguna funcionalidad sin │
│          │ una necesidad de usuario o hipótesis de valor validada.          │
│ VAL-I02  │ FRICTION MINIMIZATION: Todo flujo crítico debe alcanzar su       │
│          │ objetivo con la menor cantidad de pasos y carga cognitiva.       │
│ VAL-I03  │ EPISTEMIC TRANSPARENCY: Quedan prohibidos los dark patterns,     │
│          │ datos engañosos o copy artificial que manipule al usuario.       │
│ VAL-I04  │ ACCESSIBILITY AS A RIGHT: El producto debe ser utilizable por    │
│          │ cualquier persona (WCAG AA) sin degradación de experiencia.      │
│ VAL-I05  │ TRUST-BY-DESIGN: La claridad institucional, el destino de aportes│
│          │ y los canales de contacto deben ser inequívocos.                 │
│ VAL-I06  │ MEASURABLE USER OUTCOME: El éxito se mide por la satisfacción de │
│          │ la tarea del usuario, no solo por tests técnicos en verde.       │
│ VAL-I07  │ OUTCOME-ORIENTED INNOVATION: Una característica solo puede       │
│          │ clasificarse como innovadora si produce un resultado de usuario  │
│          │ superior demostrable frente a la línea base.                     │
└──────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 4. Compuerta de Evidencia de Valor (`VAL-EVD`)

Antes de autorizar cambios mayores de arquitectura o interfaz en el Control Plane, el Value Plane debe certificar:

- **`VAL-EVD-001` (Legitimidad Comprendida):** El usuario puede identificar la personería y misión institucional sin desconfianza.
- **`VAL-EVD-002` (Mecanismo Claro):** El usuario comprende el método de donación o voluntariado sin ambigüedad.
- **`VAL-EVD-003` (Tarea Completada):** El usuario completa su flujo objetivo (Task Completion).
- **`VAL-EVD-004` (Expectativa Clara):** El usuario sabe qué ocurrirá después de su acción.
- **`VAL-EVD-005` (Confianza Reportada):** El usuario declara tranquilidad y confianza en el canal.
