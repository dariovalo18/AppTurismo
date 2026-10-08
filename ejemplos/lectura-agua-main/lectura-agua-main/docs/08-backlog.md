---
id: 08-backlog
title: Proposed backlog
status: proposed
---

# Proposed backlog

[Index](./README.md) · previous: [07-open-questions.md](./07-open-questions.md)

Sequence for building v1 on the current scaffold. Nothing in this list is done except B-00. One item at a time: finish it, make it tappable, and only then open the next one.

An item marked **blocked** is not coded. The question that stops it is in [07-open-questions.md](./07-open-questions.md). The happy path of an item can be built when the table says so. The blocked part stays cited, with no invented rule.

[FA-01](./01-scope.md#fa-01) through [FA-06](./01-scope.md#fa-06) stay out.

## When an item is done

- The behavior cites ids from [02-requirements.md](./02-requirements.md).
- Data goes through the service. The screen does not import the mock ([DT-03](./05-data-and-api.md#dt-03)).
- If the item touches an open question, the code names the id (`P-01`) and does not choose the answer.
- New files, folders, functions, and comments are English. Contract identifiers stay as in [06-entities.md](./06-entities.md).

## 0. Decisions

| Id | Work | Blocked by | Done when |
| --- | --- | --- | --- |
| <a id="b-00"></a>B-00 | Pick one folder layout for types, mocks, and services. | — | Done. `src/types/`, `src/mocks/`, `src/services/routes.ts`. See [P-28](./07-open-questions.md#p-28). |

## 1. Contract, no new screens

| Id | Work | Requirements | Done when |
| --- | --- | --- | --- |
| <a id="b-01"></a>B-01 | Write the types from [06-entities.md](./06-entities.md) once, in `src/types/`, with an English file name. No extra fields. Contract identifiers stay untranslated. | DT-01, DT-06 through DT-10 | The module compiles and matches the contract. |
| <a id="b-02"></a>B-02 | Typed mocks with the six awkward cases. | DT-02, DT-05 | A route of 200, a new connection, a multiplier, negative consumption, a closed route, and a network error. The error mock is not a generic `throw`: it has the shape `{ error: { codigo, mensaje } }`. |
| <a id="b-03"></a>B-03 | Async services. Today they return the mock. | DT-03, DT-04 | No screen imports the mock. `src/services/routes.ts` returns the mock. Session waits for B-12. |

B-00 is closed. Next is B-01. B-01 through B-03 do not resolve P-01 through P-07: the mock carries the case and the service returns it.

## 2. Something that can be tapped

The request asks to see something early, with invented data. This batch uses the happy path of route 07 and leaves the gaps visible.

| Id | Work | Requirements | Done when |
| --- | --- | --- | --- |
| <a id="b-04"></a>B-04 | Today's routes and the list of one route, in `suministroIds` order. Read, pending, and incident states, with the reason visible. An "unsent" strip whose number comes from the mock. | RF-01, RF-02, RF-03, RF-06, RF-21, RNF-06 | The wireframe list can be walked. It is not sorted by street or by `numero`. If a row ordinal is shown, it cites [P-17](./07-open-questions.md#p-17). |
| <a id="b-05"></a>B-05 | Happy-path reading screen: previous value, average, number, consumption from the formula, save, and move to the next. | RF-07, RF-08, RF-12, RNF-01 | With previous 1284 and value 1302, consumption is 18 when the multiplier is 1. Saving with no previous value, a negative result, or an out-of-range value stays blocked: [P-03](./07-open-questions.md#p-03), [P-04](./07-open-questions.md#p-04), [P-01](./07-open-questions.md#p-01). |
| <a id="b-06"></a>B-06 | Day summary from the same data: read, with an incident, pending, not yet uploaded. | RF-30 | The four numbers are visible on the open route. |

The current email login is not extended. Replacing it is B-12, and that item is blocked.

## 3. Do not lose what was entered

| Id | Work | Requirements | Done when |
| --- | --- | --- | --- |
| <a id="b-07"></a>B-07 | Persist the downloaded route and every saved reading or incident on the phone. It survives closing the app and killing the process. | RF-04, RF-19, RF-23 | With the route already on the device, the list and a new reading are still there after reopening, with no network. A locally invented id cites [P-12](./07-open-questions.md#p-12). |
| <a id="b-08"></a>B-08 | A photo is required to save a reading, using `expo-camera`. | RF-09, RNF-05 | Without a photo there is no save. The copy stays on disk until a deletion rule exists. |
| <a id="b-09"></a>B-09 | An incident instead of a reading: reason, photo, text or voice note. | RF-14, RF-15, RF-16, RF-17 | The seven reasons are chosen from the list. The photo is required. Text and audio may both be `null`. |

B-08 and B-09 do not decide whether the gallery is enough ([P-23](./07-open-questions.md#p-23)) or whether a reading and an incident can coexist ([P-07](./07-open-questions.md#p-07)).

## 4. Blocked until the questions close

These items are written down so they are not lost. They are not started.

| Id | Work | Blocked by |
| --- | --- | --- |
| <a id="b-10"></a>B-10 | Out-of-range consumption warning, with confirm or correct, and a distinct haptic. | [P-01](./07-open-questions.md#p-01), [P-04](./07-open-questions.md#p-04), [P-25](./07-open-questions.md#p-25) |
| <a id="b-11"></a>B-11 | Meter QR. | [P-06](./07-open-questions.md#p-06) |
| <a id="b-12"></a>B-12 | Sign-in with username and password, then fingerprint, on a shared phone. Token in `expo-secure-store`. | [P-13](./07-open-questions.md#p-13), [P-14](./07-open-questions.md#p-14), [P-27](./07-open-questions.md#p-27) |
| <a id="b-13"></a>B-13 | Automatic upload when the signal returns, an honest counter, and deletion of what already uploaded. | [P-10](./07-open-questions.md#p-10), [P-11](./07-open-questions.md#p-11), [P-26](./07-open-questions.md#p-26) |
| <a id="b-14"></a>B-14 | Close the route without pretending everything is synced. | [P-08](./07-open-questions.md#p-08), [P-09](./07-open-questions.md#p-09) |
| <a id="b-15"></a>B-15 | Map, magnetometer arrow, and a coordinate saved with the reading. GPS only when it is needed. | [P-21](./07-open-questions.md#p-21) |
| <a id="b-16"></a>B-16 | Video of how to read the model, including with no signal. | [P-05](./07-open-questions.md#p-05), [P-20](./07-open-questions.md#p-20) |
| <a id="b-17"></a>B-17 | New-route alert and the 17:00 reminder. | [P-22](./07-open-questions.md#p-22) |
| <a id="b-18"></a>B-18 | Incidents grouped for administration. | [P-15](./07-open-questions.md#p-15), [P-16](./07-open-questions.md#p-16) |

## Suggested order

`B-00 → B-01 → B-02 → B-03 → B-04 → B-05 → B-06 → B-07 → B-08 → B-09`

That is a demo day: route, happy-path reading, summary, and data that survives closing the app. The rest waits for an answer.

[Index](./README.md) · previous: [07-open-questions.md](./07-open-questions.md)
