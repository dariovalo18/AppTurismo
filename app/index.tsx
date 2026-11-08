import { Redirect } from 'expo-router';

import { useSesion } from '@/proveedores/ProveedorSesion';

// Puerta de entrada: manda al inicio o al login según la sesión.
// Recién ingresado (o registrado) se pregunta primero por los intereses; al reabrir la app con la sesión ya hecha, no.
export default function Indice() {
  const { modo, preguntarIntereses } = useSesion();
  if (modo === 'sesion' && preguntarIntereses) return <Redirect href="/intereses" />;
  return <Redirect href={modo === 'sesion' || modo === 'invitado' ? '/inicio' : '/login'} />;
}
