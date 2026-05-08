/**
 * Ficha completa de un equipo con pestañas: información, expediente CE, componentes e historial.
 * - Expediente CE: edición inline de todos los campos CE y estado normativo.
 * - Componentes: tabla + formulario para añadir y eliminar componentes.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api, {
  getAnalisisRiesgos, saveAnalisisRiesgos,
  getEnsayosPrestaciones, saveEnsayosPrestaciones,
  type AnalisisRiesgoItem, type EnsayoPrestacionItem,
} from '@/lib/api';

async function descargarPdf(url: string, nombre: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href; a.download = nombre; a.click();
  URL.revokeObjectURL(href);
}

const badgeEstadoNorm: Record<string, string> = {
  conforme:            'bg-green-100 text-green-700',
  no_conforme:         'bg-red-100 text-red-700',
  en_proceso:          'bg-yellow-100 text-yellow-700',
  requiere_adecuacion: 'bg-orange-100 text-orange-700',
  sin_evaluar:         'bg-gray-100 text-gray-600',
};

const labelEstadoNorm: Record<string, string> = {
  conforme:            'Conforme',
  no_conforme:         'No conforme',
  en_proceso:          'En proceso',
  requiere_adecuacion: 'Requiere adecuación',
  sin_evaluar:         'Sin evaluar',
};

const CATEGORIAS_COMPONENTE = [
  'motor','cuadro','receptor','fotocélula','banda_sensible','detector_presencia',
  'final_carrera','guia','muelle','cableado','desbloqueo_manual','semaforo',
  'pulsador','radar','cremallera','brazo','variador','encoder','celula_seguridad','otro',
];

type Pestaña = 'informacion' | 'expediente_ce' | 'analisis_riesgos' | 'ensayos' | 'componentes' | 'historial';

function Campo({ label, valor }: { label: string; valor?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{valor ?? '—'}</dd>
    </div>
  );
}

// ─── Subcomponente: Tab Expediente CE editable ───────────────────────────────
function TabCE({ equipo, onGuardado }: { equipo: any; onGuardado: (nuevo: any) => void }) {
  const CAMPOS_CE = [
    { key: 'tiene_marcado_ce',                   label: 'Marcado CE' },
    { key: 'expediente_ce_generado',              label: 'Expediente técnico generado' },
    { key: 'declaracion_conformidad_emitida',     label: 'Declaración de conformidad emitida' },
    { key: 'declaracion_prestaciones_emitida',    label: 'Declaración de prestaciones emitida' },
    { key: 'manual_usuario_emitido',              label: 'Manual de usuario emitido' },
    { key: 'manual_mantenimiento_emitido',        label: 'Manual de mantenimiento emitido' },
    { key: 'libro_mantenimiento_activo',          label: 'Libro de mantenimiento activo' },
    { key: 'evaluacion_riesgos_realizada',        label: 'Evaluación de riesgos realizada' },
  ] as const;

  const [editando, setEditando] = useState(false);
  const [campos, setCampos] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CAMPOS_CE.forEach(c => { init[c.key] = !!equipo[c.key]; });
    return init;
  });
  const [estadoNorm, setEstadoNorm] = useState(equipo.estado_normativo ?? 'sin_evaluar');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await api.put(`/equipos/${equipo.id}`, {
        ...campos,
        estado_normativo: estadoNorm,
      });
      onGuardado(res.data);
      setEditando(false);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  };

  const completitud = Math.round(
    (CAMPOS_CE.filter(c => campos[c.key]).length / CAMPOS_CE.length) * 100
  );

  return (
    <div className="space-y-4">
      {/* Barra de progreso */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Completitud del expediente CE</h3>
          <span className="text-2xl font-bold text-blue-600">{completitud}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${completitud === 100 ? 'bg-green-500' : completitud > 50 ? 'bg-blue-500' : 'bg-orange-400'}`}
            style={{ width: `${completitud}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Estado normativo:{' '}
          <strong>{labelEstadoNorm[equipo.estado_normativo] ?? equipo.estado_normativo}</strong>
        </p>
      </div>

      {/* Documentación */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Documentación y marcado</h3>
          <div className="flex items-center gap-3">
            {guardado && <span className="text-xs text-green-600 font-medium">✓ Guardado</span>}
            <button
              onClick={() => setEditando(!editando)}
              className="text-sm border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              {editando ? 'Cancelar' : 'Editar'}
            </button>
          </div>
        </div>

        {CAMPOS_CE.map(c => (
          <div key={c.key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-700">{c.label}</span>
            {editando ? (
              <button
                type="button"
                onClick={() => setCampos(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  campos[c.key]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {campos[c.key] ? '✓ Sí' : '✗ No'}
              </button>
            ) : (
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${campos[c.key] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {campos[c.key] ? '✓ Sí' : '✗ No'}
              </span>
            )}
          </div>
        ))}

        {editando && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado normativo</label>
              <select
                value={estadoNorm}
                onChange={e => setEstadoNorm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="conforme">Conforme</option>
                <option value="no_conforme">No conforme</option>
                <option value="en_proceso">En proceso</option>
                <option value="requiere_adecuacion">Requiere adecuación</option>
                <option value="sin_evaluar">Sin evaluar</option>
              </select>
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
      </div>

      {/* Normas aplicables */}
      {(() => {
        const raw = equipo.tipo_equipo?.normas_aplicables;
        const normas: string[] = Array.isArray(raw) ? raw : (typeof raw === 'string' ? JSON.parse(raw) : []);
        return normas.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Normativa aplicable</h3>
            <div className="flex flex-wrap gap-2">
              {normas.map((norma: string) => (
                <span key={norma} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                  {norma}
                </span>
              ))}
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}

// ─── Subcomponente: Tab Componentes ──────────────────────────────────────────
function TabComponentes({ equipoId }: { equipoId: string }) {
  const [componentes, setComponentes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    categoria: '', subcategoria: '', fabricante: '', marca: '', modelo: '',
    numero_serie: '', referencia: '', tension: '', potencia: '',
    fecha_instalacion: '', es_critico: false, observaciones: '',
  });

  useEffect(() => {
    api.get(`/equipos/${equipoId}/componentes`)
      .then(res => setComponentes(res.data))
      .finally(() => setCargando(false));
  }, [equipoId]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await api.post('/componentes', {
        equipo_id: Number(equipoId),
        categoria: form.categoria,
        subcategoria: form.subcategoria || undefined,
        fabricante: form.fabricante || undefined,
        marca: form.marca || undefined,
        modelo: form.modelo || undefined,
        numero_serie: form.numero_serie || undefined,
        referencia: form.referencia || undefined,
        tension: form.tension || undefined,
        potencia: form.potencia || undefined,
        fecha_instalacion: form.fecha_instalacion || undefined,
        es_critico: form.es_critico,
        observaciones: form.observaciones || undefined,
      });
      setComponentes(prev => [...prev, res.data]);
      setForm({ categoria:'', subcategoria:'', fabricante:'', marca:'', modelo:'',
        numero_serie:'', referencia:'', tension:'', potencia:'',
        fecha_instalacion:'', es_critico: false, observaciones:'' });
      setMostrarFormulario(false);
    } finally {
      setEnviando(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este componente?')) return;
    await api.delete(`/componentes/${id}`);
    setComponentes(prev => prev.filter(c => c.id !== id));
  };

  if (cargando) return <div className="p-8 text-center text-gray-400">Cargando componentes...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Añadir componente'}
        </button>
      </div>

      {/* Formulario de nuevo componente */}
      {mostrarFormulario && (
        <form onSubmit={handleAdd} className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm">Nuevo componente</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría *</label>
              <select
                value={form.categoria}
                onChange={e => set('categoria', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIAS_COMPONENTE.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subcategoría</label>
              <input type="text" value={form.subcategoria} onChange={e => set('subcategoria', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fabricante</label>
              <input type="text" value={form.fabricante} onChange={e => set('fabricante', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
              <input type="text" value={form.marca} onChange={e => set('marca', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
              <input type="text" value={form.modelo} onChange={e => set('modelo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nº serie</label>
              <input type="text" value={form.numero_serie} onChange={e => set('numero_serie', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Referencia</label>
              <input type="text" value={form.referencia} onChange={e => set('referencia', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tensión (V)</label>
              <input type="text" value={form.tension} onChange={e => set('tension', e.target.value)}
                placeholder="ej. 230V AC"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Potencia (W)</label>
              <input type="text" value={form.potencia} onChange={e => set('potencia', e.target.value)}
                placeholder="ej. 250W"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">F. instalación</label>
              <input type="date" value={form.fecha_instalacion} onChange={e => set('fecha_instalacion', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
            <input type="text" value={form.observaciones} onChange={e => set('observaciones', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.es_critico} onChange={e => set('es_critico', e.target.checked)} className="rounded" />
              Componente crítico
            </label>
            <button
              type="submit"
              disabled={enviando}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {enviando ? 'Guardando...' : 'Añadir componente'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {componentes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay componentes registrados para este equipo.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fabricante / Modelo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">N/S</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">F. instalación</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {componentes.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 capitalize">{c.categoria.replace(/_/g, ' ')}</p>
                    {c.subcategoria && <p className="text-xs text-gray-400">{c.subcategoria}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {[c.fabricante, c.modelo].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.numero_serie ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.estado === 'activo' ? 'bg-green-100 text-green-700' :
                      c.estado === 'averiado' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.estado}
                    </span>
                    {c.es_critico && <span className="ml-1 text-xs text-orange-600 font-medium">⚡</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {c.fecha_instalacion ? new Date(c.fecha_instalacion).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      title="Eliminar componente"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponente: Tab Análisis de Riesgos ──────────────────────────────────
function TabAnalisisRiesgos({ equipoId }: { equipoId: string }) {
  const [items, setItems] = useState<AnalisisRiesgoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [expandido, setExpandido] = useState<number | null>(null);

  useEffect(() => {
    getAnalisisRiesgos(Number(equipoId))
      .then(res => setItems(res.data))
      .finally(() => setCargando(false));
  }, [equipoId]);

  const setEstado = (idx: number, estado: AnalisisRiesgoItem['estado']) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, estado } : it));
  };

  const setObs = (idx: number, observaciones: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, observaciones } : it));
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await saveAnalisisRiesgos(Number(equipoId), items);
      setItems(res.data);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-gray-400">Cargando análisis de riesgos...</div>;

  const cumple    = items.filter(i => i.estado === 'cumple').length;
  const noCumple  = items.filter(i => i.estado === 'no_cumple').length;
  const noAplica  = items.filter(i => i.estado === 'no_aplica').length;

  // Agrupar por categoría
  const categorias = Array.from(new Set(items.map(i => i.categoria)));

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-6">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Análisis de riesgos (ISO 12100 / UNE-EN 13241)</h3>
          <p className="text-xs text-gray-400">{items.length} requisitos evaluados</p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{cumple}</div>
            <div className="text-xs text-gray-500">Cumple</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{noCumple}</div>
            <div className="text-xs text-gray-500">No cumple</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-400">{noAplica}</div>
            <div className="text-xs text-gray-500">No aplica</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {guardado && <span className="text-xs text-green-600 font-medium">✓ Guardado</span>}
          <button
            onClick={guardar}
            disabled={guardando}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar análisis'}
          </button>
        </div>
      </div>

      {/* Lista por categoría */}
      {categorias.map(cat => {
        const requisitos = items.map((it, idx) => ({ ...it, _idx: idx })).filter(it => it.categoria === cat);
        return (
          <div key={cat} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
              <h4 className="font-semibold text-sm text-gray-700">{cat}</h4>
            </div>
            <div className="divide-y divide-gray-50">
              {requisitos.map(({ _idx, ...it }) => (
                <div key={it.requisito} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{it.requisito}</p>
                      {expandido === _idx && (
                        <textarea
                          className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                          rows={2}
                          placeholder="Observaciones..."
                          value={it.observaciones ?? ''}
                          onChange={e => setObs(_idx, e.target.value)}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Botones de estado */}
                      {(['cumple', 'no_cumple', 'no_aplica'] as const).map(estado => (
                        <button
                          key={estado}
                          onClick={() => setEstado(_idx, estado)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                            it.estado === estado
                              ? estado === 'cumple'     ? 'bg-green-500 text-white'
                              : estado === 'no_cumple' ? 'bg-red-500 text-white'
                              :                          'bg-gray-400 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {estado === 'cumple' ? 'CUMPLE' : estado === 'no_cumple' ? 'NO CUMPLE' : 'NO APLICA'}
                        </button>
                      ))}
                      <button
                        onClick={() => setExpandido(expandido === _idx ? null : _idx)}
                        className="text-gray-400 hover:text-gray-600 text-xs px-2"
                        title="Observaciones"
                      >
                        {expandido === _idx ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Subcomponente: Tab Ensayos de Prestaciones ───────────────────────────────
function TabEnsayosPrestaciones({ equipoId }: { equipoId: string }) {
  const [items, setItems] = useState<EnsayoPrestacionItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    getEnsayosPrestaciones(Number(equipoId))
      .then(res => setItems(res.data))
      .finally(() => setCargando(false));
  }, [equipoId]);

  const setFuerza = (idx: number, fuerza_obtenida: string) => {
    const val = fuerza_obtenida === '' ? null : parseFloat(fuerza_obtenida);
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const conforme = val !== null ? val <= it.fuerza_limite : null;
      return { ...it, fuerza_obtenida: val, conforme };
    }));
  };

  const setLimite = (idx: number, fuerza_limite: string) => {
    const lim = parseFloat(fuerza_limite) || 150;
    setItems(prev => prev.map((it, i) => {
      if (i !== idx) return it;
      const conforme = it.fuerza_obtenida !== null && it.fuerza_obtenida !== undefined
        ? it.fuerza_obtenida <= lim : null;
      return { ...it, fuerza_limite: lim, conforme };
    }));
  };

  const setObs = (idx: number, observaciones: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, observaciones } : it));
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const res = await saveEnsayosPrestaciones(Number(equipoId), items);
      setItems(res.data);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="p-8 text-center text-gray-400">Cargando ensayos...</div>;

  const totalConValor = items.filter(i => i.fuerza_obtenida !== null && i.fuerza_obtenida !== undefined).length;
  const todoConforme = totalConValor > 0 && items.filter(i => i.fuerza_obtenida !== null).every(i => i.conforme);

  const renderTabla = (tipo: 'apertura' | 'cierre') => {
    const filas = items.map((it, idx) => ({ ...it, _idx: idx })).filter(it => it.tipo === tipo);
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
          <h4 className="font-semibold text-sm text-gray-700 capitalize">{tipo} de puerta</h4>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs">Punto de medición</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs">Fuerza obtenida (N)</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs">Límite (N)</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs">Resultado</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600 text-xs">Obs.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filas.map(({ _idx, ...it }) => (
              <tr key={it.punto} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700 font-medium">{it.punto}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={it.fuerza_obtenida ?? ''}
                    onChange={e => setFuerza(_idx, e.target.value)}
                    placeholder="—"
                    className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={it.fuerza_limite}
                    onChange={e => setLimite(_idx, e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
                <td className="px-4 py-3">
                  {it.fuerza_obtenida !== null && it.fuerza_obtenida !== undefined ? (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      it.conforme ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {it.conforme ? 'CONFORME' : 'NO CONFORME'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Sin medir</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={it.observaciones ?? ''}
                    onChange={e => setObs(_idx, e.target.value)}
                    placeholder="Opcional"
                    className="w-28 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Cabecera con resultado global */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-6">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Ensayos de prestaciones (UNE-EN 12453)</h3>
          <p className="text-xs text-gray-400">Medición de fuerzas de impacto en puntos de control</p>
        </div>
        {totalConValor > 0 && (
          <div className={`text-sm font-bold px-4 py-2 rounded-lg ${
            todoConforme ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {todoConforme ? '✓ CONFORME' : '✗ NO CONFORME'}
          </div>
        )}
        <div className="flex items-center gap-3">
          {guardado && <span className="text-xs text-green-600 font-medium">✓ Guardado</span>}
          <button
            onClick={guardar}
            disabled={guardando}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {guardando ? 'Guardando...' : 'Guardar ensayos'}
          </button>
        </div>
      </div>

      {renderTabla('apertura')}
      {renderTabla('cierre')}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function EquipoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [equipo, setEquipo] = useState<any>(null);
  const [actuaciones, setActuaciones] = useState<any[]>([]);
  const [pestaña, setPestaña] = useState<Pestaña>('informacion');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    api.get(`/equipos/${id}`)
      .then(res => setEquipo(res.data))
      .catch(() => router.push('/equipos'))
      .finally(() => setCargando(false));
  }, [id, router]);

  useEffect(() => {
    if (!equipo) return;
    if (pestaña === 'historial' && actuaciones.length === 0) {
      api.get(`/equipos/${id}/actuaciones`).then(res => setActuaciones(res.data));
    }
  }, [pestaña, equipo]);

  const copiarEnlaceQR = () => {
    const url = `${window.location.origin}/qr/${equipo.qr_token}`;
    navigator.clipboard.writeText(url);
    alert('Enlace QR copiado al portapapeles');
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-gray-400">Cargando ficha...</div>
        </main>
      </div>
    );
  }

  if (!equipo) return null;

  const pestañas: { id: Pestaña; label: string }[] = [
    { id: 'informacion',      label: 'Información' },
    { id: 'expediente_ce',    label: 'Expediente CE' },
    { id: 'analisis_riesgos', label: 'Análisis de Riesgos' },
    { id: 'ensayos',          label: 'Ensayos' },
    { id: 'componentes',      label: 'Componentes' },
    { id: 'historial',        label: 'Historial' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">

          {/* Cabecera */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/equipos" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Volver a equipos
              </Link>
              <h2 className="text-2xl font-bold text-gray-900">{equipo.descripcion_corta}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-sm text-gray-500">{equipo.codigo_equipo}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeEstadoNorm[equipo.estado_normativo] ?? 'bg-gray-100 text-gray-600'}`}>
                  {labelEstadoNorm[equipo.estado_normativo] ?? equipo.estado_normativo}
                </span>
                {equipo.revision_vencida && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                    ⚠ Revisión vencida
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {equipo.cliente?.razon_social} · {equipo.ubicacion?.nombre_centro}
              </p>
            </div>
            <div className="text-right space-y-2">
              <button
                onClick={() => descargarPdf(
                  `${process.env.NEXT_PUBLIC_API_URL}/equipos/${id}/pdf`,
                  `ficha-${equipo.codigo_equipo}.pdf`
                )}
                className="block ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Descargar PDF
              </button>
              <p className="text-xs text-gray-400 mb-1">Token QR</p>
              <p className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{equipo.qr_token?.slice(0, 18)}...</p>
              <button onClick={copiarEnlaceQR} className="mt-1 text-xs text-blue-600 hover:text-blue-800">
                Copiar enlace QR
              </button>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex border-b border-gray-200 mb-6">
            {pestañas.map(p => (
              <button
                key={p.id}
                onClick={() => setPestaña(p.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  pestaña === p.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Tab: Información */}
          {pestaña === 'informacion' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Campo label="Tipo de equipo" valor={equipo.tipo_equipo?.nombre} />
                <Campo label="Fabricante" valor={equipo.fabricante} />
                <Campo label="Marca / Modelo" valor={[equipo.marca, equipo.modelo].filter(Boolean).join(' / ')} />
                <Campo label="Tipo apertura" valor={equipo.tipo_apertura} />
                <Campo label="Número de serie" valor={equipo.numero_serie} />
                <Campo label="Fecha instalación" valor={equipo.fecha_instalacion ? new Date(equipo.fecha_instalacion).toLocaleDateString('es-ES') : undefined} />
                <Campo label="Ancho paso" valor={equipo.ancho_paso ? `${equipo.ancho_paso} m` : undefined} />
                <Campo label="Alto paso" valor={equipo.alto_paso ? `${equipo.alto_paso} m` : undefined} />
                <Campo label="Peso estimado" valor={equipo.peso_estimado ? `${equipo.peso_estimado} kg` : undefined} />
                <Campo label="Criticidad" valor={equipo.criticidad} />
                <Campo label="Estado" valor={equipo.estado_equipo?.replace('_', ' ')} />
                <Campo label="Periodicidad mantenimiento" valor={equipo.periodicidad_mantenimiento ? `${equipo.periodicidad_mantenimiento} días` : undefined} />
                <Campo label="Próx. mantenimiento" valor={equipo.fecha_proximo_mantenimiento ? new Date(equipo.fecha_proximo_mantenimiento).toLocaleDateString('es-ES') : undefined} />
                <Campo label="Técnico responsable" valor={equipo.tecnico_responsable?.name} />
                <Campo label="Uso previsto" valor={equipo.uso_previsto} />
              </dl>
              {equipo.observaciones_generales && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</dt>
                  <dd className="text-sm text-gray-700">{equipo.observaciones_generales}</dd>
                </div>
              )}
            </div>
          )}

          {/* Tab: Expediente CE */}
          {pestaña === 'expediente_ce' && (
            <TabCE equipo={equipo} onGuardado={setEquipo} />
          )}

          {/* Tab: Análisis de Riesgos */}
          {pestaña === 'analisis_riesgos' && (
            <TabAnalisisRiesgos equipoId={id} />
          )}

          {/* Tab: Ensayos de Prestaciones */}
          {pestaña === 'ensayos' && (
            <TabEnsayosPrestaciones equipoId={id} />
          )}

          {/* Tab: Componentes */}
          {pestaña === 'componentes' && (
            <TabComponentes equipoId={id} />
          )}

          {/* Tab: Historial */}
          {pestaña === 'historial' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Link
                  href={`/actuaciones/nueva?equipo_id=${id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  + Nueva actuación
                </Link>
              </div>
              {actuaciones.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                  Sin actuaciones registradas para este equipo.
                </div>
              ) : (
                actuaciones.map((a: any) => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">
                          {a.tipo_actuacion.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(a.fecha_inicio).toLocaleDateString('es-ES')}
                          {a.usuario_responsable && ` · ${a.usuario_responsable.name}`}
                        </p>
                        {a.resumen && <p className="text-sm text-gray-600 mt-2">{a.resumen}</p>}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.estado === 'completada' ? 'bg-green-100 text-green-700' :
                          a.estado === 'en_curso' ? 'bg-blue-100 text-blue-700' :
                          a.estado === 'cancelada' ? 'bg-gray-100 text-gray-500' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.estado.replace('_', ' ')}
                        </span>
                        <Link href={`/actuaciones/${a.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Ver →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
