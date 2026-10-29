// Fechas de la agenda. La API manda texto ISO con zona ("2026-11-14T21:00:00-03:00"):
// se convierte a Date recién acá, al mostrar (regla del PDF).

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const dos = (n: number) => String(n).padStart(2, '0');

// Date -> "2026-11-14" (en la hora del teléfono). Es el formato que pide GET /eventos?fecha=
export function fechaParaApi(d: Date): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

// Los próximos `cantidad` días, empezando por hoy (a las 00:00).
export function proximosDias(cantidad: number): Date[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    return d;
  });
}

// Para la tira de días: "Hoy", "Mañana" o "Vie".
export function etiquetaDia(d: Date, indice: number): string {
  if (indice === 0) return 'Hoy';
  if (indice === 1) return 'Mañana';
  return DIAS_CORTOS[d.getDay()];
}

// "14 nov"
export function diaYMes(d: Date): string {
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

// "21:00"
export function hora(iso: string): string {
  const d = new Date(iso);
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

// "sábado 14 nov · 21:00"
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return `${DIAS[d.getDay()]} ${diaYMes(d)} · ${hora(iso)}`;
}

// "5 h" / "1 h 30 min" / "45 min". Sin fin no se puede calcular: null.
export function duracion(inicio: string, fin: string | null): string | null {
  if (!fin) return null;
  const minutos = Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / 60000);
  if (minutos <= 0) return null;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// Precio del evento: 0 es gratis y null es que no aplica / no se informó.
export function textoPrecioEvento(precio: number | null): string | null {
  if (precio === null) return null;
  if (precio === 0) return 'Gratis';
  // 15000 -> "$15.000" (punto de miles, a mano para no depender de Intl)
  return `$${String(precio).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
