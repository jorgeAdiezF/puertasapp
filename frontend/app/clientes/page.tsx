/**
 * Listado de clientes con búsqueda y paginación.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';
import type { Cliente, Paginacion } from '@/types';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Paginacion<Cliente> | null>(null);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  const cargarClientes = (pagina = 1, termino = '') => {
    setCargando(true);
    api.get('/clientes', { params: { pagina, buscar: termino, por_pagina: 20 } })
      .then(res => setClientes(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    cargarClientes();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarClientes(1, buscar);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Cabecera */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
            <Link
              href="/clientes/nuevo"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Nuevo cliente
            </Link>
          </div>

          {/* Buscador */}
          <form onSubmit={handleBuscar} className="flex gap-2 mb-6">
            <input
              type="text"
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar por nombre, razón social o CIF..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {cargando ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : clientes?.data.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No hay clientes registrados aún.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Razón social</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">CIF/NIF</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Localidad</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Equipos</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clientes?.data.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cliente.codigo_interno}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{cliente.razon_social}</p>
                          {cliente.nombre_comercial && cliente.nombre_comercial !== cliente.razon_social && (
                            <p className="text-xs text-gray-400">{cliente.nombre_comercial}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{cliente.cif_nif ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{cliente.poblacion ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          {cliente.equipos_count ?? 0} equipos
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          cliente.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Ver detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {clientes && clientes.last_page > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Total: {clientes.total} clientes</span>
              <div className="flex gap-2">
                {Array.from({ length: clientes.last_page }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => cargarClientes(p, buscar)}
                    className={`px-3 py-1 rounded ${
                      p === clientes.current_page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
