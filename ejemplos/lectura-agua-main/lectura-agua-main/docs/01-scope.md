---
id: 01-scope
title: v1 scope
source: PRD.pdf, p. 5
---

# v1 scope

[Index](./README.md) · previous: [00-context.md](./00-context.md) · next: [02-requirements.md](./02-requirements.md)

v1 is the reader's app in the street. It delivers readings and incidents. It does not bill.

## In scope

Six areas, detailed in [02-requirements.md](./02-requirements.md):

1. Today's route.
2. Taking the reading.
3. When the meter cannot be read.
4. Working with no signal.
5. Finding the meter.
6. The reader and their day.

## Out of scope

| Id | Stays out | PRD note |
| --- | --- | --- |
| <a id="fa-01"></a>FA-01 | Billing itself | The app delivers readings. The billing system already exists and is a different system. |
| <a id="fa-02"></a>FA-02 | A member app | Consumption and the bill will be asked for later. Not now. |
| <a id="fa-03"></a>FA-03 | Collecting payment in the street | — |
| <a id="fa-04"></a>FA-04 | Work orders for maintenance crews | — |
| <a id="fa-05"></a>FA-05 | Reading the meter number from the photo | The basics have to work first. |
| <a id="fa-06"></a>FA-06 | Meters with telemetry | There are four. They are an experiment. |

If a change needs any of these rows, it is not in this version.

## How Hugo wants the work done

These rules apply to an agent too:

- If something is impossible, far too expensive, or unclear, say so directly. Do not hide it inside an implementation.
- A question now is worth more than an app that is useless in October.
- This document has mistakes and omissions. When they show up, write them in [07-open-questions.md](./07-open-questions.md). Do not resolve them alone and report it afterwards.
- Talk to a reader (Ramón, route 7) before closing how the walking actually works.
- When the request changes, say what drops or what slips.
- Show something that can be tapped early, even if it is ugly and the data is fake.

[Index](./README.md) · previous: [00-context.md](./00-context.md) · next: [02-requirements.md](./02-requirements.md)
