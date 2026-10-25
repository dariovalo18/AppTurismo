import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Boton } from '@/componentes/Boton';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarCategorias } from '@/servicios/categorias';
import { listarLugares } from '@/servicios/lugares';
import type { Categoria, Lugar } from '@/tipos';
import { estadoApertura } from '@/utilidades/horarios';

export default function Lugares() {
  const paleta = useTema();
  const router = useRouter();

  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<string | undefined>(undefined);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0); // sube de a uno con "Reintentar" para volver a pedir

  // Las categorías se piden una sola vez.
  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {});
  }, []);

  // Cada vez que cambia la categoría o el texto (con una pausa de medio segundo) se piden los lugares.
  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    const espera = setTimeout(() => {
      listarLugares({ categoriaId, q: texto.trim() || undefined })
        .then((datos) => !cancelado && setLugares(datos))
        .catch((e) => !cancelado && setError(e.message ?? 'No pudimos cargar los lugares.'))
        .finally(() => !cancelado && setCargando(false));
    }, 500);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [categoriaId, texto, intento]);

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <Text style={[styles.titulo, { color: paleta.texto }]}>Lugares</Text>

      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Buscar por nombre"
        placeholderTextColor={paleta.textoSuave}
        accessibilityLabel="Buscar lugar por nombre"
        style={[styles.buscador, { color: paleta.texto, backgroundColor: paleta.superficie, borderColor: paleta.borde }]}
      />

      {/* Filtro por categoría: "Todas" más una opción por cada categoría. */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categorias}>
          <Chip etiqueta="Todas" activo={categoriaId === undefined} onPress={() => setCategoriaId(undefined)} />
          {categorias.map((c) => (
            <Chip key={c.id} etiqueta={c.nombre} activo={categoriaId === c.id} onPress={() => setCategoriaId(c.id)} />
          ))}
        </ScrollView>
      </View>

      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={paleta.acento} />
        </View>
      ) : error ? (
        <View style={styles.centro}>
          <Text style={[styles.mensaje, { color: paleta.error }]}>{error}</Text>
          <Boton etiqueta="Reintentar" onPress={() => setIntento(intento + 1)} />
        </View>
      ) : (
        <FlatList
          data={lugares}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>No encontramos lugares con esa búsqueda.</Text>
          }
          renderItem={({ item }) => <TarjetaLugar lugar={item} onPress={() => router.push({ pathname: '/lugar/[id]', params: { id: item.id } })} />}
        />
      )}
    </SafeAreaView>
  );
}

function Chip({ etiqueta, activo, onPress }: { etiqueta: string; activo: boolean; onPress: () => void }) {
  const paleta = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={[
        styles.chip,
        { backgroundColor: activo ? paleta.acento : paleta.superficie, borderColor: paleta.acento },
      ]}
    >
      <Text style={[styles.chipTexto, { color: activo ? paleta.sobreAcento : paleta.acento }]}>{etiqueta}</Text>
    </Pressable>
  );
}

function TarjetaLugar({ lugar, onPress }: { lugar: Lugar; onPress: () => void }) {
  const paleta = useTema();
  const apertura = estadoApertura(lugar.horarios);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.tarjeta, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}
    >
      {/* Algunos lugares no tienen fotos. */}
      {lugar.imagenes.length > 0 ? (
        <Image source={{ uri: lugar.imagenes[0] }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.sinFoto, { backgroundColor: paleta.borde }]}>
          <Text style={{ color: paleta.textoSuave }}>Sin foto</Text>
        </View>
      )}
      <View style={styles.tarjetaTexto}>
        <Text style={[styles.nombre, { color: paleta.texto }]} numberOfLines={2}>
          {lugar.nombre}
        </Text>
        <Text style={[styles.descripcion, { color: paleta.textoSuave }]} numberOfLines={2}>
          {lugar.descripcionCorta}
        </Text>
        {apertura ? (
          <Text style={[styles.apertura, { color: apertura.abierto ? paleta.acento : paleta.error }]}>
            {apertura.texto}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  pantalla: { flex: 1, paddingHorizontal: 16, gap: 12 },
  titulo: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  buscador: { minHeight: 56, borderWidth: 2, borderRadius: 12, paddingHorizontal: 14, fontSize: 18 },
  categorias: { gap: 8, paddingVertical: 4 },
  chip: { minHeight: 44, borderWidth: 2, borderRadius: 22, paddingHorizontal: 16, justifyContent: 'center' },
  chipTexto: { fontSize: 16, fontWeight: '700' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mensaje: { fontSize: 18, textAlign: 'center', marginTop: 24 },
  lista: { gap: 12, paddingBottom: 24 },
  tarjeta: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  foto: { width: '100%', height: 160 },
  sinFoto: { alignItems: 'center', justifyContent: 'center' },
  tarjetaTexto: { padding: 12, gap: 4 },
  nombre: { fontSize: 20, fontWeight: '700' },
  descripcion: { fontSize: 16 },
  apertura: { fontSize: 16, fontWeight: '700' },
});
