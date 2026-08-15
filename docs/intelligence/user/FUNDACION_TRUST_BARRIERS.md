# BARRERAS DE CONFIANZA Y MITIGACIÓN (TRUST BARRIERS) — PRJ-FUNDACION
## Análisis Forense de Obstáculos Psicológicos y de Seguridad en la Conversión Social

**Identificador:** `VAL-TRST-FND-001`  
**Fecha:** 2026-08-14  
**Proyecto:** `PRJ-FUNDACION`  
**Estatus:** `TRUST RISK MATRIX FORMALIZED`

---

## 1. Las 5 Grandes Barreras de Confianza Identificadas

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE BARRERAS DE CONFIANZA                          │
├─────────┬───────────────────────────────┬───────────────────────────────────┤
│ ID      │ Barrera Psicológica / Riesgo  │ Estrategia de Mitigación EOS      │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ TRST-01 │ Temor a Fraude / Estafa       │ Exposición pública del NIT,       │
│         │ (¿Esta entidad existe?)       │ personería jurídica y cámara com. │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ TRST-02 │ Opacidad Financiera           │ Desglose porcentual explícito de  │
│         │ (¿A dónde va el dinero?)      │ destino de aportes (programas/adm)│
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ TRST-03 │ Sensación de Abandono         │ Canales directos activos          │
│         │ (¿Alguien me responderá?)     │ (WhatsApp oficial con horario).   │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ TRST-04 │ Manipulación Emocional        │ Narrativa digna y respetuosa, sin │
│         │ (Dark patterns / Culpa)       │ chantaje emocional (VAL-I03).     │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ TRST-05 │ Inseguridad Tecnológica       │ HTTPS forzado, CSP estricto,      │
│         │ (Miedo a robo de datos)       │ cero scripts de terceros espías.  │
└─────────┴───────────────────────────────┴───────────────────────────────────┘
```

---

## 2. Invariante `VAL-I05` (Trust-by-Design) en la Práctica

Para superar estas barreras, `PRJ-FUNDACION` debe implementar un **Centro de Transparencia Visible**:
1. **Identidad Institucional Inequívoca:** Razón social completa, NIT verificado y fecha de constitución.
2. **Cero Ambigüedad en Cuentas:** Nombre del titular de la cuenta bancaria exactamente igual a la razón social de la Fundación (nunca cuentas personales no autorizadas).
3. **Privacidad Garantizada:** Cero rastreadores de publicidad invasivos (`VAL-I03`).
