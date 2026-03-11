/**
 * Listado de actuaciones con filtros por tipo, estado y equipo.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

const TIPOS_ACTUACION: Record<string, string> = {
  instalacion_nueva:       'Instalación nueva',
  automatizacion:          'Automatización',
  sustitucion_parcial:     'Sustitución parcial',
  reparacion:              'Reparación',
  mantenimiento_preventivo:'Mantenimiento preventivo',
  mantenimiento_correctivo:'Mantenimiento correctivo',
  adecuacion_normativa:    'Adecuación normativa',
  inspeccion_tecnica:      'Inspección técnica',
  baja:                    'Baja',
};

const BADGE_ESTADO: Record<string, string> = {
  pendiente:            'bg-yellow-100 text-yellow-700',
  en_curso:             'bg-blue-100 text-blue-700',
  completada:           'bg-green-100 text-green-700',
  cancelada:            'bg-gray-100 text-gray-500',
  pendiente_validacion: 'bg-orange-100 text-orange-700',
};

export default function ActuacionesPage() {
  const router = useRouter();
  const [actuaciones, setActuaciones] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const cargar = (pagina = 1) => {
    setCargando(true);
    api.get('/actuaciones', {
      params: {
        pagina,
        estado: filtroEstado || undefined,
        tipo_actuacion: filtroTipo || undefined,
        por_pagina: 25,
      },
    })
      .then(res => setActuaciones(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    cargar();
  }, [filtroEstado, filtroTipo]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">

          {/* Cabecera */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Actuaciones</h2>
            <Link
              href="/actuaciones/nueva"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Nueva actuación
            </Link>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_curso">En curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="pendiente_validacion">Pendiente validación</option>
            </select>

            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TIPOS_ACTUACION).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cargando ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : actuaciones?.data?.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay actuaciones con los filtros actuales.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Equipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha inicio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Responsable</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {actuaciones?.data?.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {TIPOS_ACTUACION[a.tipo_actuacion] ?? a.tipo_actuacion.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{a.origen_actuacion?.replace(/_/g, ' ')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{a.equipo?.descripcion_corta ?? '—'}</p>
                        <p className="text-xs font-mono text-gray-400">{a.equipo?.codigo_equipo}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {a.equipo?.cliente?.razon_social ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(a.fecha_inicio).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {a.usuario_responsable?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_ESTADO[a.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                          {a.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/actuaciones/${a.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {actuaciones && actuaciones.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>{actuaciones.total} actuaciones en total</span>
              <div className="flex gap-2">
                {actuaciones.current_page > 1 && (
                  <button onClick={() => cargar(actuaciones.current_page - 1)} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white">
                    ← Anterior
                  </button>
                )}
                <span className="px-3 py-1 text-gray-700">
                  {actuaciones.current_page} / {actuaciones.last_page}
                </span>
                {actuaciones.current_page < actuaciones.last_page && (
                  <button onClick={() => cargar(actuaciones.current_page + 1)} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white">
                    Siguiente →
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
