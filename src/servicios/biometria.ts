import * as LocalAuthentication from 'expo-local-authentication';

// true si el teléfono tiene huella/rostro y la persona ya la configuró.
export async function biometriaDisponible(): Promise<boolean> {
  const hayHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hayHardware) return false;
  return LocalAuthentication.isEnrolledAsync();
}

// Muestra el aviso del sistema. Devuelve false si cancela o falla.
export async function pedirBiometria(): Promise<boolean> {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Entrá a Mi Ciudad Colón',
    cancelLabel: 'Usar contraseña',
  });
  return resultado.success;
}
