import { obtenerBD } from '@/db/baseDatos';
import type { Evento } from '@/tipos';

// Copia de la agenda en el teléfono, para seguir viéndola sin señal.
// Usa la misma base SQLite que el catálogo (src/db/baseDatos.ts), con una tabla propia.
// Cada fila guarda una lista de eventos como texto JSON, con una clave:
//   'dia:2026-11-14'  -> los eventos de ese día
//   'guardados'       -> mis eventos guardados
//   'evento:evt-017'  -> el detalle de un evento

export type Copia<T> = { datos: T; guardadoEn: string };

let tablaLista: Promise<void> | null = null;

// La tabla se crea la primera vez que se usa (así no hace falta tocar baseDatos.ts).
async function bd() {
  const db = await obtenerBD();
  if (!tablaLista) {
    tablaLista = db.execAsync(`
      CREATE TABLE IF NOT EXISTS agenda_cache (
        clave TEXT PRIMARY KEY NOT NULL,
        json TEXT NOT NULL,
        guardadoEn TEXT NOT NULL
      );
    `);
  }
  await tablaLista;
  return db;
}

async function guardar(clave: string, datos: unknown) {
  const db = await bd();
  await db.runAsync(
    'INSERT OR REPLACE INTO agenda_cache (clave, json, guardadoEn) VALUES (?, ?, ?)',
    clave,
    JSON.stringify(datos),
    new Date().toISOString(),
  );
}

async function leer<T>(clave: string): Promise<Copia<T> | null> {
  const db = await bd();
  const fila = await db.getFirstAsync<{ json: string; guardadoEn: string }>(
    'SELECT json, guardadoEn FROM agenda_cache WHERE clave = ?',
    clave,
  );
  return fila ? { datos: JSON.parse(fila.json) as T, guardadoEn: fila.guardadoEn } : null;
}

export const guardarEventosDelDia = (fecha: string, eventos: Evento[]) => guardar(`dia:${fecha}`, eventos);
export const leerEventosDelDia = (fecha: string) => leer<Evento[]>(`dia:${fecha}`);

export const guardarEventosGuardados = (eventos: Evento[]) => guardar('guardados', eventos);
export const leerEventosGuardados = () => leer<Evento[]>('guardados');

export const guardarEvento = (evento: Evento) => guardar(`evento:${evento.id}`, evento);
export const leerEvento = (id: string) => leer<Evento>(`evento:${id}`);

// Al cerrar sesión: los guardados son de esa persona, no tienen que quedar en el teléfono.
export async function borrarEventosGuardados() {
  const db = await bd();
  await db.runAsync("DELETE FROM agenda_cache WHERE clave = 'guardados'");
}
