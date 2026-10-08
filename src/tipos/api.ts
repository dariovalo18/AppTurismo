// Forma de las respuestas de la API (ver PDF, "Cómo va a venir la información").
export interface RespuestaExito<T> {
  datos: T;
  meta?: { total: number; pagina: number; porPagina: number };
}

// Si la API falla, devuelve este formato en lugar de 'datos'.
export interface RespuestaError {
  error: { codigo: string; mensaje: string };
}
