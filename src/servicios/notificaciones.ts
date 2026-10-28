import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configuración común de las notificaciones de la app (la usan la Persona 2 y la Persona 3).
// Docs: https://docs.expo.dev/versions/latest/sdk/notifications/

// En Android cada tipo de aviso va en un "canal": la persona puede silenciar uno sin silenciar los otros.
export const CANAL_PROXIMIDAD = 'proximidad';

// Se llama una sola vez, al arrancar la app (en app/_layout.tsx).
export function configurarNotificaciones() {
  // Sin esto, una notificación que llega con la app abierta no se muestra.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, // el cartelito que baja de arriba
      shouldShowList: true, // que quede en la lista de notificaciones
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CANAL_PROXIMIDAD, {
      name: 'Lugares cercanos',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

// true si podemos mandar notificaciones. Si todavía no se preguntó, pregunta.
export async function tenerPermisoNotificaciones(): Promise<boolean> {
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  if (!actual.canAskAgain) return false; // dijo que no y no se puede volver a preguntar
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}