<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actuacion;
use App\Models\Equipo;
use App\Models\Cliente;
use App\Models\AgendaTarea;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * KPIs principales del cuadro de mando.
     */
    public function index(): JsonResponse
    {
        // Contadores principales
        $totalEquipos      = Equipo::where('activo', true)->count();
        $totalClientes     = Cliente::where('activo', true)->count();

        // Equipos con documentación incompleta
        $sinExpediente     = Equipo::where('activo', true)
                                   ->where('expediente_ce_generado', false)
                                   ->count();

        // Revisiones vencidas
        $revisionesVencidas = Equipo::where('activo', true)
                                    ->whereNotNull('fecha_proximo_mantenimiento')
                                    ->where('fecha_proximo_mantenimiento', '<', now())
                                    ->count();

        // Próximas revisiones (30 días)
        $revisionesPróximas = Equipo::where('activo', true)
                                    ->whereBetween('fecha_proximo_mantenimiento', [now(), now()->addDays(30)])
                                    ->count();

        // Equipos no conformes
        $noConformes = Equipo::where('activo', true)
                             ->whereIn('estado_normativo', ['no_conforme', 'requiere_adecuacion'])
                             ->count();

        // Actuaciones recientes (últimos 30 días)
        $actuacionesRecientes = Actuacion::where('fecha_inicio', '>=', now()->subDays(30))
                                         ->count();

        // Tareas pendientes de hoy
        $tareasPendientesHoy = AgendaTarea::whereDate('fecha_programada', today())
                                          ->whereIn('estado', ['pendiente', 'confirmada'])
                                          ->count();

        // Distribución por estado normativo
        $distribucionNormativa = Equipo::where('activo', true)
            ->select('estado_normativo', DB::raw('count(*) as total'))
            ->groupBy('estado_normativo')
            ->pluck('total', 'estado_normativo');

        // Equipos con revisión más urgente
        $revisionesUrgentes = Equipo::with(['cliente', 'ubicacion'])
            ->where('activo', true)
            ->whereNotNull('fecha_proximo_mantenimiento')
            ->where('fecha_proximo_mantenimiento', '<=', now()->addDays(30))
            ->orderBy('fecha_proximo_mantenimiento')
            ->limit(5)
            ->get(['id', 'codigo_equipo', 'descripcion_corta', 'cliente_id', 'ubicacion_id',
                   'fecha_proximo_mantenimiento', 'criticidad']);

        return response()->json([
            'kpis' => [
                'total_equipos'          => $totalEquipos,
                'total_clientes'         => $totalClientes,
                'sin_expediente_ce'      => $sinExpediente,
                'revisiones_vencidas'    => $revisionesVencidas,
                'revisiones_proximas_30d'=> $revisionesPróximas,
                'equipos_no_conformes'   => $noConformes,
                'actuaciones_mes'        => $actuacionesRecientes,
                'tareas_hoy'             => $tareasPendientesHoy,
            ],
            'distribucion_normativa' => $distribucionNormativa,
            'revisiones_urgentes'    => $revisionesUrgentes,
        ]);
    }
}
