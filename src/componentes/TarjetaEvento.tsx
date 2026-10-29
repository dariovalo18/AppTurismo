import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import { useTema } from '@/proveedores/ProveedorTema';
import type { EstadoEvento, Evento } from '@/tipos';
import { fechaLarga, hora, textoPrecioEvento } from '@/utilidades/fechas';

// ESTÉTICA: colores fijos de los estados, con texto blanco (contraste alto en modo claro y oscuro).
const ESTADOS: Record<Exclude<EstadoEvento, 'programado'>, { texto: string; fondo: string }> = {
  suspendido: { texto: 'Suspendido', fondo: '#8A4B00' },
  cancelado: { texto: 'Cancelado', fondo: '#B3261E' },
  finalizado: { texto: 'Finalizado', fondo: '#4F5F67' },
};

// Cartelito del estado. Un evento "programado" no lleva cartel (es lo normal).
export function EtiquetaEstado({ estado, grande }: { estado: EstadoEvento; grande?: boolean }) {
  if (estado === 'programado') return null;
  const { texto, fondo } = ESTADOS[estado];
  return (
    <View style={[styles.etiqueta, { backgroundColor: fondo }, grande && styles.etiquetaGrande]}>
      <Text style={[styles.etiquetaTexto, grande && styles.etiquetaTextoGrande]}>{texto}</Text>
    </View>
  );
}

type Props = {
  evento: Evento;
  onPress: () => void;
  guardado?: boolean;
  mostrarFecha?: boolean; // en "Guardados" se ve la fecha completa; en un día alcanza la hora
};

// Tarjeta de un evento en la agenda. Sin alturas fijas: crece con la letra agrandada.
export function TarjetaEvento({ evento, onPress, guardado, mostrarFecha }: Props) {
  const paleta = useTema();
  const apagado = evento.estado === 'cancelado' || evento.estado === 'finalizado';
  const precio = textoPrecioEvento(evento.precio);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${evento.titulo}, ${fechaLarga(evento.inicio)}${evento.estado !== 'programado' ? `, ${evento.estado}` : ''}`}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: paleta.superficie, borderColor: paleta.borde },
        pressed && { opacity: 0.8 },
      ]}
    >
      {evento.imagenUrl ? <Image source={{ uri: evento.imagenUrl }} style={styles.imagen} /> : null}
      <View style={styles.cuerpo}>
        <View style={styles.filaArriba}>
          <Text style={[styles.hora, { color: paleta.acento }]}>
            {mostrarFecha ? fechaLarga(evento.inicio) : hora(evento.inicio)}
          </Text>
          {guardado ? <Ionicons name="bookmark" size={22} color={paleta.acento} accessibilityLabel="Guardado" /> : null}
        </View>
        <Text
          style={[
            styles.titulo,
            { color: apagado ? paleta.textoSuave : paleta.texto },
            evento.estado === 'cancelado' && styles.tachado,
          ]}
        >
          {evento.titulo}
        </Text>
        <View style={styles.filaAbajo}>
          <EtiquetaEstado estado={evento.estado} />
          {precio ? <Text style={[styles.precio, { color: paleta.textoSuave }]}>{precio}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  imagen: { width: '100%', aspectRatio: 16 / 7 },
  cuerpo: { padding: 14, gap: 6 },
  filaArriba: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  hora: { fontSize: 18, fontWeight: '800', flexShrink: 1 },
  titulo: { fontSize: 20, fontWeight: '700' },
  tachado: { textDecorationLine: 'line-through' },
  filaAbajo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  precio: { fontSize: 16, fontWeight: '600' },
  etiqueta: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  etiquetaGrande: { paddingHorizontal: 14, paddingVertical: 8 },
  etiquetaTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  etiquetaTextoGrande: { fontSize: 18 },
});
