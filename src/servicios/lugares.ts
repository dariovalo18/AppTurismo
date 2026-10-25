import * as Network from 'expo-network';

import type { Lugar, RespuestaExito } from '@/tipos';
import { leerLugar, leerLugares, guardarLugares } from './cacheCatalogo';
import { clienteApi } from './clienteApi';
import { ErrorApi } from './errores';

export type FiltrosLugares = {
  q?: string; // texto a buscar en el nombre
  categoriaId?: string;
};

// Sin señal (o si la red se cae a mitad del pedido) se usa la copia guardada en el teléfono.
async function haySenal() {
  const estado = await Network.getNetworkStateAsync();
  return estado.isConnected !== false && estado.isInternetReachable !== false;
}

// Misma búsqueda que hace la API (sin tildes ni mayúsculas), para cuando estamos sin señal.
const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

async function listarDesdeCache(filtros: FiltrosLugares) {
  let lugares = await leerLugares();
  if (filtros.categoriaId) lugares = lugares.filter((l) => l.categoriaId === filtros.categoriaId);
  if (filtros.q) lugares = lugares.filter((l) => normalizar(l.nombre).includes(normalizar(filtros.q!)));
  return lugares.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// GET /lugares. Con filtros opcionales (categoría y búsqueda por nombre).
export async function listarLugares(filtros: FiltrosLugares = {}): Promise<Lugar[]> {
  if (!(await haySenal())) return listarDesdeCache(filtros);

  try {
    const { data } = await clienteApi.get<RespuestaExito<Lugar[]>>('/lugares', {
      params: { ...filtros, porPagina: 500 },
    });
    // La lista completa (sin filtros) es la que se guarda para usar sin señal.
    if (!filtros.q && !filtros.categoriaId) await guardarLugares(data.datos);
    return data.datos;
  } catch (e) {
    if (e instanceof ErrorApi && e.codigo === 'SIN_RED') return listarDesdeCache(filtros);
    throw e;
  }
}

// GET /lugares/:id
export async function obtenerLugar(id: string): Promise<Lugar> {
  try {
    if (!(await haySenal())) throw new ErrorApi('SIN_RED', 'No hay conexión.');
    const { data } = await clienteApi.get<RespuestaExito<Lugar>>(`/lugares/${id}`);
    return data.datos;
  } catch (e) {
    if (e instanceof ErrorApi && e.codigo === 'SIN_RED') {
      const guardado = await leerLugar(id);
      if (guardado) return guardado;
    }
    throw e;
  }
}
