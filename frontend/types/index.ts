/**
 * Tipos TypeScript del dominio de la aplicación.
 */

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  perfil: 'administrador' | 'oficina_tecnica' | 'tecnico_instalador' | 'tecnico_mantenedor' | 'gerencia';
}

export interface Cliente {
  id: number;
  codigo_interno: string;
  razon_social: string;
  nombre_comercial?: string;
  nombre_display?: string;
  cif_nif?: string;
  poblacion?: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  equipos_count?: number;
}

export interface Ubicacion {
  id: number;
  cliente_id: number;
  nombre_centro: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  tipo_ubicacion: string;
  activo: boolean;
}

export interface TipoEquipo {
  id: number;
  nombre: string;
  familia: string;
  normas_aplicables?: string[];
}

export interface Equipo {
  id: number;
  codigo_equipo: string;
  descripcion_corta: string;
  fabricante?: string;
  marca?: string;
  modelo?: string;
  tipo_apertura?: string;
  estado_equipo: 'activo' | 'inactivo' | 'baja' | 'en_revision' | 'inmovilizado';
  estado_normativo: 'sin_evaluar' | 'conforme' | 'no_conforme' | 'en_proceso' | 'requiere_adecuacion';
  criticidad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_instalacion?: string;
  fecha_proximo_mantenimiento?: string;
  completitud_ce?: number;
  revision_vencida?: boolean;
  cliente?: Cliente;
  ubicacion?: Ubicacion;
  tipo_equipo?: TipoEquipo;
  qr_token?: string;
}

export interface DashboardKPIs {
  kpis: {
    total_equipos: number;
    total_clientes: number;
    sin_expediente_ce: number;
    revisiones_vencidas: number;
    revisiones_proximas_30d: number;
    equipos_no_conformes: number;
    actuaciones_mes: number;
    tareas_hoy: number;
  };
  distribucion_normativa: Record<string, number>;
  revisiones_urgentes: Equipo[];
}

export interface Paginacion<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
