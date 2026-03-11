/**
 * Formulario para registrar una nueva actuación sobre un equipo.
 * Acepta ?equipo_id=X en la URL para pre-seleccionar el equipo.
 */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

const TIPOS_ACTUACION = [
  { value: 'instalacion_nueva',        label: 'Instalación nueva' },
  { value: 'automatizacion',           label: 'Automatización' },
  { value: 'sustitucion_parcial',      label: 'Sustitución parcial' },
  { value: 'reparacion',               label: 'Reparación' },
  { value: 'mantenimiento_preventivo', label: 'Mantenimiento preventivo' },
  { value: 'mantenimiento_correctivo', label: 'Mantenimiento correctivo' },
  { value: 'adecuacion_normativa',     label: 'Adecuación normativa' },
  { value: 'inspeccion_tecnica',       label: 'Inspección técnica' },
  { value: 'baja',                     label: 'Baja' },
];

const ORIGENES = [
  { value: 'contrato',          label: 'Contrato' },
  { value: 'averia',            label: 'Avería' },
  { value: 'solicitud_cliente', label: 'Solicitud del cliente' },
  { value: 'inspeccion',        label: 'Inspección' },
  { value: 'adecuacion',        label: 'Adecuación normativa' },
  { value: 'interno',           label: 'Interno' },
];

function NuevaActuacionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const equipoIdParam = searchParams.get('equipo_id');

  const [equipos, setEquipos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const hoy = new Date().toISOString().slice(0, 16); // datetime-local

  const [form, setForm] = useState({
    equipo_id:               equipoIdParam ?? '',
    tipo_actuacion:          '',
    origen_actuacion:        'contrato',
    fecha_inicio:            hoy,
    fecha_fin:               '',
    usuario_responsable_id:  '',
    duracion_minutos:        '',
    resumen:                 '',
    observaciones:           '',
    actualiza_expediente_ce: false,
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    // Cargar catálogos en paralelo
    Promise.all([
      api.get('/equipos', { params: { por_pagina: 200 } }),
      api.get('/usuarios'),
    ]).then(([eqRes, usRes]) => {
      setEquipos(eqRes.data.data ?? []);
      setUsuarios(usRes.data);
    });
  }, []);

  const set = (campo: string, valor: any) =>
    setForm(f => ({ ...f, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});
    setEnviando(true);

    const payload: any = {
      equipo_id:        Number(form.equipo_id),
      tipo_actuacion:   form.tipo_actuacion,
      origen_actuacion: form.origen_actuacion,
      fecha_inicio:     form.fecha_inicio,
      fecha_fin:        form.fecha_fin || undefined,
      usuario_responsable_id: form.usuario_responsable_id ? Number(form.usuario_responsable_id) : undefined,
      duracion_minutos: form.duracion_minutos ? Number(form.duracion_minutos) : undefined,
      resumen:          form.resumen || undefined,
      observaciones:    form.observaciones || undefined,
      actualiza_expediente_ce: form.actualiza_expediente_ce,
    };

    try {
      const res = await api.post('/actuaciones', payload);
      router.push(`/actuaciones/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const msgs: Record<string, string> = {};
        Object.entries(err.response.data.errors ?? {}).forEach(([k, v]) => {
          msgs[k] = (v as string[])[0];
        });
        setErrores(msgs);
      }
    } finally {
      setEnviando(false);
    }
  };

  const Err = ({ campo }: { campo: string }) =>
    errores[campo] ? <p className="text-red-500 text-xs mt-1">{errores[campo]}</p> : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/actuaciones" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver a actuaciones
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva actuación</h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">

            {/* Equipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipo <span className="text-red-500">*</span>
              </label>
              <select
                value={form.equipo_id}
                onChange={e => set('equipo_id', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar equipo...</option>
                {equipos.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.codigo_equipo} – {eq.descripcion_corta}
                  </option>
                ))}
              </select>
              <Err campo="equipo_id" />
            </div>

            {/* Tipo de actuación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de actuación <span className="text-red-500">*</span>
              </label>
              <select
                value={form.tipo_actuacion}
                onChange={e => set('tipo_actuacion', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo...</option>
                {TIPOS_ACTUACION.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Err campo="tipo_actuacion" />
            </div>

            {/* Origen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
              <select
                value={form.origen_actuacion}
                onChange={e => set('origen_actuacion', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ORIGENES.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.fecha_inicio}
                  onChange={e => set('fecha_inicio', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Err campo="fecha_inicio" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input
                  type="datetime-local"
                  value={form.fecha_fin}
                  onChange={e => set('fecha_fin', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Responsable y duración */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Técnico responsable</label>
                <select
                  value={form.usuario_responsable_id}
                  onChange={e => set('usuario_responsable_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin asignar</option>
                  {usuarios.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={form.duracion_minutos}
                  onChange={e => set('duracion_minutos', e.target.value)}
                  min={1}
                  placeholder="ej. 90"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Resumen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen</label>
              <textarea
                value={form.resumen}
                onChange={e => set('resumen', e.target.value)}
                rows={3}
                placeholder="Descripción breve de los trabajos realizados..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)}
                rows={2}
                placeholder="Incidencias, materiales usados, notas adicionales..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expediente CE */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <input
                id="actualiza_ce"
                type="checkbox"
                checked={form.actualiza_expediente_ce}
                onChange={e => set('actualiza_expediente_ce', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="actualiza_ce" className="text-sm text-gray-700 cursor-pointer">
                Esta actuación genera o actualiza el expediente CE del equipo
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                {enviando ? 'Guardando...' : 'Registrar actuación'}
              </button>
              <Link
                href="/actuaciones"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function NuevaActuacionPage() {
  return (
    <Suspense>
      <NuevaActuacionForm />
    </Suspense>
  );
}
