import { useEffect, useRef, useState } from 'react';
import { Magnetometer } from 'expo-sensors';

import { diferenciaGrados, normalizarGrados } from '@/utilidades/distancia';

// Hacia dónde apunta la parte de arriba del celular, en grados: 0 = norte, 90 = este...
// Se calcula con el magnetómetro (la brújula del teléfono). Funciona bien con el celular acostado.
// Devuelve null si el teléfono no tiene magnetómetro (la app sigue andando, sin flecha).
// Docs: https://docs.expo.dev/versions/latest/sdk/magnetometer/
export function useRumbo(): number | null {
  const [rumbo, setRumbo] = useState<number | null>(null);
  // Último valor suavizado. useRef: cambia sin volver a dibujar la pantalla.
  const suavizado = useRef<number | null>(null);

  useEffect(() => {
    let suscripcion: { remove: () => void } | null = null;
    let cancelado = false;

    Magnetometer.isAvailableAsync()
      .then((disponible) => {
        if (!disponible || cancelado) return;

        Magnetometer.setUpdateInterval(100); // una lectura cada 100 ms (10 por segundo)

        suscripcion = Magnetometer.addListener(({ x, y }) => {
          // El campo magnético apunta al norte. Con el celular acostado, x es hacia la derecha
          // de la pantalla e y hacia arriba: de ahí sale el ángulo entre el norte y la punta del celular.
          const medido = normalizarGrados((Math.atan2(-x, y) * 180) / Math.PI);

          // Suavizado: cada lectura mueve el valor solo un 20% hacia la nueva, así la flecha no tiembla.
          const anterior = suavizado.current;
          const nuevo = anterior === null ? medido : normalizarGrados(anterior + diferenciaGrados(anterior, medido) * 0.2);
          suavizado.current = nuevo;
          setRumbo(nuevo);
        });
      })
      .catch(() => {});

    // Al cerrar la tarjeta se deja de escuchar el sensor (ahorra batería).
    return () => {
      cancelado = true;
      suscripcion?.remove();
    };
  }, []);

  return rumbo;
}