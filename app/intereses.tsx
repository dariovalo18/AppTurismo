import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Boton } from '@/componentes/Boton';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarCategorias } from '@/servicios/categorias';
import type { Categoria } from '@/tipos';

// Primera pantalla después de ingresar o crear la cuenta: se eligen los temas de interés.
// Ya vienen tildados los que la cuenta tenía guardados en la API; así se "restauran" al volver a ingresar.
export default function Intereses() {
  const paleta = useTema();
  const router = useRouter();
  const { usuario, guardarPerfil, terminarIntereses } = useSesion();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [elegidas, setElegidas] = useState<string[]>(usuario?.preferencias.categoriasFavoritas ?? []);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarCategorias()
      .then((lista) => setCategorias([...lista].sort((a, b) => a.orden - b.orden)))
      .catch(() => setCategorias([]))
      .finally(() => setCargando(false));
  }, []);

  const alternar = (id: string) =>
    setElegidas((actuales) => (actuales.includes(id) ? actuales.filter((c) => c !== id) : [...actuales, id]));

  const seguir = () => {
    terminarIntereses();
    router.replace('/inicio');
  };

  const guardarYSeguir = async () => {
    setGuardando(true);
    setError(null);
    try {
      await guardarPerfil({ preferencias: { categoriasFavoritas: elegidas } });
      seguir();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar. Probá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={[styles.titulo, { color: paleta.texto }]}>¿Qué te interesa?</Text>
        <Text style={[styles.texto, { color: paleta.textoSuave }]}>
          Elegí lo que más te gusta y te mostramos primero lo que tengas cerca. Lo podés cambiar cuando quieras desde Yo.
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={paleta.acento} />
        ) : categorias.length === 0 ? (
          <Text style={[styles.texto, { color: paleta.textoSuave }]}>
            No pudimos cargar las categorías. Podés elegirlas más tarde desde Yo.
          </Text>
        ) : (
          <View style={styles.opciones}>
            {categorias.map((c) => {
              const elegida = elegidas.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => alternar(c.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: elegida }}
                  style={[
                    styles.opcion,
                    { borderColor: paleta.acento, backgroundColor: elegida ? paleta.acento : paleta.superficie },
                  ]}
                >
                  <Text style={[styles.opcionTexto, { color: elegida ? paleta.sobreAcento : paleta.acento }]}>
                    {c.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {error ? (
          <Text accessibilityRole="alert" style={[styles.texto, { color: paleta.error }]}>
            {error}
          </Text>
        ) : null}

        <Boton etiqueta="Continuar" onPress={guardarYSeguir} cargando={guardando} />
        <Boton etiqueta="Ahora no" variante="secundario" onPress={seguir} deshabilitado={guardando} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 24, gap: 16 },
  titulo: { fontSize: 32, fontWeight: '800' },
  texto: { fontSize: 18, lineHeight: 26 },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  opcion: { minHeight: 48, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 2 },
  opcionTexto: { fontSize: 17, fontWeight: '700' },
});
