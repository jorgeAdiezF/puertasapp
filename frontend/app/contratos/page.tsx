/**
 * Listado de contratos con filtros por estado y tipo.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const PERIODICIDAD: Record<string, string> = {
  mensual:    'Mensual',
  bimestral:  'Bimestral',
  trimestral: 'Trimestral',
  semestral:  'Semestral',
  anual:      'Anual',
  bianual:    'Bianual',
};

const BADGE_ESTADO: Record<string, string> = {
  borrador:  'bg-gray-100 text-gray-600',
  activo:    'bg-green-100 text-green-700',
  vencido:   'bg-orange-100 text-orange-700',
  cancelado: 'bg-red-100 text-red-600',
};

export default function ContratosPage() {
  const router = useRouter();
  const [contratos, setContratos] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const cargar = (pagina = 1) => {
    setCargando(true);
    api.get('/contratos', {
      params: {
        page: pagina,
        estado: filtroEstado || undefined,
        tipo_contrato: filtroTipo || undefined,
        por_pagina: 25,
      },
    })
      .then(res => setContratos(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, filtroTipo]);

  const formatFecha = (f: string | null) =>
    f ? new Date(f).toLocaleDateString('es-ES') : '—';

  const formatImporte = (importe: number | null, moneda: string | null) => {
    if (importe == null) return '—';
    const simbolo = moneda === 'USD' ? '$' : moneda === 'GBP' ? '£' : '€';
    return `${simbolo}${Number(importe).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">

          {/* Cabecera */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Contratos</h2>
            <Link
              href="/contratos/nueva"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Nuevo contrato
            </Link>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3">
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TIPOS_CONTRATO).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cargando ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : contratos?.data?.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay contratos con los filtros actuales.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nº Contrato</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Vigencia</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Periodicidad</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Importe</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Equipos</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {contratos?.data?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono font-medium text-gray-900 text-xs">
                          {c.numero_contrato ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {TIPOS_CONTRATO[c.tipo_contrato] ?? c.tipo_contrato?.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.cliente?.razon_social ?? '—'}
                        {c.ubicacion?.nombre_centro && (
                          <p className="text-xs text-gray-400">{c.ubicacion.nombre_centro}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatFecha(c.fecha_inicio)}
                        {c.fecha_fin && (
                          <span className="text-gray-400"> → {formatFecha(c.fecha_fin)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.periodicidad_visitas ? (PERIODICIDAD[c.periodicidad_visitas] ?? c.periodicidad_visitas) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {formatImporte(c.importe, c.moneda)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_ESTADO[c.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.estado?.charAt(0).toUpperCase() + c.estado?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 font-medium">
                        {c.equipos_count ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/contratos/${c.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {contratos && contratos.last_page > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>{contratos.total} contratos en total</span>
              <div className="flex gap-2">
                {contratos.current_page > 1 && (
                  <button
                    onClick={() => cargar(contratos.current_page - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white"
                  >
                    ← Anterior
                  </button>
                )}
                <span className="px-3 py-1 text-gray-700">
                  {contratos.current_page} / {contratos.last_page}
                </span>
                {contratos.current_page < contratos.last_page && (
                  <button
                    onClick={() => cargar(contratos.current_page + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white"
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
