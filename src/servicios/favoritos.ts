import * as Network from 'expo-network';

import { obtenerBD } from '@/db/baseDatos';
import type { Favorito, RespuestaExito } from '@/tipos';
import { leerToken } from './almacenSesion';
import { clienteApi } from './clienteApi';
import { ErrorApi } from './errores';

// ─────────────────────────────────────────────────────────────────────────────
// Servicio de favoritos (Persona 5). Rutas de la API:
//   GET    /yo/favoritos             con sesión
//   PUT    /yo/favoritos/{lugarId}   con sesión
//   DELETE /yo/favoritos/{lugarId}   con sesión
// Viven en el servidor para que sigan si la persona cambia de teléfono (PDF).
// Además se guarda una copia en SQLite para verlos sin señal.
// ─────────────────────────────────────────────────────────────────────────────

export type ResultadoFavoritos = {
  favoritos: Favorito[];
  desdeCopia: boolean; // true = sin señal, se muestra lo último que se descargó
};

// Mismo criterio de "hay señal" que usa servicios/lugares.ts.
async function haySenal() {
  const estado = await Network.getNetworkStateAsync();
  return estado.isConnected !== false && estado.isInternetReachable !== false;
}

async function cabeceraSesion() {
  const token = await leerToken();
  if (!token) throw new ErrorApi('NO_AUTENTICADO', 'Ingresá con tu cuenta para guardar favoritos.');
  return { Authorization: `Bearer ${token}` };
}

// ─── Copia en el teléfono ────────────────────────────────────────────────────

// La tabla se crea la primera vez que se usa, en la misma base de la app.
let tablaLista: Promise<void> | null = null;

async function bd() {
  const db = await obtenerBD();
  if (!tablaLista) {
    tablaLista = db.execAsync(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id TEXT PRIMARY KEY NOT NULL,
        usuarioId TEXT NOT NULL,
        lugarId TEXT NOT NULL,
        creadoEn TEXT NOT NULL
      );
    `);
  }
  await tablaLista;
  return db;
}

async function guardarCopia(usuarioId: string, favoritos: Favorito[]) {
  const db = await bd();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync('DELETE FROM favoritos WHERE usuarioId = ?', usuarioId);
    for (const f of favoritos) {
      await tx.runAsync(
        'INSERT OR REPLACE INTO favoritos (id, usuarioId, lugarId, creadoEn) VALUES (?, ?, ?, ?)',
        f.id,
        usuarioId,
        f.lugarId,
        f.creadoEn,
      );
    }
  });
}

async function leerCopia(usuarioId: string): Promise<Favorito[]> {
  const db = await bd();
  return db.getAllAsync<Favorito>(
    'SELECT id, usuarioId, lugarId, creadoEn FROM favoritos WHERE usuarioId = ? ORDER BY creadoEn DESC',
    usuarioId,
  );
}

// ─── Lo que usan las pantallas ───────────────────────────────────────────────

// GET /yo/favoritos, los más nuevos primero. Sin señal devuelve la copia.
export async function listarFavoritos(usuarioId: string): Promise<ResultadoFavoritos> {
  if (!(await haySenal())) return { favoritos: await leerCopia(usuarioId), desdeCopia: true };

  try {
    const { data } = await clienteApi.get<RespuestaExito<Favorito[]>>('/yo/favoritos', {
      params: { porPagina: 100 },
      headers: await cabeceraSesion(),
    });
    const favoritos = [...data.datos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
    await guardarCopia(usuarioId, favoritos).catch(() => {}); // si falla la copia, igual mostramos los datos
    return { favoritos, desdeCopia: false };
  } catch (e) {
    if (e instanceof ErrorApi && e.codigo === 'SIN_RED') {
      return { favoritos: await leerCopia(usuarioId), desdeCopia: true };
    }
    throw e;
  }
}

// PUT /yo/favoritos/{lugarId}. Si ya estaba, no se duplica.
export async function agregarFavorito(usuarioId: string, lugarId: string): Promise<Favorito> {
  const { data } = await clienteApi.put<RespuestaExito<Favorito>>(
    `/yo/favoritos/${encodeURIComponent(lugarId)}`,
    null,
    { headers: await cabeceraSesion() },
  );
  const db = await bd();
  await db.runAsync(
    'INSERT OR REPLACE INTO favoritos (id, usuarioId, lugarId, creadoEn) VALUES (?, ?, ?, ?)',
    data.datos.id,
    usuarioId,
    lugarId,
    data.datos.creadoEn,
  );
  return data.datos;
}

// DELETE /yo/favoritos/{lugarId}
export async function quitarFavorito(usuarioId: string, lugarId: string): Promise<void> {
  await clienteApi.delete(`/yo/favoritos/${encodeURIComponent(lugarId)}`, {
    headers: await cabeceraSesion(),
  });
  const db = await bd();
  await db.runAsync('DELETE FROM favoritos WHERE usuarioId = ? AND lugarId = ?', usuarioId, lugarId);
}