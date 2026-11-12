Chicos la documentacion y el API quedo en esta URL https://entrerios.voipgroup.com/docs

# Mi Ciudad Colón · Guía turística - 

App móvil para el turista que visita Colón (Entre Ríos): lugares, mapa con lo que tenés cerca, agenda de eventos, tu recorrido y audioguías. Funciona sin señal con la información que ya se descargó.

Trabajo Final Integrador de **Desarrollo para Móviles** — Tecnicatura Universitaria en Desarrollo Web, UNER.

## Integrantes

| Integrante | Parte |
|---|---|
| _ Dario Gabriel Arias  | Catálogo, offline y entrega |
| _ Andrés Agustín Garcia  | Mapa y ubicación |
| _ Daniel Esteban Clementín | Agenda y notificaciones |
| _ Valentin Suarez  | Mi recorrido y visitas offline |
| _ Nicolas Ibarra  | Cuenta, favoritos y audioguías |

## Tecnologías

React Native con **Expo SDK 54**, TypeScript y Expo Router. La API es la de la cátedra (`api-mi-ciudad`).

---

## Cómo ejecutarla

### Requisitos

- **Node.js LTS** (https://nodejs.org). Comprobar con `node -v`.
- En el celular, **Expo Go para SDK 54**. La versión de Play Store suele ser más nueva y no abre el proyecto: bajarla desde https://expo.dev/go eligiendo **SDK 54** y desactivar la actualización automática de Expo Go en Play Store.
- El celular y la computadora en la **misma red wifi**.

### Pasos

```bash
git clone <url-del-repo>
cd AppTurismo
npm install
npx expo start
```

En el celular, abrir Expo Go y escanear el QR que aparece en la terminal.

### Usuarios de prueba

| Email | Contraseña | Para qué |
|---|---|---|
| `lucia@mail.com` | `lucia1234` | Usuaria con favoritos, visitas y un evento guardado |
| `nuevo@demo.ar` | `nuevo1234` | Cuenta vacía, para ver las listas vacías |
| `turismo@colon.demo.ar` | `turismo1234` | Administración: puede suspender y cancelar eventos |

También se puede entrar con **"Continuar sin cuenta"**: el mapa y los lugares no piden cuenta.

### Dirección de la API

Se configura en el archivo `.env`:

```
EXPO_PUBLIC_API_URL=https://entrerios.voipgroup.com
```

Para usar la API corriendo en la computadora, poner la IP de la compu (no `localhost`, que en el celular es el propio celular), por ejemplo `EXPO_PUBLIC_API_URL=http://192.168.0.10:3000`, y reiniciar con `npx expo start -c`.

### Generar el APK

```bash
npx eas-cli build --platform android --profile preview
```

El perfil `preview` está en `eas.json` y genera un APK que se instala y anda sin la computadora.

---

## Estructura

```
app/                  Pantallas (Expo Router: cada archivo es una ruta)
  (tabs)/             Pestañas de abajo: inicio, mapa, agenda, recorrido, yo
  lugar/[id].tsx      Detalle de un lugar
  login.tsx
src/
  componentes/        Componentes reutilizables
  hooks/              useUbicacion, useCatalogo, useRumbo
  servicios/          Llamadas a la API, caché offline, notificaciones, audioguías
  db/                 Base SQLite local
  tipos/              Tipos del PDF (no se modifican)
  utilidades/         Horarios, distancias, cómo llegar
```

## Funcionalidades

###  Mapa y ubicación

- **Mapa** (`react-native-maps`) centrado en Colón, con un pin por lugar del color de su categoría.
- **Filtro por categoría** arriba del mapa.
- **Tarjeta del lugar** al tocar un pin: categoría, si está abierto, distancia, flecha, "Ver detalle" y "Cómo llegar".
- **Ubicación** (`expo-location`): si se niega el permiso o el GPS está apagado, la app sigue andando y lo avisa.
- **Inicio** con un mapa chico y **"Cerca tuyo"**: los 5 lugares más cercanos, ordenados por distancia.
- **Cómo llegar**: abre Google Maps (Apple Maps en iPhone) caminando o en auto.
- **Flecha hacia el lugar** con el magnetómetro (`expo-sensors`).
- **Aviso de proximidad** (`expo-notifications`, notificación local): uno por lugar y por día, y como mínimo 10 minutos entre avisos. Respeta las preferencias del usuario (activado o no, y radio de 100, 250 o 500 m); sin cuenta avisa a 250 m. **Funciona mientras la app está abierta.**
- **Audioguías sin señal** (`expo-file-system`): botón en el detalle para bajar el audio al teléfono.

###  Agenda y notificaciones

- **Agenda por día** empezando por hoy: tira con los próximos 14 días (`GET /eventos?fecha=`). Un evento que pasa la medianoche aparece en los dos días (lo resuelve la API).
- **Detalle del evento**: qué es, cuándo empieza, cuánto dura, dónde (lugar del catálogo con "Ver el lugar", o dirección suelta), si es gratis, "Cómo llegar".
- **Estados**: suspendido, cancelado y finalizado se ven con un cartel de color; los cancelados, tachados.
- **Guardar evento** (pide cuenta, `PUT /yo/eventos-guardados/{id}`) y pestaña **Guardados**. Se pueden guardar programados y suspendidos.
- **Recordatorio** 1 hora antes (`expo-notifications`, notificación local programada: anda sin señal y en Expo Go). Al tocarlo se abre el evento.
- **Si un evento guardado se suspende, se cancela o cambia de horario**: la app lo detecta al abrirse, avisa y reprograma o cancela el recordatorio. Además la API manda una push.
- **Push**: al entrar con cuenta se pide permiso, se obtiene el token de Expo y se registra con `POST /dispositivos`. Al cerrar sesión se da de baja (`DELETE /dispositivos/{token}`) y se borran los recordatorios.
- **Sin señal**: la agenda y los guardados se guardan en SQLite (tabla `agenda_cache`) y se muestran con el aviso "Sin conexión".
- **Administración** (`turismo@colon.demo.ar`): en el detalle, botones para suspender, cancelar o volver a programar (`PATCH /eventos/{id}/estado`).


---

## Problemas frecuentes

| Qué pasa | Qué hacer |
|---|---|
| Expo Go dice *"Project is incompatible with this version of Expo Go"* | Instalar Expo Go para SDK 54 desde https://expo.dev/go (ver Requisitos) |
| Cartel rojo *"Android Push notifications ... removed from Expo Go with SDK 53"* | Es solo un aviso de Expo Go sobre las notificaciones push del servidor. Tocar **Dismiss**: las notificaciones locales funcionan igual |
| La app no muestra los cambios | Guardar todos los archivos y reiniciar con `npx expo start -c` |
| El celular no se conecta | Misma wifi, permitir Node.js en el firewall de Windows, o usar `npx expo start --tunnel` |
| `npm` tira `ERESOLVE` al instalar un paquete | `react-native` tiene que estar fijo en `"0.81.5"` (sin `^`) en `package.json` |
| Después de instalar un paquete, la app no lo encuentra | Reiniciar con `npx expo start -c` |

## Notas para probar

- **Aviso de proximidad desde lejos de Colón:** en el Mapa hay un botón con un frasquito que manda el aviso del lugar más cercano. Aparece solo en desarrollo (Expo Go); en el APK no se ve.
- **Mapa en el APK:** en Android, `react-native-maps` necesita una API key de Google Maps en `app.json` para verse en el APK. En Expo Go funciona sin key.
- **Coordenadas:** son las que manda la API de la cátedra, que son aproximadas.
- **Recordatorio de un evento sin esperar:** guardá un evento que empiece en poco más de 1 hora (o bajá `MINUTOS_ANTES` en `src/servicios/recordatorios.ts` solo para probar).
- **Push del servidor:** no andan en Expo Go para Android; hace falta un development build o el APK. Además necesitan el `projectId` de EAS en `app.json` (`npx eas-cli init`) y el backend de `/dispositivos` completo.
