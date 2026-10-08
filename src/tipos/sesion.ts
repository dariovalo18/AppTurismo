import type { Usuario } from './usuario';

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
