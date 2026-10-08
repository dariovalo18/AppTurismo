---
id: 02-requirements
title: Requirements
source: PRD.pdf, pp. 2–4
---

# Requirements

[Index](./README.md) · previous: [01-scope.md](./01-scope.md) · next: [03-screens-and-use.md](./03-screens-and-use.md)

Each id is stable. Cite the id in code and in the backlog. Screen detail is in [03-screens-and-use.md](./03-screens-and-use.md). What the PRD does not define is in [07-open-questions.md](./07-open-questions.md).

## 1. Today's route

A route is 120 to 200 supplies in the same area, in the order they are walked. Each morning the reader has one or two routes. The walk is neither alphabetical nor by house number: the readers built it over years, and it saves about an hour per route.

| Id | The app has to |
| --- | --- |
| <a id="rf-01"></a>RF-01 | Show the routes assigned for today, with how many supplies each one has and how many are already read. |
| <a id="rf-02"></a>RF-02 | Open a route and list the supplies in walk order, with the address and the member's name. |
| <a id="rf-03"></a>RF-03 | Make read, pending, and incident visible at a glance. |
| <a id="rf-04"></a>RF-04 | Download the full route before leaving, on the cooperative's wifi. |
| <a id="rf-05"></a>RF-05 | Close the route at the end of the day. |
| <a id="rf-06"></a>RF-06 | Keep `suministroIds` as the walk order. Do not reorder. |

## 2. Taking the reading

This is the screen the reader uses about 150 times a day. Every extra second is multiplied by 150.

Four meter models coexist: two dial meters, one digital, and an old one with a ×10 multiplier. On that last one, the number on the face is not the consumption. The exact mapping to `ModeloMedidor` is open: [P-05](./07-open-questions.md#p-05).

| Id | The app has to |
| --- | --- |
| <a id="rf-07"></a>RF-07 | On opening a supply, show the previous reading and consumption over recent periods. The wireframe shows one average of 6 periods, not a series. [P-02](./07-open-questions.md#p-02) |
| <a id="rf-08"></a>RF-08 | Let the reader enter the number on the meter. |
| <a id="rf-09"></a>RF-09 | Require a photo of the meter before saving the reading. It is the only way to settle a complaint six months later. |
| <a id="rf-10"></a>RF-10 | Compute consumption and warn on the spot if it is far outside what is usual for that member. Do not block the save: warn and ask for confirmation. The threshold is undefined. [P-01](./07-open-questions.md#p-01) |
| <a id="rf-11"></a>RF-11 | Allow scanning the QR stuck on the meter to confirm this reading belongs to this supply. The PRD does not say the QR is required. [P-06](./07-open-questions.md#p-06) |
| <a id="rf-12"></a>RF-12 | Move to the next supply without returning to the list. |
| <a id="rf-13"></a>RF-13 | Play, from that same screen, the twenty-second video that shows how to read that model. |

## 3. When the meter cannot be read

This happens every day, and today it is recorded nowhere.

| Id | The app has to |
| --- | --- |
| <a id="rf-14"></a>RF-14 | Mark the supply with an incident instead of a reading. |
| <a id="rf-15"></a>RF-15 | Pick the reason from this short list: loose dog, closed gate, tall grass, covered meter, broken meter, unoccupied home, meter not found. |
| <a id="rf-16"></a>RF-16 | Require a photo on the incident too. If the reason is tall grass, the photo has to show the grass. |
| <a id="rf-17"></a>RF-17 | Allow a written note or a voice note. The reader's hands are dirty and they are in a hurry. |
| <a id="rf-18"></a>RF-18 | Let administration later see incidents grouped by reason and by area, so they can send someone to cut the grass or talk to the member. The PRD does not say whether that view lives in this app. [P-15](./07-open-questions.md#p-15), [P-16](./07-open-questions.md#p-16) |

`MotivoNovedad` values are in [06-entities.md](./06-entities.md#novedad).

## 4. Working with no signal

The quintas have no signal, and it drops in several neighborhoods. No signal is the rule.

| Id | The app has to |
| --- | --- |
| <a id="rf-19"></a>RF-19 | Once the route is downloaded, run the whole day offline: see the list, enter readings, take photos, mark incidents. |
| <a id="rf-20"></a>RF-20 | Store readings on the phone and upload them on their own when the signal returns, without the reader pressing anything. |
| <a id="rf-21"></a>RF-21 | Always show how many readings are still waiting to upload. |
| <a id="rf-22"></a>RF-22 | When closing the route, say clearly if something is still unsent, and do not allow a close that pretends everything is fine. |
| <a id="rf-23"></a>RF-23 | Never lose a saved reading, even if the phone powers off, the app is closed, or the battery dies. If that happens once, the readers go back to the folder. |

## 5. Finding the meter

| Id | The app has to |
| --- | --- |
| <a id="rf-24"></a>RF-24 | Show the route's supplies on a map, with the reader located. |
| <a id="rf-25"></a>RF-25 | When the supply cannot be seen — the quintas have no street numbers — point an arrow toward it and say how many meters away it is. |
| <a id="rf-26"></a>RF-26 | Record where the reading was entered from. |
| <a id="rf-27"></a>RF-27 | Treat that coordinate as evidence for the day a member says nobody came by. It is not a way to supervise the readers. The team has to be able to say that. |

## 6. The reader and their day

The phones belong to the cooperative and are shared across shifts.

| Id | The app has to |
| --- | --- |
| <a id="rf-28"></a>RF-28 | Sign in with username and password the first time, and with a fingerprint after that. |
| <a id="rf-29"></a>RF-29 | Keep the session from staying open under just anyone's name. |
| <a id="rf-30"></a>RF-30 | Show the day's summary: read, with an incident, pending, not yet uploaded. |
| <a id="rf-31"></a>RF-31 | Notify the reader when administration assigns a new route. |
| <a id="rf-32"></a>RF-32 | Remind them at 17:00 if readings are still unsynced. |

## Constraints that change the design

| Id | Constraint |
| --- | --- |
| <a id="rnf-01"></a>RNF-01 | Used with one hand, in the sun, for eight hours. The other hand is lifting the meter cover. Large buttons and few steps. |
| <a id="rnf-02"></a>RNF-02 | The battery has to last the day. Do not leave GPS on all day, and do not upload each photo at full quality the moment it is taken. |
| <a id="rnf-03"></a>RNF-03 | After the route is downloaded, any screen that fails offline is wrong. |
| <a id="rnf-04"></a>RNF-04 | Nobody will read a manual. Some readers are 58 and use the phone for WhatsApp and nothing else. |
| <a id="rnf-05"></a>RNF-05 | Low-end Android, with little free space. If photos are never deleted after sync, within one period nothing else fits. |
| <a id="rnf-06"></a>RNF-06 | On screen, the member's name and address, and nothing else. Do not show phone number or national id. The device can be lost. |

[Index](./README.md) · previous: [01-scope.md](./01-scope.md) · next: [03-screens-and-use.md](./03-screens-and-use.md)
