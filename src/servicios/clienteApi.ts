import axios, { isAxiosError } from 'axios';

import type { RespuestaError } from '@/tipos';
import { ErrorApi } from './errores';

// Dirección de la API. Con Expo Go no sirve localhost: poné la IP de la compu en .env
// (EXPO_PUBLIC_API_URL=http://192.168.1.25:3000).
export const URL_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const clienteApi = axios.create({
  baseURL: URL_BASE,
  timeout: 15000,
});

// Convierte cualquier falla de axios en un ErrorApi { codigo, mensaje }.
// Si la API respondió, usa su error; si no hubo respuesta, es un problema de red.
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (isAxiosError<RespuestaError>(error)) {
      const apiError = error.response?.data?.error;
      if (apiError) throw new ErrorApi(apiError.codigo, apiError.mensaje);
      throw new ErrorApi('SIN_RED', 'No hay conexión. Probá de nuevo cuando tengas señal.');
    }
    throw error;
  },
);
