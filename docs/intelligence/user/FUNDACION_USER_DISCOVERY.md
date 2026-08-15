# DESCUBRIMIENTO DE USUARIO — PRJ-FUNDACION
## Marco Metodológico, Contexto y Disciplina Epistémica del Value Plane

**Identificador:** `VAL-DISC-FND-001`  
**Fecha:** 2026-08-14  
**Proyecto:** `PRJ-FUNDACION`  
**Modo:** `READ_ONLY / RESEARCH_ONLY`  
**Estatus:** `DISCOVERY COMPLETED — HYPOTHESES FORMALIZED`  
**Target Físico (`Fundacion`):** `100% FROZEN (0 mutaciones)`  
**Producción / Gate-13:** `CLOSED`

---

## 1. Propósito y Filosofía del Descubrimiento

En cumplimiento del principio constitucional **`USER VALUE FIRST` (CORE-VAL-001)** y de los invariantes `VAL-I01` a `VAL-I06`, este documento formaliza el descubrimiento de usuario para `PRJ-FUNDACION`.

> **Regla de Oro Epistémica:**  
> No diseñamos primero y preguntamos después. Primero comprendemos quién es el usuario, qué problema intenta resolver y qué barreras enfrenta; luego modelamos la arquitectura y el producto para satisfacer ese objetivo sin fricción.

---

## 2. Taxonomía de Certeza en el Descubrimiento

Para evitar la trampa de tratar suposiciones como hechos consumados, cada hallazgo se etiqueta taxativamente:

- **`[FACT]` (Hecho Verificado):** Datos demostrables mediante inventario físico, análisis de mercado empírico o requisitos explícitos del PO.
- **`[ASSUMPTION]` (Hipótesis / Suposición):** Premisa lógica sobre el comportamiento o motivación del usuario que **requiere validación experimental**.
- **`[GAP]` (Incertidumbre / Información Faltante):** Dato crítico desconocido (`GAP-001`, `GAP-002`, `GAP-003`) que debe ser tratado con neutralidad estricta.

---

## 3. Matriz de Preguntas Fundamentales de Producto

| Pregunta Fundamental | Respuesta Descubierta | Estatus Epistémico |
|---|---|---|
| **1. ¿Para quién construimos?** | Donantes potenciales, voluntarios, buscadores de información comunitaria y aliados estratégicos. | `[ASSUMPTION]` (5 Segmentos modelados) |
| **2. ¿Qué problema intentan resolver?** | Desean apoyar una causa social creíble, pero enfrentan desconfianza sobre el destino de fondos y fricción en los canales de contacto. | `[ASSUMPTION]` (Problema central) |
| **3. ¿Qué tarea quieren completar?** | Evaluar la legitimidad de la fundación y completar una acción (donar, ofrecerse como voluntario, contactar). | `[ASSUMPTION]` (JTBD) |
| **4. ¿Qué los bloquea hoy?** | Opacidad institucional, falta de métricas de impacto verificables y datos institucionales en estado `UNKNOWN`. | `[FACT]` (`GAP-002`) |
| **5. ¿Qué sería una experiencia excelente?** | Carga instantánea (<1s), transparencia total sin *dark patterns*, canal de ayuda accesible en 1 clic y respeto a su privacidad. | `[FACT]` (`VAL-I02`, `VAL-I03`) |
| **6. ¿Cómo medimos el éxito?** | Tasa de éxito de la tarea (Task Completion Rate) y reducción del tiempo para contactar o donar sin errores. | `[FACT]` (`VAL-I06`) |
