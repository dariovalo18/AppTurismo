---
id: 03-screens-and-use
title: Screens and conditions of use
source: PRD.pdf, pp. 4–5
---

# Screens and conditions of use

[Index](./README.md) · previous: [02-requirements.md](./02-requirements.md) · next: [04-stack.md](./04-stack.md)

The PRD draws three screens. It does not draw login, the start of the day, or closing a route. Those screens come from the requirements.

Conditions that apply to every screen: [RNF-01](./02-requirements.md#rnf-01) through [RNF-06](./02-requirements.md#rnf-06).

Screen copy below is Spanish, as the reader will see it.

## Open route

Requirements: [RF-02](./02-requirements.md#rf-02), [RF-03](./02-requirements.md#rf-03), [RF-06](./02-requirements.md#rf-06), [RF-21](./02-requirements.md#rf-21), [RF-24](./02-requirements.md#rf-24), [RF-30](./02-requirements.md#rf-30).

```
+-----------------------------------+
| <  Ruta 07 - Barrio Brasil        |
|    142 suministros - 88 leídos    |
+-----------------------------------+
| Sin subir: 12            [ nube ] |
+-----------------------------------+
| 89. Brasil 1420                   |
|     Coronel, Ramona               |
| 90. Brasil 1436            LEÍDO  |
| 91. Brasil 1450          NOVEDAD  |
|     perro suelto                  |
| 92. Brasil 1462                   |
|     Miguez, Hector                |
+-----------------------------------+
| [ Lista ]  [ Mapa ]  [ Resumen ]  |
+-----------------------------------+
```

What the drawing specifies:

- Title: route number and name.
- Subtitle: total supplies and how many are read.
- A persistent strip with the count still waiting to upload.
- Each row: an ordinal, the address, the holder, and, when it applies, `LEÍDO` or `NOVEDAD` plus the reason.
- A row with no status is pending.
- Three modes of the same route: list, map, summary.

The ordinal `89` is not a field on the model. [P-17](./07-open-questions.md#p-17).

## Enter a reading

Requirements: [RF-07](./02-requirements.md#rf-07) through [RF-13](./02-requirements.md#rf-13), [RF-09](./02-requirements.md#rf-09), [RF-14](./02-requirements.md#rf-14).

```
+-----------------------------------+
| <  Brasil 1420 - Coronel, Ramona  |
+-----------------------------------+
| Medidor A-88413  modelo agujas    |
| [ cómo se lee este modelo  0:20 ] |
+-----------------------------------+
| Anterior: 1.284 m³ (14/07)        |
| Promedio últimos 6 bim.: 18 m³    |
+-----------------------------------+
| Lectura de hoy                    |
|        [ 1  3  0  2 ]             |
| Consumo: 18 m³ - normal           |
+-----------------------------------+
| [ escanear QR ]  [ tomar foto ]   |
+-----------------------------------+
| [ No se pudo leer ]  [ Guardar ]  |
+-----------------------------------+
```

What the drawing specifies:

- Header with address and holder. Nothing else about the member. [RNF-06](./02-requirements.md#rnf-06).
- Meter serial, model, and a way into the 20-second video.
- Previous reading with a short date, and a single six-period average.
- Consumption recalculates as the number is entered and gets a label (`normal` in the example).
- Two capture actions: QR and photo.
- Two exits: incident (`No se pudo leer`) or save.

The example closes: previous 1,284, value 1,302, consumption 18 m³, inside the usual range.

## When the number does not add up

Requirement: [RF-10](./02-requirements.md#rf-10). The story is in [00-context.md](./00-context.md): 4520 was written instead of 452.

```
+-----------------------------------+
| Revisa este número                |
+-----------------------------------+
| Cargaste 4520.                    |
| Eso da un consumo de 3.236 m³.    |
| Esta cuenta consume 18 m³ por     |
| bimestre.                         |
|                                   |
| Mira bien el medidor. Si el       |
| número es correcto, confirmalo.   |
+-----------------------------------+
| [ Corregir ]      [ Confirmar ]   |
+-----------------------------------+
```

`Corregir` returns to the number. `Confirmar` saves anyway and sets `confirmadaPorLector` to true. See [Lectura](./06-entities.md#lectura).

The warning does not say which multiple or difference triggers it. [P-01](./07-open-questions.md#p-01).

## Screens the PRD names and does not draw

| Screen | Comes from | What has to be visible |
| --- | --- | --- |
| Sign-in | RF-28, RF-29 | Username and password the first time. Fingerprint after that. A phone shared across shifts. |
| Today's routes | RF-01, RF-04 | One or two routes, with total and read counts, and a full download before leaving. |
| Incident | RF-14 through RF-17 | A reason from the short list, a photo, text or a voice note. |
| Map | RF-24, RF-25, RF-27 | Supplies, the reader, an arrow, and meters. The coordinate is not presented as supervision of the reader. |
| Summary | RF-30 | Read, with an incident, pending, not yet uploaded. |
| Close route | RF-05, RF-22 | If something is still unsent, say so clearly and do not close as if everything were fine. |

## What use imposes on the UI

- One hand, sun, eight hours, large buttons, few steps. [RNF-01](./02-requirements.md#rnf-01)
- The reading screen is used ~150 times a day. Do not add steps.
- No manual. The model video replaces the explanation. [RNF-04](./02-requirements.md#rnf-04), [RF-13](./02-requirements.md#rf-13)
- Low-end Android. [RNF-05](./02-requirements.md#rnf-05)

[Index](./README.md) · previous: [02-requirements.md](./02-requirements.md) · next: [04-stack.md](./04-stack.md)
