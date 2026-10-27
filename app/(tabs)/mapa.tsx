import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { useRumbo } from '@/hooks/useRumbo';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarCategorias } from '@/servicios/categorias';
import { listarLugares } from '@/servicios/lugares';
import type { Categoria, Coordenadas, Lugar } from '@/tipos';
import { elegirComoLlegar } from '@/utilidades/comoLlegar';
import { direccionRelativa, distanciaMetros, formatearDistancia, rumboHacia } from '@/utilidades/distancia';
import { estadoApertura } from '@/utilidades/horarios';

// Nombre de un ícono de Ionicons (el tipo sale del propio paquete).
type Icono = React.ComponentProps<typeof Ionicons>['name'];

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
  const router = useRouter();
  const margenes = useSafeAreaInsets(); // espacio de la barra de estado (hora, batería)
  const { estado, coordenadas, puedePedirDeNuevo, pedir } = useUbicacion();

  // Referencia al mapa para poder moverlo desde código (botones).
  const mapa = useRef<MapView>(null);

  // Lugares a mostrar y las categorías por id: { 'cat-museos': { nombre, color, ... }, ... }
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Record<string, Categoria>>({});
  const [errorLugares, setErrorLugares] = useState<string | null>(null);
  const [intento, setIntento] = useState(0); // sube con "Reintentar" para volver a pedir

  // El lugar cuyo pin se tocó. null = no se muestra la tarjeta.
  const [seleccionado, setSeleccionado] = useState<Lugar | null>(null);

  // Categoría elegida en el filtro. null = "Todos".
  const [filtro, setFiltro] = useState<string | null>(null);

  // Se piden lugares y categorías a la vez. Si fallan las categorías, igual mostramos
  // los lugares con el color de la app (por eso el .catch(() => [])).
  useEffect(() => {
    setErrorLugares(null);
    Promise.all([listarLugares(), listarCategorias().catch(() => [])])
      .then(([listaLugares, listaCategorias]) => {
        setLugares(listaLugares);
        setCategorias(Object.fromEntries(listaCategorias.map((c) => [c.id, c])));
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

  // Los pines que se dibujan: todos, o solo los de la categoría elegida.
  const lugaresVisibles = filtro ? lugares.filter((l) => l.categoriaId === filtro) : lugares;

  // Solo ofrecemos categorías que tienen al menos un lugar, ordenadas como dice la API.
  const categoriasConLugares = Object.values(categorias)
    .filter((c) => lugares.some((l) => l.categoriaId === c.id))
    .sort((a, b) => a.orden - b.orden);

  // Al cambiar el filtro se cierra la tarjeta (el lugar elegido puede quedar oculto).
  const elegirFiltro = (categoriaId: string | null) => {
    setFiltro(categoriaId);
    setSeleccionado(null);
  };

  return (
    <View style={styles.pantalla}>
      <MapView
        ref={mapa}
        style={StyleSheet.absoluteFill} // el mapa ocupa toda la pantalla
        initialRegion={REGION_COLON}
        showsUserLocation={estado === 'lista'} // el punto azul, solo si hay permiso
        showsMyLocationButton={false} // usamos nuestro propio botón, más grande
        // Tocar el mapa (fuera de un pin) cierra la tarjeta.
        // Al tocar un pin, el mapa también recibe el toque con action 'marker-press': ese lo ignoramos.
        onPress={(e) => {
          if (e.nativeEvent.action !== 'marker-press') setSeleccionado(null);
        }}
      >
        {/* Un marcador por lugar. Sin title: en vez del globito, mostramos nuestra tarjeta. */}
        {lugaresVisibles.map((lugar) => (
          <Marker
            key={lugar.id}
            coordinate={{
              latitude: lugar.coordenadas.latitud,
              longitude: lugar.coordenadas.longitud,
            }}
            pinColor={categorias[lugar.categoriaId]?.color ?? paleta.acento}
            onPress={() => setSeleccionado(lugar)}
          />
        ))}
      </MapView>

      {/* Parte de arriba: filtros de borde a borde y, debajo, los avisos.
          pointerEvents="box-none": el espacio vacío deja pasar los toques al mapa. */}
      <View style={[styles.arriba, { top: margenes.top + 8 }]} pointerEvents="box-none">
        {/* Filtro por categoría. Se desliza de costado. */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip
            etiqueta={`Todos (${lugares.length})`}
            icono="apps-outline"
            activo={filtro === null}
            onPress={() => elegirFiltro(null)}
          />
          {categoriasConLugares.map((c) => (
            <Chip
              key={c.id}
              etiqueta={c.nombre}
              icono={c.icono as Icono}
              color={c.color}
              activo={filtro === c.id}
              onPress={() => elegirFiltro(c.id)}
            />
          ))}
        </ScrollView>

        {/* Avisos. El mapa sigue andando aunque falle algo (lo pide el PDF). */}
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

      {/* Parte de abajo: botones redondos y, si hay un pin tocado, la tarjeta.
          pointerEvents="box-none": el espacio vacío deja pasar los toques al mapa. */}
      <View style={styles.abajo} pointerEvents="box-none">
        <View style={styles.botones} pointerEvents="box-none">
          {/* Volver a ver Colón. Siempre visible. */}
          <BotonRedondo icono="business-outline" etiqueta="Ver Colón" onPress={irAColon} />
          {/* Centrar en la persona. Solo si sabemos dónde está. */}
          {coordenadas ? <BotonRedondo icono="locate" etiqueta="Ir a mi ubicación" onPress={irAMiUbicacion} /> : null}
        </View>

        {seleccionado ? (
          <TarjetaLugar
            lugar={seleccionado}
            categoria={categorias[seleccionado.categoriaId] ?? null}
            ubicacion={coordenadas}
            onCerrar={() => setSeleccionado(null)}
            onVerDetalle={() => router.push({ pathname: '/lugar/[id]', params: { id: seleccionado.id } })}
          />
        ) : null}
      </View>
    </View>
  );
}

function BotonRedondo({ icono, etiqueta, onPress }: { icono: Icono; etiqueta: string; onPress: () => void }) {
  const paleta = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={[styles.botonRedondo, { backgroundColor: paleta.superficie, borderColor: paleta.acento }]}
    >
      <Ionicons name={icono} size={28} color={paleta.acento} />
    </Pressable>
  );
}

type PropsChip = { etiqueta: string; icono: Icono; color?: string; activo: boolean; onPress: () => void };

// Botón del filtro, flotando sobre el mapa con sombra.
// Elegido: fondo azul de la app y todo en blanco. Sin elegir: fondo claro e ícono del color de la categoría.
function Chip({ etiqueta, icono, color, activo, onPress }: PropsChip) {
  const paleta = useTema();
  const colorIcono = activo ? paleta.sobreAcento : (color ?? paleta.acento);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: activo ? paleta.acento : paleta.superficie },
        pressed && { opacity: 0.8 }, // se aclara un poco mientras lo tocás
      ]}
    >
      <Ionicons name={icono} size={20} color={colorIcono} />
      <Text style={[styles.chipTexto, { color: activo ? paleta.sobreAcento : paleta.texto }]}>{etiqueta}</Text>
    </Pressable>
  );
}

type PropsTarjeta = {
  lugar: Lugar;
  categoria: Categoria | null;
  ubicacion: Coordenadas | null; // null si no hay permiso o GPS
  onCerrar: () => void;
  onVerDetalle: () => void;
};

// Tarjeta que aparece abajo al tocar un pin.
function TarjetaLugar({ lugar, categoria, ubicacion, onCerrar, onVerDetalle }: PropsTarjeta) {
  const paleta = useTema();
  const apertura = estadoApertura(lugar.horarios);
  // Sin ubicación no hay distancia: lo decimos en vez de esconderlo.
  const distancia = ubicacion
    ? `A ${formatearDistancia(distanciaMetros(ubicacion, lugar.coordenadas))} de donde estás`
    : 'Activá la ubicación para ver a qué distancia está';

  // Flecha: hacia dónde queda el lugar (rumbo) menos hacia dónde apunta el celular = cuánto girarla.
  const rumboCelular = useRumbo();
  const giro = ubicacion && rumboCelular !== null ? rumboHacia(ubicacion, lugar.coordenadas) - rumboCelular : null;

  return (
    <View style={[styles.tarjeta, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}>
      <View style={styles.tarjetaEncabezado}>
        <Text style={[styles.tarjetaNombre, { color: paleta.texto }]} numberOfLines={2}>
          {lugar.nombre}
        </Text>
        <Pressable onPress={onCerrar} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={12}>
          <Ionicons name="close" size={28} color={paleta.textoSuave} />
        </Pressable>
      </View>

      {categoria ? (
        <Text style={[styles.tarjetaCategoria, { color: categoria.color }]}>{categoria.nombre}</Text>
      ) : null}
      {apertura ? (
        <Text style={[styles.tarjetaDato, { color: apertura.abierto ? paleta.acento : paleta.error }]}>
          {apertura.texto}
        </Text>
      ) : null}
      <View style={styles.filaDistancia}>
        {giro !== null ? (
          <View
            accessible
            accessibilityLabel={`El lugar queda ${direccionRelativa(giro)}`}
            style={[styles.flecha, { backgroundColor: paleta.acento }]}
          >
            <Ionicons
              name="arrow-up"
              size={28}
              color={paleta.sobreAcento}
              style={{ transform: [{ rotate: `${giro}deg` }] }}
            />
          </View>
        ) : null}
        <Text style={[styles.tarjetaDato, styles.textoDistancia, { color: paleta.texto }]}>{distancia}</Text>
      </View>

      {/* Dos botones lado a lado. Boton no recibe style, por eso cada uno va dentro de un View con flex: 1. */}
      <View style={styles.tarjetaBotones}>
        <View style={styles.tarjetaBoton}>
          <Boton etiqueta="Ver detalle" onPress={onVerDetalle} />
        </View>
        <View style={styles.tarjetaBoton}>
          <Boton
            etiqueta="Cómo llegar"
            variante="secundario"
            onPress={() => elegirComoLlegar(lugar.nombre, lugar.coordenadas)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  arriba: { position: 'absolute', left: 0, right: 0, gap: 10 },
  aviso: { marginHorizontal: 16, padding: 14, gap: 10, borderRadius: 14, borderWidth: 1 },
  avisoTexto: { fontSize: 16, lineHeight: 22 },
  abajo: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 12 },
  botones: { alignSelf: 'flex-end', gap: 12 }, // columna de botones pegada a la derecha
  botonRedondo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarjeta: { padding: 16, gap: 6, borderRadius: 16, borderWidth: 1 },
  tarjetaEncabezado: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tarjetaNombre: { flex: 1, fontSize: 22, fontWeight: '800' },
  tarjetaCategoria: { fontSize: 16, fontWeight: '700' },
  tarjetaDato: { fontSize: 17, fontWeight: '600' },
  filaDistancia: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textoDistancia: { flex: 1 },
  flecha: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tarjetaBotones: { flexDirection: 'row', gap: 10, marginTop: 4 },
  tarjetaBoton: { flex: 1 },
  // paddingHorizontal: el primer y el último filtro no quedan pegados al borde,
  // pero la fila se desliza de punta a punta de la pantalla.
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 6 },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 22,
    // Sombra: elevation en Android; shadow* en iPhone.
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  chipTexto: { fontSize: 16, fontWeight: '700' },
});