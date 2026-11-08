import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';

import { useSesion } from '@/proveedores/ProveedorSesion';
import { useTema } from '@/proveedores/ProveedorTema';
import { ErrorApi } from '@/servicios/errores';
import { agregarFavorito, listarFavoritos, quitarFavorito } from '@/servicios/favoritos';

// Corazón del detalle del lugar. Sin cuenta no se muestra.
export function BotonFavorito({ lugarId }: { lugarId: string }) {
  const paleta = useTema();
  const { usuario } = useSesion();
  const [favorito, setFavorito] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    let cancelado = false; // si la pantalla se cierra antes de que llegue la respuesta, no tocamos el estado
    listarFavoritos(usuario.id)
      .then(({ favoritos }) => {
        if (!cancelado) setFavorito(favoritos.some((f) => f.lugarId === lugarId));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [usuario, lugarId]);

  if (!usuario) return null;

  const alternar = async () => {
    setError(null);
    setCargando(true);
    try {
      if (favorito) await quitarFavorito(usuario.id, lugarId);
      else await agregarFavorito(usuario.id, lugarId);
      setFavorito(!favorito);
      // Vibración corta (expo-haptics). Si el teléfono no puede vibrar, no pasa nada.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch (e) {
      if (e instanceof ErrorApi && e.codigo === 'SIN_RED') {
        setError('Sin señal no podemos guardar el favorito. Probá cuando tengas conexión.');
      } else {
        setError(e instanceof Error ? e.message : 'No pudimos guardar el favorito.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.bloque}>
      <Pressable
        onPress={alternar}
        disabled={cargando}
        accessibilityRole="button"
        accessibilityLabel={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        style={[styles.boton, { borderColor: paleta.acento, backgroundColor: paleta.superficie }]}
      >
        {cargando ? (
          <ActivityIndicator color={paleta.acento} />
        ) : (
          <Ionicons
            name={favorito ? 'heart' : 'heart-outline'}
            size={28}
            color={favorito ? paleta.error : paleta.acento}
          />
        )}
        <Text style={[styles.texto, { color: paleta.acento }]}>
          {favorito ? 'En tus favoritos' : 'Agregar a favoritos'}
        </Text>
      </Pressable>
      {error ? <Text style={[styles.error, { color: paleta.error }]}>{error}</Text> : null}
    </View>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
const styles = StyleSheet.create({
  bloque: { gap: 6 },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    borderWidth: 2,
    paddingHorizontal: 16,
  },
  texto: { fontSize: 18, fontWeight: '700' },
  error: { fontSize: 16, fontWeight: '600' },
});
