import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Network from 'expo-network';

import { Boton } from '@/componentes/Boton';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarLugares } from '@/servicios/lugares';
import {
  listarRecorrido,
  sincronizarPendientes,
  traerVisitasDelServidor,
  type VisitaRecorrido,
} from '@/servicios/visitas';
import type { OrigenVisita } from '@/tipos';

const TEXTO_ORIGEN: Record<OrigenVisita, string> = {
  qr: 'Escaneaste el QR',
  gps: 'Registrada por ubicación',
  manual: 'Cargada a mano',
};

function textoFecha(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Recorrido() {
  const paleta = useTema();
  const router = useRouter();
  const { usuario, salir } = useSesion();
  const usuarioId = usuario?.id ?? null;

  // Estado de la red con expo-network: avisa si estamos sin señal y dispara la subida al volver.
  const red = Network.useNetworkState();
  const conectado = red.isConnected !== false && red.isInternetReachable !== false;

  const [visitas, setVisitas] = useState<VisitaRecorrido[]>([]);
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);

  // Lee el recorrido de SQLite (anda sin señal).
  const leerLocal = useCallback(async () => {
    if (!usuarioId) {
      setCargando(false);
      return;
    }
    try {
      setVisitas(await listarRecorrido(usuarioId));
      setError(null);
    } catch {
      setError('No pudimos leer tu recorrido.');
    } finally {
      setCargando(false);
    }
  }, [usuarioId]);

  // Sube lo pendiente y trae lo que haya en el servidor. Nunca tira error: si falla, queda en la cola.
  const sincronizar = useCallback(async () => {
    if (!usuarioId) return;
    setSincronizando(true);
    try {
      await sincronizarPendientes(usuarioId);
      await traerVisitasDelServidor(usuarioId);
      await leerLocal();
    } catch {
      // se reintenta la próxima vez
    } finally {
      setSincronizando(false);
    }
  }, [usuarioId, leerLocal]);

  // Cada vez que se muestra la pestaña, y cada vez que cambia el estado de la red (vuelve la señal).
  useFocusEffect(
    useCallback(() => {
      leerLocal();
      // Nombres de los lugares (salen del catálogo cacheado si no hay señal).
      listarLugares()
        .then((lugares) => setNombres(Object.fromEntries(lugares.map((l) => [l.id, l.nombre]))))
        .catch(() => {});
      if (conectado) sincronizar();
    }, [leerLocal, sincronizar, conectado]),
  );

  const pendientes = visitas.filter((v) => !v.sincronizada).length;

  const cabecera = (
    <View style={styles.cabecera}>
      <Text style={[styles.titulo, { color: paleta.texto }]}>Mi recorrido</Text>

      {!conectado ? (
        <Text style={[styles.aviso, { color: paleta.texto, backgroundColor: paleta.superficie, borderColor: paleta.borde }]}>
          Sin conexión. Podés registrar visitas igual: se suben solas cuando vuelva la señal.
        </Text>
      ) : null}

      {pendientes > 0 ? (
        <View style={[styles.aviso, { backgroundColor: paleta.superficie, borderColor: paleta.borde, gap: 8 }]}>
          <Text style={[styles.textoAviso, { color: paleta.texto }]}>
            {pendientes === 1 ? 'Tenés 1 visita sin subir.' : `Tenés ${pendientes} visitas sin subir.`}
          </Text>
          {conectado ? (
            <Boton etiqueta="Subir ahora" variante="secundario" cargando={sincronizando} onPress={sincronizar} />
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.subtitulo, { color: paleta.texto }]}>Registrar una visita</Text>
      <Boton etiqueta="Escanear el QR del cartel" onPress={() => router.push('/visita/escaner')} />
      <Boton
        etiqueta="Estoy cerca de un lugar (ubicación)"
        variante="secundario"
        onPress={() => router.push({ pathname: '/visita/elegir', params: { modo: 'gps' } })}
      />
      <Boton
        etiqueta="Cargarla a mano"
        variante="secundario"
        onPress={() => router.push({ pathname: '/visita/elegir', params: { modo: 'manual' } })}
      />

      {visitas.length > 0 ? (
        <Text style={[styles.subtitulo, { color: paleta.texto }]}>Tus visitas, en orden</Text>
      ) : null}
    </View>
  );

  // Entró como invitado: el recorrido se guarda en la cuenta, así que hace falta ingresar.
  // (Mirar el mapa y los lugares no pide cuenta.) salir() lleva a la pantalla de login.
  if (!usuarioId) {
    return (
      <SafeAreaView edges={['top']} style={[styles.pantalla, styles.centro, { backgroundColor: paleta.fondo, padding: 16, gap: 12 }]}>
        <Text style={[styles.titulo, { color: paleta.texto }]}>Mi recorrido</Text>
        <Text style={[styles.mensaje, { color: paleta.texto, textAlign: 'center' }]}>
          Para guardar tus visitas, tus fotos y tus notas necesitás una cuenta.
        </Text>
        <Boton etiqueta="Ingresar o crear cuenta" onPress={salir} />
      </SafeAreaView>
    );
  }

  // Estado de carga: primera lectura del teléfono.
  if (cargando) {
    return (
      <SafeAreaView edges={['top']} style={[styles.pantalla, styles.centro, { backgroundColor: paleta.fondo }]}>
        <ActivityIndicator size="large" color={paleta.acento} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <FlatList
        data={visitas}
        keyExtractor={(v) => v.id}
        ListHeaderComponent={cabecera}
        contentContainerStyle={styles.lista}
        // Estados vacío y error visibles en pantalla.
        ListEmptyComponent={
          error ? (
            <View style={styles.vacio}>
              <Text style={[styles.mensaje, { color: paleta.error }]}>{error}</Text>
              <Boton etiqueta="Reintentar" onPress={leerLocal} />
            </View>
          ) : (
            <View style={styles.vacio}>
              <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>
                Todavía no registraste ninguna visita. Cuando estés en un lugar, tocá una de las opciones de arriba.
              </Text>
            </View>
          )
        }
        renderItem={({ item, index }) => {
          const foto = item.fotoUri ?? item.fotoUrl;
          return (
            <View style={[styles.tarjeta, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}>
              <Text style={[styles.parada, { color: paleta.acento }]}>Parada {index + 1}</Text>
              <Text style={[styles.lugar, { color: paleta.texto }]}>{nombres[item.lugarId] ?? 'Lugar visitado'}</Text>
              <Text style={[styles.detalle, { color: paleta.textoSuave }]}>
                {textoFecha(item.fechaHora)} · {TEXTO_ORIGEN[item.origen]}
              </Text>
              {foto ? (
                <Image
                  source={{ uri: foto }}
                  style={styles.foto}
                  accessibilityLabel={`Foto de tu visita a ${nombres[item.lugarId] ?? 'un lugar'}`}
                />
              ) : null}
              {item.nota ? <Text style={[styles.nota, { color: paleta.texto }]}>{item.nota}</Text> : null}
              <Text style={[styles.estado, { color: item.sincronizada ? paleta.textoSuave : paleta.error }]}>
                {item.sincronizada ? 'Guardada en tu cuenta' : 'Pendiente de subir'}
              </Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { alignItems: 'center', justifyContent: 'center' },
  lista: { padding: 16, gap: 12 },
  cabecera: { gap: 12 },
  titulo: { fontSize: 28, fontWeight: '800' },
  subtitulo: { fontSize: 22, fontWeight: '700', marginTop: 8 },
  aviso: { fontSize: 18, lineHeight: 26, borderWidth: 2, borderRadius: 12, padding: 12 },
  textoAviso: { fontSize: 18, lineHeight: 26 },
  vacio: { gap: 12, paddingVertical: 16 },
  mensaje: { fontSize: 18, lineHeight: 26 },
  tarjeta: { borderWidth: 2, borderRadius: 12, padding: 14, gap: 6 },
  parada: { fontSize: 16, fontWeight: '700' },
  lugar: { fontSize: 22, fontWeight: '800' },
  detalle: { fontSize: 16 },
  foto: { width: '100%', height: 200, borderRadius: 12, marginTop: 4 },
  nota: { fontSize: 18, lineHeight: 26, marginTop: 4 },
  estado: { fontSize: 16, fontWeight: '600', marginTop: 4 },
});
