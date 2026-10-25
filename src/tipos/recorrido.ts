export interface Favorito {
  id: string;
  usuarioId: string;
  lugarId: string;
  creadoEn: string;
}

export type OrigenVisita = 'qr' | 'gps' | 'manual';

export interface Visita {
  id: string;
  usuarioId: string;
  lugarId: string;
  fechaHora: string;
  origen: OrigenVisita;
  fotoUri: string | null;
  nota: string | null;
  sincronizada: boolean;
}
