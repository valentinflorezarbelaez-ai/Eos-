# EOS — GAP-002 PROVENANCE & PO VALIDATION PROTOCOL

## 1. Objetivo
Resolver `GAP-002` asegurando la procedencia, autenticidad, consistencia legal y validación explícita del Product Owner sobre los datos institucionales de `PRJ-FUNDACION`, sin inferir ni sintetizar información.

---

## 2. Estado Canónico Inicial
* **Estado:** `OPEN / PENDING_PO_VALIDATION`
* **Campos:** Todos estrictamente en `UNKNOWN`.

```text
legal_name
nit
legal_entity_status
address
email
phone
bank_name
account_type
account_number
data_treatment_policy_url
```

---

## 3. Criterios de Fuente Aceptable
Una fuente solo se considera admisible si es:
1. **Oficial:** Emitida o provista formalmente por el Product Owner / Autoridad de la Fundación.
2. **Atribuible:** Con referencia clara a un documento legal, certificado de personería o acta formal.
3. **Verificable:** Con hash de integridad o copia respaldada en los registros del Control Plane.
4. **Suficiente:** Sin ambigüedad en los datos requeridos para el experimento.

> Si no se puede demostrar procedencia formal: **`NOT VERIFIED`** (permanece en `UNKNOWN`).

---

## 4. Registro y Tratamiento por Campo
Cada campo en `FUNDACION_GAP_002_OFFICIAL_DATA.json` debe registrar:
* `value`: Valor real oficial (o `UNKNOWN`).
* `epistemic_status`: `UNKNOWN` | `PENDING_PO_VALIDATION` | `VERIFIED`.
* `source_reference`: Origen documental explícito.
* `source_hash`: Hash SHA-256 del documento fuente cuando aplique.
* `po_validation_status`: `PENDING` | `VALIDATED` | `REJECTED`.

### Manejo de Contradicciones
Si dos fuentes oficiales presentan discrepancias (ej. nombre legal o dirección):
1. `GAP-002` se mantiene `OPEN`.
2. Se genera un `FINDING-GAP-002-CONTRADICTION`.
3. Está estrictamente prohibido elegir una fuente de forma silenciosa o no auditada.

### Datos Parciales
Un campo puede estar `VERIFIED` (ej. NIT) mientras otros permanecen en `UNKNOWN` (ej. Cuenta Bancaria). Las variantes experimentales solo podrán consumir campos con estado `VERIFIED`.

### Datos Bancarios Sensibles
Nunca se publicarán datos bancarios en código o variantes experimentales sin certificación de fuente y autorización expresa de seguridad.

---

## 5. Criterios de Cierre de GAP-002
`GAP-002` pasa a estado **`CLOSED`** únicamente si:
1. Los campos requeridos para `VAL-EXPERIMENT-002` cuentan con evidencia documental verificada.
2. La procedencia es 100% trazable.
3. El Product Owner firmó la validación formal.
4. No existen contradicciones abiertas.
5. El artefacto `EVD-FUNDACION-GAP-002-001.json` fue generado e indexado en `docs/evidence/`.

---

## 6. Entregables Obligatorios
- [ ] `docs/intelligence/user/FUNDACION_GAP_002_OFFICIAL_DATA.json` (actualizado)
- [ ] `docs/evidence/EVD-FUNDACION-GAP-002-001.json`
- [ ] Registro de validación PO en `docs/projects/registrations/fundacion/DECISION_RECORD.md`
- [ ] Actualización de estado en `docs/projects/registry.json` y `fundacion.json`
- [ ] Decisión formal de desbloqueo de `VAL-EXPERIMENT-002`
