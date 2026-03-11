/**
 * Listado de equipos con filtros por estado normativo y revisiones vencidas.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';
import type { Equipo, Paginacion } from '@/types';

const estadoNormativoColor: Record<string, string> = {
  conforme:            'bg-green-100 text-green-700',
  no_conforme:         'bg-red-100 text-red-700',
  en_proceso:          'bg-yellow-100 text-yellow-700',
  requiere_adecuacion: 'bg-orange-100 text-orange-700',
  sin_evaluar:         'bg-gray-100 text-gray-600',
};

const estadoEquipoColor: Record<string, string> = {
  activo:      'bg-green-100 text-green-700',
  inactivo:    'bg-gray-100 text-gray-600',
  baja:        'bg-red-100 text-red-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  inmovilizado:'bg-red-200 text-red-800',
};

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Paginacion<Equipo> | null>(null);
  const [buscar, setBuscar] = useState('');
  const [filtroNormativo, setFiltroNormativo] = useState('');
  const [soloVencidos, setSoloVencidos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  const cargarEquipos = (pagina = 1) => {
    setCargando(true);
    api.get('/equipos', {
      params: {
        pagina,
        buscar: buscar || undefined,
        estado_normativo: filtroNormativo || undefined,
        revision_vencida: soloVencidos || undefined,
        por_pagina: 20,
      }
    })
      .then(res => setEquipos(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    cargarEquipos();
  }, [filtroNormativo, soloVencidos]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarEquipos(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Cabecera */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Equipos</h2>
            <Link
              href="/equipos/nuevo"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Nuevo equipo
            </Link>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-end">
            <form onSubmit={handleBuscar} className="flex gap-2 flex-1 min-w-60">
              <input
                type="text"
                value={buscar}
                onChange={e => setBuscar(e.target.value)}
                placeholder="Código, descripción, número de serie..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-3 py-2 rounded-lg">
                Buscar
              </button>
            </form>

            <select
              value={filtroNormativo}
              onChange={e => setFiltroNormativo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados normativos</option>
              <option value="conforme">Conforme</option>
              <option value="no_conforme">No conforme</option>
              <option value="en_proceso">En proceso</option>
              <option value="requiere_adecuacion">Requiere adecuación</option>
              <option value="sin_evaluar">Sin evaluar</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={soloVencidos}
                onChange={e => setSoloVencidos(e.target.checked)}
                className="rounded"
              />
              Solo revisiones vencidas
            </label>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cargando ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : equipos?.data.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No hay equipos con los filtros actuales.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Equipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ubicación</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Normativa</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Próx. revisión</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {equipos?.data.map((equipo) => (
                    <tr key={equipo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{equipo.codigo_equipo}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{equipo.descripcion_corta}</p>
                        {equipo.tipo_equipo && (
                          <p className="text-xs text-gray-400">{equipo.tipo_equipo.nombre}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{equipo.cliente?.razon_social ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{equipo.ubicacion?.nombre_centro ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoEquipoColor[equipo.estado_equipo] ?? 'bg-gray-100 text-gray-600'}`}>
                          {equipo.estado_equipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoNormativoColor[equipo.estado_normativo] ?? 'bg-gray-100 text-gray-600'}`}>
                          {equipo.estado_normativo.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {equipo.fecha_proximo_mantenimiento ? (
                          <span className={`text-xs ${equipo.revision_vencida ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {new Date(equipo.fecha_proximo_mantenimiento).toLocaleDateString('es-ES')}
                            {equipo.revision_vencida && ' ⚠'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/equipos/${equipo.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Total */}
          {equipos && (
            <p className="mt-4 text-sm text-gray-400 text-right">
              {equipos.total} equipos en total
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
