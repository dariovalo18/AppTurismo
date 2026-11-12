import type {
  CambiosPerfil,
  CredencialesLogin,
  DatosRegistro,
  RespuestaExito,
  RespuestaLogin,
  Usuario,
} from '@/tipos';
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

// Registro. Devuelve lo mismo que el login: el token y el usuario.
export async function registrarse(datos: DatosRegistro): Promise<RespuestaExito<RespuestaLogin>> {
  const { data } = await clienteApi.post<RespuestaExito<RespuestaLogin>>('/auth/registro', {
    nombre: datos.nombre.trim(),
    email: datos.email.trim(),
    contrasena: datos.password,
  });
  return data;
}

// PATCH /yo. Cambia el nombre o las preferencias y devuelve el usuario actualizado.
export async function actualizarPerfil(token: string, cambios: CambiosPerfil): Promise<Usuario> {
  const { data } = await clienteApi.patch<RespuestaExito<Usuario>>('/yo', cambios, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.datos;
}