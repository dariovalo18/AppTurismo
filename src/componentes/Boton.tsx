import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Texto as Text } from '@/componentes/Texto';

import { useTema } from '@/proveedores/ProveedorTema';

type Props = {
  etiqueta: string;
  onPress: () => void;
  variante?: 'principal' | 'secundario';
  cargando?: boolean;
  deshabilitado?: boolean;
};

// ESTÉTICA: botón propio (principal = relleno, secundario = con borde). Usa Pressable.
// Docs Pressable: https://reactnative.dev/docs/pressable | Accesibilidad: https://reactnative.dev/docs/accessibility
// Botón grande: minHeight (no height fija) para que crezca con la letra agrandada.
export function Boton({ etiqueta, onPress, variante = 'principal', cargando, deshabilitado }: Props) {
  const paleta = useTema();
  const principal = variante === 'principal';
  const inactivo = deshabilitado || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo }}
      disabled={inactivo}
      onPress={onPress}
      style={[
        styles.base,
        principal
          ? { backgroundColor: paleta.acento }
          : { backgroundColor: paleta.superficie, borderWidth: 2, borderColor: paleta.acento },
        inactivo && { opacity: 0.6 },
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={principal ? paleta.sobreAcento : paleta.acento} />
      ) : (
        <Text style={[styles.etiqueta, { color: principal ? paleta.sobreAcento : paleta.acento }]}>
          {etiqueta}
        </Text>
      )}
    </Pressable>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  etiqueta: { fontSize: 18, fontWeight: '700', textAlign: 'center', letterSpacing: 0.4 },
});
