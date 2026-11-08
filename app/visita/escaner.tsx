import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { Boton } from '@/componentes/Boton';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarLugares } from '@/servicios/lugares';
import { buscarLugarPorQr, leerCodigoQr } from '@/utilidades/qr';

// Escáner del QR del cartel. Un QR ajeno o roto muestra un aviso y sigue escaneando: nunca cuelga la app.
// Docs expo-camera: https://docs.expo.dev/versions/latest/sdk/camera/
export default function EscanerQr() {
  const paleta = useTema();
  const router = useRouter();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [aviso, setAviso] = useState<string | null>(null);
  // La cámara dispara el evento muchas veces por segundo con el mismo QR: este "candado" deja pasar uno solo.
  const ocupado = useRef(false);

  async function alEscanear({ data }: { data: string }) {
    if (ocupado.current) return;
    ocupado.current = true;
    setAviso(null);

    try {
      const codigo = leerCodigoQr(data);
      if (!codigo) {
        setAviso('Ese código no es de Mi Ciudad. Probá con el cartel de un lugar.');
        return;
      }

      // Funciona sin señal: el catálogo sale de la copia guardada en el teléfono.
      const lugar = buscarLugarPorQr(codigo, await listarLugares());
      if (!lugar) {
        setAviso('No encontramos ese lugar en la guía. Puede que el cartel esté desactualizado.');
        return;
      }

      Haptics.selectionAsync().catch(() => {});
      router.replace({ pathname: '/visita/nueva', params: { lugarId: lugar.id, origen: 'qr' } });
    } catch {
      setAviso('No pudimos leer el código. Probá de nuevo.');
    } finally {
      // Tras un rechazo esperamos 2 segundos antes de leer otro, para no repetir el aviso sin parar.
      setTimeout(() => {
        ocupado.current = false;
      }, 2000);
    }
  }

  // Todavía no sabemos si hay permiso.
  if (!permiso) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro, { backgroundColor: paleta.fondo }]}>
        <ActivityIndicator size="large" color={paleta.acento} />
      </SafeAreaView>
    );
  }

  // Sin permiso la app sigue andando: se puede cargar la visita a mano.
  if (!permiso.granted) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro, { backgroundColor: paleta.fondo }]}>
        <Text style={[styles.mensaje, { color: paleta.texto }]}>
          Necesitamos la cámara para leer el código QR del cartel.
        </Text>
        {permiso.canAskAgain ? (
          <Boton etiqueta="Permitir cámara" onPress={pedirPermiso} />
        ) : (
          <Boton etiqueta="Abrir ajustes del teléfono" onPress={() => Linking.openSettings()} />
        )}
        <Boton
          etiqueta="Cargar la visita a mano"
          variante="secundario"
          onPress={() => router.replace({ pathname: '/visita/elegir', params: { modo: 'manual' } })}
        />
        <Boton etiqueta="Volver" variante="secundario" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.pantalla}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={alEscanear}
      />

      <SafeAreaView style={styles.superposicion}>
        <Boton etiqueta="Volver" variante="secundario" onPress={() => router.back()} />
        <View style={styles.centroVisor}>
          <View style={styles.marco} />
        </View>
        <View style={[styles.cartel, { backgroundColor: paleta.superficie }]}>
          <Text style={[styles.mensaje, { color: aviso ? paleta.error : paleta.texto }]}>
            {aviso ?? 'Apuntá la cámara al código QR del cartel.'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#000000' },
  centro: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  superposicion: { flex: 1, padding: 16, justifyContent: 'space-between' },
  centroVisor: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  marco: { width: 240, height: 240, borderWidth: 4, borderColor: '#FFFFFF',},
  cartel: { padding: 14 },
  mensaje: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
});
