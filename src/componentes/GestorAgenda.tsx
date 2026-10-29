import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { useSesion } from '@/proveedores/ProveedorSesion';
import { alEntrarConCuenta } from '@/servicios/agendaCuenta';

// Última notificación abierta, para no abrir dos veces el mismo detalle.
let ultimaAbierta: string | null = null;

// Abre el detalle del evento si la notificación es de la agenda (recordatorio local o push del servidor).
function abrirSiEsEvento(respuesta: Notifications.NotificationResponse | null) {
  if (!respuesta) return;
  const { identifier, content } = respuesta.notification.request;
  if (identifier === ultimaAbierta) return;
  const datos = content.data;
  if (datos && typeof datos.eventoId === 'string') {
    ultimaAbierta = identifier;
    router.push({ pathname: '/evento/[id]', params: { id: datos.eventoId } });
  }
}

// No dibuja nada. Va montado en app/(tabs)/_layout.tsx, al lado del VigilanteProximidad.
// 1. Cuando hay sesión: registra el teléfono para push y sincroniza los recordatorios.
// 2. Al tocar una notificación de un evento: abre su detalle.
export function GestorAgenda() {
  const { modo, usuario } = useSesion();
  const ultimoUsuario = useRef<string | null>(null);

  useEffect(() => {
    if (modo !== 'sesion' || !usuario) {
      ultimoUsuario.current = null;
      return;
    }
    if (ultimoUsuario.current === usuario.id) return; // ya se hizo para esta cuenta
    ultimoUsuario.current = usuario.id;
    alEntrarConCuenta();
  }, [modo, usuario]);

  useEffect(() => {
    // Si la app estaba cerrada y se abrió tocando la notificación.
    // Después se borra, para que no vuelva a abrirse la próxima vez que se abra la app.
    Notifications.getLastNotificationResponseAsync()
      .then((respuesta) => {
        abrirSiEsEvento(respuesta);
        if (respuesta) return Notifications.clearLastNotificationResponseAsync();
      })
      .catch(() => {});
    // Si la app ya estaba abierta o en segundo plano.
    const suscripcion = Notifications.addNotificationResponseReceivedListener(abrirSiEsEvento);
    return () => suscripcion.remove();
  }, []);

  return null;
}
