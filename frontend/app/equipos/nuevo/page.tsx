/**
 * Formulario para dar de alta un nuevo equipo.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

export default function NuevoEquipoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [tiposEquipo, setTiposEquipo] = useState<any[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    cliente_id:                  '',
    ubicacion_id:                '',
    tipo_equipo_id:              '',
    descripcion_corta:           '',
    fabricante:                  '',
    marca:                       '',
    modelo:                      '',
    numero_serie:                '',
    tipo_apertura:               '',
    ancho_paso:                  '',
    alto_paso:                   '',
    peso_estimado:               '',
    fecha_instalacion:           '',
    periodicidad_mantenimiento:  '',
    criticidad:                  'media',
    uso_previsto:                '',
    observaciones_generales:     '',
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    // Cargar catálogos en paralelo
    Promise.all([
      api.get('/clientes?por_pagina=200'),
      api.get('/tipos-equipo'),
    ]).then(([resClientes, resTipos]) => {
      setClientes(resClientes.data.data ?? resClientes.data);
      setTiposEquipo(resTipos.data);
    });
  }, []);

  // Cuando cambia el cliente, cargar sus ubicaciones
  useEffect(() => {
    if (!form.cliente_id) { setUbicaciones([]); return; }
    api.get(`/ubicaciones?cliente_id=${form.cliente_id}&por_pagina=100`)
      .then(res => setUbicaciones(res.data.data ?? res.data));
  }, [form.cliente_id]);

  const set = (campo: string, valor: string) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrores({});

    // Construir payload sin campos vacíos
    const payload: any = {};
    Object.entries(form).forEach(([k, v]) => { if (v !== '') payload[k] = v; });

    try {
      const res = await api.post('/equipos', payload);
      router.push(`/equipos/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errs: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([k, v]: any) => { errs[k] = v[0]; });
        setErrores(errs);
      } else {
        setErrores({ general: err.response?.data?.message ?? 'Error al guardar el equipo.' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const inputClass = (campo: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores[campo] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Link href="/equipos" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver a equipos
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo equipo</h2>

          {errores.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errores.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Bloque: Ubicación */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                  <select value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)} required className={inputClass('cliente_id')}>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
                  </select>
                  {errores.cliente_id && <p className="text-xs text-red-500 mt-1">{errores.cliente_id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                  <select value={form.ubicacion_id} onChange={e => set('ubicacion_id', e.target.value)} required disabled={!form.cliente_id} className={inputClass('ubicacion_id')}>
                    <option value="">{form.cliente_id ? 'Seleccionar ubicación...' : 'Primero selecciona un cliente'}</option>
                    {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.nombre_centro}</option>)}
                  </select>
                  {errores.ubicacion_id && <p className="text-xs text-red-500 mt-1">{errores.ubicacion_id}</p>}
                </div>
              </div>
            </div>

            {/* Bloque: Identificación */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Identificación del equipo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta *</label>
                  <input type="text" value={form.descripcion_corta} onChange={e => set('descripcion_corta', e.target.value)} required placeholder="Ej: Puerta seccional nave 1 entrada principal" className={inputClass('descripcion_corta')} />
                  {errores.descripcion_corta && <p className="text-xs text-red-500 mt-1">{errores.descripcion_corta}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de equipo</label>
                  <select value={form.tipo_equipo_id} onChange={e => set('tipo_equipo_id', e.target.value)} className={inputClass('tipo_equipo_id')}>
                    <option value="">Sin especificar</option>
                    {tiposEquipo.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de apertura</label>
                  <select value={form.tipo_apertura} onChange={e => set('tipo_apertura', e.target.value)} className={inputClass('tipo_apertura')}>
                    <option value="">Sin especificar</option>
                    <option value="seccional">Seccional</option>
                    <option value="enrollable">Enrollable</option>
                    <option value="batiente">Batiente</option>
                    <option value="corredera">Corredera</option>
                    <option value="basculante">Basculante</option>
                    <option value="rapida">Rápida</option>
                    <option value="peatonal">Peatonal automática</option>
                    <option value="barrera">Barrera</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
                  <input type="text" value={form.fabricante} onChange={e => set('fabricante', e.target.value)} className={inputClass('fabricante')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input type="text" value={form.marca} onChange={e => set('marca', e.target.value)} className={inputClass('marca')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <input type="text" value={form.modelo} onChange={e => set('modelo', e.target.value)} className={inputClass('modelo')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de serie</label>
                  <input type="text" value={form.numero_serie} onChange={e => set('numero_serie', e.target.value)} className={inputClass('numero_serie')} />
                </div>
              </div>
            </div>

            {/* Bloque: Dimensiones */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Dimensiones</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ancho paso (m)</label>
                  <input type="number" step="0.01" value={form.ancho_paso} onChange={e => set('ancho_paso', e.target.value)} className={inputClass('ancho_paso')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alto paso (m)</label>
                  <input type="number" step="0.01" value={form.alto_paso} onChange={e => set('alto_paso', e.target.value)} className={inputClass('alto_paso')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso estimado (kg)</label>
                  <input type="number" step="0.1" value={form.peso_estimado} onChange={e => set('peso_estimado', e.target.value)} className={inputClass('peso_estimado')} />
                </div>
              </div>
            </div>

            {/* Bloque: Operativo */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Datos operativos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha instalación</label>
                  <input type="date" value={form.fecha_instalacion} onChange={e => set('fecha_instalacion', e.target.value)} className={inputClass('fecha_instalacion')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Periodicidad mantenimiento (días)</label>
                  <input type="number" value={form.periodicidad_mantenimiento} onChange={e => set('periodicidad_mantenimiento', e.target.value)} placeholder="365" className={inputClass('periodicidad_mantenimiento')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Criticidad</label>
                  <select value={form.criticidad} onChange={e => set('criticidad', e.target.value)} className={inputClass('criticidad')}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uso previsto</label>
                  <input type="text" value={form.uso_previsto} onChange={e => set('uso_previsto', e.target.value)} placeholder="Ej: Acceso de vehículos a nave industrial de uso frecuente" className={inputClass('uso_previsto')} />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea value={form.observaciones_generales} onChange={e => set('observaciones_generales', e.target.value)} rows={3} className={inputClass('observaciones_generales')} />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <Link href="/equipos" className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Cancelar
              </Link>
              <button type="submit" disabled={enviando} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors">
                {enviando ? 'Guardando...' : 'Crear equipo'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
