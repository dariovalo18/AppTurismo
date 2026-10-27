import type { Coordenadas } from '@/tipos';

const RADIO_TIERRA_METROS = 6371000;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

// Distancia en línea recta entre dos puntos, en metros (fórmula de haversine:
// tiene en cuenta que la Tierra es redonda). No es la distancia caminando por las calles.
export function distanciaMetros(desde: Coordenadas, hasta: Coordenadas): number {
  const difLatitud = aRadianes(hasta.latitud - desde.latitud);
  const difLongitud = aRadianes(hasta.longitud - desde.longitud);

  const h =
    Math.sin(difLatitud / 2) ** 2 +
    Math.cos(aRadianes(desde.latitud)) * Math.cos(aRadianes(hasta.latitud)) * Math.sin(difLongitud / 2) ** 2;

  return 2 * RADIO_TIERRA_METROS * Math.asin(Math.sqrt(h));
}

// 850 -> "850 m" | 1430 -> "1,4 km" | 48200 -> "48 km"
export function formatearDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros / 10) * 10} m`;
  const km = metros / 1000;
  // Hasta 10 km con un decimal; más lejos, sin decimales. Coma decimal como en Argentina.
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`;
}