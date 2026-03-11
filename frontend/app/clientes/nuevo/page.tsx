/**
 * Formulario para dar de alta un nuevo cliente.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

export default function NuevoClientePage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    razon_social:     '',
    nombre_comercial: '',
    cif_nif:          '',
    direccion_fiscal: '',
    poblacion:        '',
    provincia:        '',
    codigo_postal:    '',
    pais:             'España',
    telefono:         '',
    email:            '',
    web:              '',
    observaciones:    '',
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, []);

  const set = (campo: string, valor: string) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrores({});

    const payload: any = {};
    Object.entries(form).forEach(([k, v]) => { if (v !== '') payload[k] = v; });

    try {
      const res = await api.post('/clientes', payload);
      router.push(`/clientes/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errs: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([k, v]: any) => { errs[k] = v[0]; });
        setErrores(errs);
      } else {
        setErrores({ general: err.response?.data?.message ?? 'Error al guardar.' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const f = (campo: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errores[campo] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/clientes" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver a clientes
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo cliente</h2>

          {errores.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errores.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Datos fiscales</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón social *</label>
                <input type="text" value={form.razon_social} onChange={e => set('razon_social', e.target.value)} required className={f('razon_social')} />
                {errores.razon_social && <p className="text-xs text-red-500 mt-1">{errores.razon_social}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre comercial</label>
                  <input type="text" value={form.nombre_comercial} onChange={e => set('nombre_comercial', e.target.value)} className={f('nombre_comercial')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIF / NIF</label>
                  <input type="text" value={form.cif_nif} onChange={e => set('cif_nif', e.target.value)} className={f('cif_nif')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal</label>
                <input type="text" value={form.direccion_fiscal} onChange={e => set('direccion_fiscal', e.target.value)} className={f('direccion_fiscal')} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Población</label>
                  <input type="text" value={form.poblacion} onChange={e => set('poblacion', e.target.value)} className={f('poblacion')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <input type="text" value={form.provincia} onChange={e => set('provincia', e.target.value)} className={f('provincia')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cód. postal</label>
                  <input type="text" value={form.codigo_postal} onChange={e => set('codigo_postal', e.target.value)} className={f('codigo_postal')} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Contacto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)} className={f('telefono')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={f('email')} />
                  {errores.email && <p className="text-xs text-red-500 mt-1">{errores.email}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Web</label>
                  <input type="url" value={form.web} onChange={e => set('web', e.target.value)} placeholder="https://" className={f('web')} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={3} className={f('observaciones')} />
            </div>

            <div className="flex gap-3 justify-end">
              <Link href="/clientes" className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Cancelar
              </Link>
              <button type="submit" disabled={enviando} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors">
                {enviando ? 'Guardando...' : 'Crear cliente'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
