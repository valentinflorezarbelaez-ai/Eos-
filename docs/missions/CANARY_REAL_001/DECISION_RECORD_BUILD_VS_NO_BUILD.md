# CANARY-REAL-001: Decision Record — BUILD vs NO_BUILD

**Decisión ID:** `DEC-CANARY-REAL-001-BUILD-GATE`  
**Cliente:** Alexander Rodríguez Remodelaciones  
**Fecha:** 2026-08-14  

---

## 1. Criterios de Validación de la Compuerta

| Pregunta de Validación de Compuerta | Evidencia / Análisis | Resultado |
|---|---|---|
| **1. ¿Existe realmente el problema?** | Alexander pierde 6–10h semanales atendiendo leads descalificados y perdiendo clientes de alto ticket por falta de prueba de confianza local. | ✅ SÍ, PROBLEMA DEMOSTRADO |
| **2. ¿Quién lo tiene y cuánto duele?** | Dueños de casas/apartamentos en Oriente Antioqueño y el propio contratista. El dolor representa pérdidas de contratos de \$20M–\$100M COP. | ✅ SÍ, ALTO VALOR COMERCIAL |
| **3. ¿Hay una oportunidad clara de reducir fricción?** | Sí: Cotizador interactivo guiado en 3 pasos que precalifica ubicación/alcance y genera un mensaje estructurado directo a WhatsApp. | ✅ SÍ, REDUCCIÓN DE FRICCIÓN CLARA |
| **4. ¿Se pueden medir métricas comparables antes y después?** | Sí: Tasa de conversión calificada ($\ge 22\%$), tiempo de acción ($\le 45\text{s}$), confianza ($\ge 9.0$) y tasa de ruido ($< 20\%$). | ✅ SÍ, MÉTRICAS FALSABLES |

---

## 2. Veredicto Formal de Compuerta

$$
\boxed{
\text{DISCOVERY VERDICT} = \mathbf{BUILD\_JUSTIFIED}
}
$$

*   **Fundamento:** No se construye por inercia técnica; se construye porque existe una asimetría comercial clara, una fricción cuantificable y una solución arquitectónica que aumentará directamente los ingresos del cliente y ahorrará horas operativas.
*   **Próximo Paso Autorizado:** Pasar a la fase de **OpenSpec (`SPEC-0007`)** y diseño de arquitectura antes de cualquier implementación TDD.
