import { useRef } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useTema } from '@/proveedores/ProveedorTema';

// Centro de Colón (Entre Ríos). El mapa arranca acá aunque la persona esté en otro lado.
// latitudeDelta / longitudeDelta = cuánto se ve: más chico, más zoom.
const REGION_COLON = {
  latitude: -32.2236,
  longitude: -58.1427,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

// Docs react-native-maps: https://github.com/react-native-maps/react-native-maps
export default function Mapa() {
  const paleta = useTema();
  const margenes = useSafeAreaInsets(); // espacio de la barra de estado (hora, batería)
  const { estado, coordenadas, puedePedirDeNuevo, pedir } = useUbicacion();

  // Referencia al mapa para poder moverlo desde código (botón "mi ubicación").
  const mapa = useRef<MapView>(null);

  const irAMiUbicacion = () => {
    if (!coordenadas) return;
    mapa.current?.animateToRegion(
      {
        latitude: coordenadas.latitud,
        longitude: coordenadas.longitud,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      800, // duración de la animación en milisegundos
    );
  };

    // Vuelve a mostrar Colón entero, como cuando se abre el mapa.
  const irAColon = () => {
    mapa.current?.animateToRegion(REGION_COLON, 800);
  };

  return (
    <View style={styles.pantalla}>
      <MapView
        ref={mapa}
        style={StyleSheet.absoluteFill} // el mapa ocupa toda la pantalla
        initialRegion={REGION_COLON}
        showsUserLocation={estado === 'lista'} // el punto azul, solo si hay permiso
        showsMyLocationButton={false} // usamos nuestro propio botón, más grande
      />

      {/* Aviso arriba si no hay permiso o no se pudo obtener la posición.
          El mapa sigue andando igual (lo pide el PDF). */}
      {estado === 'denegada' || estado === 'error' ? (
        <View
          style={[
            styles.aviso,
            { top: margenes.top + 12, backgroundColor: paleta.superficie, borderColor: paleta.borde },
          ]}
        >
          <Text style={[styles.avisoTexto, { color: paleta.texto }]}>
            {estado === 'denegada'
              ? 'Sin permiso de ubicación: ves el mapa, pero no dónde estás.'
              : 'No pudimos saber dónde estás. Revisá que la ubicación esté activada.'}
          </Text>
          <Boton
            etiqueta={estado === 'denegada' && !puedePedirDeNuevo ? 'Abrir ajustes' : 'Reintentar'}
            onPress={estado === 'denegada' && !puedePedirDeNuevo ? () => Linking.openSettings() : pedir}
          />
        </View>
      ) : null}

            {/* Botón para volver a ver Colón. Siempre visible. */}
      <Pressable
        onPress={irAColon}
        accessibilityRole="button"
        accessibilityLabel="Ver Colón"
        style={[
          styles.botonUbicacion,
          styles.botonColon,
          { backgroundColor: paleta.superficie, borderColor: paleta.acento },
        ]}
      >
        <Ionicons name="business-outline" size={26} color={paleta.acento} />
      </Pressable>

      {/* Botón para centrar el mapa en la persona. Solo aparece si sabemos dónde está. */}
      {coordenadas ? (
        <Pressable
          onPress={irAMiUbicacion}
          accessibilityRole="button"
          accessibilityLabel="Ir a mi ubicación"
          style={[styles.botonUbicacion, { backgroundColor: paleta.superficie, borderColor: paleta.acento }]}
        >
          <Ionicons name="locate" size={28} color={paleta.acento} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  aviso: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 14,
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  avisoTexto: { fontSize: 16, lineHeight: 22 },
  botonColon: { bottom: 96 }, // queda arriba del botón de mi ubicación
  botonUbicacion: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});