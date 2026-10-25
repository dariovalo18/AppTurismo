import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@react-native-vector-icons/ionicons';

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
  const [enCuadricula, setEnCuadricula] = useState(false); // false = lista, true = 2 columnas
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [total, setTotal] = useState<number | null>(null);

  // Las categorías se piden una sola vez, y también la lista completa para contar
  // cuántos lugares tiene cada una (la API no manda ese número).
  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => {});
    listarLugares()
      .then((todos) => {
        const cuenta: Record<string, number> = {};
        todos.forEach((l) => (cuenta[l.categoriaId] = (cuenta[l.categoriaId] ?? 0) + 1));
        setCantidades(cuenta);
        setTotal(todos.length);
      })
      .catch(() => {});
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
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, { color: paleta.texto }]}>Lugares</Text>
        {/* Cambia entre lista (una tarjeta grande por fila) y cuadrícula (dos por fila). */}
        <Pressable
          onPress={() => setEnCuadricula(!enCuadricula)}
          accessibilityRole="button"
          accessibilityLabel={enCuadricula ? 'Ver como lista' : 'Ver como cuadrícula'}
          style={[styles.botonVista, { borderColor: paleta.acento, backgroundColor: paleta.superficie }]}
        >
          <Ionicons name={enCuadricula ? 'list-outline' : 'grid-outline'} size={26} color={paleta.acento} />
        </Pressable>
      </View>

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
          <Chip
            etiqueta={total === null ? 'Todas' : `Todas (${total})`}
            activo={categoriaId === undefined}
            onPress={() => setCategoriaId(undefined)}
          />
          {categorias.map((c) => (
            <Chip
              key={c.id}
              etiqueta={total === null ? c.nombre : `${c.nombre} (${cantidades[c.id] ?? 0})`}
              activo={categoriaId === c.id}
              onPress={() => setCategoriaId(c.id)}
            />
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
          // FlatList no deja cambiar numColumns "en caliente": cambiando la key se arma de nuevo.
          key={enCuadricula ? 'cuadricula' : 'lista'}
          numColumns={enCuadricula ? 2 : 1}
          columnWrapperStyle={enCuadricula ? styles.columnas : undefined}
          data={lugares}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>No encontramos lugares con esa búsqueda.</Text>
          }
          renderItem={({ item }) => (
            <TarjetaLugar
              lugar={item}
              compacta={enCuadricula}
              onPress={() => router.push({ pathname: '/lugar/[id]', params: { id: item.id } })}
            />
          )}
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

// compacta = vista en cuadrícula: foto más baja, sin descripción y con el nombre más chico.
function TarjetaLugar({ lugar, compacta, onPress }: { lugar: Lugar; compacta: boolean; onPress: () => void }) {
  const paleta = useTema();
  const apertura = estadoApertura(lugar.horarios);
  const alturaFoto = compacta ? 100 : 160;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.tarjeta,
        compacta && styles.tarjetaCompacta,
        { backgroundColor: paleta.superficie, borderColor: paleta.borde },
      ]}
    >
      {/* Algunos lugares no tienen fotos. */}
      {lugar.imagenes.length > 0 ? (
        <Image source={{ uri: lugar.imagenes[0] }} style={[styles.foto, { height: alturaFoto }]} />
      ) : (
        <View style={[styles.foto, styles.sinFoto, { height: alturaFoto, backgroundColor: paleta.borde }]}>
          <Text style={{ color: paleta.textoSuave }}>Sin foto</Text>
        </View>
      )}
      <View style={styles.tarjetaTexto}>
        <Text style={[styles.nombre, compacta && styles.nombreCompacto, { color: paleta.texto }]} numberOfLines={2}>
          {lugar.nombre}
        </Text>
        {compacta ? null : (
          <Text style={[styles.descripcion, { color: paleta.textoSuave }]} numberOfLines={2}>
            {lugar.descripcionCorta}
          </Text>
        )}
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
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  titulo: { fontSize: 28, fontWeight: '800' },
  botonVista: { width: 48, height: 48, borderWidth: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  columnas: { gap: 12 },
  buscador: { minHeight: 56, borderWidth: 2, borderRadius: 12, paddingHorizontal: 14, fontSize: 18 },
  categorias: { gap: 8, paddingVertical: 4 },
  chip: { minHeight: 44, borderWidth: 2, borderRadius: 22, paddingHorizontal: 16, justifyContent: 'center' },
  chipTexto: { fontSize: 16, fontWeight: '700' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mensaje: { fontSize: 18, textAlign: 'center', marginTop: 24 },
  lista: { gap: 12, paddingBottom: 24 },
  tarjeta: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  tarjetaCompacta: { flex: 1 }, // en la cuadrícula, cada tarjeta ocupa la mitad del ancho
  foto: { width: '100%' },
  sinFoto: { alignItems: 'center', justifyContent: 'center' },
  tarjetaTexto: { padding: 12, gap: 4 },
  nombre: { fontSize: 20, fontWeight: '700' },
  nombreCompacto: { fontSize: 16 },
  descripcion: { fontSize: 16 },
  apertura: { fontSize: 16, fontWeight: '700' },
});
