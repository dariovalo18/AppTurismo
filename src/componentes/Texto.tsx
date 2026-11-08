import { StyleSheet, Text as TextoRN, type TextProps } from 'react-native';

import { familiaDe } from '@/tema/fuentes';

// Reemplaza al Text de React Native: pone la tipografía de la app según el peso y el tamaño que
// ya traía cada estilo, así no hay que tocar fontFamily en cada pantalla.
export function Texto({ style, ...resto }: TextProps) {
  const plano = StyleSheet.flatten(style) ?? {};
  const familia = plano.fontFamily ?? familiaDe(plano.fontWeight, plano.fontSize);
  // Con una fuente propia el peso va dentro del archivo: dejar fontWeight duplicaría la negrita en Android.
  return <TextoRN {...resto} style={[style, { fontFamily: familia, fontWeight: 'normal' }]} />;
}
