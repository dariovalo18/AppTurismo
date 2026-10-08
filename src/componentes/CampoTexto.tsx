import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTema } from '@/proveedores/ProveedorTema';

type Props = Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur' | 'keyboardType' | 'autoComplete' | 'secureTextEntry' | 'editable'
> & {
  etiqueta: string;
  error?: string;
};

// ESTÉTICA: campo de texto propio con etiqueta arriba y error abajo. Usa TextInput.
// Docs TextInput: https://reactnative.dev/docs/textinput
export function CampoTexto({ etiqueta, error, ...resto }: Props) {
  const paleta = useTema();

  return (
    <View style={styles.campo}>
      <Text style={[styles.etiqueta, { color: paleta.texto }]}>{etiqueta}</Text>
      <TextInput
        {...resto}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={etiqueta}
        style={[
          styles.input,
          {
            color: paleta.texto,
            backgroundColor: paleta.superficie,
            borderColor: error ? paleta.error : paleta.borde,
          },
        ]}
      />
      {error ? <Text style={[styles.error, { color: paleta.error }]}>{error}</Text> : null}
    </View>
  );
}

// ESTÉTICA: estilos con StyleSheet de React Native (medidas y disposición; los colores salen de la paleta).
// Docs: https://reactnative.dev/docs/stylesheet | Flexbox: https://reactnative.dev/docs/flexbox
const styles = StyleSheet.create({
  campo: { gap: 6 },
  etiqueta: { fontSize: 18, fontWeight: '600' },
  input: {
    minHeight: 56,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 18,
  },
  error: { fontSize: 16 },
});
