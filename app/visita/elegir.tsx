import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Boton } from '@/componentes/Boton';
import { CampoTexto } from '@/componentes/CampoTexto';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarLugares } from '@/servicios/lugares';
import type { Lugar } from '@/tipos';
import { distanciaMetros, formatearDistancia } from '@/utilidades/distancia';

// Para registrar una visita por GPS: a cuántos metros como máximo. El PRD no fija el número (pregunta pendiente).
const RADIO_VISITA_GPS_METROS = 150;

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// Lugares activos del catálogo (con la copia offline si no hay señal).
function useLugaresActivos() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    listarLugares()
      .then((lista) => setLugares(lista.filter((l) => l.activo)))
      .catch((e) => setError(e.message ?? 'No pudimos cargar los lugares.'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { lugares, cargando, error, cargar };
}

export default function ElegirLugar() {
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const paleta = useTema();
  const router = useRouter();
  const esGps = modo === 'gps';

  // Al elegir, se pasa al formulario. replace: al volver atrás se vuelve al recorrido, no a esta lista.
  const elegir = (lugar: Lugar) =>
    router.replace({
      pathname: '/visita/nueva',
      params: { lugarId: lugar.id, origen: esGps ? 'gps' : 'manual' },
    });

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <View style={styles.cabecera}>
        <Boton etiqueta="Volver" variante="secundario" onPress={() => router.back()} />
        <Text style={[styles.titulo, { color: paleta.texto }]}>
          {esGps ? 'Lugares cerca tuyo' : '¿Dónde estuviste?'}
        </Text>
      </View>
      {esGps ? <ListaGps onElegir={elegir} /> : <ListaManual onElegir={elegir} />}
    </SafeAreaView>
  );
}

// ─── Modo manual: todos los lugares, con buscador ────────────────────────────
function ListaManual({ onElegir }: { onElegir: (lugar: Lugar) => void }) {
  const paleta = useTema();
  const { lugares, cargando, error, cargar } = useLugaresActivos();
  const [busqueda, setBusqueda] = useState('');

  const visibles = useMemo(
    () => lugares.filter((l) => normalizar(l.nombre).includes(normalizar(busqueda))),
    [lugares, busqueda],
  );

  if (cargando) return <Cargando />;
  if (error) return <Falla mensaje={error} onReintentar={cargar} />;

  return (
    <View style={styles.cuerpo}>
      <CampoTexto etiqueta="Buscar por nombre" value={busqueda} onChangeText={setBusqueda} />
      <FlatList
        data={visibles}
        keyExtractor={(l) => l.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>No hay lugares con ese nombre.</Text>
        }
        renderItem={({ item }) => <FilaLugar nombre={item.nombre} detalle={item.direccion} onPress={() => onElegir(item)} />}
      />
    </View>
  );
}

// ─── Modo GPS: solo los lugares a menos de RADIO_VISITA_GPS_METROS ───────────
function ListaGps({ onElegir }: { onElegir: (lugar: Lugar) => void }) {
  const paleta = useTema();
  const router = useRouter();
  const { estado, coordenadas, puedePedirDeNuevo, pedir } = useUbicacion();
  const { lugares, cargando, error, cargar } = useLugaresActivos();

  const cercanos = useMemo(() => {
    if (!coordenadas) return [];
    return lugares
      .map((lugar) => ({ lugar, metros: distanciaMetros(coordenadas, lugar.coordenadas) }))
      .filter((x) => x.metros <= RADIO_VISITA_GPS_METROS)
      .sort((a, b) => a.metros - b.metros);
  }, [coordenadas, lugares]);

  const irAManual = () => router.replace({ pathname: '/visita/elegir', params: { modo: 'manual' } });

  // Sin permiso o sin GPS la app sigue usable: se puede cargar a mano.
  if (estado === 'denegada' || estado === 'error') {
    return (
      <View style={styles.cuerpoCentro}>
        <Text style={[styles.mensaje, { color: paleta.texto }]}>
          {estado === 'denegada'
            ? 'Sin tu ubicación no podemos saber qué lugar tenés cerca.'
            : 'No pudimos obtener tu ubicación. Revisá que el GPS esté encendido.'}
        </Text>
        {estado === 'denegada' && !puedePedirDeNuevo ? (
          <Boton etiqueta="Abrir ajustes del teléfono" onPress={() => Linking.openSettings()} />
        ) : (
          <Boton etiqueta={estado === 'denegada' ? 'Permitir ubicación' : 'Reintentar'} onPress={pedir} />
        )}
        <Boton etiqueta="Cargar la visita a mano" variante="secundario" onPress={irAManual} />
      </View>
    );
  }

  if ((estado === 'cargando' && !coordenadas) || cargando) return <Cargando texto="Buscando tu ubicación…" />;
  if (error) return <Falla mensaje={error} onReintentar={cargar} />;

  return (
    <View style={styles.cuerpo}>
      <FlatList
        data={cercanos}
        keyExtractor={(x) => x.lugar.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.cuerpoCentro}>
            <Text style={[styles.mensaje, { color: paleta.texto }]}>
              No estás cerca de ningún lugar de la guía (a menos de {RADIO_VISITA_GPS_METROS} m).
            </Text>
            <Boton etiqueta="Cargar la visita a mano" onPress={irAManual} />
          </View>
        }
        renderItem={({ item }) => (
          <FilaLugar
            nombre={item.lugar.nombre}
            detalle={`A ${formatearDistancia(item.metros)}`}
            onPress={() => onElegir(item.lugar)}
          />
        )}
      />
    </View>
  );
}

// ─── Piezas compartidas ──────────────────────────────────────────────────────
function FilaLugar({ nombre, detalle, onPress }: { nombre: string; detalle: string; onPress: () => void }) {
  const paleta = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${nombre}. ${detalle}`}
      onPress={onPress}
      style={[styles.fila, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}
    >
      <Text style={[styles.filaNombre, { color: paleta.texto }]}>{nombre}</Text>
      <Text style={[styles.filaDetalle, { color: paleta.textoSuave }]}>{detalle}</Text>
    </Pressable>
  );
}

function Cargando({ texto }: { texto?: string }) {
  const paleta = useTema();
  return (
    <View style={styles.cuerpoCentro}>
      <ActivityIndicator size="large" color={paleta.acento} />
      {texto ? <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>{texto}</Text> : null}
    </View>
  );
}

function Falla({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  const paleta = useTema();
  return (
    <View style={styles.cuerpoCentro}>
      <Text style={[styles.mensaje, { color: paleta.error }]}>{mensaje}</Text>
      <Boton etiqueta="Reintentar" onPress={onReintentar} />
    </View>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  cabecera: { padding: 16, gap: 12 },
  titulo: { fontSize: 28, fontWeight: '800' },
  cuerpo: { flex: 1, paddingHorizontal: 16, gap: 12 },
  cuerpoCentro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  lista: { gap: 10, paddingBottom: 24 },
  mensaje: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
  fila: { minHeight: 64, borderWidth: 2, borderRadius: 12, padding: 14, gap: 2, justifyContent: 'center' },
  filaNombre: { fontSize: 20, fontWeight: '700' },
  filaDetalle: { fontSize: 16 },
});
