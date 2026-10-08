---
id: 04-stack
title: Stack and device capabilities
source: PRD.pdf, pp. 6–7
---

# Stack and device capabilities

[Index](./README.md) · previous: [03-screens-and-use.md](./03-screens-and-use.md) · next: [05-data-and-api.md](./05-data-and-api.md)

Before writing Expo code, read the docs for the exact version: [https://docs.expo.dev/versions/v57.0.0/](https://docs.expo.dev/versions/v57.0.0/). This repo targets Expo `^57.0.1`.

## What it is built with

| What | With |
| --- | --- |
| Framework | React Native with Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| Styles | `StyleSheet`. Unistyles or NativeWind are optional. Nobody is required to adopt them. |
| Delivery | Production build with EAS |

`StyleSheet` is the base. Everything essential is done with `StyleSheet` first. Theme via `useColorScheme` and Context. Responsive layout via `useWindowDimensions`.

## Capabilities

Install a package only when the backlog item asks for it.

| Capability | Package | What it is for in this app | Requirements |
| --- | --- | --- | --- |
| Camera | `expo-camera` (`CameraView`) | Required meter photo and the QR on the box | RF-09, RF-11, RF-16 |
| Gallery | `expo-image-picker` | Attach a photo taken earlier, when the camera fails | [P-23](./07-open-questions.md#p-23) |
| Location and map | `expo-location` + `react-native-maps` | Route supplies on the map, and where each reading was entered | RF-24, RF-26 |
| Notifications | `expo-notifications` | A newly assigned route, and a reminder for unsynced readings | RF-31, RF-32 |
| Persistence and network | `expo-sqlite`, `expo-sqlite/kv-store`, `expo-network` | Downloaded route, upload queue, session, and preferences | RF-04, RF-19, RF-20, RF-23 |
| Security | `expo-secure-store` + `expo-local-authentication` | Stored token and fingerprint sign-in on a shared phone | RF-28, RF-29 |
| Sensors and haptics | `expo-sensors`, `expo-haptics` | Arrow toward the meter via the magnetometer; a different vibration on save and on an out-of-range consumption | RF-25, RF-10 |
| File system | `expo-file-system` | Photos and videos kept until upload, then deleted once synced | RF-09, RF-13, RNF-05 |
| Media | `expo-video`, `expo-audio` | Video of how to read each model; voice note on an incident | RF-13, RF-17 |

## Three things old docs get wrong

- `expo-av` is gone. Audio is `expo-audio`. Video is `expo-video`.
- The old `expo-file-system` API throws at runtime. Use `File`, `Directory`, and `Paths`.
- Icons are `@react-native-vector-icons/ionicons`, not `@expo/vector-icons`. This repo already depends on `@react-native-vector-icons/ionicons`.

## Already installed

`expo`, `expo-router`, `expo-status-bar`, `react-native`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@react-native-vector-icons/ionicons`.

None of the packages in the capability table are installed yet.

## Repo conventions the PRD does not mention

- Folders, files, functions, components, variables, and comments are English. [P-28](./07-open-questions.md#p-28).
- Contract names stay as in the PRD. Screen copy stays Spanish.
- Route files live in `app/`, thin, with no business logic and no fetch.
- Named exports. `export default` only in files under `app/`.
- No `any`. `strict` on.
- Alias `@/` points at `src/`.
- `typedRoutes: true` in `app.json`. It is off today.
- Prettier: no semicolons, single quotes, trailing commas, `printWidth` 100.

[Index](./README.md) · previous: [03-screens-and-use.md](./03-screens-and-use.md) · next: [05-data-and-api.md](./05-data-and-api.md)
