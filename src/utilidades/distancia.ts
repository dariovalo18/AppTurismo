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


// ---------- Ángulos (para la flecha que apunta al lugar) ----------

// Lleva cualquier ángulo al rango 0..360. Ej: -90 -> 270, 370 -> 10.
export const normalizarGrados = (grados: number) => ((grados % 360) + 360) % 360;

// Cuánto hay que girar para ir de "desde" a "hasta" por el camino más corto: entre -180 y 180.
// Ej: de 350 a 10 son +20 (no -340).
export const diferenciaGrados = (desde: number, hasta: number) => ((hasta - desde + 540) % 360) - 180;

// Rumbo desde un punto hacia otro, en grados: 0 = norte, 90 = este, 180 = sur, 270 = oeste.
export function rumboHacia(desde: Coordenadas, hasta: Coordenadas): number {
  const lat1 = aRadianes(desde.latitud);
  const lat2 = aRadianes(hasta.latitud);
  const difLongitud = aRadianes(hasta.longitud - desde.longitud);

  const y = Math.sin(difLongitud) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(difLongitud);

  return normalizarGrados((Math.atan2(y, x) * 180) / Math.PI);
}

// Para lectores de pantalla: convierte el giro de la flecha en palabras.
export function direccionRelativa(giro: number): string {
  const g = diferenciaGrados(0, giro); // entre -180 y 180
  if (Math.abs(g) <= 30) return 'adelante';
  if (Math.abs(g) >= 150) return 'atrás';
  return g > 0 ? 'a la derecha' : 'a la izquierda';
}