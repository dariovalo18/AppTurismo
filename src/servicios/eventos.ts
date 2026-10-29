import * as Network from 'expo-network';

import type { EstadoEvento, Evento, RespuestaExito } from '@/tipos';
import { leerToken } from './almacenSesion';
import * as cache from './cacheEventos';
import { clienteApi } from './clienteApi';
import { ErrorApi } from './errores';

// Agenda de eventos (Persona 3). Rutas de la API (ver /docs, sección "Agenda" y "Eventos guardados"):
//   GET    /eventos?fecha=AAAA-MM-DD          público
//   GET    /eventos/{id}                       público
//   PATCH  /eventos/{id}/estado                admin
//   GET    /yo/eventos-guardados               con sesión
//   PUT    /yo/eventos-guardados/{eventoId}    con sesión
//   DELETE /yo/eventos-guardados/{eventoId}    con sesión

// Lo que devuelven las lecturas: los datos y si salieron de la copia del teléfono.
export type Resultado<T> = {
  datos: T;
  desdeCopia: boolean; // true = sin señal, se muestra lo último que se descargó
  guardadoEn: string | null; // cuándo se guardó esa copia (ISO)
};

async function haySenal() {
  const estado = await Network.getNetworkStateAsync();
  return estado.isConnected !== false && estado.isInternetReachable !== false;
}

// Cabecera Authorization con el token de secure-store. Sin sesión, error claro.
async function cabeceraSesion() {
  const token = await leerToken();
  if (!token) throw new ErrorApi('NO_AUTENTICADO', 'Tenés que ingresar con tu cuenta para hacer esto.');
  return { Authorization: `Bearer ${token}` };
}

// Patrón común: si hay señal pide a la API y guarda la copia; si no hay (o la red se cae),
// devuelve la copia. Si tampoco hay copia, sale el error de la API.
async function conCopia<T>(
  pedirApi: () => Promise<T>,
  guardarCopia: (datos: T) => Promise<void>,
  leerCopia: () => Promise<cache.Copia<T> | null>,
): Promise<Resultado<T>> {
  const usarCopia = async (errorOriginal: unknown) => {
    const copia = await leerCopia().catch(() => null);
    if (copia) return { datos: copia.datos, desdeCopia: true, guardadoEn: copia.guardadoEn };
    throw errorOriginal;
  };

  if (!(await haySenal())) {
    return usarCopia(new ErrorApi('SIN_RED', 'No hay conexión y todavía no descargaste esta información.'));
  }
  try {
    const datos = await pedirApi();
    await guardarCopia(datos).catch(() => {}); // si falla guardar la copia, igual mostramos los datos
    return { datos, desdeCopia: false, guardadoEn: null };
  } catch (e) {
    if (e instanceof ErrorApi && e.codigo === 'SIN_RED') return usarCopia(e);
    throw e;
  }
}

// GET /eventos?fecha=AAAA-MM-DD. La API ya devuelve los del día ordenados por inicio,
// e incluye los que empezaron el día anterior y siguen (una peña de 21 a 02 sale en los dos días).
export function listarEventosDelDia(fecha: string): Promise<Resultado<Evento[]>> {
  return conCopia(
    async () => {
      const { data } = await clienteApi.get<RespuestaExito<Evento[]>>('/eventos', {
        params: { fecha, porPagina: 100 },
      });
      return data.datos;
    },
    (eventos) => cache.guardarEventosDelDia(fecha, eventos),
    () => cache.leerEventosDelDia(fecha),
  );
}

// GET /eventos/{id}
export function obtenerEvento(id: string): Promise<Resultado<Evento>> {
  return conCopia(
    async () => {
      const { data } = await clienteApi.get<RespuestaExito<Evento>>(`/eventos/${encodeURIComponent(id)}`);
      return data.datos;
    },
    (evento) => cache.guardarEvento(evento),
    () => cache.leerEvento(id),
  );
}

// GET /yo/eventos-guardados. Incluye los que terminaron o se cancelaron, con su estado de hoy.
export function listarEventosGuardados(): Promise<Resultado<Evento[]>> {
  return conCopia(
    async () => {
      const { data } = await clienteApi.get<RespuestaExito<Evento[]>>('/yo/eventos-guardados', {
        params: { porPagina: 100 },
        headers: await cabeceraSesion(),
      });
      return data.datos;
    },
    (eventos) => cache.guardarEventosGuardados(eventos),
    () => cache.leerEventosGuardados(),
  );
}

// PUT /yo/eventos-guardados/{id}. 201 si es nuevo, 200 si ya estaba.
// Solo programados o suspendidos: si no, la API responde 422 EVENTO_NO_VIGENTE.
export async function guardarEvento(id: string): Promise<Evento> {
  const { data } = await clienteApi.put<RespuestaExito<Evento>>(
    `/yo/eventos-guardados/${encodeURIComponent(id)}`,
    null,
    { headers: await cabeceraSesion() },
  );
  return data.datos;
}

// DELETE /yo/eventos-guardados/{id}. 204 sin cuerpo (también si no estaba).
export async function quitarEventoGuardado(id: string): Promise<void> {
  await clienteApi.delete(`/yo/eventos-guardados/${encodeURIComponent(id)}`, {
    headers: await cabeceraSesion(),
  });
}

// PATCH /eventos/{id}/estado (solo admin; si no, 403 SIN_PERMISO).
// "finalizado" no se elige: lo calcula la API cuando el evento terminó.
export async function cambiarEstadoEvento(
  id: string,
  estado: Exclude<EstadoEvento, 'finalizado'>,
): Promise<Evento> {
  const { data } = await clienteApi.patch<RespuestaExito<Evento>>(
    `/eventos/${encodeURIComponent(id)}/estado`,
    { estado },
    { headers: await cabeceraSesion() },
  );
  return data.datos;
}

// Se puede guardar un evento programado o suspendido (puede reprogramarse). Cancelado o finalizado, no.
export const sePuedeGuardar = (e: Evento) => e.estado === 'programado' || e.estado === 'suspendido';
