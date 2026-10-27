import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { useCatalogo } from '@/hooks/useCatalogo';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import type { Categoria, Lugar } from '@/tipos';
import { distanciaMetros, formatearDistancia } from '@/utilidades/distancia';
import { estadoApertura } from '@/utilidades/horarios';

type Icono = React.ComponentProps<typeof Ionicons>['name'];

const CENTRO_COLON = { latitud: -32.2236, longitud: -58.1427 };
// Si la persona está a menos de esto de Colón, el mapa chico se centra en ella.
const RADIO_ZONA_COLON_METROS = 30000;
// Cuántos lugares mostrar en "Cerca tuyo".
const CANTIDAD_CERCA = 5;

// Accesos a las pantallas que no tienen pestaña propia (en _layout tienen href: null).
const accesos: { titulo: string; ruta: Href; icono: Icono }[] = [
  { titulo: 'Lugares', ruta: '/lugares', icono: 'location-outline' },
  { titulo: 'Favoritos', ruta: '/favoritos', icono: 'heart-outline' },
  { titulo: 'Audioguías', ruta: '/audioguias', icono: 'headset-outline' },
];

export default function Inicio() {
  const paleta = useTema();
  const { usuario } = useSesion();
  const { estado, coordenadas, puedePedirDeNuevo, pedir } = useUbicacion();
  const { lugares, categorias, cargando, error, reintentar } = useCatalogo();

  // Sin usuario (invitado) se saluda genérico.
  const saludo = usuario ? `Hola, ${usuario.nombre.split(' ')[0]}` : 'Hola, visitante';

  // ¿La persona está en la zona de Colón? Si no, el mapa chico muestra Colón.
  const enColon = coordenadas !== null && distanciaMetros(coordenadas, CENTRO_COLON) < RADIO_ZONA_COLON_METROS;
  const centro = enColon && coordenadas ? coordenadas : CENTRO_COLON;

  // "Cerca tuyo": calculamos la distancia a cada lugar, ordenamos de menor a mayor y nos quedamos con los primeros.
  const cercanos = coordenadas
    ? lugares
        .map((lugar) => ({ lugar, metros: distanciaMetros(coordenadas, lugar.coordenadas) }))
        .sort((a, b) => a.metros - b.metros)
        .slice(0, CANTIDAD_CERCA)
    : [];

  const abrirDetalle = (id: string) => router.push({ pathname: '/lugar/[id]', params: { id } });

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={[styles.saludo, { color: paleta.texto }]}>{saludo}</Text>
          <Text style={[styles.pregunta, { color: paleta.textoSuave }]}>¿Qué querés hacer en Colón?</Text>
        </View>

        {/* Mapa chico, quieto: al tocarlo se abre la pestaña Mapa. */}
        <Pressable
          onPress={() => router.push('/mapa')}
          accessibilityRole="button"
          accessibilityLabel="Abrir el mapa"
          style={[styles.marcoMapa, { borderColor: paleta.borde }]}
        >
          <MapView
            style={StyleSheet.absoluteFill}
            region={{ latitude: centro.latitud, longitude: centro.longitud, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
            showsUserLocation={estado === 'lista'}
            // Quieto: sin mover, ni hacer zoom, ni girar. Así el dedo hace scroll de la pantalla.
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
            pointerEvents="none" // el toque lo recibe el Pressable de afuera
          >
            {lugares.map((lugar) => (
              <Marker
                key={lugar.id}
                coordinate={{ latitude: lugar.coordenadas.latitud, longitude: lugar.coordenadas.longitud }}
                pinColor={categorias[lugar.categoriaId]?.color ?? paleta.acento}
              />
            ))}
          </MapView>
          <View style={[styles.etiquetaMapa, { backgroundColor: paleta.superficie }]}>
            <Ionicons name="expand-outline" size={18} color={paleta.acento} />
            <Text style={[styles.etiquetaMapaTexto, { color: paleta.acento }]}>Ver mapa completo</Text>
          </View>
        </Pressable>

        <Text style={[styles.subtitulo, { color: paleta.texto }]}>Cerca tuyo</Text>

        {cargando || estado === 'cargando' ? (
          <ActivityIndicator size="large" color={paleta.acento} />
        ) : error ? (
          <View style={styles.bloque}>
            <Text style={[styles.mensaje, { color: paleta.error }]}>{error}</Text>
            <Boton etiqueta="Reintentar" onPress={reintentar} />
          </View>
        ) : !coordenadas ? (
          // Sin ubicación no podemos saber qué tiene cerca: lo decimos y ofrecemos darla.
          <View style={styles.bloque}>
            <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>
              {estado === 'denegada'
                ? 'Para ver qué tenés cerca necesitamos tu ubicación.'
                : 'No pudimos saber dónde estás. Revisá que la ubicación esté activada.'}
            </Text>
            <Boton
              etiqueta={estado === 'denegada' && !puedePedirDeNuevo ? 'Abrir ajustes' : 'Usar mi ubicación'}
              variante="secundario"
              onPress={estado === 'denegada' && !puedePedirDeNuevo ? () => Linking.openSettings() : pedir}
            />
          </View>
        ) : (
          <View style={styles.lista}>
            {cercanos.map(({ lugar, metros }) => (
              <FilaCercano
                key={lugar.id}
                lugar={lugar}
                categoria={categorias[lugar.categoriaId] ?? null}
                distancia={formatearDistancia(metros)}
                onPress={() => abrirDetalle(lugar.id)}
              />
            ))}
          </View>
        )}

        {/* Accesos a las secciones que no tienen pestaña abajo. */}
        <View style={styles.accesos}>
          {accesos.map((acceso) => (
            <Pressable
              key={acceso.titulo}
              onPress={() => router.push(acceso.ruta)}
              accessibilityRole="button"
              accessibilityLabel={acceso.titulo}
              style={[styles.acceso, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}
            >
              <Ionicons name={acceso.icono} size={32} color={paleta.acento} />
              <Text style={[styles.accesoTexto, { color: paleta.texto }]}>{acceso.titulo}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type PropsFila = { lugar: Lugar; categoria: Categoria | null; distancia: string; onPress: () => void };

// Una fila de "Cerca tuyo": ícono de la categoría, nombre, si está abierto y la distancia.
function FilaCercano({ lugar, categoria, distancia, onPress }: PropsFila) {
  const paleta = useTema();
  const apertura = estadoApertura(lugar.horarios);
  const color = categoria?.color ?? paleta.acento;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${lugar.nombre}, a ${distancia}`}
      style={[styles.fila, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}
    >
      <View style={[styles.iconoFila, { backgroundColor: color }]}>
        <Ionicons name={(categoria?.icono as Icono) ?? 'location-outline'} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.textosFila}>
        <Text style={[styles.nombreFila, { color: paleta.texto }]} numberOfLines={2}>
          {lugar.nombre}
        </Text>
        {apertura ? (
          <Text style={[styles.aperturaFila, { color: apertura.abierto ? paleta.acento : paleta.error }]}>
            {apertura.texto}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.distancia, { color: paleta.acento }]}>{distancia}</Text>
    </Pressable>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 20, gap: 16 },
  encabezado: { gap: 4 },
  saludo: { fontSize: 32, fontWeight: '800' },
  pregunta: { fontSize: 18 },
  marcoMapa: { height: 220, borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  etiquetaMapa: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  etiquetaMapaTexto: { fontSize: 15, fontWeight: '700' },
  subtitulo: { fontSize: 22, fontWeight: '800' },
  bloque: { gap: 12 },
  mensaje: { fontSize: 17, lineHeight: 24 },
  lista: { gap: 10 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  iconoFila: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textosFila: { flex: 1, gap: 2 },
  nombreFila: { fontSize: 18, fontWeight: '700' },
  aperturaFila: { fontSize: 15, fontWeight: '600' },
  distancia: { fontSize: 17, fontWeight: '800' },
  accesos: { flexDirection: 'row', gap: 10 },
  acceso: {
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  accesoTexto: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});