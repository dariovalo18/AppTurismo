# Docs — Meter reading

This folder is the working spec, split from [`PRD.pdf`](../PRD.pdf). Start here, then open only the file the task needs. Do not invent behavior for anything listed in [07-open-questions.md](./07-open-questions.md). Implement one item from [08-backlog.md](./08-backlog.md) at a time.

Teaching document. This request is not assigned to any student group: the app in this repo is the example used in class to show how to read a PRD. The voice of the request is Hugo Barreto, head of Readings and Billing at the Cooperativa de Agua Potable de Chajarí. When the PRD contradicts itself, record it. Do not close the contradiction in code.

Docs, folders, and code we write are English. Contract names stay as the API will send them (`Suministro`, `lecturaAnterior`). Screen copy stays Spanish. [P-28](./07-open-questions.md#p-28).

## Index

| File | What it answers | Open it when |
| --- | --- | --- |
| [00-context.md](./00-context.md) | Who uses the app, what breaks today, and what must not fail | You have not read the PRD yet |
| [01-scope.md](./01-scope.md) | What is in v1, what stays out, and how to work with Hugo | You are about to add a screen or a package |
| [02-requirements.md](./02-requirements.md) | Requirements with stable ids (`RF-`, `RNF-`) | You are implementing or reviewing a flow |
| [03-screens-and-use.md](./03-screens-and-use.md) | Wireframes and real conditions of use | You are building UI |
| [04-stack.md](./04-stack.md) | Expo SDK 57, packages, and what each one is for | You are installing a dependency or touching the device |
| [05-data-and-api.md](./05-data-and-api.md) | Mocks, services, the API envelope, and conventions | You are reading or writing data |
| [06-entities.md](./06-entities.md) | Types, fields, and JSON examples | You are creating `src/types` or a mock |
| [07-open-questions.md](./07-open-questions.md) | Gaps and contradictions in the PRD, unresolved | The requirement is not enough to decide |
| [08-backlog.md](./08-backlog.md) | Proposed work sequence | You are choosing the next change |

## Repo status

The code does not implement the PRD yet. It is an Expo Router scaffold:

- `app/index.tsx` asks for email and password and navigates to `/rutas` with no session.
- `app/rutas/` shows a sample list and an id screen.
- `src/types`, `src/mocks`, and `src/services` do not exist.
- The email login is not in the `Usuario` model. See [P-13](./07-open-questions.md#p-13).

## How to read this

1. If the change touches behavior, cite the id from [02-requirements.md](./02-requirements.md).
2. If the PRD is not enough, leave the id from [07-open-questions.md](./07-open-questions.md) in the code and do not pick an option.
3. The real API arrives later. Until then, services return mocks with the same shape the API will have.
