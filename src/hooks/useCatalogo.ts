import { useCallback, useEffect, useState } from 'react';

import { listarCategorias } from '@/servicios/categorias';
import { listarLugares } from '@/servicios/lugares';
import type { Categoria, Lugar } from '@/tipos';

// Trae los lugares y las categorías (con la copia local si no hay señal: eso lo resuelven los servicios).
// categorias viene como objeto por id para buscar rápido: categorias['cat-museos'].color
export function useCatalogo() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Record<string, Categoria>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0); // sube con reintentar() para volver a pedir

  useEffect(() => {
    let cancelado = false; // si la pantalla se cierra antes de que llegue la respuesta, no tocamos el estado
    setCargando(true);
    setError(null);

    // Si fallan las categorías, igual mostramos los lugares (por eso el .catch(() => [])).
    Promise.all([listarLugares(), listarCategorias().catch(() => [])])
      .then(([listaLugares, listaCategorias]) => {
        if (cancelado) return;
        setLugares(listaLugares);
        setCategorias(Object.fromEntries(listaCategorias.map((c) => [c.id, c])));
      })
      .catch((e) => {
        if (!cancelado) setError(e instanceof Error ? e.message : 'No pudimos cargar los lugares.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return { lugares, categorias, cargando, error, reintentar };
}