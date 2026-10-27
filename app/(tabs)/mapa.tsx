import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/componentes/Boton';
import { useUbicacion } from '@/hooks/useUbicacion';
import { useTema } from '@/proveedores/ProveedorTema';

export default function Mapa() {
  const paleta = useTema();
  const { estado, coordenadas, puedePedirDeNuevo, pedir } = useUbicacion();

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <Text style={[styles.titulo, { color: paleta.texto }]}>Mapa</Text>

      {estado === 'cargando' ? <ActivityIndicator size="large" color={paleta.acento} /> : null}

      {estado === 'lista' && coordenadas ? (
        <Text style={[styles.texto, { color: paleta.texto }]}>
          Latitud: {coordenadas.latitud.toFixed(5)}
          {'\n'}
          Longitud: {coordenadas.longitud.toFixed(5)}
        </Text>
      ) : null}

      {estado === 'denegada' ? (
        <View style={styles.bloque}>
          <Text style={[styles.texto, { color: paleta.texto }]}>
            No tenemos permiso para ver tu ubicación. Igual podés ver los lugares, pero sin distancias.
          </Text>
          <Boton
            etiqueta={puedePedirDeNuevo ? 'Permitir ubicación' : 'Abrir ajustes'}
            onPress={puedePedirDeNuevo ? pedir : () => Linking.openSettings()}
          />
        </View>
      ) : null}

      {estado === 'error' ? (
        <View style={styles.bloque}>
          <Text style={[styles.texto, { color: paleta.error }]}>
            No pudimos saber dónde estás. Revisá que la ubicación del teléfono esté activada.
          </Text>
          <Boton etiqueta="Reintentar" onPress={pedir} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, padding: 24, gap: 16 },
  titulo: { fontSize: 28, fontWeight: '800' },
  texto: { fontSize: 18, lineHeight: 26 },
  bloque: { gap: 12 },
});