/**
 * Ficha de una actuación con posibilidad de actualizar estado y añadir notas.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

async function descargarPdf(url: string, nombre: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href; a.download = nombre; a.click();
  URL.revokeObjectURL(href);
}

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

const ORIGENES: Record<string, string> = {
  contrato:          'Contrato',
  averia:            'Avería',
  solicitud_cliente: 'Solicitud cliente',
  inspeccion:        'Inspección',
  adecuacion:        'Adecuación',
  interno:           'Interno',
};

const BADGE_ESTADO: Record<string, string> = {
  pendiente:            'bg-yellow-100 text-yellow-700',
  en_curso:             'bg-blue-100 text-blue-700',
  completada:           'bg-green-100 text-green-700',
  cancelada:            'bg-gray-100 text-gray-500',
  pendiente_validacion: 'bg-orange-100 text-orange-700',
};

function Campo({ label, valor }: { label: string; valor?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{valor ?? '—'}</dd>
    </div>
  );
}

export default function ActuacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [actuacion, setActuacion] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // Panel de edición rápida
  const [editando, setEditando] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [resumen, setResumen] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [duracion, setDuracion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    api.get(`/actuaciones/${id}`)
      .then(res => {
        const a = res.data;
        setActuacion(a);
        setNuevoEstado(a.estado);
        setFechaFin(a.fecha_fin ? a.fecha_fin.slice(0, 16) : '');
        setResumen(a.resumen ?? '');
        setObservaciones(a.observaciones ?? '');
        setDuracion(a.duracion_minutos ?? '');
      })
      .catch(() => router.push('/actuaciones'))
      .finally(() => setCargando(false));
  }, [id]);

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await api.put(`/actuaciones/${id}`, {
        estado: nuevoEstado,
        fecha_fin: fechaFin || undefined,
        resumen: resumen || undefined,
        observaciones: observaciones || undefined,
        duracion_minutos: duracion ? Number(duracion) : undefined,
      });
      setActuacion((prev: any) => ({ ...prev, ...res.data }));
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

  if (!actuacion) return null;

  const estaTerminada = ['completada', 'cancelada'].includes(actuacion.estado);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">

          {/* Cabecera */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/actuaciones" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Volver a actuaciones
              </Link>
              <h2 className="text-2xl font-bold text-gray-900">
                {TIPOS_ACTUACION[actuacion.tipo_actuacion] ?? actuacion.tipo_actuacion.replace(/_/g, ' ')}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {actuacion.equipo?.cliente?.razon_social} ·{' '}
                <Link href={`/equipos/${actuacion.equipo_id}`} className="text-blue-600 hover:text-blue-800">
                  {actuacion.equipo?.descripcion_corta}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {guardado && (
                <span className="text-xs text-green-600 font-medium">✓ Guardado</span>
              )}
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${BADGE_ESTADO[actuacion.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                {actuacion.estado.replace(/_/g, ' ')}
              </span>
              <button
                onClick={() => descargarPdf(
                  `${process.env.NEXT_PUBLIC_API_URL}/actuaciones/${id}/pdf`,
                  `parte-${String(id).padStart(5, '0')}.pdf`
                )}
                className="text-sm border border-gray-300 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Descargar parte
              </button>
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
              <h3 className="font-semibold text-gray-800 text-sm">Actualizar actuación</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nuevo estado</label>
                  <select
                    value={nuevoEstado}
                    onChange={e => setNuevoEstado(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_curso">En curso</option>
                    <option value="completada">Completada</option>
                    <option value="pendiente_validacion">Pendiente validación</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={duracion}
                  onChange={e => setDuracion(e.target.value)}
                  min={1}
                  className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Resumen de trabajos</label>
                <textarea
                  value={resumen}
                  onChange={e => setResumen(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  rows={2}
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
              <Campo label="Tipo" valor={TIPOS_ACTUACION[actuacion.tipo_actuacion] ?? actuacion.tipo_actuacion} />
              <Campo label="Origen" valor={ORIGENES[actuacion.origen_actuacion] ?? actuacion.origen_actuacion} />
              <Campo label="Estado" valor={actuacion.estado.replace(/_/g, ' ')} />
              <Campo
                label="Fecha inicio"
                valor={new Date(actuacion.fecha_inicio).toLocaleString('es-ES')}
              />
              <Campo
                label="Fecha fin"
                valor={actuacion.fecha_fin ? new Date(actuacion.fecha_fin).toLocaleString('es-ES') : undefined}
              />
              <Campo
                label="Duración"
                valor={actuacion.duracion_minutos ? `${actuacion.duracion_minutos} min` : undefined}
              />
              <Campo label="Responsable" valor={actuacion.usuario_responsable?.name} />
              <Campo
                label="Actualiza expediente CE"
                valor={actuacion.actualiza_expediente_ce ? 'Sí' : 'No'}
              />
            </dl>
          </div>

          {/* Resumen y observaciones */}
          {(actuacion.resumen || actuacion.observaciones) && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4 space-y-4">
              {actuacion.resumen && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Resumen de trabajos</h3>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{actuacion.resumen}</p>
                </div>
              )}
              {actuacion.observaciones && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{actuacion.observaciones}</p>
                </div>
              )}
            </div>
          )}

          {/* Datos del equipo */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Equipo asociado</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Campo label="Código" valor={actuacion.equipo?.codigo_equipo} />
              <Campo label="Descripción" valor={actuacion.equipo?.descripcion_corta} />
              <Campo label="Cliente" valor={actuacion.equipo?.cliente?.razon_social} />
              <Campo label="Ubicación" valor={actuacion.equipo?.ubicacion?.nombre_centro} />
            </dl>
            <div className="mt-4">
              <Link
                href={`/equipos/${actuacion.equipo_id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver ficha completa del equipo →
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
