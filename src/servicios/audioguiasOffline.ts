import { Directory, File, Paths } from 'expo-file-system';

import type { Lugar } from '@/tipos';

// Audioguías guardadas en el teléfono, para escucharlas sin señal (PDF: en El Palmar no hay datos).
// Docs: https://docs.expo.dev/versions/latest/sdk/filesystem/

// Carpeta de la app donde se guardan: documentos/audioguias/
const carpeta = new Directory(Paths.document, 'audioguias');

// El archivo local de la audioguía de un lugar: audioguias/lug-004.mp3
function archivoDe(lugar: Lugar): File | null {
  if (!lugar.audioguia) return null;
  // La extensión sale de la URL ("molino-es.m4a" -> "m4a"). Si no se puede leer, mp3.
  const extension = lugar.audioguia.url.split('?')[0].split('.').pop() || 'mp3';
  return new File(carpeta, `${lugar.id}.${extension}`);
}

// ¿Ya está descargada?
export function estaDescargada(lugar: Lugar): boolean {
  return archivoDe(lugar)?.exists ?? false;
}

// Baja el audio al teléfono. Si ya estaba, lo reemplaza.
export async function descargarAudioguia(lugar: Lugar): Promise<void> {
  const archivo = archivoDe(lugar);
  if (!archivo || !lugar.audioguia) return;
  if (!carpeta.exists) carpeta.create({ intermediates: true });
  await File.downloadFileAsync(lugar.audioguia.url, archivo, { idempotent: true });
}

// Borra la copia del teléfono.
export function borrarAudioguia(lugar: Lugar): void {
  const archivo = archivoDe(lugar);
  if (archivo?.exists) archivo.delete();
}

// Lo que tiene que reproducir la Persona 5: el archivo local si está bajado, si no la URL de la API.
export function uriAudioguia(lugar: Lugar): string | null {
  if (!lugar.audioguia) return null;
  const archivo = archivoDe(lugar);
  return archivo?.exists ? archivo.uri : lugar.audioguia.url;
}