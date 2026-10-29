import { borrarEventosGuardados } from './cacheEventos';
import { listarEventosGuardados } from './eventos';
import { darDeBajaDispositivo, registrarDispositivo } from './push';
import { borrarTodosLosRecordatorios, sincronizarRecordatorios } from './recordatorios';

// Lo que la agenda necesita hacer cuando alguien entra o sale de su cuenta.

// Al entrar con cuenta (login, huella o al abrir la app con sesión):
// - registra el teléfono para recibir push,
// - trae los eventos guardados y les programa el recordatorio. Así, si la persona cambió
//   de teléfono o reinstaló la app, los avisos vuelven a estar.
export async function alEntrarConCuenta() {
  await registrarDispositivo();
  try {
    const { datos, desdeCopia } = await listarEventosGuardados();
    if (!desdeCopia) await sincronizarRecordatorios(datos);
  } catch (e) {
    console.log('[Agenda] no se pudieron sincronizar los recordatorios:', e);
  }
}

// Al cerrar sesión. Se llama ANTES de borrar el token (dar de baja el teléfono pide sesión).
export async function alSalirDeLaCuenta() {
  await darDeBajaDispositivo();
  await borrarTodosLosRecordatorios().catch(() => {});
  await borrarEventosGuardados().catch(() => {});
}
