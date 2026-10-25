import { obtenerBD } from '@/db/baseDatos';
import type { Categoria, Lugar } from '@/tipos';

// Copia del catálogo en el teléfono, para seguir viendo los lugares sin señal.
// Cada fila guarda el objeto entero como texto JSON.

export async function guardarLugares(lugares: Lugar[]) {
  const db = await obtenerBD();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM lugares');
    for (const lugar of lugares) {
      await db.runAsync('INSERT INTO lugares (id, json) VALUES (?, ?)', lugar.id, JSON.stringify(lugar));
    }
  });
}

export async function leerLugares(): Promise<Lugar[]> {
  const db = await obtenerBD();
  const filas = await db.getAllAsync<{ json: string }>('SELECT json FROM lugares');
  return filas.map((fila) => JSON.parse(fila.json) as Lugar);
}

export async function leerLugar(id: string): Promise<Lugar | null> {
  const db = await obtenerBD();
  const fila = await db.getFirstAsync<{ json: string }>('SELECT json FROM lugares WHERE id = ?', id);
  return fila ? (JSON.parse(fila.json) as Lugar) : null;
}

export async function guardarCategorias(categorias: Categoria[]) {
  const db = await obtenerBD();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM categorias');
    for (const categoria of categorias) {
      await db.runAsync('INSERT INTO categorias (id, json) VALUES (?, ?)', categoria.id, JSON.stringify(categoria));
    }
  });
}

export async function leerCategorias(): Promise<Categoria[]> {
  const db = await obtenerBD();
  const filas = await db.getAllAsync<{ json: string }>('SELECT json FROM categorias');
  return filas.map((fila) => JSON.parse(fila.json) as Categoria).sort((a, b) => a.orden - b.orden);
}
