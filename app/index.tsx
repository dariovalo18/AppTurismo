import { Redirect } from 'expo-router';

import { useSesion } from '@/proveedores/ProveedorSesion';

// Puerta de entrada: manda al inicio o al login según la sesión.
export default function Indice() {
  const { modo } = useSesion();
  return <Redirect href={modo === 'sesion' || modo === 'invitado' ? '/inicio' : '/login'} />;
}
