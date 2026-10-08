---
id: 05-data-and-api
title: Data, mocks, and API
source: PRD.pdf, pp. 7–8
---

# Data, mocks, and API

[Index](./README.md) · previous: [04-stack.md](./04-stack.md) · next: [06-entities.md](./06-entities.md)

The course provides the API later in the term. Until then the app is built against invented data. Swapping in the API has to be cheap: replace the body of the service, not the screens or the types.

## Where each thing lives

| Id | Rule |
| --- | --- |
| <a id="dt-01"></a>DT-01 | The types in [06-entities.md](./06-entities.md) are written once, in `src/types/`, and are not edited when the API arrives. |
| <a id="dt-02"></a>DT-02 | Fake data lives in `src/mocks/`, typed with those same types. If the mock does not compile against the type, the mock is wrong. |
| <a id="dt-03"></a>DT-03 | No screen imports a mock. Every read and write goes through a service. The route service is `src/services/routes.ts`. Today it returns the mock. Tomorrow it calls `fetch`. |
| <a id="dt-04"></a>DT-04 | Services are async from day one, even if the mock answers instantly. |
| <a id="dt-05"></a>DT-05 | Mocks include the awkward cases in the table below. |

Folders and the code we write are English. Closed in [P-28](./07-open-questions.md#p-28). The PRD said `src/tipos/` and `src/servicios/rutas.ts`. In this repo they are `src/types/` and `src/services/routes.ts`. The `@/` alias points at `src/`.

Contract names are not translated. `Suministro`, `lecturaAnterior`, `perro_suelto`, and the rest of [06-entities.md](./06-entities.md) stay as the API will send them. Files, functions, components, variables, and comments are English. Text the reader sees on screen stays Spanish.

## Awkward cases the mock has to include

| Case | Why it exists |
| --- | --- |
| A route of 200 supplies | The real list is long. Between 120 and 200. |
| A supply with no previous reading | A new connection. `lecturaAnterior` is `null`. [P-03](./07-open-questions.md#p-03) |
| A meter with a multiplier | The number on the face is not the consumption. [P-05](./07-open-questions.md#p-05) |
| A reading with negative consumption | The meter was replaced. [P-04](./07-open-questions.md#p-04) |
| A closed route | `estado: "cerrada"`. |
| A network error | The service has to be able to fail, not only return data. |

## API envelope

Success:

```json
{ "datos": [], "meta": { "total": 142, "pagina": 1, "porPagina": 50 } }
```

Error:

```json
{ "error": { "codigo": "RUTA_YA_CERRADA", "mensaje": "Esa ruta fue cerrada el 14/09." } }
```

`RUTA_YA_CERRADA` is the only sample code. Do not invent other codes and treat them as the contract.

The route is downloaded in full before leaving ([RF-04](./02-requirements.md#rf-04)), but the envelope pages at 50. How to request the whole route is unstated. [P-19](./07-open-questions.md#p-19).

## Conventions, with no exceptions

| Id | Rule |
| --- | --- |
| <a id="dt-06"></a>DT-06 | Identifiers are `string`, not `number`. The supply number is a string too, even when it looks numeric: it keeps leading zeros (`"004120"`). |
| <a id="dt-07"></a>DT-07 | Dates and times travel as ISO 8601 text with a zone (`"2026-09-15T08:12:00-03:00"`). Never a `Date` and never a number in the contract. |
| <a id="dt-08"></a>DT-08 | Keys are `camelCase`. |
| <a id="dt-09"></a>DT-09 | A field with no value comes as `null`. The key is not omitted. It is not `""`. |
| <a id="dt-10"></a>DT-10 | Readings are integers, in the unit the meter shows. The multiplier is applied separately and is stored on the meter, not on the reading. |
| <a id="dt-11"></a>DT-11 | The session travels in `Authorization: Bearer <token>`. The token is stored in `expo-secure-store`, never in `kv-store`. |

## The formula the PRD does write

On `Medidor`: real consumption is `(lectura - anterior) * multiplicador`.

On `Lectura`: `consumo` is `(valor - anterior) * multiplicador`. `valor` is the number as seen on the meter.

That formula does not say what to do when `anterior` is `null`, or when the result is negative. Those cases are mocked and left unresolved. [P-03](./07-open-questions.md#p-03), [P-04](./07-open-questions.md#p-04).

## What does not travel to the phone

[RNF-06](./02-requirements.md#rnf-06): on screen, name and address. The `Suministro` model has no phone and no national id. Do not add them "in case they are needed".

[Index](./README.md) · previous: [04-stack.md](./04-stack.md) · next: [06-entities.md](./06-entities.md)
