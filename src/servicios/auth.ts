import type { CredencialesLogin, RespuestaExito, RespuestaLogin, Usuario } from '@/tipos';
import { clienteApi } from './clienteApi';

// Login contra la API real. Los errores salen como ErrorApi (ver clienteApi).
// OJO: la API espera el campo "contrasena", la app lo llama "password".
export async function iniciarSesion(
  credenciales: CredencialesLogin,
): Promise<RespuestaExito<RespuestaLogin>> {
  const { data } = await clienteApi.post<RespuestaExito<RespuestaLogin>>('/auth/ingreso', {
    email: credenciales.email.trim(),
    contrasena: credenciales.password,
  });
  return data;
}

// Para recuperar la sesión a partir del token guardado.
export async function obtenerPerfil(token: string): Promise<RespuestaExito<Usuario>> {
  const { data } = await clienteApi.get<RespuestaExito<Usuario>>('/yo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
