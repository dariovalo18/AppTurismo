export interface Preferencias {
  categoriasFavoritas: string[];
  avisarProximidad: boolean;
  radioAvisoMetros: number; // 100, 250 o 500
  tema: 'claro' | 'oscuro' | 'sistema';
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatarUrl: string | null;
  creadoEn: string; // ISO 8601 con zona
  preferencias: Preferencias;
}
