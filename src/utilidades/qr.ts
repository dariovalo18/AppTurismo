import type { Lugar } from '@/tipos';

// Formato de nuestros QR (definido con la cátedra/cliente): "COLON:<idDelLugar>", por ejemplo "COLON:lug-004".
// Es el mismo valor que viene en lugar.codigoQr.
// Cualquier otra cosa (una URL, un texto cualquiera, un QR cortado) se rechaza sin romper nada.
const PATRON_QR = /^COLON:[A-Za-z0-9_-]{1,64}$/;

// Devuelve el código limpio si tiene nuestro formato, o null si no.
// Recibe 'unknown' a propósito: no confiamos en lo que lee la cámara.
export function leerCodigoQr(dato: unknown): string | null {
  if (typeof dato !== 'string') return null;
  const limpio = dato.trim();
  if (limpio.length > 100) return null; // un QR gigante no es nuestro: ni lo analizamos
  return PATRON_QR.test(limpio) ? limpio : null;
}

// Busca en el catálogo el lugar de ese código. Solo lugares activos (los dados de baja no se visitan).
export function buscarLugarPorQr(codigo: string, lugares: Lugar[]): Lugar | null {
  const lugar =
    lugares.find((l) => l.codigoQr === codigo) ?? lugares.find((l) => `COLON:${l.id}` === codigo);
  return lugar && lugar.activo ? lugar : null;
}
