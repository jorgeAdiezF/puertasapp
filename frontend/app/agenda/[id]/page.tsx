/**
 * Ficha de una tarea de agenda con panel de edición rápida.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

function Campo({ label, valor }: { label: string; valor?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{valor ?? '—'}</dd>
    </div>
  );
}

export default function AgendaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tarea, setTarea] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Panel de edición
  const [editando, setEditando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [franjaHoraria, setFranjaHoraria] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    Promise.all([
      api.get(`/agenda/${id}`),
      api.get('/usuarios'),
    ])
      .then(([tareaRes, usRes]) => {
        const t = tareaRes.data;
        setTarea(t);
        setNuevoEstado(t.estado);
        setFechaProgramada(t.fecha_programada ? t.fecha_programada.slice(0, 16) : '');
        setFranjaHoraria(t.franja_horaria ?? '');
        setTecnicoId(t.tecnico_id ? String(t.tecnico_id) : '');
        setObservaciones(t.observaciones ?? '');
        setUsuarios(usRes.data);
      })
      .catch(() => router.push('/agenda'))
      .finally(() => setCargando(false));
  }, [id]);

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await api.put(`/agenda/${id}`, {
        estado:           nuevoEstado,
        fecha_programada: fechaProgramada || undefined,
        franja_horaria:   franjaHoraria || undefined,
        tecnico_id:       tecnicoId ? Number(tecnicoId) : undefined,
        observaciones:    observaciones || undefined,
      });
      setTarea((prev: any) => ({ ...prev, ...res.data }));
      setEditando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-gray-400">Cargando...</div>
        </main>
      </div>
    );
  }

  if (!tarea) return null;

  const estaTerminada = ['completada', 'cancelada'].includes(tarea.estado);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">

          {/* Cabecera */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/agenda" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Volver a agenda
              </Link>
              <h2 className="text-2xl font-bold text-gray-900">
                {TIPOS_TAREA[tarea.tipo_tarea] ?? tarea.tipo_tarea?.replace(/_/g, ' ')}
              </h2>
              {tarea.equipo && (
                <p className="text-sm text-gray-500 mt-1">
                  {tarea.equipo.cliente?.razon_social && (
                    <>{tarea.equipo.cliente.razon_social} · </>
                  )}
                  <Link href={`/equipos/${tarea.equipo.id ?? tarea.equipo_id}`} className="text-blue-600 hover:text-blue-800">
                    {tarea.equipo.descripcion_corta}
                  </Link>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {guardado && (
                <span className="text-xs text-green-600 font-medium">✓ Guardado</span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_PRIORIDAD[tarea.prioridad] ?? 'bg-gray-100 text-gray-600'}`}>
                {tarea.prioridad ?? '—'}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${BADGE_ESTADO[tarea.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                {tarea.estado?.replace(/_/g, ' ') ?? '—'}
              </span>
              {!estaTerminada && (
                <button
                  onClick={() => setEditando(!editando)}
                  className="text-sm border border-gray-300 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {editando ? 'Cancelar' : 'Editar'}
                </button>
              )}
            </div>
          </div>

          {/* Panel de edición rápida */}
          {editando && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 space-y-4">
              <h3 className="font-semibold text-gray-800 text-sm">Actualizar tarea</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo estado</label>
                  <select
                    value={nuevoEstado}
                    onChange={e => setNuevoEstado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="en_curso">En curso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="reprogramada">Reprogramada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha programada</label>
                  <input
                    type="datetime-local"
                    value={fechaProgramada}
                    onChange={e => setFechaProgramada(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Franja horaria</label>
                  <input
                    type="text"
                    value={franjaHoraria}
                    onChange={e => setFranjaHoraria(e.target.value)}
                    placeholder="ej. 09:00-11:00"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Técnico asignado</label>
                  <select
                    value={tecnicoId}
                    onChange={e => setTecnicoId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Sin asignar</option>
                    {usuarios.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <button
                onClick={guardar}
                disabled={guardando}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}

          {/* Datos principales */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <Campo label="Tipo" valor={TIPOS_TAREA[tarea.tipo_tarea] ?? tarea.tipo_tarea} />
              <Campo label="Prioridad" valor={tarea.prioridad} />
              <Campo label="Estado" valor={tarea.estado?.replace(/_/g, ' ')} />
              <Campo
                label="Fecha programada"
                valor={tarea.fecha_programada
                  ? new Date(tarea.fecha_programada).toLocaleString('es-ES', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : undefined}
              />
              <Campo label="Franja horaria" valor={tarea.franja_horaria} />
              <Campo label="Técnico" valor={tarea.tecnico?.name} />
            </dl>
          </div>

          {/* Observaciones */}
          {tarea.observaciones && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Observaciones</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line">{tarea.observaciones}</p>
            </div>
          )}

          {/* Datos del equipo */}
          {tarea.equipo && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Equipo asociado</h3>
              <dl className="grid grid-cols-2 gap-4">
                <Campo label="Código" valor={tarea.equipo.codigo_equipo} />
                <Campo label="Descripción" valor={tarea.equipo.descripcion_corta} />
                <Campo label="Cliente" valor={tarea.equipo.cliente?.razon_social} />
                <Campo label="Ubicación" valor={tarea.equipo.ubicacion?.nombre_centro} />
              </dl>
              <div className="mt-4">
                <Link
                  href={`/equipos/${tarea.equipo.id ?? tarea.equipo_id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver ficha completa del equipo →
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
