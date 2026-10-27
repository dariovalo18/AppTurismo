import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';

import type { Coordenadas } from '@/tipos';

// cargando: pidiendo el permiso o buscando la posición
// lista: tenemos coordenadas
// denegada: la persona no dio permiso (la app sigue andando igual)
// error: dio permiso pero no se pudo obtener la posición (por ejemplo, GPS apagado)
export type EstadoUbicacion = 'cargando' | 'lista' | 'denegada' | 'error';

// Pide el permiso de ubicación y devuelve dónde está la persona.
// Vuelve a revisar cada vez que se entra a la pantalla y cada vez que se vuelve a la app
// (por si la persona cambió el permiso o apagó el GPS desde los ajustes).
// Docs expo-location: https://docs.expo.dev/versions/latest/sdk/location/
export function useUbicacion() {
  const [estado, setEstado] = useState<EstadoUbicacion>('cargando');
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  // Si la persona tocó "No volver a preguntar", el sistema ya no muestra el aviso:
  // hay que mandarla a los ajustes del teléfono.
  const [puedePedirDeNuevo, setPuedePedirDeNuevo] = useState(true);
  // El aviso del permiso se muestra solo la primera vez. Después solo se revisa en silencio.
  const yaPregunto = useRef(false);

  // preguntar = true: muestra el aviso del sistema (si todavía se puede).
  // preguntar = false: solo consulta cómo está el permiso, sin molestar.
  const actualizar = useCallback(async (preguntar: boolean) => {
    try {
      const permiso = preguntar
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();
      setPuedePedirDeNuevo(permiso.canAskAgain);

      if (permiso.status !== 'granted') {
        setCoordenadas(null);
        setEstado('denegada');
        return;
      }

      // 1) La última posición que el teléfono ya conoce: sale al instante (puede ser de hace un rato).
      //    Puede venir null si el teléfono no tiene ninguna guardada.
      const ultima = await Location.getLastKnownPositionAsync();
      if (ultima) {
        setCoordenadas({ latitud: ultima.coords.latitude, longitud: ultima.coords.longitude });
        setEstado('lista');
      }

      // 2) La posición actual, más precisa: tarda un poco más y reemplaza a la anterior.
      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      // La API y los tipos del PDF usan latitud/longitud en castellano.
      setCoordenadas({
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
      });
      setEstado('lista');
    } catch {
      // Hay permiso pero no hay posición: GPS apagado, por ejemplo.
      setCoordenadas(null);
      setEstado('error');
    }
  }, []);

  // Para el botón "Permitir ubicación" / "Reintentar".
  const pedir = useCallback(() => {
    setEstado('cargando');
    return actualizar(true);
  }, [actualizar]);

  // Cada vez que la pantalla se muestra (también al cambiar de pestaña y volver).
  useFocusEffect(
    useCallback(() => {
      actualizar(!yaPregunto.current);
      yaPregunto.current = true;
    }, [actualizar]),
  );

  // Cada vez que la app vuelve a primer plano (por ejemplo, después de ir a los ajustes).
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') actualizar(false);
    });
    return () => suscripcion.remove();
  }, [actualizar]);

  return { estado, coordenadas, puedePedirDeNuevo, pedir };
}