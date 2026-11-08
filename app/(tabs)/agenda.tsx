import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Boton } from '@/componentes/Boton';
import { TarjetaEvento } from '@/componentes/TarjetaEvento';
import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { listarEventosDelDia, listarEventosGuardados } from '@/servicios/eventos';
import { sincronizarRecordatorios } from '@/servicios/recordatorios';
import type { Evento } from '@/tipos';
import { diaYMes, etiquetaDia, fechaParaApi, hora, proximosDias } from '@/utilidades/fechas';

// Cuántos días se ven en la tira de arriba (hoy + 13).
const DIAS_VISIBLES = 14;

type Vista = 'dia' | 'guardados';

// Agenda (Persona 3): eventos por día empezando por hoy, y mis eventos guardados.
export default function Agenda() {
  const paleta = useTema();
  const { modo, salir } = useSesion();
  const conCuenta = modo === 'sesion';

  const dias = useMemo(() => proximosDias(DIAS_VISIBLES), []);
  const [vista, setVista] = useState<Vista>('dia');
  const [diaElegido, setDiaElegido] = useState(0); // 0 = hoy

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [guardados, setGuardados] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [recargando, setRecargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiaDe, setCopiaDe] = useState<string | null>(null); // sin señal: cuándo se guardó lo que se ve
  const [intento, setIntento] = useState(0); // sube para volver a pedir (Reintentar o deslizar)

  const fecha = fechaParaApi(dias[diaElegido]);

  // Se vuelve a cargar cada vez que la pestaña se muestra (por ejemplo, al volver del detalle
  // después de guardar un evento), al cambiar de día o de vista, y al recargar.
  useFocusEffect(
    useCallback(() => {
      let cancelado = false; // si la pantalla se cierra antes de que llegue la respuesta, no tocamos el estado
      setError(null);

      async function cargar() {
        // Con cuenta, los guardados se piden siempre: sirven para la vista "Guardados"
        // y para marcar con un ícono los guardados en la vista por día.
        const pedidoGuardados = conCuenta ? listarEventosGuardados().catch(() => null) : Promise.resolve(null);

        try {
          if (vista === 'dia') {
            const [delDia, mios] = await Promise.all([listarEventosDelDia(fecha), pedidoGuardados]);
            if (cancelado) return;
            setEventos(delDia.datos);
            setCopiaDe(delDia.desdeCopia ? delDia.guardadoEn : null);
            if (mios) setGuardados(mios.datos);
            if (mios && !mios.desdeCopia) sincronizarRecordatorios(mios.datos).catch(() => {});
          } else {
            if (!conCuenta) return; // la vista muestra "Ingresá con tu cuenta"
            const mios = await pedidoGuardados;
            if (cancelado) return;
            if (!mios) throw new Error('No pudimos cargar tus eventos guardados.');
            setGuardados(mios.datos);
            setCopiaDe(mios.desdeCopia ? mios.guardadoEn : null);
            // Si alguno se suspendió, se canceló o cambió de horario, acá se avisa y se reprograma.
            if (!mios.desdeCopia) sincronizarRecordatorios(mios.datos).catch(() => {});
          }
        } catch (e) {
          if (!cancelado) setError(e instanceof Error ? e.message : 'No pudimos cargar la agenda.');
        } finally {
          if (!cancelado) {
            setCargando(false);
            setRecargando(false);
          }
        }
      }

      cargar();
      return () => {
        cancelado = true;
      };
    }, [vista, fecha, conCuenta, intento]),
  );

  const idsGuardados = useMemo(() => new Set(guardados.map((e) => e.id)), [guardados]);
  const lista = vista === 'dia' ? eventos : guardados;

  const cambiarVista = (nueva: Vista) => {
    if (nueva === vista) return;
    setCargando(true);
    setCopiaDe(null);
    setVista(nueva);
  };
  const elegirDia = (indice: number) => {
    if (indice === diaElegido) return;
    setCargando(true);
    setDiaElegido(indice);
  };
  const reintentar = () => {
    setCargando(true);
    setIntento((n) => n + 1);
  };
  const recargar = () => {
    setRecargando(true);
    setIntento((n) => n + 1);
  };
  const abrir = (id: string) => router.push({ pathname: '/evento/[id]', params: { id } });

  return (
    <SafeAreaView edges={['top']} style={[styles.pantalla, { backgroundColor: paleta.fondo }]}>
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, { color: paleta.texto }]} accessibilityRole="header">
          Agenda
        </Text>

        {/* Por día / Guardados */}
        <View style={[styles.selector, { borderColor: paleta.acento }]}>
          {(['dia', 'guardados'] as const).map((opcion) => {
            const activa = vista === opcion;
            return (
              <Pressable
                key={opcion}
                onPress={() => cambiarVista(opcion)}
                accessibilityRole="tab"
                accessibilityState={{ selected: activa }}
                style={[styles.opcion, activa && { backgroundColor: paleta.acento }]}
              >
                <Text style={[styles.opcionTexto, { color: activa ? paleta.sobreAcento : paleta.acento }]}>
                  {opcion === 'dia' ? 'Por día' : 'Guardados'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tira de días, empezando por hoy */}
      {vista === 'dia' ? (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dias}>
            {dias.map((d, i) => {
              const activo = i === diaElegido;
              return (
                <Pressable
                  key={fechaParaApi(d)}
                  onPress={() => elegirDia(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  accessibilityLabel={`${etiquetaDia(d, i)} ${diaYMes(d)}`}
                  style={[
                    styles.dia,
                    { borderColor: activo ? paleta.acento : paleta.borde },
                    { backgroundColor: activo ? paleta.acento : paleta.superficie },
                  ]}
                >
                  <Text style={[styles.diaNombre, { color: activo ? paleta.sobreAcento : paleta.texto }]}>
                    {etiquetaDia(d, i)}
                  </Text>
                  <Text style={[styles.diaFecha, { color: activo ? paleta.sobreAcento : paleta.textoSuave }]}>
                    {diaYMes(d)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Sin señal: se muestra lo último que se descargó, y se avisa */}
      {copiaDe && !cargando && !error ? (
        <View style={[styles.aviso, { backgroundColor: paleta.superficie, borderColor: paleta.borde }]}>
          <Ionicons name="cloud-offline-outline" size={22} color={paleta.texto} />
          <Text style={[styles.avisoTexto, { color: paleta.texto }]}>
            Sin conexión. Mostramos lo que descargaste a las {hora(copiaDe)}.
          </Text>
        </View>
      ) : null}

      {vista === 'guardados' && !conCuenta ? (
        // Sin cuenta no hay guardados (PDF: "la cuenta es para guardar cosas").
        <View style={styles.centro}>
          <Ionicons name="bookmark-outline" size={48} color={paleta.textoSuave} />
          <Text style={[styles.mensaje, { color: paleta.texto }]}>
            Ingresá con tu cuenta para guardar eventos y que te avisemos antes de que empiecen.
          </Text>
          <Boton etiqueta="Iniciar sesión" onPress={salir} />
        </View>
      ) : cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={paleta.acento} />
        </View>
      ) : error ? (
        <View style={styles.centro}>
          <Text style={[styles.mensaje, { color: paleta.error }]}>{error}</Text>
          <Boton etiqueta="Reintentar" onPress={reintentar} />
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={recargando} onRefresh={recargar} colors={[paleta.acento]} tintColor={paleta.acento} />
          }
          renderItem={({ item }) => (
            <TarjetaEvento
              evento={item}
              onPress={() => abrir(item.id)}
              guardado={vista === 'dia' && idsGuardados.has(item.id)}
              mostrarFecha={vista === 'guardados'}
            />
          )}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Ionicons name="calendar-clear-outline" size={48} color={paleta.textoSuave} />
              <Text style={[styles.mensaje, { color: paleta.textoSuave }]}>
                {vista === 'dia'
                  ? 'No hay eventos este día. Probá con otro día de la tira de arriba.'
                  : 'Todavía no guardaste eventos. Abrí uno y tocá "Guardar evento".'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Botones con minHeight (no height fija) para que crezcan con la letra agrandada.
const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  encabezado: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  titulo: { fontSize: 28, fontWeight: '800' },
  selector: { flexDirection: 'row', borderWidth: 2, overflow: 'hidden' },
  opcion: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  opcionTexto: { fontSize: 17, fontWeight: '700' },
  dias: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  dia: {
    minWidth: 76,
    minHeight: 64,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  diaNombre: { fontSize: 17, fontWeight: '800' },
  diaFecha: { fontSize: 15, fontWeight: '600' },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderWidth: 1,
  },
  avisoTexto: { fontSize: 16, fontWeight: '600', flex: 1 },
  lista: { padding: 16, paddingTop: 4, gap: 12, flexGrow: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 48 },
  mensaje: { fontSize: 18, textAlign: 'center', lineHeight: 26 },
});
