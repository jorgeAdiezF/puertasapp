/**
 * Cliente HTTP centralizado para comunicarse con el backend Laravel.
 * Gestiona el token de autenticación y las cabeceras comunes.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor de petición: añade el token si existe en localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de respuesta: redirige al login si el token expira
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Análisis de riesgos ---
export const getAnalisisRiesgos = (equipoId: number) =>
  api.get(`/equipos/${equipoId}/analisis-riesgos`);

export const saveAnalisisRiesgos = (equipoId: number, items: AnalisisRiesgoItem[]) =>
  api.post(`/equipos/${equipoId}/analisis-riesgos`, { items });

// --- Ensayos de prestaciones ---
export const getEnsayosPrestaciones = (equipoId: number) =>
  api.get(`/equipos/${equipoId}/ensayos-prestaciones`);

export const saveEnsayosPrestaciones = (equipoId: number, items: EnsayoPrestacionItem[]) =>
  api.post(`/equipos/${equipoId}/ensayos-prestaciones`, { items });

// --- Tipos ---
export interface AnalisisRiesgoItem {
  id?: number | null;
  equipo_id?: number;
  categoria: string;
  requisito: string;
  estado: 'cumple' | 'no_cumple' | 'no_aplica';
  observaciones?: string | null;
}

export interface EnsayoPrestacionItem {
  id?: number | null;
  equipo_id?: number;
  tipo: 'apertura' | 'cierre';
  punto: string;
  fuerza_obtenida?: number | null;
  fuerza_limite: number;
  conforme?: boolean | null;
  observaciones?: string | null;
}

export default api;
