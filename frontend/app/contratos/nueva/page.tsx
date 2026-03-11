/**
 * Formulario de creación de un nuevo contrato.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

const TIPOS_CONTRATO = [
  { value: 'mantenimiento_preventivo', label: 'Mantenimiento preventivo' },
  { value: 'mantenimiento_integral',   label: 'Mantenimiento integral' },
  { value: 'servicio_tecnico',         label: 'Servicio técnico' },
  { value: 'adecuacion',               label: 'Adecuación' },
  { value: 'inspeccion',               label: 'Inspección' },
];

const PERIODICIDADES = [
  { value: 'mensual',    label: 'Mensual' },
  { value: 'bimestral',  label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral',  label: 'Semestral' },
  { value: 'anual',      label: 'Anual' },
  { value: 'bianual',    label: 'Bianual' },
];

interface FormData {
  cliente_id: string;
  ubicacion_id: string;
  numero_contrato: string;
  tipo_contrato: string;
  fecha_inicio: string;
  fecha_fin: string;
  periodicidad_visitas: string;
  alcance: string;
  incluye_repuestos: boolean;
  importe: string;
  observaciones: string;
}

export default function NuevoContratoPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<any[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    cliente_id: '',
    ubicacion_id: '',
    numero_contrato: '',
    tipo_contrato: '',
    fecha_inicio: '',
    fecha_fin: '',
    periodicidad_visitas: '',
    alcance: '',
    incluye_repuestos: false,
    importe: '',
    observaciones: '',
  });

  // Cargar clientes al montar
  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    api.get('/clientes', { params: { por_pagina: 200 } })
      .then(res => setClientes(res.data.data ?? res.data))
      .catch(() => router.push('/login'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar ubicaciones cuando cambia cliente_id
  useEffect(() => {
    if (!form.cliente_id) {
      setUbicaciones([]);
      setForm(prev => ({ ...prev, ubicacion_id: '' }));
      return;
    }
    setCargandoUbicaciones(true);
    api.get('/ubicaciones', { params: { cliente_id: form.cliente_id } })
      .then(res => setUbicaciones(res.data.data ?? res.data))
      .catch(() => setUbicaciones([]))
      .finally(() => setCargandoUbicaciones(false));
    setForm(prev => ({ ...prev, ubicacion_id: '' }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cliente_id]);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errores[field]) setErrores(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({});

    // Validación básica en cliente
    const nuevosErrores: Record<string, string> = {};
    if (!form.cliente_id)    nuevosErrores.cliente_id    = 'El cliente es obligatorio.';
    if (!form.tipo_contrato) nuevosErrores.tipo_contrato = 'El tipo de contrato es obligatorio.';
    if (!form.fecha_inicio)  nuevosErrores.fecha_inicio  = 'La fecha de inicio es obligatoria.';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const body: Record<string, any> = {
      cliente_id:          Number(form.cliente_id),
      tipo_contrato:       form.tipo_contrato,
      fecha_inicio:        form.fecha_inicio,
      incluye_repuestos:   form.incluye_repuestos,
    };
    if (form.ubicacion_id)        body.ubicacion_id        = Number(form.ubicacion_id);
    if (form.numero_contrato)     body.numero_contrato     = form.numero_contrato;
    if (form.fecha_fin)           body.fecha_fin           = form.fecha_fin;
    if (form.periodicidad_visitas) body.periodicidad_visitas = form.periodicidad_visitas;
    if (form.alcance)             body.alcance             = form.alcance;
    if (form.importe)             body.importe             = Number(form.importe);
    if (form.observaciones)       body.observaciones       = form.observaciones;

    setEnviando(true);
    try {
      const res = await api.post('/contratos', body);
      const id = res.data?.id ?? res.data?.data?.id;
      router.push(`/contratos/${id}`);
    } catch (err: any) {
      if (err.response?.status === 422 && err.response.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([campo, msgs]) => {
          apiErrors[campo] = (msgs as string[])[0];
        });
        setErrores(apiErrors);
      } else {
        setErrores({ general: 'Ha ocurrido un error al guardar el contrato.' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const inputClass = (campo: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errores[campo] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">

          {/* Cabecera */}
          <div className="mb-6">
            <Link href="/contratos" className="text-sm text-blue-600 hover:text-blue-800">
              ← Volver a contratos
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Nuevo contrato</h2>
          </div>

          {/* Error general */}
          {errores.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {errores.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Sección: Partes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Partes del contrato</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Cliente */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.cliente_id}
                    onChange={e => set('cliente_id', e.target.value)}
                    className={inputClass('cliente_id')}
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.razon_social}</option>
                    ))}
                  </select>
                  {errores.cliente_id && <p className="text-red-500 text-xs mt-1">{errores.cliente_id}</p>}
                </div>

                {/* Ubicación */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ubicación / Centro</label>
                  <select
                    value={form.ubicacion_id}
                    onChange={e => set('ubicacion_id', e.target.value)}
                    disabled={!form.cliente_id || cargandoUbicaciones}
                    className={inputClass('ubicacion_id') + ' disabled:bg-gray-50 disabled:text-gray-400'}
                  >
                    <option value="">
                      {cargandoUbicaciones ? 'Cargando...' : 'Sin ubicación específica'}
                    </option>
                    {ubicaciones.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.nombre_centro}</option>
                    ))}
                  </select>
                  {errores.ubicacion_id && <p className="text-red-500 text-xs mt-1">{errores.ubicacion_id}</p>}
                </div>
              </div>
            </div>

            {/* Sección: Datos del contrato */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Datos del contrato</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Número de contrato */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nº Contrato</label>
                  <input
                    type="text"
                    value={form.numero_contrato}
                    onChange={e => set('numero_contrato', e.target.value)}
                    placeholder="CON-2024-001"
                    className={inputClass('numero_contrato')}
                  />
                  {errores.numero_contrato && <p className="text-red-500 text-xs mt-1">{errores.numero_contrato}</p>}
                </div>

                {/* Tipo de contrato */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tipo de contrato <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.tipo_contrato}
                    onChange={e => set('tipo_contrato', e.target.value)}
                    className={inputClass('tipo_contrato')}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {TIPOS_CONTRATO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {errores.tipo_contrato && <p className="text-red-500 text-xs mt-1">{errores.tipo_contrato}</p>}
                </div>

                {/* Fecha inicio */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Fecha de inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={e => set('fecha_inicio', e.target.value)}
                    className={inputClass('fecha_inicio')}
                  />
                  {errores.fecha_inicio && <p className="text-red-500 text-xs mt-1">{errores.fecha_inicio}</p>}
                </div>

                {/* Fecha fin */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de fin</label>
                  <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={e => set('fecha_fin', e.target.value)}
                    className={inputClass('fecha_fin')}
                  />
                  {errores.fecha_fin && <p className="text-red-500 text-xs mt-1">{errores.fecha_fin}</p>}
                </div>

                {/* Periodicidad */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Periodicidad de visitas</label>
                  <select
                    value={form.periodicidad_visitas}
                    onChange={e => set('periodicidad_visitas', e.target.value)}
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
                    value={form.importe}
                    onChange={e => set('importe', e.target.value)}
                    placeholder="0.00"
                    className={inputClass('importe')}
                  />
                  {errores.importe && <p className="text-red-500 text-xs mt-1">{errores.importe}</p>}
                </div>

                {/* Incluye repuestos */}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    id="incluye_repuestos"
                    type="checkbox"
                    checked={form.incluye_repuestos}
                    onChange={e => set('incluye_repuestos', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="incluye_repuestos" className="text-sm text-gray-700">
                    Incluye repuestos
                  </label>
                </div>

                {/* Alcance */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alcance</label>
                  <textarea
                    value={form.alcance}
                    onChange={e => set('alcance', e.target.value)}
                    rows={3}
                    placeholder="Descripción del alcance del contrato..."
                    className={inputClass('alcance')}
                  />
                  {errores.alcance && <p className="text-red-500 text-xs mt-1">{errores.alcance}</p>}
                </div>

                {/* Observaciones */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                  <textarea
                    value={form.observaciones}
                    onChange={e => set('observaciones', e.target.value)}
                    rows={3}
                    placeholder="Notas adicionales..."
                    className={inputClass('observaciones')}
                  />
                  {errores.observaciones && <p className="text-red-500 text-xs mt-1">{errores.observaciones}</p>}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/contratos"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={enviando}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {enviando ? 'Guardando...' : 'Crear contrato'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
