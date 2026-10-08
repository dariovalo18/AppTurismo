// ESTÉTICA: paleta de colores de la app (modo claro y oscuro). El azul sale del logo.
// Contraste fuerte porque se usa al sol y con una mano.
// Docs de colores en React Native: https://reactnative.dev/docs/colors
export const coloresClaro = {
  fondo: '#F4F7F8',
  superficie: '#FFFFFF',
  texto: '#0B1F2A',
  textoSuave: '#43555F',
  acento: '#0B4F7C',
  sobreAcento: '#FFFFFF',
  borde: '#B8C7CE',
  error: '#B3261E',
};

export type Paleta = typeof coloresClaro;

export const coloresOscuro: Paleta = {
  fondo: '#0B1519',
  superficie: '#16262D',
  texto: '#F2F7F9',
  textoSuave: '#A9BCC4',
  acento: '#7CC0F0',
  sobreAcento: '#06243A',
  borde: '#3A5560',
  error: '#FFB4AB',
};

export const paletas = { claro: coloresClaro, oscuro: coloresOscuro };
