import type { CredencialesLogin, RespuestaExito, RespuestaLogin, Usuario } from '@/tipos';
import { clienteApi } from './clienteApi';

// Login contra la API real. Los errores salen como ErrorApi (ver clienteApi).
// OJO: la API espera el campo "contrasena", la app lo llama "password".
export async function iniciarSesion(
  credenciales: CredencialesLogin,
): Promise<RespuestaExito<RespuestaLogin>> {
  console.log('Peganmos al endpoint del login', clienteApi.defaults.baseURL + '/auth/ingreso');
  try {
    const { data } = await clienteApi.post<RespuestaExito<RespuestaLogin>>('/auth/ingreso', {
      email: credenciales.email.trim(),
      contrasena: credenciales.password,
    });
    console.log('Api contesto el login ok, llego el token', !!data.datos.token);
    return data;
  } catch (e) {
    console.log('Salio mal con el login, error:', e);
    throw e;
  }
}

// Para recuperar la sesión a partir del token guardado.
export async function obtenerPerfil(token: string): Promise<RespuestaExito<Usuario>> {
  console.log('pido el perfil con el token guardado');
  const { data } = await clienteApi.get<RespuestaExito<Usuario>>('/yo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('listo, me llego el perfil de', data.datos.email);
  return data;
}
