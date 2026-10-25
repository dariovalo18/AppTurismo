import type { Horario } from '@/tipos';

export const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// "09:30" -> 570 (minutos desde la medianoche)
const aMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

export type Apertura = { abierto: boolean; texto: string };

// Dice si el lugar está abierto ahora. Reglas de la API:
// - hay un horario por tramo (puede haber dos el mismo día)
// - un día sin horarios es un día cerrado
// - un tramo como 20:30-01:00 cierra al día siguiente
// Devuelve null si el lugar no tiene horarios cargados.
export function estadoApertura(horarios: Horario[], ahora = new Date()): Apertura | null {
  if (horarios.length === 0) return null;

  const hoy = ahora.getDay();
  const ayer = (hoy + 6) % 7;
  const minutos = ahora.getHours() * 60 + ahora.getMinutes();

  for (const h of horarios) {
    const abre = aMinutos(h.abre);
    const cierra = aMinutos(h.cierra);
    const cruzaMedianoche = cierra <= abre;

    // Tramo de hoy.
    if (h.dia === hoy) {
      if (!cruzaMedianoche && minutos >= abre && minutos < cierra) {
        return { abierto: true, texto: `Abierto ahora · cierra ${h.cierra}` };
      }
      if (cruzaMedianoche && minutos >= abre) {
        return { abierto: true, texto: `Abierto ahora · cierra ${h.cierra}` };
      }
    }
    // Tramo de ayer que termina hoy de madrugada.
    if (h.dia === ayer && cruzaMedianoche && minutos < cierra) {
      return { abierto: true, texto: `Abierto ahora · cierra ${h.cierra}` };
    }
  }

  // Está cerrado: buscamos cuándo abre la próxima vez (hoy, mañana, ...).
  for (let desplazamiento = 0; desplazamiento <= 7; desplazamiento++) {
    const dia = (hoy + desplazamiento) % 7;
    const tramos = horarios
      .filter((h) => h.dia === dia && (desplazamiento > 0 || aMinutos(h.abre) > minutos))
      .sort((a, b) => aMinutos(a.abre) - aMinutos(b.abre));
    if (tramos.length > 0) {
      const cuando = desplazamiento === 0 ? 'hoy' : desplazamiento === 1 ? 'mañana' : NOMBRES_DIA[dia];
      return { abierto: false, texto: `Cerrado ahora · abre ${cuando} ${tramos[0].abre}` };
    }
  }
  return { abierto: false, texto: 'Cerrado ahora' };
}

// Para mostrar la tabla de horarios: "09:00 a 13:00 y 16:00 a 20:00", o "Cerrado".
export function horariosDelDia(horarios: Horario[], dia: number): string {
  const tramos = horarios
    .filter((h) => h.dia === dia)
    .sort((a, b) => aMinutos(a.abre) - aMinutos(b.abre))
    .map((h) => `${h.abre} a ${h.cierra}`);
  return tramos.length > 0 ? tramos.join(' y ') : 'Cerrado';
}
