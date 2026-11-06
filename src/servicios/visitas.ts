import { Directory, File, Paths } from 'expo-file-system';
import * as Network from 'expo-network';

import { obtenerBD } from '@/db/baseDatos';
import type { OrigenVisita, RespuestaExito, Visita } from '@/tipos';
import { leerToken } from './almacenSesion';
import { clienteApi } from './clienteApi';
import { ErrorApi } from './errores';

// ─────────────────────────────────────────────────────────────────────────────
// Servicio de visitas (Persona 4).
// Idea: la visita SIEMPRE se guarda primero en el teléfono (SQLite) con sincronizada = false.
// Después, si hay señal, se sube: primero la foto (POST /archivos) y después la visita
// (POST /yo/visitas) mandando la url de la foto. Si no hay señal, queda en la cola y se
// reintenta cuando vuelve la conexión.
// El servidor es idempotente por id: si reintentamos una visita que ya subió, no la duplica.
// ─────────────────────────────────────────────────────────────────────────────

export const LARGO_MAX_NOTA = 280;

// Una visita tal como se muestra en el recorrido: la del PDF + la url de la foto ya subida.
export type VisitaRecorrido = Visita & { fotoUrl: string | null };

// Fila cruda de la tabla (SQLite no tiene booleanos: sincronizada es 0 o 1).
type FilaVisita = {
  id: string;
  usuarioId: string;
  lugarId: string;
  fechaHora: string;
  origen: OrigenVisita;
  fotoUri: string | null;
  fotoUrl: string | null;
  nota: string | null;
  sincronizada: number;
};

const aVisita = (f: FilaVisita): VisitaRecorrido => ({
  id: f.id,
  usuarioId: f.usuarioId,
  lugarId: f.lugarId,
  fechaHora: f.fechaHora,
  origen: f.origen,
  fotoUri: f.fotoUri,
  fotoUrl: f.fotoUrl,
  nota: f.nota,
  sincronizada: f.sincronizada === 1,
});

// Mismo criterio de "hay señal" que usa servicios/lugares.ts.
async function haySenal() {
  const estado = await Network.getNetworkStateAsync();
  return estado.isConnected !== false && estado.isInternetReachable !== false;
}

// El token está en secure-store. clienteApi no lo agrega solo, así que lo mandamos en cada pedido.
async function cabeceraSesion() {
  const token = await leerToken();
  if (!token) throw new ErrorApi('NO_AUTENTICADO', 'Tenés que ingresar con tu cuenta para hacer esto.');
  return { Authorization: `Bearer ${token}` };
}

// ─── Guardar la visita en el teléfono ────────────────────────────────────────

// La foto que devuelve la cámara/galería vive en una carpeta temporal que el sistema puede borrar.
// La copiamos a la carpeta de documentos de la app (API nueva de expo-file-system: File, Directory, Paths).
function copiarFoto(id: string, uriOrigen: string): string {
  const carpeta = new Directory(Paths.document, 'visitas');
  if (!carpeta.exists) carpeta.create({ intermediates: true });

  const extension =
    /\.(jpe?g|png|heic|webp)$/i.exec(uriOrigen.split('?')[0])?.[1]?.toLowerCase() ?? 'jpg';
  const destino = new File(carpeta, `${id}.${extension}`);
  new File(uriOrigen).copy(destino);
  return destino.uri;
}

type DatosVisita = {
  usuarioId: string;
  lugarId: string;
  origen: OrigenVisita;
  fotoOrigen: string | null; // uri que devolvió la cámara o la galería
  nota: string | null;
};

export async function registrarVisita(datos: DatosVisita): Promise<VisitaRecorrido> {
  // El id lo ponemos nosotros (cadena de texto, como pide el PRD). El servidor lo usa para no duplicar.
  const id = `vis-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const fotoUri = datos.fotoOrigen ? copiarFoto(id, datos.fotoOrigen) : null;
  const nota = datos.nota?.trim().slice(0, LARGO_MAX_NOTA) || null;
  const fechaHora = new Date().toISOString(); // ISO 8601 con zona (termina en Z), como pide el PRD

  const db = await obtenerBD();
  await db.runAsync(
    `INSERT INTO visitas (id, usuarioId, lugarId, fechaHora, origen, fotoUri, nota, sincronizada)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    id,
    datos.usuarioId,
    datos.lugarId,
    fechaHora,
    datos.origen,
    fotoUri,
    nota,
  );

  // Intento de subida en segundo plano: si falla o no hay señal, queda en la cola.
  sincronizarPendientes(datos.usuarioId).catch(() => {});

  return aVisita({
    id,
    usuarioId: datos.usuarioId,
    lugarId: datos.lugarId,
    fechaHora,
    origen: datos.origen,
    fotoUri,
    fotoUrl: null,
    nota,
    sincronizada: 0,
  });
}

// ─── Leer el recorrido (funciona sin señal: lee de SQLite) ───────────────────

// En orden: de la primera visita a la última (es un "recorrido").
export async function listarRecorrido(usuarioId: string): Promise<VisitaRecorrido[]> {
  const db = await obtenerBD();
  const filas = await db.getAllAsync<FilaVisita>(
    'SELECT * FROM visitas WHERE usuarioId = ? ORDER BY fechaHora ASC',
    usuarioId,
  );
  return filas.map(aVisita);
}

// ─── Subir lo pendiente ──────────────────────────────────────────────────────

// POST /archivos: multipart/form-data con el campo "archivo". Devuelve { datos: { url } }.
async function subirFoto(uriLocal: string, headers: Record<string, string>): Promise<string> {
  const archivo = new File(uriLocal);
  const formulario = new FormData();
  formulario.append('archivo', {
    uri: archivo.uri,
    name: archivo.name,
    type: archivo.type || 'image/jpeg',
  } as unknown as Blob);

  const { data } = await clienteApi.post<RespuestaExito<{ url: string }>>('/archivos', formulario, {
    headers: { ...headers, 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // una foto tarda más que un pedido normal
  });
  if (!data.datos?.url) throw new ErrorApi('RESPUESTA_INVALIDA', 'El servidor no devolvió la url de la foto.');
  return data.datos.url;
}

// Si ya hay una subida en curso, se reutiliza: así dos pantallas no suben la misma visita dos veces.
let enCurso: Promise<number> | null = null;

// Sube todas las visitas pendientes del usuario. Devuelve cuántas subió.
export function sincronizarPendientes(usuarioId: string): Promise<number> {
  if (!enCurso) {
    enCurso = ejecutarSincronizacion(usuarioId).finally(() => {
      enCurso = null;
    });
  }
  return enCurso;
}

async function ejecutarSincronizacion(usuarioId: string): Promise<number> {
  if (!(await haySenal())) return 0;

  const db = await obtenerBD();
  // Solo las del usuario actual: si no, se subirían a la cuenta equivocada (el token es de quien está logueado).
  const pendientes = await db.getAllAsync<FilaVisita>(
    'SELECT * FROM visitas WHERE sincronizada = 0 AND usuarioId = ? ORDER BY fechaHora ASC',
    usuarioId,
  );

  let subidas = 0;
  for (const fila of pendientes) {
    try {
      const headers = await cabeceraSesion();

      // 1) La foto primero. Se guarda la url apenas se sube, así si falla el paso 2 no se re-sube.
      let fotoUrl = fila.fotoUrl;
      if (fila.fotoUri && !fotoUrl) {
        try {
          fotoUrl = await subirFoto(fila.fotoUri, headers);
          await db.runAsync('UPDATE visitas SET fotoUrl = ? WHERE id = ?', fotoUrl, fila.id);
        } catch (e) {
          // Foto de más de 5 MB o de un formato que la API no acepta: la visita se sube igual, sin foto.
          // En el teléfono la foto se sigue viendo.
          const noSirve =
            e instanceof ErrorApi &&
            (e.codigo === 'ARCHIVO_DEMASIADO_GRANDE' || e.codigo === 'TIPO_DE_ARCHIVO_NO_PERMITIDO');
          if (!noSirve) throw e;
          fotoUrl = null;
        }
      }

      // 2) La visita, con la url de la foto. Es idempotente por id: reintentar no duplica.
      await clienteApi.post<RespuestaExito<Visita>>(
        '/yo/visitas',
        {
          id: fila.id,
          lugarId: fila.lugarId,
          fechaHora: fila.fechaHora,
          origen: fila.origen,
          fotoUri: fotoUrl,
          nota: fila.nota,
          sincronizada: true, // la API lo ignora
        },
        { headers },
      );

      await db.runAsync('UPDATE visitas SET sincronizada = 1 WHERE id = ?', fila.id);
      subidas++;
    } catch (e) {
      if (e instanceof ErrorApi) {
        // Se cayó la señal o no hay sesión: cortamos y reintentamos más tarde.
        if (e.codigo === 'SIN_RED' || e.codigo === 'NO_AUTENTICADO') break;
        // La url guardada de la foto ya no sirve para el servidor: se vuelve a subir en el próximo intento.
        if (e.codigo === 'ARCHIVO_NO_SUBIDO') {
          await db.runAsync('UPDATE visitas SET fotoUrl = NULL WHERE id = ?', fila.id);
        }
      }
      // Cualquier otro error: esta visita queda pendiente y seguimos con la siguiente.
    }
  }
  return subidas;
}

// ─── Traer lo que ya estaba en el servidor (cambio de teléfono) ──────────────

// GET /yo/visitas (ya viene en orden). Si la visita ya existe en el teléfono (mismo id), no se duplica:
// solo se la marca como sincronizada.
export async function traerVisitasDelServidor(usuarioId: string): Promise<void> {
  if (!(await haySenal())) return;

  try {
    const headers = await cabeceraSesion();
    const { data } = await clienteApi.get<RespuestaExito<Visita[]>>('/yo/visitas', {
      params: { porPagina: 500 },
      headers,
    });

    const db = await obtenerBD();
    await db.withExclusiveTransactionAsync(async (tx) => {
      for (const v of data.datos) {
        await tx.runAsync(
          `INSERT INTO visitas (id, usuarioId, lugarId, fechaHora, origen, fotoUri, fotoUrl, nota, sincronizada)
           VALUES (?, ?, ?, ?, ?, NULL, ?, ?, 1)
           ON CONFLICT(id) DO UPDATE SET
             sincronizada = 1,
             fotoUrl = COALESCE(excluded.fotoUrl, visitas.fotoUrl)`,
          v.id,
          usuarioId,
          v.lugarId,
          v.fechaHora,
          v.origen,
          v.fotoUri, // del servidor la foto viene como url
          v.nota,
        );
      }
    });
  } catch {
    // Sin conexión o error del servidor: seguimos mostrando lo que hay en el teléfono.
  }
}
