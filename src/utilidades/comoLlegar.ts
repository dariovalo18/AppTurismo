import { Alert, Linking, Platform } from 'react-native';

import type { Coordenadas } from '@/tipos';

type Modo = 'caminando' | 'auto';

// Arma el link de "cómo llegar" para la app de mapas del teléfono.
// Android: Google Maps (si no está instalada, se abre en el navegador).
// iPhone: Apple Maps.
// Docs: https://developers.google.com/maps/documentation/urls/get-started
function urlRuta(destino: Coordenadas, modo: Modo): string {
  const { latitud, longitud } = destino;
  if (Platform.OS === 'ios') {
    const dirflg = modo === 'caminando' ? 'w' : 'd'; // w = walking, d = driving
    return `https://maps.apple.com/?daddr=${latitud},${longitud}&dirflg=${dirflg}`;
  }
  const travelmode = modo === 'caminando' ? 'walking' : 'driving';
  return `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=${travelmode}`;
}

// Abre la app de mapas con la ruta. Si algo falla, avisa en vez de quedarse colgada.
async function abrirRuta(destino: Coordenadas, modo: Modo) {
  try {
    await Linking.openURL(urlRuta(destino, modo));
  } catch {
    Alert.alert('No pudimos abrir los mapas', 'Probá de nuevo o buscá el lugar en tu app de mapas.');
  }
}

// Pregunta cómo va a ir (caminando o en auto) y abre la ruta.
// El origen no hace falta: la app de mapas usa la ubicación actual del teléfono.
export function elegirComoLlegar(nombre: string, destino: Coordenadas) {
  Alert.alert(`Cómo llegar a ${nombre}`, '¿Cómo vas a ir?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'En auto', onPress: () => abrirRuta(destino, 'auto') },
    { text: 'Caminando', onPress: () => abrirRuta(destino, 'caminando') },
  ]);
}