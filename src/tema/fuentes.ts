import { Fraunces_700Bold, Fraunces_900Black } from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';

// ESTÉTICA: tipografía propia. Fraunces (serif con carácter) para títulos grandes y
// Hanken Grotesk para el resto del texto.
export const archivosFuentes = {
  Fraunces_700Bold,
  Fraunces_900Black,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
};

// Los títulos grandes y en negrita usan la serif; lo demás, la grotesca según su peso.
const TAMANO_TITULO = 22;

export function familiaDe(peso: string | number | undefined, tamano: number | undefined): string {
  const n = peso === 'bold' ? 700 : peso === 'normal' || peso === undefined ? 400 : Number(peso);
  if ((tamano ?? 0) >= TAMANO_TITULO && n >= 700) return n >= 800 ? 'Fraunces_900Black' : 'Fraunces_700Bold';
  if (n >= 800) return 'HankenGrotesk_800ExtraBold';
  if (n >= 700) return 'HankenGrotesk_700Bold';
  if (n >= 600) return 'HankenGrotesk_600SemiBold';
  if (n >= 500) return 'HankenGrotesk_500Medium';
  return 'HankenGrotesk_400Regular';
}
