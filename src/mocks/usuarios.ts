import type { RespuestaExito, RespuestaLogin } from '@/tipos';
import sesionJson from './login.json';

// El JSON se tipa con los mismos tipos de src/tipos: si no compila, el mock está mal.
export const sesionMock: RespuestaExito<RespuestaLogin> = sesionJson as RespuestaExito<RespuestaLogin>;

export const usuarioMock = sesionMock.datos.usuario;
export const tokenMock = sesionMock.datos.token;
// El mock no guarda contraseñas: se compara contra este valor fijo.
export const contrasenaMock = '1234';

// Casos feos para probar: este email simula que no hay señal.
export const emailSinRedMock = 'sinred@mail.com';
