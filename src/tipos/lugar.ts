// Tipos copiados literal del PDF ("Resumen: qué entidades maneja la app"). No se modifican.
export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface Horario {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo
  abre: string; // "09:00"
  cierra: string; // "19:00"
}

export interface Audioguia {
  url: string;
  duracionSegundos: number;
  idioma: 'es' | 'en' | 'pt';
}

export interface Lugar {
  id: string;
  nombre: string;
  categoriaId: string;
  descripcionCorta: string;
  descripcion: string;
  coordenadas: Coordenadas;
  direccion: string;
  imagenes: string[];
  horarios: Horario[];
  telefono: string | null;
  sitioWeb: string | null;
  precioEntrada: number | null;
  audioguia: Audioguia | null;
  codigoQr: string | null;
  accesible: boolean;
  activo: boolean;
  actualizadoEn: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string; // nombre del ícono de Ionicons
  color: string; // hexadecimal
  orden: number;
}
