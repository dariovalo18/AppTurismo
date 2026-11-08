import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Boton } from '@/componentes/Boton';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { obtenerLugar } from '@/servicios/lugares';
import { LARGO_MAX_NOTA, registrarVisita } from '@/servicios/visitas';
import type { Lugar, OrigenVisita } from '@/tipos';

const ORIGENES: OrigenVisita[] = ['qr', 'gps', 'manual'];

// Formulario de la visita: foto (cámara o galería) y nota. El lugar y el origen llegan por parámetros.
export default function NuevaVisita() {
  const { lugarId, origen: origenParam } = useLocalSearchParams<{ lugarId?: string; origen?: string }>();
  const paleta = useTema();
  const router = useRouter();
  const { usuario } = useSesion();
  const usuarioId = usuario?.id ?? null;

  // Un parámetro inválido no rompe nada: cae en "manual".
  const origen: OrigenVisita = ORIGENES.includes(origenParam as OrigenVisita)
    ? (origenParam as OrigenVisita)
    : 'manual';

  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorLugar, setErrorLugar] = useState<string | null>(null);

  const [foto, setFoto] = useState<string | null>(null);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  useEffect(() => {
    if (!lugarId) {
      setErrorLugar('Falta elegir el lugar.');
      setCargando(false);
      return;
    }
    // Sin señal sale de la copia guardada en el teléfono.
    obtenerLugar(lugarId)
      .then(setLugar)
      .catch((e) => setErrorLugar(e.message ?? 'No pudimos cargar el lugar.'))
      .finally(() => setCargando(false));
  }, [lugarId]);

  async function sacarFoto() {
    setErrorFoto(null);
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        setErrorFoto('Sin permiso de cámara. Podés elegir una foto de la galería o guardar la visita sin foto.');
        return;
      }
      const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!resultado.canceled) setFoto(resultado.assets[0].uri);
    } catch {
      setErrorFoto('No pudimos abrir la cámara. Probá con la galería.');
    }
  }

  async function elegirDeGaleria() {
    setErrorFoto(null);
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!resultado.canceled) setFoto(resultado.assets[0].uri);
    } catch {
      setErrorFoto('No pudimos abrir la galería.');
    }
  }

  async function guardar() {
    if (guardando || !lugar) return; // evita guardar dos veces si se toca rápido
    if (!usuarioId) {
      setErrorGuardar('Para registrar visitas tenés que ingresar con tu cuenta.');
      return;
    }
    setGuardando(true);
    setErrorGuardar(null);
    try {
      await registrarVisita({ usuarioId, lugarId: lugar.id, origen, fotoOrigen: foto, nota });
      // Vibración al registrar (expo-haptics). Si el teléfono no puede vibrar, no pasa nada.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/(tabs)/recorrido');
    } catch {
      setErrorGuardar('No pudimos guardar la visita. Probá de nuevo.');
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro, { backgroundColor: paleta.fondo }]}>
        <ActivityIndicator size="large" color={paleta.acento} />
      </SafeAreaView>
    );
  }

  if (!lugar) {
    return (
      <SafeAreaView style={[styles.pantalla, styles.centro, { backgroundColor: paleta.fondo }]}>
        <Text style={[styles.mensaje, { color: paleta.error }]}>{errorLugar ?? 'No encontramos el lugar.'}</Text>
        <Boton etiqueta="Volver" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Boton etiqueta="Cancelar" variante="secundario" onPress={() => router.back()} />

        <Text style={[styles.subtitulo, { color: paleta.textoSuave }]}>Registrar visita en</Text>
        <Text style={[styles.titulo, { color: paleta.texto }]}>{lugar.nombre}</Text>

        {/* Foto (opcional) */}
        <Text style={[styles.etiqueta, { color: paleta.texto }]}>Foto (opcional)</Text>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.foto} accessibilityLabel="Foto elegida para la visita" />
        ) : null}
        <Boton etiqueta={foto ? 'Sacar otra foto' : 'Sacar una foto'} variante="secundario" onPress={sacarFoto} />
        <Boton etiqueta="Elegir de la galería" variante="secundario" onPress={elegirDeGaleria} />
        {foto ? <Boton etiqueta="Quitar la foto" variante="secundario" onPress={() => setFoto(null)} /> : null}
        {errorFoto ? <Text style={[styles.error, { color: paleta.error }]}>{errorFoto}</Text> : null}

        {/* Nota (opcional, hasta 280 caracteres) */}
        <Text style={[styles.etiqueta, { color: paleta.texto }]}>Nota (opcional)</Text>
        <TextInput
          value={nota}
          onChangeText={setNota}
          maxLength={LARGO_MAX_NOTA}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Nota de la visita"
          style={[
            styles.nota,
            { color: paleta.texto, backgroundColor: paleta.superficie, borderColor: paleta.borde },
          ]}
        />
        <Text style={[styles.contador, { color: paleta.textoSuave }]}>
          {nota.length}/{LARGO_MAX_NOTA}
        </Text>

        {errorGuardar ? <Text style={[styles.error, { color: paleta.error }]}>{errorGuardar}</Text> : null}
        <View style={styles.guardar}>
          <Boton etiqueta="Guardar visita" cargando={guardando} onPress={guardar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  contenido: { padding: 16, gap: 12 },
  subtitulo: { fontSize: 16, fontWeight: '600' },
  titulo: { fontSize: 28, fontWeight: '800' },
  etiqueta: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  foto: { width: '100%', height: 220,},
  nota: { minHeight: 120, borderWidth: 2, padding: 14, fontSize: 18 },
  contador: { fontSize: 16, textAlign: 'right' },
  error: { fontSize: 16, lineHeight: 22 },
  mensaje: { fontSize: 18, textAlign: 'center' },
  guardar: { marginTop: 8 },
});
