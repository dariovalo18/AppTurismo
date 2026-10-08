---
id: 07-open-questions
title: Open questions
source: PRD.pdf, explicit gaps and contradictions
---

# Open questions

[Index](./README.md) · previous: [06-entities.md](./06-entities.md) · next: [08-backlog.md](./08-backlog.md)

Hugo asked for gaps to be reported, not resolved in silence. Every item here is open, except [P-28](#p-28), which already has a decision. Implementing an answer for the rest changes the request.

When a question is closed, write the decision under the item and update the requirement that cites it. Until then the code does not choose.

<a id="p-01"></a>
## P-01 — Threshold for "far outside the usual"

Blocks [RF-10](./02-requirements.md#rf-10).

The PRD asks for a warning when consumption is far outside the usual, without blocking the save. The wireframe compares 3,236 m³ with an average of 18 m³. It does not say whether the warning fires on a multiple, a fixed difference, or some other rule. It also does not say what happens when `consumoPromedio` is `null`.

<a id="p-02"></a>
## P-02 — A history of periods, or a single average

Blocks the detail of [RF-07](./02-requirements.md#rf-07).

The text asks to see "consumption over recent periods". The wireframe and `Suministro` carry a single `consumoPromedio` ("average of the last 6 periods"). The model has no list of earlier consumptions.

<a id="p-03"></a>
## P-03 — New connection, no previous reading

`lecturaAnterior` may be `null`. The formula `(valor - anterior) * multiplicador` does not say what to do then. A new-connection mock is required ([DT-05](./05-data-and-api.md#dt-05)). A screen for that case is not.

<a id="p-04"></a>
## P-04 — Negative consumption after a meter change

The mock has to include a reading with negative consumption because the meter was replaced. There is no UI rule: whether to warn, whether to allow the save, whether `fueraDeRango` applies.

<a id="p-05"></a>
## P-05 — Which model carries the ×10 multiplier

The text names four models: two dial meters, one digital, and an old one with a ×10 multiplier. The type has `agujas`, `agujas_viejo`, `digital`, and `multiplicador`. It does not say which value is the old ×10 meter, or whether `agujas_viejo` and `multiplicador` are two different devices.

<a id="p-06"></a>
## P-06 — Whether the QR is required

The photo is required ([RF-09](./02-requirements.md#rf-09)). For the QR, the PRD says the reader can scan it to confirm the supply ([RF-11](./02-requirements.md#rf-11)). `codigoQr` may be `null`. It does not say whether a reading can be saved without a scan, or what happens when the scanned QR does not match.

<a id="p-07"></a>
## P-07 — Reading and incident on the same supply

They are separate entities on purpose. It does not say whether, on the same route, a supply can have both, whether one replaces the other, or whether a saved reading can be corrected.

<a id="p-08"></a>
## P-08 — Closing a route that still has unread supplies

[RF-05](./02-requirements.md#rf-05) asks to close at the end of the day. [RF-22](./02-requirements.md#rf-22) stops the close when something is still unsent. It does not say whether a route can close with supplies still pending.

<a id="p-09"></a>
## P-09 — "Do not allow a close" means a block or a warning

The sentence is: if something is still unsent, say so clearly and do not allow a close that pretends everything is fine. That can be a disabled button until the upload finishes, or a different close that records what is still pending. It is not chosen.

<a id="p-10"></a>
## P-10 — When the upload happens, and at what quality

[RF-20](./02-requirements.md#rf-20) says the upload happens on its own when the signal returns, with the reader pressing nothing. [RNF-02](./02-requirements.md#rnf-02) forbids uploading each photo at full quality the moment it is taken, because of the battery. Missing: compression, whether the photo and the record travel together, and whether the upload waits for wifi or uses mobile data.

<a id="p-11"></a>
## P-11 — When the photo may be deleted

[RNF-05](./02-requirements.md#rnf-05) asks to delete what is already synced so the phone does not fill up. It does not say what happens if the JSON uploaded and the photo did not, or the reverse.

<a id="p-12"></a>
## P-12 — Who generates the id while offline

`Lectura.id` and `Novedad.id` are `string`. In the street they are created with no API. It does not say whether the phone invents the id and the server keeps it.

<a id="p-13"></a>
## P-13 — What the reader signs in with

[RF-28](./02-requirements.md#rf-28) says username and password. `Usuario` has `legajo` and `nombre`. It has no email and no password. The scaffold in `app/index.tsx` asks for an email. That form is not the request.

<a id="p-14"></a>
## P-14 — Fingerprint on a phone that changes hands

The first time is username and password; after that, the fingerprint. The phone is shared across shifts and the session must not stay open under just anyone's name ([RF-29](./02-requirements.md#rf-29)). It does not say whether each reader enrolls their own fingerprint, whether the fingerprint only reopens the last person who signed in, or when the session ends as the phone is handed over.

<a id="p-15"></a>
## P-15 — Where administration looks at incidents

[RF-18](./02-requirements.md#rf-18) asks to see incidents grouped by reason and by area. `Rol` includes `administracion`. v1 is the reader's app, and billing is another system ([FA-01](./01-scope.md#fa-01)). It does not say whether that screen belongs in this app.

<a id="p-16"></a>
## P-16 — There is no area field

Grouping by area has no field to group on. Candidates the model does have are `Ruta.nombre` and `Suministro.categoria`. Neither is defined as the area.

<a id="p-17"></a>
## P-17 — The number 89 on the list

The wireframe numbers the rows 89, 90, 91, 92. `Suministro` has no such ordinal. `numero` is something else (`"004120"`). The closest thing is the position in `suministroIds`, and on a route of 142 that does not explain a lone 89 if the list starts at the beginning.

<a id="p-18"></a>
## P-18 — What `bimestre: "2026-05"` means

The type comment says `"AAAA-NN"`. There are six two-month periods in a year, not twelve. `"2026-05"` can be May or the fifth period.

<a id="p-19"></a>
## P-19 — Pages of 50 and a full route

The API envelope pages (`porPagina: 50`). [RF-04](./02-requirements.md#rf-04) asks to download the full route, 120 to 200 supplies, before leaving. It does not say whether the service walks the pages or whether another resource returns the route unpaged.

<a id="p-20"></a>
## P-20 — The model video with no signal

[RF-13](./02-requirements.md#rf-13) asks to watch the video while standing in front of the meter. [RF-19](./02-requirements.md#rf-19) requires the day to work offline. `videoInstructivoUrl` is a URL. It does not say whether the video is downloaded with the route.

<a id="p-21"></a>
## P-21 — When GPS turns on

Location is needed for the map ([RF-24](./02-requirements.md#rf-24)), the arrow ([RF-25](./02-requirements.md#rf-25)), and the coordinate saved with the reading ([RF-26](./02-requirements.md#rf-26)). [RNF-02](./02-requirements.md#rnf-02) forbids leaving GPS on all day. It does not say on which screens the position is requested.

<a id="p-22"></a>
## P-22 — A new-route alert where there is no signal

[RF-31](./02-requirements.md#rf-31) is an alert when administration assigns a route. The quintas have no signal. It does not say whether that is a remote push, a local alert at sync time, or both. The 17:00 reminder ([RF-32](./02-requirements.md#rf-32)) can be computed on the phone from what is already waiting to upload.

<a id="p-23"></a>
## P-23 — Whether the gallery satisfies the required photo

`expo-image-picker` is there to attach a photo taken earlier, when the camera fails. It does not say whether that photo satisfies [RF-09](./02-requirements.md#rf-09) and [RF-16](./02-requirements.md#rf-16).

<a id="p-24"></a>
## P-24 — An inactive supply on the route

`Suministro.activo` exists. It does not say whether a supply with `false` is skipped, shown, or should not appear in `suministroIds`.

<a id="p-25"></a>
## P-25 — Units of the average and of the dial

`valor` is in the unit the meter shows. `consumoPromedio` is noted as m³ per period. With `multiplicador: 10` it does not say whether the average is already in real m³ or in turns of the dial.

<a id="p-26"></a>
## P-26 — What "not yet uploaded" counts

[RF-21](./02-requirements.md#rf-21) talks about readings waiting to upload. The wireframe says "Sin subir: 12". Incidents also have `sincronizada`. It does not say whether the number adds both.

<a id="p-27"></a>
## P-27 — When the shift's session ends

Related to [P-14](#p-14). It does not say whether leaving the app requires signing in again, or whether the fingerprint is enough to reopen the same reader.

<a id="p-28"></a>
## P-28 — Names of the code folders

Closed. Folders and the code we write are English. These docs are English too.

| In the PRD | In this repo |
| --- | --- |
| `src/tipos/` | `src/types/` |
| `src/mocks/` | `src/mocks/` |
| `src/servicios/rutas.ts` | `src/services/routes.ts` |

`@/` points at `src/`. The Spanish folders are not created.

Files, functions, components, variables, and comments are English. Contract names (`Suministro`, `lecturaAnterior`, `codigoQr`, the incident reasons) are not translated: they are what the API will send. Screen copy stays Spanish.

[Index](./README.md) · previous: [06-entities.md](./06-entities.md) · next: [08-backlog.md](./08-backlog.md)
