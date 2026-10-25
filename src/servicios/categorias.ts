import * as Network from 'expo-network';

import type { Categoria, RespuestaExito } from '@/tipos';
import { guardarCategorias, leerCategorias } from './cacheCatalogo';
import { clienteApi } from './clienteApi';
import { ErrorApi } from './errores';

// GET /categorias. Sin señal devuelve la copia guardada en el teléfono.
export async function listarCategorias(): Promise<Categoria[]> {
  try {
    const estado = await Network.getNetworkStateAsync();
    if (estado.isConnected === false) throw new ErrorApi('SIN_RED', 'No hay conexión.');

    const { data } = await clienteApi.get<RespuestaExito<Categoria[]>>('/categorias');
    await guardarCategorias(data.datos);
    return data.datos;
  } catch (e) {
    if (e instanceof ErrorApi && e.codigo === 'SIN_RED') return leerCategorias();
    throw e;
  }
}
