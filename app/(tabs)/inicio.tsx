import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
// ESTÉTICA: iconos Ionicons. Catálogo de nombres: https://ionic.io/ionicons
// Docs del paquete: https://github.com/oblador/react-native-vector-icons
import Ionicons from '@react-native-vector-icons/ionicons';

import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';

type Opcion = {
  titulo: string;
  ruta: Href;
  icono: React.ComponentProps<typeof Ionicons>['name'];
};

// Opciones del inicio. Para sumar una, agregá la ruta acá y su archivo en app/(tabs)/.
const opciones: Opcion[] = [
  { titulo: 'Lugares', ruta: '/lugares', icono: 'location-outline' },
  { titulo: 'Mapa', ruta: '/mapa', icono: 'map-outline' },
  { titulo: 'Agenda', ruta: '/agenda', icono: 'calendar-outline' },
  { titulo: 'Mi recorrido', ruta: '/recorrido', icono: 'footsteps-outline' },
  { titulo: 'Favoritos', ruta: '/favoritos', icono: 'heart-outline' },
  { titulo: 'Audioguías', ruta: '/audioguias', icono: 'headset-outline' },
];

export default function Inicio() {
  const paleta = useTema();
  const { usuario } = useSesion();

  // Sin usuario (invitado) se saluda genérico.
  const saludo = usuario ? `Hola, ${usuario.nombre.split(' ')[0]}` : 'Hola, visitante';

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={[styles.saludo, { color: paleta.texto }]}>{saludo}</Text>
          <Text style={[styles.pregunta, { color: paleta.textoSuave }]}>¿Qué querés hacer en Colón?</Text>
        </View>

        {/* Grilla de dos columnas: flexWrap acomoda las tarjetas y flexBasis fija su ancho. */}
        <View style={styles.grilla}>
          {opciones.map((opcion) => (
            <Pressable
              key={opcion.titulo}
              accessibilityRole="button"
              accessibilityLabel={opcion.titulo}
              onPress={() => router.push(opcion.ruta)}
              style={[styles.tarjeta, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}
            >
              <Ionicons name={opcion.icono} size={48} color={paleta.acento} />
              <Text style={[styles.tituloOpcion, { color: paleta.texto }]}>{opcion.titulo}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 24, gap: 16 },
  encabezado: { gap: 4 },
  saludo: { fontSize: 32, fontWeight: '800' },
  pregunta: { fontSize: 18 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tarjeta: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  tituloOpcion: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
});
