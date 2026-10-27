import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarCategorias } from '@/servicios/categorias';
import { listarLugares } from '@/servicios/lugares';
import type { Lugar } from '@/tipos';

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

  // Referencia al mapa para poder moverlo desde código (botones).
  const mapa = useRef<MapView>(null);

  // Lugares a mostrar y el color de cada categoría: { 'cat-museos': '#8E5A4A', ... }
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [colores, setColores] = useState<Record<string, string>>({});
  const [errorLugares, setErrorLugares] = useState<string | null>(null);
  const [intento, setIntento] = useState(0); // sube con "Reintentar" para volver a pedir

  // Se piden lugares y categorías a la vez. Si fallan las categorías, igual mostramos
  // los lugares con el color de la app (por eso el .catch(() => [])).
  useEffect(() => {
    setErrorLugares(null);
    Promise.all([listarLugares(), listarCategorias().catch(() => [])])
      .then(([listaLugares, listaCategorias]) => {
        setLugares(listaLugares);
        setColores(Object.fromEntries(listaCategorias.map((c) => [c.id, c.color])));
      })
      .catch((e) => setErrorLugares(e instanceof Error ? e.message : 'No pudimos cargar los lugares.'));
  }, [intento]);

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

  const sinUbicacion = estado === 'denegada' || estado === 'error';

  return (
    <View style={styles.pantalla}>
      <MapView
        ref={mapa}
        style={StyleSheet.absoluteFill} // el mapa ocupa toda la pantalla
        initialRegion={REGION_COLON}
        showsUserLocation={estado === 'lista'} // el punto azul, solo si hay permiso
        showsMyLocationButton={false} // usamos nuestro propio botón, más grande
      >
        {/* Un marcador por lugar. Al tocarlo, el mapa muestra el nombre y la descripción corta. */}
        {lugares.map((lugar) => (
          <Marker
            key={lugar.id}
            coordinate={{
              latitude: lugar.coordenadas.latitud,
              longitude: lugar.coordenadas.longitud,
            }}
            title={lugar.nombre}
            description={lugar.descripcionCorta}
            pinColor={colores[lugar.categoriaId] ?? paleta.acento}
          />
        ))}
      </MapView>

      {/* Avisos arriba. El mapa sigue andando aunque falle algo (lo pide el PDF). */}
      <View style={[styles.avisos, { top: margenes.top + 12 }]}>
        {sinUbicacion ? (
          <View style={[styles.aviso, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}>
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

        {errorLugares ? (
          <View style={[styles.aviso, { backgroundColor: paleta.superficie, borderColor: paleta.error }]}>
            <Text style={[styles.avisoTexto, { color: paleta.error }]}>{errorLugares}</Text>
            <Boton etiqueta="Reintentar" onPress={() => setIntento(intento + 1)} />
          </View>
        ) : null}
      </View>

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
  avisos: { position: 'absolute', left: 16, right: 16, gap: 10 },
  aviso: { padding: 14, gap: 10, borderRadius: 14, borderWidth: 1 },
  avisoTexto: { fontSize: 16, lineHeight: 22 },
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
  botonColon: { bottom: 96 }, // queda arriba del botón de mi ubicación
});