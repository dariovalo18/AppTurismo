// ESTÉTICA: paleta de colores de la app (modo claro y oscuro). Tonos cálidos de la costa del
// río Uruguay: arena, terracota de los ladrillos de las termas y verde agua del río.
// Contraste fuerte porque se usa al sol y con una mano.
// Docs de colores en React Native: https://reactnative.dev/docs/colors
export const coloresClaro = {
  fondo: '#F3E9D8',
  superficie: '#FBF6EC',
  texto: '#2A1C14',
  textoSuave: '#6A5646',
  acento: '#B8452A',
  secundario: '#1F6F6B',
  sobreAcento: '#FFF8EE',
  borde: '#D9C7AA',
  error: '#9C1C1C',
};

export type Paleta = typeof coloresClaro;

export const coloresOscuro: Paleta = {
  fondo: '#1C130E',
  superficie: '#2A1D16',
  texto: '#F5E9D6',
  textoSuave: '#C4AE96',
  acento: '#E8825F',
  secundario: '#6FC2B8',
  sobreAcento: '#2A1208',
  borde: '#4D392C',
  error: '#FF9C8F',
};

export const paletas = { claro: coloresClaro, oscuro: coloresOscuro };

// Formas propias: esquinas desparejas (una grande y el resto chicas) en vez del mismo redondeo en todo.
export const formas = {
  tarjeta: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 22,
    borderBottomLeftRadius: 6,
  },
  boton: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 6,
  },
} as const;
