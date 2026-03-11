/**
 * Listado de tareas de agenda con filtros por estado, prioridad y modo de vista.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

const TIPOS_TAREA: Record<string, string> = {
  instalacion:    'Instalación',
  mantenimiento:  'Mantenimiento',
  incidencia:     'Incidencia',
  inspeccion:     'Inspección',
  adecuacion:     'Adecuación',
  visita_tecnica: 'Visita técnica',
};

const BADGE_PRIORIDAD: Record<string, string> = {
  baja:    'bg-gray-100 text-gray-500',
  normal:  'bg-blue-100 text-blue-700',
  alta:    'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const BADGE_ESTADO: Record<string, string> = {
  pendiente:    'bg-yellow-100 text-yellow-700',
  confirmada:   'bg-blue-100 text-blue-700',
  en_curso:     'bg-indigo-100 text-indigo-700',
  completada:   'bg-green-100 text-green-700',
  cancelada:    'bg-gray-100 text-gray-500',
  reprogramada: 'bg-orange-100 text-orange-700',
};

type Modo = 'hoy' | 'semana' | 'todas';

export default function AgendaPage() {
  const router = useRouter();
  const [tareas, setTareas] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState<Modo>('todas');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const cargar = (pagina = 1) => {
    setCargando(true);

    if (modo === 'hoy') {
      api.get('/agenda/hoy')
        .then(res => setTareas({ data: res.data, flat: true }))
        .catch(() => router.push('/login'))
        .finally(() => setCargando(false));
      return;
    }

    if (modo === 'semana') {
      api.get('/agenda/semana')
        .then(res => setTareas({ data: res.data, flat: true }))
        .catch(() => router.push('/login'))
        .finally(() => setCargando(false));
      return;
    }

    // modo === 'todas'
    api.get('/agenda', {
      params: {
        pagina,
        estado: filtroEstado || undefined,
        por_pagina: 25,
      },
    })
      .then(res => setTareas(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    cargar();
  }, [modo, filtroEstado, filtroPrioridad]);

  const filas: any[] = tareas?.flat
    ? (tareas.data ?? []).filter((t: any) => {
        if (filtroEstado && t.estado !== filtroEstado) return false;
        if (filtroPrioridad && t.prioridad !== filtroPrioridad) return false;
        return true;
      })
    : (tareas?.data ?? []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">

          {/* Cabecera */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
              {/* Selector de modo */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
                {(['hoy', 'semana', 'todas'] as Modo[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setModo(m)}
                    className={`px-4 py-1.5 font-medium transition-colors capitalize ${
                      modo === m
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {m === 'hoy' ? 'Hoy' : m === 'semana' ? 'Semana' : 'Todas'}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href="/agenda/nueva"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Nueva tarea
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
              <option value="confirmada">Confirmada</option>
              <option value="en_curso">En curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="reprogramada">Reprogramada</option>
            </select>

            <select
              value={filtroPrioridad}
              onChange={e => setFiltroPrioridad(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cargando ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : filas.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay tareas con los filtros actuales.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Equipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Técnico</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha programada</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Prioridad</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filas.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {TIPOS_TAREA[t.tipo_tarea] ?? t.tipo_tarea?.replace(/_/g, ' ')}
                        </p>
                        {t.franja_horaria && (
                          <p className="text-xs text-gray-400">{t.franja_horaria}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{t.equipo?.descripcion_corta ?? '—'}</p>
                        <p className="text-xs font-mono text-gray-400">{t.equipo?.codigo_equipo}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.tecnico?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {t.fecha_programada
                          ? new Date(t.fecha_programada).toLocaleString('es-ES', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_PRIORIDAD[t.prioridad] ?? 'bg-gray-100 text-gray-600'}`}>
                          {t.prioridad ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_ESTADO[t.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                          {t.estado?.replace(/_/g, ' ') ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/agenda/${t.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación — solo en modo 'todas' */}
          {modo === 'todas' && tareas && tareas.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>{tareas.total} tareas en total</span>
              <div className="flex gap-2">
                {tareas.current_page > 1 && (
                  <button
                    onClick={() => cargar(tareas.current_page - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white"
                  >
                    ← Anterior
                  </button>
                )}
                <span className="px-3 py-1 text-gray-700">
                  {tareas.current_page} / {tareas.last_page}
                </span>
                {tareas.current_page < tareas.last_page && (
                  <button
                    onClick={() => cargar(tareas.current_page + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white"
                  >
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
