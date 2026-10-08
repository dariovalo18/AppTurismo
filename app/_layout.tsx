import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProveedorSesion, useSesion } from '@/proveedores/ProveedorSesion';
import { ProveedorTema, useTema } from '@/proveedores/ProveedorTema';

// Decide qué pantallas existen según el estado de la sesión.
function Rutas() {
  const { modo } = useSesion();
  const paleta = useTema();

  // Mientras se lee el token guardado mostramos una ruedita, para no parpadear el login.
  if (modo === 'cargando') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: paleta.fondo }}>
        <ActivityIndicator size="large" color={paleta.acento} />
      </View>
    );
  }

  const haySesionOInvitado = modo === 'sesion' || modo === 'invitado';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: paleta.fondo } }}>
      {/* Stack.Protected: la ruta solo es accesible si guard es true. Al cambiar la sesión,
          Expo Router redirige solo a la otra pantalla. */}
      <Stack.Protected guard={!haySesionOInvitado}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={haySesionOInvitado}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

// Raíz de la app: los proveedores (tema y sesión) envuelven todas las pantallas.
export default function LayoutRaiz() {
  return (
    <ProveedorTema>
      <ProveedorSesion>
        <StatusBar style="auto" />
        <Rutas />
      </ProveedorSesion>
    </ProveedorTema>
  );
}
