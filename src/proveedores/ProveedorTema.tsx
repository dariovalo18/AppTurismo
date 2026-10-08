import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { paletas, type Paleta } from '@/tema/colores';

const ContextoTema = createContext<Paleta>(paletas.claro);

// ESTÉTICA: elige la paleta clara u oscura según el modo del teléfono.
// Docs useColorScheme: https://reactnative.dev/docs/usecolorscheme
// Por ahora sigue al sistema. Cuando estén las preferencias del usuario
// se puede elegir claro/oscuro desde acá.
export function ProveedorTema({ children }: { children: ReactNode }) {
  const esquema = useColorScheme();
  const paleta = esquema === 'dark' ? paletas.oscuro : paletas.claro;
  return <ContextoTema.Provider value={paleta}>{children}</ContextoTema.Provider>;
}

export const useTema = () => useContext(ContextoTema);
