/**
 * Panel de control principal con KPIs y alertas.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';
import type { DashboardKPIs } from '@/types';

// Colores por estado normativo
const colorEstado: Record<string, string> = {
  conforme:            'bg-green-100 text-green-800',
  no_conforme:         'bg-red-100 text-red-800',
  en_proceso:          'bg-yellow-100 text-yellow-800',
  requiere_adecuacion: 'bg-orange-100 text-orange-800',
  sin_evaluar:         'bg-gray-100 text-gray-700',
};

const nombreEstado: Record<string, string> = {
  conforme:            'Conforme',
  no_conforme:         'No conforme',
  en_proceso:          'En proceso',
  requiere_adecuacion: 'Requiere adecuación',
  sin_evaluar:         'Sin evaluar',
};

interface KpiCardProps {
  titulo: string;
  valor: number;
  color?: string;
  descripcion?: string;
}

function KpiCard({ titulo, valor, color = 'bg-white', descripcion }: KpiCardProps) {
  return (
    <div className={`${color} rounded-xl p-5 shadow-sm border border-gray-100`}>
      <p className="text-sm font-medium text-gray-500">{titulo}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{valor}</p>
      {descripcion && <p className="text-xs text-gray-400 mt-1">{descripcion}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [datos, setDatos] = useState<DashboardKPIs | null>(null);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }

    api.get('/dashboard')
      .then(res => setDatos(res.data))
      .catch(() => router.push('/login'))
      .finally(() => setCargando(false));
  }, [router]);

  if (cargando) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-gray-400">Cargando...</div>
        </main>
      </div>
    );
  }

  const kpis = datos?.kpis;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Panel de control</h2>

          {/* KPIs principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <KpiCard titulo="Equipos activos" valor={kpis?.total_equipos ?? 0} />
            <KpiCard titulo="Clientes" valor={kpis?.total_clientes ?? 0} />
            <KpiCard
              titulo="Revisiones vencidas"
              valor={kpis?.revisiones_vencidas ?? 0}
              color={kpis?.revisiones_vencidas ? 'bg-red-50' : 'bg-white'}
            />
            <KpiCard
              titulo="Sin expediente CE"
              valor={kpis?.sin_expediente_ce ?? 0}
              color={kpis?.sin_expediente_ce ? 'bg-orange-50' : 'bg-white'}
            />
            <KpiCard
              titulo="Revisiones próximas 30d"
              valor={kpis?.revisiones_proximas_30d ?? 0}
              color="bg-yellow-50"
            />
            <KpiCard
              titulo="No conformes"
              valor={kpis?.equipos_no_conformes ?? 0}
              color={kpis?.equipos_no_conformes ? 'bg-red-50' : 'bg-white'}
            />
            <KpiCard titulo="Actuaciones este mes" valor={kpis?.actuaciones_mes ?? 0} />
            <KpiCard titulo="Tareas hoy" valor={kpis?.tareas_hoy ?? 0} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribución normativa */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estado normativo de equipos</h3>
              {datos && Object.keys(datos.distribucion_normativa).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(datos.distribucion_normativa).map(([estado, total]) => (
                    <div key={estado} className="flex items-center justify-between">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colorEstado[estado] ?? 'bg-gray-100 text-gray-700'}`}>
                        {nombreEstado[estado] ?? estado}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{total} equipos</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin datos aún. Añade equipos para ver estadísticas.</p>
              )}
            </div>

            {/* Revisiones urgentes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Revisiones urgentes</h3>
              {datos?.revisiones_urgentes.length ? (
                <div className="space-y-3">
                  {datos.revisiones_urgentes.map((equipo) => (
                    <div key={equipo.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{equipo.descripcion_corta}</p>
                        <p className="text-xs text-gray-400">{equipo.codigo_equipo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-red-600 font-medium">
                          {equipo.fecha_proximo_mantenimiento
                            ? new Date(equipo.fecha_proximo_mantenimiento).toLocaleDateString('es-ES')
                            : '—'}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          equipo.criticidad === 'critica' ? 'bg-red-100 text-red-700' :
                          equipo.criticidad === 'alta' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {equipo.criticidad}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No hay revisiones urgentes pendientes.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
