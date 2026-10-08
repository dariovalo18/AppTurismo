import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/componentes/Boton';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';

export default function Yo() {
  const paleta = useTema();
  const { modo, usuario, salir } = useSesion();

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <View style={styles.contenido}>
        <Text style={[styles.titulo, { color: paleta.texto }]}>{usuario ? usuario.nombre : 'Visitante'}</Text>
        <Text style={[styles.texto, { color: paleta.textoSuave }]}>
          {usuario ? usuario.email : 'Entraste sin cuenta'}
        </Text>
        <Boton
          etiqueta={modo === 'sesion' ? 'Cerrar sesión' : 'Iniciar sesión'}
          variante="secundario"
          onPress={salir}
        />
      </View>
    </SafeAreaView>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 24, gap: 12 },
  titulo: { fontSize: 28, fontWeight: '800' },
  texto: { fontSize: 18, marginBottom: 12 },
});
