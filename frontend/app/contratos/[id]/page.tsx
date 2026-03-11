/**
 * Ficha de un contrato con pestañas: Datos y Equipos.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

const TIPOS_CONTRATO: Record<string, string> = {
  mantenimiento_preventivo: 'Mantenimiento preventivo',
  mantenimiento_integral:   'Mantenimiento integral',
  servicio_tecnico:         'Servicio técnico',
  adecuacion:               'Adecuación',
  inspeccion:               'Inspección',
};

const PERIODICIDADES = [
  { value: 'mensual',    label: 'Mensual' },
  { value: 'bimestral',  label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral',  label: 'Semestral' },
  { value: 'anual',      label: 'Anual' },
  { value: 'bianual',    label: 'Bianual' },
];

const ESTADOS = [
  { value: 'borrador',  label: 'Borrador' },
  { value: 'activo',    label: 'Activo' },
  { value: 'vencido',   label: 'Vencido' },
  { value: 'cancelado', label: 'Cancelado' },
];

const BADGE_ESTADO: Record<string, string> = {
  borrador:  'bg-gray-100 text-gray-600',
  activo:    'bg-green-100 text-green-700',
  vencido:   'bg-orange-100 text-orange-700',
  cancelado: 'bg-red-100 text-red-600',
};

const BADGE_NORMATIVO: Record<string, string> = {
  conforme:     'bg-green-100 text-green-700',
  no_conforme:  'bg-red-100 text-red-600',
  en_revision:  'bg-yellow-100 text-yellow-700',
  no_aplica:    'bg-gray-100 text-gray-500',
};

const formatFecha = (f: string | null) =>
  f ? new Date(f).toLocaleDateString('es-ES') : '—';

const formatImporte = (importe: number | null, moneda: string | null) => {
  if (importe == null) return '—';
  const simbolo = moneda === 'USD' ? '$' : moneda === 'GBP' ? '£' : '€';
  return `${simbolo}${Number(importe).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
};

export default function ContratoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [contrato, setContrato] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [pestana, setPestana] = useState<'datos' | 'equipos'>('datos');

  // Estado del panel de edición
  const [edit, setEdit] = useState({
    estado: '',
    fecha_fin: '',
    periodicidad_visitas: '',
    alcance: '',
    importe: '',
    observaciones: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const cargar = () => {
    setCargando(true);
    api.get(`/contratos/${id}`)
      .then(res => {
        const c = res.data?.data ?? res.data;
        setContrato(c);
        setEdit({
          estado:               c.estado ?? '',
          fecha_fin:            c.fecha_fin ?? '',
          periodicidad_visitas: c.periodicidad_visitas ?? '',
          alcance:              c.alcance ?? '',
          importe:              c.importe != null ? String(c.importe) : '',
          observaciones:        c.observaciones ?? '',
        });
      })
      .catch(() => router.push('/contratos'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setEditField = (campo: string, valor: string) => {
    setEdit(prev => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores(prev => { const e = { ...prev }; delete e[campo]; return e; });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setErrores({});
    setGuardado(false);

    const body: Record<string, any> = {};
    if (edit.estado)               body.estado               = edit.estado;
    if (edit.fecha_fin !== undefined) body.fecha_fin          = edit.fecha_fin || null;
    if (edit.periodicidad_visitas) body.periodicidad_visitas = edit.periodicidad_visitas;
    if (edit.alcance !== undefined) body.alcance             = edit.alcance;
    if (edit.importe)              body.importe              = Number(edit.importe);
    if (edit.observaciones !== undefined) body.observaciones = edit.observaciones;

    try {
      await api.put(`/contratos/${id}`, body);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
      cargar();
    } catch (err: any) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([campo, msgs]) => {
          apiErrors[campo] = (msgs as string[])[0];
        });
        setErrores(apiErrors);
      } else {
        setErrores({ general: 'Ha ocurrido un error al guardar los cambios.' });
      }
    } finally {
      setGuardando(false);
    }
  };

  const inputClass = (campo: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errores[campo] ? 'border-red-400' : 'border-gray-300'
    }`;

  if (cargando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-gray-400">Cargando contrato...</p>
        </main>
      </div>
    );
  }

  if (!contrato) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">

          {/* Cabecera */}
          <div className="mb-6">
            <Link href="/contratos" className="text-sm text-blue-600 hover:text-blue-800">
              ← Volver a contratos
            </Link>
            <div className="flex items-center justify-between mt-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {contrato.numero_contrato
                    ? `Contrato ${contrato.numero_contrato}`
                    : `Contrato #${contrato.id}`}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {TIPOS_CONTRATO[contrato.tipo_contrato] ?? contrato.tipo_contrato?.replace(/_/g, ' ')}
                  {contrato.cliente?.razon_social && ` · ${contrato.cliente.razon_social}`}
                </p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${BADGE_ESTADO[contrato.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                {contrato.estado?.charAt(0).toUpperCase() + contrato.estado?.slice(1)}
              </span>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            {(['datos', 'equipos'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPestana(tab)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors capitalize ${
                  pestana === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'datos' ? 'Datos' : `Equipos (${contrato.equipos?.length ?? 0})`}
              </button>
            ))}
          </div>

          {/* ── PESTAÑA DATOS ── */}
          {pestana === 'datos' && (
            <div className="space-y-6">

              {/* Información del contrato */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Información general</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Nº Contrato</dt>
                    <dd className="text-gray-800 font-mono">{contrato.numero_contrato ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Tipo</dt>
                    <dd className="text-gray-800">{TIPOS_CONTRATO[contrato.tipo_contrato] ?? contrato.tipo_contrato}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Cliente</dt>
                    <dd className="text-gray-800">{contrato.cliente?.razon_social ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Ubicación / Centro</dt>
                    <dd className="text-gray-800">{contrato.ubicacion?.nombre_centro ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Fecha de inicio</dt>
                    <dd className="text-gray-800">{formatFecha(contrato.fecha_inicio)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Fecha de fin</dt>
                    <dd className="text-gray-800">{formatFecha(contrato.fecha_fin)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Periodicidad de visitas</dt>
                    <dd className="text-gray-800 capitalize">{contrato.periodicidad_visitas?.replace(/_/g, ' ') ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Importe</dt>
                    <dd className="text-gray-800">{formatImporte(contrato.importe, contrato.moneda)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Incluye repuestos</dt>
                    <dd className="text-gray-800">{contrato.incluye_repuestos ? 'Sí' : 'No'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 mb-0.5">Equipos asociados</dt>
                    <dd className="text-gray-800">{contrato.equipos?.length ?? 0}</dd>
                  </div>
                  {contrato.alcance && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-gray-500 mb-0.5">Alcance</dt>
                      <dd className="text-gray-700 whitespace-pre-line">{contrato.alcance}</dd>
                    </div>
                  )}
                  {contrato.observaciones && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-gray-500 mb-0.5">Observaciones</dt>
                      <dd className="text-gray-700 whitespace-pre-line">{contrato.observaciones}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Panel de edición */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Editar contrato</h3>

                {errores.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                    {errores.general}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Estado */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                    <select
                      value={edit.estado}
                      onChange={e => setEditField('estado', e.target.value)}
                      className={inputClass('estado')}
                    >
                      {ESTADOS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    {errores.estado && <p className="text-red-500 text-xs mt-1">{errores.estado}</p>}
                  </div>

                  {/* Fecha fin */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de fin</label>
                    <input
                      type="date"
                      value={edit.fecha_fin}
                      onChange={e => setEditField('fecha_fin', e.target.value)}
                      className={inputClass('fecha_fin')}
                    />
                    {errores.fecha_fin && <p className="text-red-500 text-xs mt-1">{errores.fecha_fin}</p>}
                  </div>

                  {/* Periodicidad */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Periodicidad de visitas</label>
                    <select
                      value={edit.periodicidad_visitas}
                      onChange={e => setEditField('periodicidad_visitas', e.target.value)}
                      className={inputClass('periodicidad_visitas')}
                    >
                      <option value="">Sin periodicidad</option>
                      {PERIODICIDADES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    {errores.periodicidad_visitas && <p className="text-red-500 text-xs mt-1">{errores.periodicidad_visitas}</p>}
                  </div>

                  {/* Importe */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Importe (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={edit.importe}
                      onChange={e => setEditField('importe', e.target.value)}
                      placeholder="0.00"
                      className={inputClass('importe')}
                    />
                    {errores.importe && <p className="text-red-500 text-xs mt-1">{errores.importe}</p>}
                  </div>

                  {/* Alcance */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Alcance</label>
                    <textarea
                      value={edit.alcance}
                      onChange={e => setEditField('alcance', e.target.value)}
                      rows={3}
                      placeholder="Descripción del alcance..."
                      className={inputClass('alcance')}
                    />
                    {errores.alcance && <p className="text-red-500 text-xs mt-1">{errores.alcance}</p>}
                  </div>

                  {/* Observaciones */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                    <textarea
                      value={edit.observaciones}
                      onChange={e => setEditField('observaciones', e.target.value)}
                      rows={3}
                      placeholder="Notas adicionales..."
                      className={inputClass('observaciones')}
                    />
                    {errores.observaciones && <p className="text-red-500 text-xs mt-1">{errores.observaciones}</p>}
                  </div>
                </div>

                {/* Botón guardar */}
                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                  >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  {guardado && (
                    <span className="text-sm text-green-600 font-medium">✓ Guardado</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PESTAÑA EQUIPOS ── */}
          {pestana === 'equipos' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {!contrato.equipos || contrato.equipos.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Este contrato no tiene equipos asociados.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Descripción</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Estado normativo</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {contrato.equipos.map((eq: any) => (
                      <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {eq.codigo_equipo ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          {eq.descripcion_corta ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          {eq.estado_normativo ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_NORMATIVO[eq.estado_normativo] ?? 'bg-gray-100 text-gray-600'}`}>
                              {eq.estado_normativo.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/equipos/${eq.id}`}
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
          )}

        </div>
      </main>
    </div>
  );
}
