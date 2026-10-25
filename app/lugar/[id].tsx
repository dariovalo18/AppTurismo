import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Boton } from '@/componentes/Boton';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarCategorias } from '@/servicios/categorias';
import { obtenerLugar } from '@/servicios/lugares';
import type { Categoria, Lugar } from '@/tipos';
import { estadoApertura, horariosDelDia, NOMBRES_DIA } from '@/utilidades/horarios';

// Precio de entrada: 0 es gratis y null es que no hay dato.
function textoPrecio(precio: number | null) {
  if (precio === null) return 'No informado';
  if (precio === 0) return 'Gratis';
  return `$${precio}`;
}

export default function DetalleLugar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const paleta = useTema();
  const router = useRouter();

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);

    obtenerLugar(id)
      .then(async (datos) => {
        setLugar(datos);
        const categorias = await listarCategorias().catch(() => []);
        setCategoria(categorias.find((c) => c.id === datos.categoriaId) ?? null);
      })
      .catch((e) => setError(e.message ?? 'No pudimos cargar el lugar.'))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando || !lugar) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro, { backgroundColor: paleta.fondo }]}>
        {cargando ? (
          <ActivityIndicator size="large" color={paleta.acento} />
        ) : (
          <>
            <Text style={[styles.mensaje, { color: paleta.error }]}>{error}</Text>
            <Boton etiqueta="Volver" onPress={() => router.back()} />
          </>
        )}
      </SafeAreaView>
    );
  }

  const apertura = estadoApertura(lugar.horarios);

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Boton etiqueta="Volver" variante="secundario" onPress={() => router.back()} />

        {/* Fotos: se deslizan de costado. Algunos lugares no tienen. */}
        {lugar.imagenes.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fotos}>
            {lugar.imagenes.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.foto} />
            ))}
          </ScrollView>
        ) : null}

        <Text style={[styles.titulo, { color: paleta.texto }]}>{lugar.nombre}</Text>
        {categoria ? <Text style={[styles.categoria, { color: paleta.acento }]}>{categoria.nombre}</Text> : null}
        {apertura ? (
          <Text style={[styles.apertura, { color: apertura.abierto ? paleta.acento : paleta.error }]}>
            {apertura.texto}
          </Text>
        ) : null}

        <Text style={[styles.texto, { color: paleta.texto }]}>{lugar.descripcion}</Text>

        <Fila titulo="Dirección" valor={lugar.direccion} />
        <Fila titulo="Entrada" valor={textoPrecio(lugar.precioEntrada)} />
        <Fila titulo="Accesible en silla de ruedas" valor={lugar.accesible ? 'Sí' : 'No'} />

        <Text style={[styles.subtitulo, { color: paleta.texto }]}>Horarios</Text>
        {lugar.horarios.length === 0 ? (
          <Text style={[styles.texto, { color: paleta.textoSuave }]}>Horario no informado.</Text>
        ) : (
          NOMBRES_DIA.map((nombre, dia) => <Fila key={nombre} titulo={nombre} valor={horariosDelDia(lugar.horarios, dia)} />)
        )}

        {/* Teléfono y sitio web: solo si el lugar los tiene. */}
        {lugar.telefono ? (
          <Boton etiqueta={`Llamar al ${lugar.telefono}`} onPress={() => Linking.openURL(`tel:${lugar.telefono}`)} />
        ) : null}
        {lugar.sitioWeb ? <Boton etiqueta="Abrir sitio web" variante="secundario" onPress={() => Linking.openURL(lugar.sitioWeb!)} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Fila({ titulo, valor }: { titulo: string; valor: string }) {
  const paleta = useTema();
  return (
    <View style={styles.fila}>
      <Text style={[styles.filaTitulo, { color: paleta.textoSuave }]}>{titulo}</Text>
      <Text style={[styles.filaValor, { color: paleta.texto }]}>{valor}</Text>
    </View>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  contenido: { padding: 16, gap: 12 },
  fotos: { gap: 8 },
  foto: { width: 300, height: 200, borderRadius: 12 },
  titulo: { fontSize: 28, fontWeight: '800' },
  categoria: { fontSize: 18, fontWeight: '700' },
  apertura: { fontSize: 18, fontWeight: '700' },
  texto: { fontSize: 18, lineHeight: 26 },
  subtitulo: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  mensaje: { fontSize: 18, textAlign: 'center' },
  fila: { gap: 2 },
  filaTitulo: { fontSize: 16, fontWeight: '600' },
  filaValor: { fontSize: 18 },
});
