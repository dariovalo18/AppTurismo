import {
  emailSinRedMock,
  sesionMock,
  contrasenaMock,
  tokenMock,
  usuarioMock,
} from '@/mocks/usuarios';
import type { CredencialesLogin, RespuestaExito, RespuestaLogin, Usuario } from '@/tipos';
import { ErrorApi } from './errores';

// Hoy devuelve el mock; mañana hace fetch. Es el único archivo que cambia.
// Siempre asíncrono, aunque el mock responda al instante.
// Simula el tiempo de respuesta de la red.
const demora = (ms = 600) => new Promise<void>((resolver) => setTimeout(resolver, ms));

// Valida las credenciales contra el mock y devuelve la respuesta con la forma del PDF.
// Los errores se lanzan como ErrorApi ({ codigo, mensaje }), igual que los de la API real.
export async function iniciarSesion(
  credenciales: CredencialesLogin,
): Promise<RespuestaExito<RespuestaLogin>> {
  await demora();

  const email = credenciales.email.trim().toLowerCase();

  if (email === emailSinRedMock) {
    throw new ErrorApi('SIN_RED', 'No hay conexión. Probá de nuevo cuando tengas señal.');
  }
  if (email !== usuarioMock.email || credenciales.password.trim() !== contrasenaMock) {
    throw new ErrorApi('CREDENCIALES_INVALIDAS', 'El email o la contraseña no son correctos.');
  }

  return sesionMock;
}

// Para recuperar la sesión a partir del token guardado.
export async function obtenerPerfil(token: string): Promise<RespuestaExito<Usuario>> {
  await demora(300);

  if (token !== tokenMock) {
    throw new ErrorApi('SESION_VENCIDA', 'Tu sesión venció. Ingresá de nuevo.');
  }
  return { datos: usuarioMock };
}
