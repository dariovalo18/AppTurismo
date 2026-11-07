import type { Preferencias, Usuario } from './usuario';

// SUPUESTO: el PDF no define el contrato de login. Se asume que devuelve
// el token y el usuario. Pendiente de confirmar con la cátedra.
export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

// Registro (POST /auth/registro). Igual que en el login, la API recibe "contrasena".
export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

// Lo que se puede cambiar del perfil con PATCH /yo.
export interface CambiosPerfil {
  nombre?: string;
  preferencias?: Partial<Preferencias>;
}