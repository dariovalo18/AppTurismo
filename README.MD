# Mi Ciudad Colón · Guía turística

App móvil para el turista que visita Colón (Entre Ríos): lugares, mapa con lo que tenés cerca, agenda de eventos, tu recorrido y audioguías. Funciona sin señal con la información que ya se descargó.

Trabajo Final Integrador de **Desarrollo para Móviles** — Tecnicatura Universitaria en Desarrollo Web, UNER.

## Integrantes

| | Integrante | Qué hizo |
|---|---|---|
| 1 | **Dario Gabriel Arias** | La base de la app: login con huella, sesión y tema claro/oscuro. El listado de lugares con búsqueda y filtro, el detalle de cada lugar y el "abierto ahora". Que todo ande sin señal (guarda el catálogo en el celu con SQLite). El build del APK y la parte de push del servidor |
| 2 | **Andres Agustin Garcia** | Todo lo de ubicación y mapa: el mapa con los pines por categoría y sus filtros, el Inicio con "Cerca tuyo", la distancia a cada lugar, la flecha que apunta al lugar (con la brújula del celu), el botón "Cómo llegar", el aviso cuando pasás cerca de un lugar y la descarga de audioguías para escucharlas sin señal |
| 3 | **Valentin Suarez** | La agenda: eventos por día, el detalle de cada evento, guardarlos, el recordatorio antes de que empiecen, los estados (suspendido, cancelado, finalizado) y registrar el celu para recibir push |
| 4 | **Daniel Clementin** | Mi recorrido: registrar una visita escaneando el QR del cartel, por GPS o a mano, con foto y nota. Si no hay señal, la visita queda guardada en el celu y se sube sola cuando vuelve internet. Vibra al registrar |
| 5 | **Nicolas Ibarra** | La cuenta: registrarse, elegir tus intereses y editar el perfil y las preferencias. Los favoritos (el corazoncito) y el reproductor de audioguías (pausa, adelantar, sigue sonando con la pantalla apagada) |

## Tecnologías

React Native con **Expo SDK 54**, TypeScript y Expo Router. La API es la de la cátedra (`api-mi-ciudad`).

- **API publicada:** https://entrerios.voipgroup.com
- **Documentación de la API:** https://entrerios.voipgroup.com/docs

---

## Instalar la app (APK)

La app se instala como un **APK**, que es el instalador de las apps de Android. No hace falta Play Store, ni la compu, ni Expo Go: se instala y anda sola. No está publicada en ninguna tienda.

**El archivo del APK se entrega en el Campus Virtual**, junto con este código.

### Paso a paso

1. **Pasá el archivo `.apk` al celular** (Android): podés descargarlo del Campus directamente desde el celu, o mandártelo por WhatsApp, Drive o cable USB.
2. **Abrí el archivo** desde la carpeta *Descargas* (o desde donde lo hayas guardado).
3. Si el celu dice que no deja instalar apps de **origen desconocido**, tocá **Configuración** → activá **Permitir de esta fuente** → volvé atrás.
4. Tocá **Instalar**.
5. Si salta **Google Play Protect** diciendo que la app es desconocida, es normal porque no viene de Play Store. Tocá **Más detalles → Instalar de todas formas**.
   - Si no aparece esa opción: Play Store → tu foto de perfil → **Play Protect** → ⚙ → desactivá **Analizar apps con Play Protect**, instalá la app y después volvé a activarlo.
6. Si dice **"App no instalada"**, desinstalá cualquier versión anterior de *Mi Ciudad Colón* y probá de nuevo.

### La primera vez que la abrís

- **Abrila con internet**: así baja los lugares y los guarda en el celu. Después anda aunque no tengas señal.
- Entrá con un usuario de prueba (ver más abajo) o tocá **Continuar sin cuenta** para mirar sin registrarte.
- Te va a pedir algunos permisos. Podés decir que no a cualquiera y la app sigue andando, solo que sin esa parte:

| Permiso | Para qué |
|---|---|
| Ubicación | Ver a qué distancia está cada lugar, "Cerca tuyo" y el aviso cuando pasás cerca de algo |
| Notificaciones | Recordatorios de eventos, avisos de eventos suspendidos y el aviso de proximidad |
| Cámara | Escanear el QR de los carteles y sacar fotos de tus visitas |
| Fotos | Elegir una foto de la galería para tu recorrido |
| Huella / rostro | Entrar rápido sin escribir la contraseña |

> **iPhone:** el APK es solo para Android. En iPhone se prueba con Expo Go (ver "Cómo ejecutarla").

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
  evento/[id].tsx     Detalle de un evento
  visita/             Registrar una visita (QR, GPS o a mano)
  login.tsx, registro.tsx, intereses.tsx
src/
  componentes/        Componentes reutilizables
  hooks/              useUbicacion, useCatalogo, useRumbo
  servicios/          Llamadas a la API, caché offline, notificaciones, push, visitas, audioguías
  db/                 Base SQLite local
  tipos/              Tipos del PDF (no se modifican)
  utilidades/         Horarios, fechas, distancias, QR, cómo llegar
```

---

## Problemas frecuentes

| Qué pasa | Qué hacer |
|---|---|
| Play Protect no deja instalar el APK | Ver el paso 5 de "Instalar la app (APK)" |
| Expo Go dice *"Project is incompatible with this version of Expo Go"* | Instalar Expo Go para SDK 54 desde https://expo.dev/go (ver Requisitos) |
| Cartel rojo *"Android Push notifications ... removed from Expo Go with SDK 53"* | Es solo un aviso de Expo Go sobre las notificaciones push del servidor. Tocar **Dismiss**: las notificaciones locales funcionan igual |
| La app no muestra los cambios | Guardar todos los archivos y reiniciar con `npx expo start -c` |
| El celular no se conecta | Misma wifi, permitir Node.js en el firewall de Windows, o usar `npx expo start --tunnel` |
| `npm` tira `ERESOLVE` al instalar un paquete | `react-native` tiene que estar fijo en `"0.81.5"` (sin `^`) en `package.json` |
| Después de instalar un paquete, la app no lo encuentra | Reiniciar con `npx expo start -c` |

## Notas para probar

- **Aviso de proximidad desde lejos de Colón:** en el Mapa hay un botón con un frasquito que manda el aviso del lugar más cercano. Aparece solo en desarrollo (Expo Go); en el APK no se ve.
- **Push del servidor:** en Expo Go para Android no funcionan; se prueban con el APK. Para probarlas, entrar con `turismo@colon.demo.ar` y suspender un evento que otra cuenta tenga guardado.
- **Coordenadas:** son las que manda la API de la cátedra, que son aproximadas.