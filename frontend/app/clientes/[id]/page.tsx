/**
 * Ficha de cliente con pestañas: datos, ubicaciones y equipos.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

type Pestaña = 'datos' | 'ubicaciones' | 'equipos';

const badgeNorm: Record<string, string> = {
  conforme:            'bg-green-100 text-green-700',
  no_conforme:         'bg-red-100 text-red-700',
  en_proceso:          'bg-yellow-100 text-yellow-700',
  requiere_adecuacion: 'bg-orange-100 text-orange-700',
  sin_evaluar:         'bg-gray-100 text-gray-600',
};

function Campo({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{valor ?? '—'}</dd>
    </div>
  );
}

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [pestaña, setPestaña] = useState<Pestaña>('datos');
  const [cargando, setCargando] = useState(true);

  // Formulario nueva ubicación
  const [mostrarFormUbi, setMostrarFormUbi] = useState(false);
  const [formUbi, setFormUbi] = useState({ nombre_centro: '', tipo_ubicacion: 'nave_industrial', localidad: '', provincia: '' });
  const [enviandoUbi, setEnviandoUbi] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    api.get(`/clientes/${id}`)
      .then(res => { setCliente(res.data); setUbicaciones(res.data.ubicaciones ?? []); })
      .catch(() => router.push('/clientes'))
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    if (pestaña === 'equipos' && equipos.length === 0 && cliente) {
      api.get(`/clientes/${id}/equipos`).then(res => setEquipos(res.data));
    }
  }, [pestaña, cliente]);

  const agregarUbicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoUbi(true);
    try {
      const res = await api.post('/ubicaciones', { ...formUbi, cliente_id: id });
      setUbicaciones(prev => [...prev, res.data]);
      setMostrarFormUbi(false);
      setFormUbi({ nombre_centro: '', tipo_ubicacion: 'nave_industrial', localidad: '', provincia: '' });
    } finally {
      setEnviandoUbi(false);
    }
  };

  if (cargando) return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Cargando...</div>
      </main>
    </div>
  );

  if (!cliente) return null;

  const pestañas: { id: Pestaña; label: string }[] = [
    { id: 'datos',      label: 'Datos' },
    { id: 'ubicaciones', label: `Ubicaciones (${ubicaciones.length})` },
    { id: 'equipos',    label: 'Equipos' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/clientes" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Volver a clientes
              </Link>
              <h2 className="text-2xl font-bold text-gray-900">{cliente.razon_social}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-sm text-gray-500">{cliente.codigo_interno}</span>
                {cliente.cif_nif && <span className="text-sm text-gray-500">{cliente.cif_nif}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cliente.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex border-b border-gray-200 mb-6">
            {pestañas.map(p => (
              <button key={p.id} onClick={() => setPestaña(p.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${pestaña === p.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Tab: Datos */}
          {pestaña === 'datos' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Campo label="Razón social" valor={cliente.razon_social} />
                <Campo label="Nombre comercial" valor={cliente.nombre_comercial} />
                <Campo label="CIF / NIF" valor={cliente.cif_nif} />
                <Campo label="Dirección fiscal" valor={cliente.direccion_fiscal} />
                <Campo label="Población" valor={cliente.poblacion} />
                <Campo label="Provincia" valor={cliente.provincia} />
                <Campo label="Código postal" valor={cliente.codigo_postal} />
                <Campo label="País" valor={cliente.pais} />
                <Campo label="Teléfono" valor={cliente.telefono} />
                <Campo label="Email" valor={cliente.email} />
                <Campo label="Web" valor={cliente.web} />
              </dl>
              {cliente.observaciones && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observaciones</dt>
                  <dd className="text-sm text-gray-700">{cliente.observaciones}</dd>
                </div>
              )}
            </div>
          )}

          {/* Tab: Ubicaciones */}
          {pestaña === 'ubicaciones' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => setMostrarFormUbi(!mostrarFormUbi)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  + Nueva ubicación
                </button>
              </div>

              {/* Formulario inline nueva ubicación */}
              {mostrarFormUbi && (
                <form onSubmit={agregarUbicacion} className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
                  <h4 className="font-medium text-blue-900">Nueva ubicación</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input required value={formUbi.nombre_centro} onChange={e => setFormUbi(p => ({ ...p, nombre_centro: e.target.value }))}
                        placeholder="Nombre del centro / instalación *"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <input value={formUbi.localidad} onChange={e => setFormUbi(p => ({ ...p, localidad: e.target.value }))}
                        placeholder="Localidad"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <select value={formUbi.tipo_ubicacion} onChange={e => setFormUbi(p => ({ ...p, tipo_ubicacion: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="nave_industrial">Nave industrial</option>
                        <option value="edificio_oficinas">Edificio oficinas</option>
                        <option value="comunidad_vecinos">Comunidad vecinos</option>
                        <option value="centro_comercial">Centro comercial</option>
                        <option value="logistica">Logística</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setMostrarFormUbi(false)} className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button type="submit" disabled={enviandoUbi} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                      {enviandoUbi ? 'Guardando...' : 'Añadir'}
                    </button>
                  </div>
                </form>
              )}

              {/* Lista */}
              {ubicaciones.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                  No hay ubicaciones registradas para este cliente.
                </div>
              ) : (
                <div className="grid gap-3">
                  {ubicaciones.map((u: any) => (
                    <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{u.nombre_centro}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {[u.localidad, u.provincia].filter(Boolean).join(', ')} · {u.tipo_ubicacion?.replace('_', ' ')}
                        </p>
                      </div>
                      <Link href={`/equipos?ubicacion_id=${u.id}`} className="text-xs text-blue-600 hover:text-blue-800">
                        Ver equipos →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Equipos */}
          {pestaña === 'equipos' && (
            <div>
              <div className="flex justify-end mb-4">
                <Link href={`/equipos/nuevo?cliente_id=${id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  + Nuevo equipo
                </Link>
              </div>
              {equipos.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                  No hay equipos registrados para este cliente.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Equipo</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Ubicación</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Normativa</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Próx. revisión</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {equipos.map((eq: any) => (
                        <tr key={eq.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{eq.codigo_equipo}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{eq.descripcion_corta}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{eq.ubicacion?.nombre_centro ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeNorm[eq.estado_normativo] ?? 'bg-gray-100 text-gray-600'}`}>
                              {eq.estado_normativo?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {eq.fecha_proximo_mantenimiento ? new Date(eq.fecha_proximo_mantenimiento).toLocaleDateString('es-ES') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/equipos/${eq.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Ver →</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
