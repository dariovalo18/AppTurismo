import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Storage from 'expo-sqlite/kv-store';

import { useSesion } from '@/proveedores/ProveedorSesion';
import { listarLugares } from '@/servicios/lugares';
import { CANAL_PROXIMIDAD, tenerPermisoNotificaciones } from '@/servicios/notificaciones';
import type { Coordenadas, Lugar } from '@/tipos';
import { distanciaMetros, formatearDistancia } from '@/utilidades/distancia';

// Radio si no hay cuenta (invitado). Con cuenta se usa el de sus preferencias (100, 250 o 500).
const RADIO_POR_DEFECTO_METROS = 250;
// Además de "uno por lugar y por día", un mínimo entre avisos: el PDF no quiere
// "doce avisos en cinco cuadras".
const MINUTOS_ENTRE_AVISOS = 10;
// Cada cuánto se vuelve a mirar si ya hay permiso de ubicación (por si lo da más tarde en el mapa).
const SEGUNDOS_ENTRE_INTENTOS = 15;

// Dónde se anota qué se avisó (kv-store: es una preferencia del teléfono, no un secreto).
const CLAVE_AVISOS = 'miciudad_avisos_proximidad';
type RegistroAvisos = {
  porLugar: Record<string, string>; // { 'lug-004': '2026-10-27' } = ese día ya se avisó
  ultimo: number; // momento del último aviso (milisegundos)
};

// Fecha de hoy en la hora del teléfono: "2026-10-27".
function fechaHoy() {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

async function leerRegistro(): Promise<RegistroAvisos> {
  try {
    const texto = await Storage.getItem(CLAVE_AVISOS);
    if (texto) return JSON.parse(texto) as RegistroAvisos;
  } catch {
    // Si está roto, arrancamos de cero.
  }
  return { porLugar: {}, ultimo: 0 };
}

type OpcionesAviso = {
  radio: number; // metros
  // true: uno por lugar y por día, y 10 minutos entre avisos (uso normal).
  // false: avisa igual (lo usa el botón de prueba del mapa).
  respetarLimites: boolean;
};

// Busca el lugar más cercano dentro del radio y manda la notificación.
// Devuelve true si avisó. La usan el vigilante (uso normal) y el botón de prueba del mapa.
export async function avisarLugarMasCercano(
  posicion: Coordenadas,
  lugares: Lugar[],
  { radio, respetarLimites }: OpcionesAviso,
): Promise<boolean> {
  const registro = await leerRegistro();
  if (respetarLimites && Date.now() - registro.ultimo < MINUTOS_ENTRE_AVISOS * 60 * 1000) return false;

  const hoy = fechaHoy();
  // Lugares dentro del radio (y, si hay que respetar límites, no avisados hoy), del más cerca al más lejos.
  const candidatos = lugares
    .map((lugar) => ({ lugar, metros: distanciaMetros(posicion, lugar.coordenadas) }))
    .filter(({ lugar, metros }) => metros <= radio && (!respetarLimites || registro.porLugar[lugar.id] !== hoy))
    .sort((a, b) => a.metros - b.metros);

  const masCerca = candidatos[0];
  if (!masCerca) return false;
  // El permiso de notificaciones se pide recién acá, cuando hay algo para avisar.
  if (!(await tenerPermisoNotificaciones())) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Estás cerca de ${masCerca.lugar.nombre}`,
      body: `A ${formatearDistancia(masCerca.metros)}. ${masCerca.lugar.descripcionCorta}`,
      data: { tipo: 'proximidad', lugarId: masCerca.lugar.id },
    },
    trigger: { channelId: CANAL_PROXIMIDAD }, // ya mismo, en el canal de proximidad
  });

  // Las pruebas no cuentan: así no bloquean los avisos de verdad.
  if (respetarLimites) {
    registro.porLugar[masCerca.lugar.id] = hoy;
    registro.ultimo = Date.now();
    await Storage.setItem(CLAVE_AVISOS, JSON.stringify(registro));
  }
  return true;
}

// Aviso de proximidad (PDF: "un aviso por lugar y por día es más que suficiente").
// Funciona mientras la app está abierta. No dibuja nada: va montado en app/(tabs)/_layout.tsx.
export function VigilanteProximidad() {
  const { usuario } = useSesion();
  // Con cuenta se respetan sus preferencias; sin cuenta, avisa con el radio por defecto.
  const activo = usuario ? usuario.preferencias.avisarProximidad : true;
  const radio = usuario?.preferencias.radioAvisoMetros ?? RADIO_POR_DEFECTO_METROS;

  const lugares = useRef<Lugar[]>([]);
  const revisando = useRef(false); // para no revisar dos veces al mismo tiempo

  // Los lugares se piden una vez (sin señal vienen de la copia guardada).
  useEffect(() => {
    listarLugares()
      .then((lista) => (lugares.current = lista))
      .catch(() => {});
  }, []);

  // Al tocar la notificación, se abre el detalle del lugar.
  useEffect(() => {
    const suscripcion = Notifications.addNotificationResponseReceivedListener((respuesta) => {
      const datos = respuesta.notification.request.content.data;
      if (datos?.tipo === 'proximidad' && typeof datos.lugarId === 'string') {
        router.push({ pathname: '/lugar/[id]', params: { id: datos.lugarId } });
      }
    });
    return () => suscripcion.remove();
  }, []);

  // Seguimiento de la ubicación mientras la app está abierta.
  useEffect(() => {
    if (!activo) return;

    let seguimiento: Location.LocationSubscription | null = null;
    let cancelado = false;

    // Se llama cada vez que la persona se mueve.
    const revisar = async (posicion: Coordenadas) => {
      if (revisando.current) return;
      revisando.current = true;
      try {
        await avisarLugarMasCercano(posicion, lugares.current, { radio, respetarLimites: true });
      } catch {
        // Un aviso que falla no puede romper la app.
      } finally {
        revisando.current = false;
      }
    };

    // Arranca el seguimiento solo si ya hay permiso de ubicación (acá no se pide: lo pide el mapa).
    const intentarSeguir = async () => {
      if (seguimiento || cancelado) return;
      const permiso = await Location.getForegroundPermissionsAsync();
      if (!permiso.granted) return;
      const nuevo = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 25, timeInterval: 10000 },
        (pos) => revisar({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }),
      );
      if (cancelado) nuevo.remove();
      else seguimiento = nuevo;
    };

    intentarSeguir().catch(() => {});
    const reintento = setInterval(() => intentarSeguir().catch(() => {}), SEGUNDOS_ENTRE_INTENTOS * 1000);

    return () => {
      cancelado = true;
      clearInterval(reintento);
      seguimiento?.remove();
    };
  }, [activo, radio]);

  return null;
}