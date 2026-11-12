import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { alSalirDeLaCuenta } from '@/servicios/agendaCuenta';
import { actualizarPerfil, iniciarSesion, obtenerPerfil, registrarse } from '@/servicios/auth';
import { borrarToken, guardarToken, leerToken } from '@/servicios/almacenSesion';
import { biometriaDisponible, pedirBiometria } from '@/servicios/biometria';
import type { CambiosPerfil, CredencialesLogin, DatosRegistro, Usuario } from '@/tipos';

// cargando: leyendo el token guardado
// sinSesion: hay que mostrar el login
// invitado: entró sin cuenta (mapa y lugares no piden cuenta)
// sesion: entró con cuenta
type Modo = 'cargando' | 'sinSesion' | 'invitado' | 'sesion';

type ContextoSesion = {
  modo: Modo;
  usuario: Usuario | null;
  // true justo después de ingresar o registrarse: la app pregunta primero por los intereses.
  preguntarIntereses: boolean;
  terminarIntereses: () => void;
  hayTokenGuardado: boolean;
  ingresar: (credenciales: CredencialesLogin) => Promise<void>;
  ingresarConBiometria: () => Promise<boolean>;
  continuarComoInvitado: () => void;
  salir: () => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  guardarPerfil: (cambios: CambiosPerfil) => Promise<void>;
};

const Contexto = createContext<ContextoSesion | null>(null);

// Guarda el estado de la sesión y lo comparte con toda la app (Context API).
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<Modo>('cargando');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [preguntarIntereses, setPreguntarIntereses] = useState(false);
  const [tokenGuardado, setTokenGuardado] = useState<string | null>(null);

  // Al abrir la app: si hay token guardado, lo dejamos listo para el
  // reingreso con huella. Si no hay biometría, se entra directo.
  useEffect(() => {
    let cancelado = false;

    async function restaurar() {
      try {
        const token = await leerToken();
        if (!token) {
          if (!cancelado) setModo('sinSesion');
          return;
        }

        if (await biometriaDisponible()) {
          if (!cancelado) {
            setTokenGuardado(token);
            setModo('sinSesion');
          }
          return;
        }

        const { datos } = await obtenerPerfil(token);
        if (!cancelado) {
          setUsuario(datos);
          setModo('sesion');
        }
      } catch {
        // Token vencido o fallo al leerlo: se pide el login de nuevo.
        await borrarToken().catch(() => {});
        if (!cancelado) setModo('sinSesion');
      }
    }

    restaurar();
    return () => {
      cancelado = true;
    };
  }, []);

  // Login con email y contraseña: guarda el token y pasa al modo 'sesion'.
  const ingresar = useCallback(async (credenciales: CredencialesLogin) => {
    const { datos } = await iniciarSesion(credenciales);
    await guardarToken(datos.token);
    setUsuario(datos.usuario);
    setPreguntarIntereses(true);
    setModo('sesion');
  }, []);

  const ingresarConBiometria = useCallback(async () => {
    if (!tokenGuardado) return false;
    if (!(await pedirBiometria())) return false;
    try {
      const { datos } = await obtenerPerfil(tokenGuardado);
      setUsuario(datos);
      setModo('sesion');
      return true;
    } catch {
      await borrarToken();
      setTokenGuardado(null);
      return false;
    }
  }, [tokenGuardado]);

  const terminarIntereses = useCallback(() => setPreguntarIntereses(false), []);

  const continuarComoInvitado = useCallback(() => setModo('invitado'), []);

  // Persona 5: registro. Igual que el login: guarda el token y pasa al modo 'sesion'.
  const registrar = useCallback(async (datos: DatosRegistro) => {
    const { datos: respuesta } = await registrarse(datos);
    await guardarToken(respuesta.token);
    setUsuario(respuesta.usuario);
    setPreguntarIntereses(true);
    setModo('sesion');
  }, []);

  // Persona 5: guarda el perfil (PATCH /yo). Si falla, el error lo muestra la pantalla.
  const guardarPerfil = useCallback(async (cambios: CambiosPerfil) => {
    const token = await leerToken();
    if (!token) throw new Error('Tu sesión se cerró. Volvé a ingresar.');
    const actualizado = await actualizarPerfil(token, cambios);
    setUsuario(actualizado);
  }, []);

  // Cerrar sesión borra el token y vuelve al login.
  const salir = useCallback(async () => {
    // Agenda: da de baja el teléfono para push y borra los recordatorios. Va antes de borrar el token.
    await alSalirDeLaCuenta().catch(() => {});
    await borrarToken();
    setTokenGuardado(null);
    setUsuario(null);
    setPreguntarIntereses(false);
    setModo('sinSesion');
  }, []);

  const valor = useMemo(
    () => ({
      modo,
      usuario,
      preguntarIntereses,
      terminarIntereses,
      hayTokenGuardado: tokenGuardado !== null,
      ingresar,
      ingresarConBiometria,
      continuarComoInvitado,
      salir,
      registrar,
      guardarPerfil,
    }),
    [modo, usuario, preguntarIntereses, terminarIntereses, tokenGuardado, ingresar, ingresarConBiometria, continuarComoInvitado, salir, registrar, guardarPerfil],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

// Hook para leer la sesión desde cualquier pantalla: const { usuario, salir } = useSesion().
export function useSesion() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  return contexto;
}