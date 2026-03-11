/**
 * Formulario para crear una nueva tarea de agenda.
 */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

const TIPOS_TAREA = [
  { value: 'instalacion',    label: 'Instalación' },
  { value: 'mantenimiento',  label: 'Mantenimiento' },
  { value: 'incidencia',     label: 'Incidencia' },
  { value: 'inspeccion',     label: 'Inspección' },
  { value: 'adecuacion',     label: 'Adecuación' },
  { value: 'visita_tecnica', label: 'Visita técnica' },
];

const PRIORIDADES = [
  { value: 'baja',    label: 'Baja' },
  { value: 'normal',  label: 'Normal' },
  { value: 'alta',    label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

function NuevaTareaForm() {
  const router = useRouter();

  const [equipos, setEquipos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const hoy = new Date().toISOString().slice(0, 16);

  const [form, setForm] = useState({
    tipo_tarea:       '',
    equipo_id:        '',
    tecnico_id:       '',
    fecha_programada: hoy,
    franja_horaria:   '',
    prioridad:        'normal',
    observaciones:    '',
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
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
      tipo_tarea:       form.tipo_tarea,
      fecha_programada: form.fecha_programada,
      prioridad:        form.prioridad,
      equipo_id:        form.equipo_id ? Number(form.equipo_id) : undefined,
      tecnico_id:       form.tecnico_id ? Number(form.tecnico_id) : undefined,
      franja_horaria:   form.franja_horaria || undefined,
      observaciones:    form.observaciones || undefined,
    };

    try {
      const res = await api.post('/agenda', payload);
      router.push(`/agenda/${res.data.id}`);
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
          <Link href="/agenda" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver a agenda
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva tarea</h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">

            {/* Tipo de tarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de tarea <span className="text-red-500">*</span>
              </label>
              <select
                value={form.tipo_tarea}
                onChange={e => set('tipo_tarea', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo...</option>
                {TIPOS_TAREA.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Err campo="tipo_tarea" />
            </div>

            {/* Equipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
              <select
                value={form.equipo_id}
                onChange={e => set('equipo_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin equipo asignado</option>
                {equipos.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.codigo_equipo} – {eq.descripcion_corta}
                  </option>
                ))}
              </select>
              <Err campo="equipo_id" />
            </div>

            {/* Técnico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Técnico asignado</label>
              <select
                value={form.tecnico_id}
                onChange={e => set('tecnico_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin asignar</option>
                {usuarios.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}{u.perfil ? ` (${u.perfil})` : ''}</option>
                ))}
              </select>
              <Err campo="tecnico_id" />
            </div>

            {/* Fecha y franja */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha programada <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.fecha_programada}
                  onChange={e => set('fecha_programada', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Err campo="fecha_programada" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Franja horaria</label>
                <input
                  type="text"
                  value={form.franja_horaria}
                  onChange={e => set('franja_horaria', e.target.value)}
                  placeholder="ej. 09:00-11:00"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Err campo="franja_horaria" />
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                value={form.prioridad}
                onChange={e => set('prioridad', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORIDADES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <Err campo="prioridad" />
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)}
                rows={3}
                placeholder="Notas adicionales, instrucciones de acceso..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Err campo="observaciones" />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                {enviando ? 'Guardando...' : 'Crear tarea'}
              </button>
              <Link
                href="/agenda"
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

export default function NuevaTareaPage() {
  return (
    <Suspense>
      <NuevaTareaForm />
    </Suspense>
  );
}
