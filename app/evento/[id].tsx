import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Boton } from '@/componentes/Boton';
import { EtiquetaEstado } from '@/componentes/TarjetaEvento';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { ErrorApi } from '@/servicios/errores';
import {
  cambiarEstadoEvento,
  guardarEvento,
  listarEventosGuardados,
  obtenerEvento,
  quitarEventoGuardado,
  sePuedeGuardar,
} from '@/servicios/eventos';
import { obtenerLugar } from '@/servicios/lugares';
import { MINUTOS_ANTES, programarRecordatorio, quitarRecordatorio } from '@/servicios/recordatorios';
import type { Evento, Lugar, Usuario } from '@/tipos';
import { elegirComoLlegar } from '@/utilidades/comoLlegar';
import { duracion, fechaLarga, textoPrecioEvento } from '@/utilidades/fechas';

// Cuenta de administración de la cátedra (README: puede suspender y cancelar eventos).
// /yo no manda el rol, así que si la API llegara a mandar un campo "rol" se usa ese,
// y si no, se reconoce por el email. Si alguien más lo intenta, la API responde 403 SIN_PERMISO.
const EMAIL_ADMIN = 'turismo@colon.demo.ar';
function esAdmin(usuario: Usuario | null) {
  if (!usuario) return false;
  const rol = (usuario as Usuario & { rol?: string }).rol;
  return rol ? rol === 'admin' : usuario.email.toLowerCase() === EMAIL_ADMIN;
}

const AVISO_ESTADO: Partial<Record<Evento['estado'], string>> = {
  suspendido: 'Este evento está suspendido (por ejemplo, por lluvia). Si lo guardás, te avisamos si vuelve a programarse.',
  cancelado: 'Este evento se canceló y no se va a hacer.',
  finalizado: 'Este evento ya terminó.',
};

export default function DetalleEvento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const paleta = useTema();
  const router = useRouter();
  const { modo, usuario, salir } = useSesion();
  const conCuenta = modo === 'sesion';

  const [evento, setEvento] = useState<Evento | null>(null);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false); // guardando / cambiando estado

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    async function cargar() {
      try {
        const { datos } = await obtenerEvento(id);
        if (cancelado) return;
        setEvento(datos);

        // Si el evento es en un lugar del catálogo, traemos el lugar (nombre y coordenadas).
        if (datos.lugarId) {
          obtenerLugar(datos.lugarId)
            .then((l) => !cancelado && setLugar(l))
            .catch(() => {});
        }
        // ¿Lo tengo guardado?
        if (conCuenta) {
          listarEventosGuardados()
            .then((r) => !cancelado && setGuardado(r.datos.some((e) => e.id === datos.id)))
            .catch(() => {});
        }
      } catch (e) {
        if (!cancelado) setError(e instanceof Error ? e.message : 'No pudimos cargar el evento.');
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [id, conCuenta]);

  if (cargando || !evento) {
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

  // Guardar / quitar. Al guardar se programa el recordatorio en el teléfono.
  async function alternarGuardado() {
    if (!evento) return;
    setTrabajando(true);
    try {
      if (guardado) {
        await quitarEventoGuardado(evento.id);
        await quitarRecordatorio(evento.id);
        setGuardado(false);
      } else {
        const actualizado = await guardarEvento(evento.id);
        setEvento(actualizado);
        setGuardado(true);
        await programarRecordatorio(actualizado);
        Alert.alert(
          'Evento guardado',
          actualizado.estado === 'programado'
            ? `Te avisamos ${MINUTOS_ANTES / 60} hora antes de que empiece, y si se suspende o se cancela.`
            : 'Te avisamos si vuelve a programarse.',
        );
      }
    } catch (e) {
      const mensaje = e instanceof ErrorApi || e instanceof Error ? e.message : 'Probá de nuevo.';
      Alert.alert('No pudimos hacerlo', mensaje);
    } finally {
      setTrabajando(false);
    }
  }

  // Solo administración: PATCH /eventos/{id}/estado.
  function cambiarEstado(nuevo: 'programado' | 'suspendido' | 'cancelado') {
    if (!evento) return;
    const textos = { programado: 'reprogramar', suspendido: 'suspender', cancelado: 'cancelar' };
    Alert.alert(`¿Seguro que querés ${textos[nuevo]} este evento?`, 'Les avisamos a quienes lo guardaron.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        style: nuevo === 'cancelado' ? 'destructive' : 'default',
        onPress: async () => {
          setTrabajando(true);
          try {
            setEvento(await cambiarEstadoEvento(evento.id, nuevo));
          } catch (e) {
            Alert.alert('No pudimos cambiar el estado', e instanceof Error ? e.message : 'Probá de nuevo.');
          } finally {
            setTrabajando(false);
          }
        },
      },
    ]);
  }

  const cuanto = duracion(evento.inicio, evento.fin);
  const precio = textoPrecioEvento(evento.precio);
  const aviso = AVISO_ESTADO[evento.estado];
  // Para "Cómo llegar": las coordenadas del lugar del catálogo, o las del evento si es en un lugar suelto.
  const destino = lugar?.coordenadas ?? evento.coordenadas;

  return (
    <SafeAreaView style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Boton etiqueta="Volver" variante="secundario" onPress={() => router.back()} />

        {evento.imagenUrl ? <Image source={{ uri: evento.imagenUrl }} style={styles.imagen} /> : null}

        <EtiquetaEstado estado={evento.estado} grande />
        {aviso ? (
          <Text style={[styles.aviso, { color: paleta.texto, borderColor: paleta.borde, backgroundColor: paleta.superficie }]}>
            {aviso}
          </Text>
        ) : null}

        <Text style={[styles.titulo, { color: paleta.texto }]} accessibilityRole="header">
          {evento.titulo}
        </Text>

        <Fila titulo="Cuándo" valor={fechaLarga(evento.inicio)} />
        {cuanto ? <Fila titulo="Duración" valor={cuanto} /> : null}
        {precio ? <Fila titulo="Entrada" valor={precio} /> : null}

        {/* Dónde: un lugar del catálogo o una dirección suelta (un campo, la costanera...) */}
        {evento.lugarId ? (
          <>
            <Fila titulo="Dónde" valor={lugar ? `${lugar.nombre} · ${lugar.direccion}` : 'Cargando el lugar…'} />
            <Boton
              etiqueta="Ver el lugar"
              variante="secundario"
              onPress={() => router.push({ pathname: '/lugar/[id]', params: { id: evento.lugarId! } })}
            />
          </>
        ) : evento.direccionLibre ? (
          <Fila titulo="Dónde" valor={evento.direccionLibre} />
        ) : null}
        {destino ? (
          <Boton
            etiqueta="Cómo llegar"
            variante="secundario"
            onPress={() => elegirComoLlegar(lugar?.nombre ?? evento.titulo, destino)}
          />
        ) : null}

        <Text style={[styles.texto, { color: paleta.texto }]}>{evento.descripcion}</Text>

        {/* Guardar: pide cuenta. Cancelados o finalizados no se pueden guardar (la API da 422). */}
        {conCuenta ? (
          <Boton
            etiqueta={guardado ? 'Quitar de guardados' : 'Guardar evento'}
            variante={guardado ? 'secundario' : 'principal'}
            onPress={alternarGuardado}
            cargando={trabajando}
            deshabilitado={!guardado && !sePuedeGuardar(evento)}
          />
        ) : (
          <Boton etiqueta="Ingresá para guardar este evento" onPress={salir} />
        )}

        {esAdmin(usuario) && evento.estado !== 'finalizado' ? (
          <View style={[styles.admin, { borderColor: paleta.borde }]}>
            <Text style={[styles.subtitulo, { color: paleta.texto }]}>Administración</Text>
            {evento.estado !== 'programado' ? (
              <Boton etiqueta="Volver a programar" onPress={() => cambiarEstado('programado')} deshabilitado={trabajando} />
            ) : null}
            {evento.estado !== 'suspendido' ? (
              <Boton etiqueta="Suspender" variante="secundario" onPress={() => cambiarEstado('suspendido')} deshabilitado={trabajando} />
            ) : null}
            {evento.estado !== 'cancelado' ? (
              <Boton etiqueta="Cancelar evento" variante="secundario" onPress={() => cambiarEstado('cancelado')} deshabilitado={trabajando} />
            ) : null}
          </View>
        ) : null}
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
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  contenido: { padding: 16, gap: 12 },
  imagen: { width: '100%', aspectRatio: 16 / 9,},
  aviso: { fontSize: 18, lineHeight: 26, fontWeight: '600', padding: 12, borderWidth: 1,},
  titulo: { fontSize: 28, fontWeight: '800' },
  texto: { fontSize: 18, lineHeight: 26 },
  subtitulo: { fontSize: 22, fontWeight: '700' },
  mensaje: { fontSize: 18, textAlign: 'center' },
  fila: { gap: 2 },
  filaTitulo: { fontSize: 16, fontWeight: '600' },
  filaValor: { fontSize: 18 },
  admin: { gap: 10, borderTopWidth: 1, paddingTop: 16, marginTop: 8 },
});
