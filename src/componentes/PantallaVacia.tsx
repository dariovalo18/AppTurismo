import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTema } from '@/proveedores/ProveedorTema';

// Pantalla en blanco para las secciones que todavía no se armaron.
export function PantallaVacia({ titulo }: { titulo: string }) {
  const paleta = useTema();

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <View style={styles.centro}>
        <Text style={[styles.titulo, { color: paleta.texto }]}>{titulo}</Text>
        <Text style={[styles.texto, { color: paleta.textoSuave }]}>Próximamente</Text>
      </View>
    </SafeAreaView>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  titulo: { fontSize: 28, fontWeight: '800' },
  texto: { fontSize: 18 },
});
