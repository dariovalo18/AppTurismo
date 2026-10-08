---
id: 00-context
title: Context
source: PRD.pdf, p. 1
---

# Context

[Index](./README.md) · next: [01-scope.md](./01-scope.md)

## Who is asking for the app

The Cooperativa de Agua Potable y Otros Servicios de Chajarí has distributed drinking water since 1961. It has 9,400 members: houses in the urban center, shops, an industrial zone, and about 300 connections in the quintas, toward the stream.

Hugo Barreto has run Readings and Billing since 2016. He has six readers. Every two-month period, all 9,400 meters have to be read.

## How the work is done today

1. Administration prints the sheets by route.
2. Each reader takes their sheets in a folder and writes down the number on the meter while walking.
3. In the afternoon they bring the folder back.
4. Someone in administration types those sheets into the billing system. About 1,500 lines per period, typed by one person at five in the afternoon.

## What broke

These three events are why the app exists. The app has to make them impossible, or at least visible.

| Event | Fact | What has to change |
| --- | --- | --- |
| Miswritten reading | A reader wrote 4520 where the meter said 452. A pensioner on Brasil street was billed eighteen times her real consumption. Paying her back took two months. | Warn on the spot if the number does not fit that member's history. Do not block it: ask for confirmation. [RF-10](./02-requirements.md#rf-10) |
| Folder lost to rain | The quintas have no signal. Three days of rain soaked the folder. 280 meters were lost and billed by average. | The whole day works with no signal, and a saved reading is never lost. [RF-19](./02-requirements.md#rf-19), [RF-23](./02-requirements.md#rf-23) |
| Unread meters, no reason | 140 meters have been billed by average for three periods (dog, tall grass, closed gate, construction). Nobody recorded why. | Every failure to read is an incident, with a reason and a photo. [RF-14](./02-requirements.md#rf-14) |

## The request in one sentence

The reader leaves with a phone instead of a folder. The app says which meters are theirs today and in which order, takes the reading with a photo, warns if the number does not make sense, and delivers all of that to administration with nobody typing it again.

## Who walks the route

Ramón has walked route 7 for eleven years. Hugo wants the team to talk to him before treating the job as understood. In the mocks, Ramón Duarte is user `usr-011`.

[Index](./README.md) · next: [01-scope.md](./01-scope.md)
