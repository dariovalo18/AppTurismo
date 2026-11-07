import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useNetworkState } from 'expo-network';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { BotonDescargaAudioguia } from '@/componentes/BotonDescargaAudioguia';
import { useCatalogo } from '@/hooks/useCatalogo';
import { useTema } from '@/proveedores/ProveedorTema';
import { estaDescargada, uriAudioguia } from '@/servicios/audioguiasOffline';
import type { Lugar } from '@/tipos';
import { formatearTiempo } from '@/utilidades/tiempo';

// Cuántos segundos se adelanta o retrocede.
const SALTO_SEGUNDOS = 15;

// Audioguías: lista de lugares con audioguía y reproductor (expo-audio, ver PDF).
// Se puede abrir con un lugar ya elegido: /audioguias?lugarId=lug-004
export default function Audioguias() {
  const paleta = useTema();
  const { lugarId } = useLocalSearchParams<{ lugarId?: string }>();
  const { lugares, cargando, error, reintentar } = useCatalogo();
  const [elegidoId, setElegidoId] = useState<string | null>(lugarId ?? null);

  // Si llega otro lugar por parámetro, se cambia la audioguía elegida.
  useEffect(() => {
    if (lugarId) setElegidoId(lugarId);
  }, [lugarId]);

  // Que siga sonando con la pantalla apagada y, en iPhone, aunque esté en silencio.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix', // si había música sonando, se pausa
    }).catch(() => {});
  }, []);

  // Solo los lugares que tienen audioguía, ordenados por nombre.
  const conAudio = lugares.filter((l) => l.audioguia !== null).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const elegido = conAudio.find((l) => l.id === elegidoId) ?? null;

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={[styles.titulo, { color: paleta.texto }]}>Audioguías</Text>

        {/* Con key, al cambiar de lugar se crea un reproductor nuevo */}
        {elegido ? <Reproductor key={elegido.id} lugar={elegido} /> : null}

        <Text style={[styles.subtitulo, { color: paleta.texto }]}>
          {elegido ? 'Otras audioguías' : 'Elegí qué querés escuchar'}
        </Text>

        {/* Estados de carga, error y vacío visibles en pantalla */}
        {cargando ? (
          <ActivityIndicator size="large" color={paleta.acento} />
        ) : error ? (
          <View style={styles.bloque}>
            <Text style={[styles.mensaje, { color: paleta.error }]}>{error}</Text>
            <Boton etiqueta="Reintentar" onPress={reintentar} />
          </View>
        ) : conAudio.length === 0 ? (
          <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>Todavía no hay audioguías cargadas.</Text>
        ) : (
          conAudio.map((lugar) => (
            <FilaAudioguia
              key={lugar.id}
              lugar={lugar}
              elegida={lugar.id === elegidoId}
              onPress={() => setElegidoId(lugar.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Reproductor: reproducir/pausa, retroceder y adelantar, tiempo escuchado y cuánto falta.
function Reproductor({ lugar }: { lugar: Lugar }) {
  const paleta = useTema();
  const red = useNetworkState();
  const descargada = estaDescargada(lugar);

  // El archivo del teléfono si está descargada (Persona 2); si no, la URL de la API.
  const uri = uriAudioguia(lugar);
  const player = useAudioPlayer(uri ? { uri } : null);
  const estado = useAudioPlayerStatus(player);

  // Hasta que carga el audio se usa la duración que manda la API.
  const duracion = estado.duration > 0 ? estado.duration : (lugar.audioguia?.duracionSegundos ?? 0);
  const actual = Math.min(estado.currentTime, duracion);
  const restante = Math.max(0, duracion - actual);
  const progreso = duracion > 0 ? actual / duracion : 0;

  // Controles en la pantalla bloqueada: permiten seguir escuchando con el celular en el bolsillo.
  useEffect(() => {
    try {
      player.setActiveForLockScreen(true, { title: lugar.nombre, artist: 'Mi Ciudad Colón' });
    } catch {
      // si el teléfono no lo soporta, igual se puede escuchar
    }
    return () => {
      try {
        player.clearLockScreenControls();
      } catch {}
    };
  }, [player, lugar.nombre]);

  const playPausa = async () => {
    if (estado.playing) {
      player.pause();
      return;
    }
    // Si terminó, vuelve al principio antes de reproducir.
    if (duracion > 0 && actual >= duracion - 0.5) await player.seekTo(0);
    player.play();
  };

  // Salta x segundos (negativo = para atrás), sin pasarse del principio ni del final.
  const saltar = (segundos: number) => {
    player.seekTo(Math.min(Math.max(0, actual + segundos), duracion));
  };

  // Sin señal y sin descargar no hay de dónde sacar el audio.
  const sinSenal = red.isInternetReachable === false || red.isConnected === false;
  const noSePuede = sinSenal && !descargada;

  return (
    <View style={[styles.reproductor, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}>
      <Text style={[styles.nombre, { color: paleta.texto }]}>{lugar.nombre}</Text>
      <Text style={[styles.detalle, { color: paleta.textoSuave }]}>
        {descargada ? '✓ Descargada: se escucha sin señal' : 'Se escucha por internet'}
      </Text>

      {noSePuede ? (
        <Text style={[styles.mensaje, { color: paleta.error }]}>
          No tenés señal y esta audioguía no está descargada. Bajala cuando tengas conexión.
        </Text>
      ) : (
        <>
          {/* Barra de progreso */}
          <View
            style={[styles.barra, { backgroundColor: paleta.borde }]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: Math.round(duracion), now: Math.round(actual) }}
          >
            <View style={[styles.barraLlena, { backgroundColor: paleta.acento, width: `${progreso * 100}%` }]} />
          </View>
          <View style={styles.tiempos}>
            <Text style={[styles.tiempo, { color: paleta.texto }]}>{formatearTiempo(actual)}</Text>
            <Text style={[styles.tiempo, { color: paleta.texto }]}>Faltan {formatearTiempo(restante)}</Text>
          </View>

          <View style={styles.controles}>
            <BotonRedondo
              icono="play-back"
              etiqueta={`Retroceder ${SALTO_SEGUNDOS} segundos`}
              onPress={() => saltar(-SALTO_SEGUNDOS)}
            />
            <BotonRedondo
              grande
              icono={estado.playing ? 'pause' : 'play'}
              etiqueta={estado.playing ? 'Pausar' : 'Reproducir'}
              onPress={playPausa}
              cargando={!estado.isLoaded}
            />
            <BotonRedondo
              icono="play-forward"
              etiqueta={`Adelantar ${SALTO_SEGUNDOS} segundos`}
              onPress={() => saltar(SALTO_SEGUNDOS)}
            />
          </View>
          <Text style={[styles.ayuda, { color: paleta.textoSuave }]}>
            Podés apagar la pantalla: la audioguía sigue sonando.
          </Text>
        </>
      )}

      {/* Descargar para usar sin señal (Persona 2) */}
      <BotonDescargaAudioguia lugar={lugar} />
    </View>
  );
}

type Icono = 'play' | 'pause' | 'play-back' | 'play-forward';

function BotonRedondo(props: {
  icono: Icono;
  etiqueta: string;
  onPress: () => void;
  grande?: boolean;
  cargando?: boolean;
}) {
  const paleta = useTema();
  const tamano = props.grande ? 84 : 64;
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.cargando}
      accessibilityRole="button"
      accessibilityLabel={props.etiqueta}
      style={[
        styles.redondo,
        { width: tamano, height: tamano, borderRadius: tamano / 2 },
        props.grande ? { backgroundColor: paleta.acento } : { borderWidth: 2, borderColor: paleta.acento },
      ]}
    >
      {props.cargando ? (
        <ActivityIndicator color={props.grande ? paleta.sobreAcento : paleta.acento} />
      ) : (
        <Ionicons
          name={props.icono}
          size={props.grande ? 40 : 28}
          color={props.grande ? paleta.sobreAcento : paleta.acento}
        />
      )}
    </Pressable>
  );
}

// Una fila de la lista: nombre, duración y si ya está descargada.
function FilaAudioguia({ lugar, elegida, onPress }: { lugar: Lugar; elegida: boolean; onPress: () => void }) {
  const paleta = useTema();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: elegida }}
      accessibilityLabel={`Audioguía de ${lugar.nombre}`}
      style={[styles.fila, { backgroundColor: paleta.superficie, borderColor: elegida ? paleta.acento : paleta.borde }]}
    >
      <Ionicons name={elegida ? 'volume-high' : 'headset-outline'} size={28} color={paleta.acento} />
      <View style={styles.filaTextos}>
        <Text style={[styles.filaNombre, { color: paleta.texto }]}>{lugar.nombre}</Text>
        <Text style={[styles.detalle, { color: paleta.textoSuave }]}>
          {formatearTiempo(lugar.audioguia?.duracionSegundos ?? 0)}
          {estaDescargada(lugar) ? ' · descargada' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Botones grandes para usar con una mano y al sol.
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 20, gap: 12 },
  titulo: { fontSize: 28, fontWeight: '800' },
  subtitulo: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  bloque: { gap: 12 },
  mensaje: { fontSize: 17, lineHeight: 24 },
  reproductor: { padding: 16, gap: 12, borderRadius: 16, borderWidth: 1 },
  nombre: { fontSize: 24, fontWeight: '800' },
  detalle: { fontSize: 16 },
  barra: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barraLlena: { height: '100%' },
  tiempos: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  tiempo: { fontSize: 18, fontWeight: '700' },
  controles: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  redondo: { alignItems: 'center', justifyContent: 'center' },
  ayuda: { fontSize: 15, textAlign: 'center' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 2,
  },
  filaTextos: { flex: 1, gap: 2 },
  filaNombre: { fontSize: 18, fontWeight: '700' },
});
