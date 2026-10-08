import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { iniciarSesion, obtenerPerfil } from '@/servicios/auth';
import { borrarToken, guardarToken, leerToken } from '@/servicios/almacenSesion';
import { biometriaDisponible, pedirBiometria } from '@/servicios/biometria';
import type { CredencialesLogin, Usuario } from '@/tipos';

// cargando: leyendo el token guardado
// sinSesion: hay que mostrar el login
// invitado: entró sin cuenta (mapa y lugares no piden cuenta)
// sesion: entró con cuenta
type Modo = 'cargando' | 'sinSesion' | 'invitado' | 'sesion';

type ContextoSesion = {
  modo: Modo;
  usuario: Usuario | null;
  hayTokenGuardado: boolean;
  ingresar: (credenciales: CredencialesLogin) => Promise<void>;
  ingresarConBiometria: () => Promise<boolean>;
  continuarComoInvitado: () => void;
  salir: () => Promise<void>;
};

const Contexto = createContext<ContextoSesion | null>(null);

// Guarda el estado de la sesión y lo comparte con toda la app (Context API).
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [modo, setModo] = useState<Modo>('cargando');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
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

  const continuarComoInvitado = useCallback(() => setModo('invitado'), []);

  // Cerrar sesión borra el token y vuelve al login.
  const salir = useCallback(async () => {
    await borrarToken();
    setTokenGuardado(null);
    setUsuario(null);
    setModo('sinSesion');
  }, []);

  const valor = useMemo(
    () => ({
      modo,
      usuario,
      hayTokenGuardado: tokenGuardado !== null,
      ingresar,
      ingresarConBiometria,
      continuarComoInvitado,
      salir,
    }),
    [modo, usuario, tokenGuardado, ingresar, ingresarConBiometria, continuarComoInvitado, salir],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

// Hook para leer la sesión desde cualquier pantalla: const { usuario, salir } = useSesion().
export function useSesion() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  return contexto;
}
