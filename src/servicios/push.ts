import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import Storage from 'expo-sqlite/kv-store';

import { leerToken } from './almacenSesion';
import { clienteApi } from './clienteApi';
import { tenerPermisoNotificaciones } from './notificaciones';

// Notificaciones PUSH: las manda el servidor (por ejemplo, cuando se suspende un evento guardado).
// Para eso el teléfono le pasa a la API su "token de Expo" con POST /dispositivos.
// Docs: https://docs.expo.dev/push-notifications/push-notifications-setup/
//
// OJO, cosas que NO son errores de este archivo:
// - En Expo Go para Android las push no existen desde SDK 53: hay que probar con un development build.
// - getExpoPushTokenAsync necesita el projectId de EAS (app.json > extra.eas.projectId, lo agrega `eas init`).
// - Mientras el backend no esté completo, POST /dispositivos responde 501 NO_IMPLEMENTADO.
// En todos esos casos se registra en la consola y la app sigue andando.

// Dónde recordamos el token que registramos (no es un secreto: va en kv-store).
const CLAVE_TOKEN_EXPO = 'miciudad_token_expo';

// Pide permiso, obtiene el token de Expo y lo registra en la API. Se llama al entrar con cuenta.
export async function registrarDispositivo(): Promise<void> {
  try {
    if (!Device.isDevice) return; // en un emulador no hay push
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;

    const token = await leerToken();
    if (!token) return; // sin cuenta no se registra nada

    if (!(await tenerPermisoNotificaciones())) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.log('[Push] falta el projectId de EAS en app.json (correr `npx eas-cli init`).');
      return;
    }
    const { data: tokenExpo } = await Notifications.getExpoPushTokenAsync({ projectId });

    // Idempotente: 201 si es nuevo, 200 si ya estaba.
    await clienteApi.post(
      '/dispositivos',
      { tokenExpo, plataforma: Platform.OS },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await Storage.setItem(CLAVE_TOKEN_EXPO, tokenExpo);
    console.log('[Push] teléfono registrado');
  } catch (e) {
    console.log('[Push] no se pudo registrar el teléfono (la app sigue andando):', e);
  }
}

// DELETE /dispositivos/{tokenExpo}: deja de recibir push en este teléfono.
// Hay que llamarlo ANTES de borrar el token de sesión, porque la ruta pide sesión.
export async function darDeBajaDispositivo(): Promise<void> {
  try {
    const tokenExpo = await Storage.getItem(CLAVE_TOKEN_EXPO);
    const token = await leerToken();
    if (tokenExpo && token) {
      await clienteApi.delete(`/dispositivos/${encodeURIComponent(tokenExpo)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (e) {
    console.log('[Push] no se pudo dar de baja el teléfono:', e);
  } finally {
    await Storage.removeItem(CLAVE_TOKEN_EXPO).catch(() => {});
  }
}

// POST /dispositivos/prueba: el servidor manda una push de prueba a mis teléfonos.
// Devuelve a cuántos teléfonos la mandó.
export async function enviarPushDePrueba(): Promise<number> {
  const token = await leerToken();
  const { data } = await clienteApi.post<{ datos: { enviados: number } }>('/dispositivos/prueba', null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.datos.enviados;
}
