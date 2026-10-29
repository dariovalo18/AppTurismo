import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Storage from 'expo-sqlite/kv-store';

import type { Evento } from '@/tipos';
import { tenerPermisoNotificaciones } from './notificaciones';

// Recordatorios de los eventos guardados (notificaciones LOCALES: las programa el propio
// teléfono, andan sin señal y también en Expo Go).
// Docs: https://docs.expo.dev/versions/latest/sdk/notifications/

// Cuánto antes de que empiece el evento se avisa.
// Cuánto antes de que empiece el evento se avisa.
export const MINUTOS_ANTES = 60;

// Canal de Android propio: la persona puede silenciar la agenda sin silenciar los avisos de proximidad.
export const CANAL_EVENTOS = 'eventos';

// En kv-store (no es un secreto) anotamos, por evento guardado, qué notificación le programamos
// y cómo estaba la última vez que lo vimos. Así podemos:
//  - cancelar el recordatorio al dejar de guardarlo,
//  - darnos cuenta si se suspendió, se canceló o cambió de horario.
const CLAVE = 'miciudad_recordatorios_eventos';
type Anotado = {
  notifId: string | null; // null = no hay recordatorio programado (ya pasó, o no está programado)
  titulo: string;
  inicio: string;
  estado: Evento['estado'];
};
type Registro = Record<string, Anotado>;

async function leer(): Promise<Registro> {
  try {
    const texto = await Storage.getItem(CLAVE);
    if (texto) return JSON.parse(texto) as Registro;
  } catch {
    // Si está roto, arrancamos de cero.
  }
  return {};
}

const escribir = (registro: Registro) => Storage.setItem(CLAVE, JSON.stringify(registro));

// Las funciones de abajo leen y escriben el mismo registro: se ejecutan de a una para no pisarse.
let cola: Promise<unknown> = Promise.resolve();
function enCola<T>(tarea: () => Promise<T>): Promise<T> {
  const resultado = cola.then(tarea, tarea);
  cola = resultado.catch(() => {});
  return resultado;
}

let canalListo = false;
async function prepararCanal() {
  if (canalListo || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_EVENTOS, {
    name: 'Eventos guardados',
    importance: Notifications.AndroidImportance.HIGH,
  });
  canalListo = true;
}

async function cancelar(notifId: string | null) {
  if (notifId) await Notifications.cancelScheduledNotificationAsync(notifId).catch(() => {});
}

// Programa el aviso MINUTOS_ANTES del inicio. Devuelve el id de la notificación, o null si no corresponde.
async function programar(evento: Evento): Promise<string | null> {
  console.log('[Recordatorio] estado:', evento.estado, 'inicio:', evento.inicio);
  if (evento.estado !== 'programado') return null;
  const cuando = new Date(new Date(evento.inicio).getTime() - MINUTOS_ANTES * 60 * 1000);
  console.log('[Recordatorio] aviso para:', cuando.toString(), '| ahora:', new Date().toString());
  if (cuando.getTime() <= Date.now()) {
    console.log('[Recordatorio] NO: la hora del aviso ya pasó');
    return null;
  }
  if (!(await tenerPermisoNotificaciones())) {
    console.log('[Recordatorio] NO: sin permiso de notificaciones');
    return null;
  }
  await prepararCanal().catch(() => {});

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `En 1 hora: ${evento.titulo}`,
      body: 'Tocá para ver dónde es.',
      data: { tipo: 'evento', eventoId: evento.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: cuando, channelId: CANAL_EVENTOS },
  });
  console.log('[Recordatorio] programado OK, id:', id);
  return id;
}

// Aviso inmediato cuando un evento guardado cambió de estado.
async function avisarCambio(evento: Evento) {
  const textos: Partial<Record<Evento['estado'], string>> = {
    suspendido: 'Se suspendió',
    cancelado: 'Se canceló',
    programado: 'Vuelve a estar programado',
  };
  const texto = textos[evento.estado];
  if (!texto || !(await tenerPermisoNotificaciones())) return;
  await prepararCanal().catch(() => {});
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${texto}: ${evento.titulo}`,
      body: 'Tocá para ver el detalle.',
      data: { tipo: 'evento', eventoId: evento.id },
    },
    trigger: { channelId: CANAL_EVENTOS }, // ya mismo
  });
}

// Al guardar un evento.
export function programarRecordatorio(evento: Evento) {
  return enCola(async () => {
    const registro = await leer();
    await cancelar(registro[evento.id]?.notifId ?? null);
    const notifId = await programar(evento);
    registro[evento.id] = { notifId, titulo: evento.titulo, inicio: evento.inicio, estado: evento.estado };
    await escribir(registro);
  });
}

// Al dejar de guardar un evento.
export function quitarRecordatorio(eventoId: string) {
  return enCola(async () => {
    const registro = await leer();
    await cancelar(registro[eventoId]?.notifId ?? null);
    delete registro[eventoId];
    await escribir(registro);
  });
}

// Se llama con la lista fresca de GET /yo/eventos-guardados (al iniciar sesión y al abrir la agenda).
// - Evento nuevo en la lista (por ejemplo, guardado desde otro teléfono): le programa el aviso.
// - Cambió el estado: avisa ("Se suspendió: ...") y programa o cancela el recordatorio.
// - Cambió el horario: reprograma el recordatorio.
// - Ya no está en la lista: cancela su recordatorio.
export function sincronizarRecordatorios(guardados: Evento[]) {
  return enCola(async () => {
    const anterior = await leer();
    const nuevo: Registro = {};

    for (const evento of guardados) {
      const visto = anterior[evento.id];
      let notifId = visto?.notifId ?? null;

      if (visto && visto.estado !== evento.estado) await avisarCambio(evento).catch(() => {});

      const hayQueReprogramar =
        !visto || visto.estado !== evento.estado || visto.inicio !== evento.inicio || (notifId === null && evento.estado === 'programado');
      if (hayQueReprogramar) {
        await cancelar(notifId);
        notifId = await programar(evento).catch(() => null);
      }
      nuevo[evento.id] = { notifId, titulo: evento.titulo, inicio: evento.inicio, estado: evento.estado };
    }

    for (const [id, visto] of Object.entries(anterior)) {
      if (!nuevo[id]) await cancelar(visto.notifId);
    }
    await escribir(nuevo);
  });
}

// Al cerrar sesión: los recordatorios son de esa cuenta.
export function borrarTodosLosRecordatorios() {
  return enCola(async () => {
    const registro = await leer();
    for (const visto of Object.values(registro)) await cancelar(visto.notifId);
    await Storage.removeItem(CLAVE);
  });
}