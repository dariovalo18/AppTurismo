// Segundos a "m:ss" (252 -> "4:12"). Lo usa el reproductor de audioguías.
export function formatearTiempo(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos || 0));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${minutos}:${resto.toString().padStart(2, '0')}`;
}