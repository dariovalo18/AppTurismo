import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarFavoritos } from '@/servicios/favoritos';
import { listarLugares } from '@/servicios/lugares';
import type { Lugar } from '@/tipos';
import { estadoApertura } from '@/utilidades/horarios';

// Favoritos. Cada favorito trae solo el lugarId: el resto sale del catálogo.
export default function Favoritos() {
  const paleta = useTema();
  const router = useRouter();
  const { usuario, salir } = useSesion();

  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [desdeCopia, setDesdeCopia] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!usuario) return;
    setCargando(true);
    setError(null);
    try {
      const [resultado, catalogo] = await Promise.all([listarFavoritos(usuario.id), listarLugares()]);
      const porId = Object.fromEntries(catalogo.map((l) => [l.id, l]));
      setLugares(
        // Si un lugar se dio de baja, no se muestra.
        resultado.favoritos.map((f) => porId[f.lugarId]).filter((l): l is Lugar => l !== undefined),
      );
      setDesdeCopia(resultado.desdeCopia);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos cargar tus favoritos.');
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  // Se vuelve a cargar cada vez que la pestaña se muestra (por ejemplo, al volver del detalle).
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  // Estados: sin cuenta, cargando, error, vacía y con datos.
  let cuerpo: React.ReactNode;
  if (!usuario) {
    cuerpo = (
      <Centro icono="heart-outline" texto="Para guardar favoritos necesitás una cuenta.">
        <Boton etiqueta="Ingresar o crear cuenta" onPress={salir} />
      </Centro>
    );
  } else if (cargando && lugares.length === 0) {
    cuerpo = <ActivityIndicator size="large" color={paleta.acento} style={styles.ruedita} />;
  } else if (error) {
    cuerpo = (
      <Centro icono="cloud-offline-outline" texto={error}>
        <Boton etiqueta="Reintentar" onPress={cargar} />
      </Centro>
    );
  } else if (lugares.length === 0) {
    cuerpo = (
      <Centro icono="heart-outline" texto="Todavía no tenés favoritos. Tocá el corazón en un lugar para guardarlo acá.">
        <Boton etiqueta="Ver lugares" variante="secundario" onPress={() => router.push('/lugares')} />
      </Centro>
    );
  } else {
    cuerpo = (
      <FlatList
        data={lugares}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.lista}
        onRefresh={cargar}
        refreshing={cargando}
        renderItem={({ item }) => (
          <FilaFavorito
            lugar={item}
            onPress={() => router.push({ pathname: '/lugar/[id]', params: { id: item.id } })}
          />
        )}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <Text style={[styles.titulo, { color: paleta.texto }]}>Favoritos</Text>
      {desdeCopia ? (
        <Text style={[styles.aviso, { color: paleta.error, borderColor: paleta.error }]}>
          Sin conexión: te mostramos los favoritos guardados en el teléfono.
        </Text>
      ) : null}
      {cuerpo}
    </SafeAreaView>
  );
}

// Una fila: foto, nombre, descripción corta y si está abierto ahora.
function FilaFavorito({ lugar, onPress }: { lugar: Lugar; onPress: () => void }) {
  const paleta = useTema();
  const apertura = estadoApertura(lugar.horarios);
  const foto = lugar.imagenes[0];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={lugar.nombre}
      style={[styles.fila, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}
    >
      {foto ? (
        <Image source={{ uri: foto }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.sinFoto, { backgroundColor: paleta.borde }]}>
          <Ionicons name="image-outline" size={28} color={paleta.textoSuave} />
        </View>
      )}
      <View style={styles.textos}>
        <Text style={[styles.nombre, { color: paleta.texto }]} numberOfLines={2}>
          {lugar.nombre}
        </Text>
        <Text style={[styles.descripcion, { color: paleta.textoSuave }]} numberOfLines={2}>
          {lugar.descripcionCorta}
        </Text>
        {apertura ? (
          <Text style={[styles.apertura, { color: apertura.abierto ? paleta.secundario : paleta.error }]}>
            {apertura.texto}
          </Text>
        ) : null}
      </View>
      <Ionicons name="heart" size={24} color={paleta.error} />
    </Pressable>
  );
}

// Mensaje centrado con un ícono (para vacío, error y sin cuenta).
function Centro({
  icono,
  texto,
  children,
}: {
  icono: 'heart-outline' | 'cloud-offline-outline';
  texto: string;
  children?: React.ReactNode;
}) {
  const paleta = useTema();
  return (
    <View style={styles.centro}>
      <Ionicons name={icono} size={56} color={paleta.acento} style={styles.iconoCentro} />
      <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>{texto}</Text>
      {children}
    </View>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  titulo: { fontSize: 28, fontWeight: '800', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  aviso: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderWidth: 2,
  },
  ruedita: { marginTop: 40 },
  lista: { padding: 20, gap: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1 },
  foto: { width: 72, height: 72,},
  sinFoto: { alignItems: 'center', justifyContent: 'center' },
  textos: { flex: 1, gap: 2 },
  nombre: { fontSize: 18, fontWeight: '700' },
  descripcion: { fontSize: 15 },
  apertura: { fontSize: 15, fontWeight: '600' },
  centro: { flex: 1, alignItems: 'stretch', justifyContent: 'center', gap: 16, padding: 24 },
  iconoCentro: { alignSelf: 'center' },
  mensaje: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
});
