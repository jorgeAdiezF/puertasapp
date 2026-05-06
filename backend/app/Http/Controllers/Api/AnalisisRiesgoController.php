<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalisisRiesgo;
use App\Models\Equipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalisisRiesgoController extends Controller
{
    // Lista de requisitos normativos por defecto (basado en UNE-EN 13241, UNE-EN 12453, EN ISO 12100)
    private const REQUISITOS_DEFAULT = [
        ['categoria' => 'Resistencia mecánica',        'requisito' => 'Resistencia al viento (presión calculada según ubicación)'],
        ['categoria' => 'Resistencia mecánica',        'requisito' => 'Resistencia a cargas estáticas verticales y horizontales'],
        ['categoria' => 'Durabilidad',                 'requisito' => 'Ciclos de vida según categoría de uso'],
        ['categoria' => 'Protección de cortes',        'requisito' => 'Bordes cortantes accesibles protegidos o eliminados'],
        ['categoria' => 'Tropiezos',                   'requisito' => 'Umbrales y guías inferiores no suponen riesgo de tropiezo'],
        ['categoria' => 'Aperturas seguras',           'requisito' => 'Funcionamiento seguro en modo apertura manual'],
        ['categoria' => 'Emisión de sustancias',       'requisito' => 'Gases, lubricantes y materiales no peligrosos en uso normal'],
        ['categoria' => 'Viento',                      'requisito' => 'Presión de viento calculada y puerta homologada para la zona'],
        ['categoria' => 'Movimientos incontrolados',   'requisito' => 'Detección de obstáculos activa (fotocélula / borde sensible)'],
        ['categoria' => 'Holguras de seguridad',       'requisito' => 'Holguras laterales conformes a tabla normativa'],
        ['categoria' => 'Holguras de seguridad',       'requisito' => 'Holguras superiores conformes a tabla normativa'],
        ['categoria' => 'Sistemas de suspensión',      'requisito' => 'Muelles de equilibrado dimensionados correctamente'],
        ['categoria' => 'Sistemas de suspensión',      'requisito' => 'Dispositivo de seguridad ante rotura de muelle'],
        ['categoria' => 'Maniobra manual emergencia',  'requisito' => 'Dispositivo manual de emergencia accesible y señalizado'],
        ['categoria' => 'Aplastamiento / cizallamiento','requisito' => 'Zona de cierre con fuerza de impacto dentro de límites'],
        ['categoria' => 'Personas levantadas',         'requisito' => 'Prevención de acceso a zona superior de la puerta'],
        ['categoria' => 'Seguridad eléctrica',         'requisito' => 'Protección contra contactos directos e indirectos'],
        ['categoria' => 'EMC',                         'requisito' => 'Compatibilidad electromagnética verificada'],
        ['categoria' => 'Parada motorización',         'requisito' => 'Parada de emergencia operativa y señalizada'],
        ['categoria' => 'Corte de alimentación',       'requisito' => 'Comportamiento seguro ante ausencia de tensión'],
        ['categoria' => 'Portillos',                   'requisito' => 'Puertas peatonales integradas con seguridades propias'],
        ['categoria' => 'Aprisionamiento',             'requisito' => 'Zona de aprisionamiento inferior controlada o protegida'],
        ['categoria' => 'Limitadores de recorrido',    'requisito' => 'Finales de carrera mecánicos y/o electrónicos operativos'],
    ];

    public function index(Equipo $equipo): JsonResponse
    {
        $registros = AnalisisRiesgo::where('equipo_id', $equipo->id)->get();

        if ($registros->isEmpty()) {
            // Devolver plantilla por defecto sin persistir
            $datos = collect(self::REQUISITOS_DEFAULT)->map(function ($item) use ($equipo) {
                return array_merge($item, [
                    'id'            => null,
                    'equipo_id'     => $equipo->id,
                    'estado'        => 'no_aplica',
                    'observaciones' => null,
                ]);
            });
            return response()->json($datos);
        }

        // Completar con requisitos que aún no estén en la BD
        $existentes = $registros->pluck('requisito')->toArray();
        $faltantes = collect(self::REQUISITOS_DEFAULT)
            ->filter(fn($r) => !in_array($r['requisito'], $existentes))
            ->map(fn($item) => array_merge($item, [
                'id'            => null,
                'equipo_id'     => $equipo->id,
                'estado'        => 'no_aplica',
                'observaciones' => null,
            ]));

        $todos = $registros->toArray();
        foreach ($faltantes as $f) {
            $todos[] = $f;
        }

        // Ordenar según el orden canónico
        $orden = collect(self::REQUISITOS_DEFAULT)->pluck('requisito')->toArray();
        usort($todos, fn($a, $b) => array_search($a['requisito'], $orden) - array_search($b['requisito'], $orden));

        return response()->json($todos);
    }

    public function bulkUpdate(Request $request, Equipo $equipo): JsonResponse
    {
        $request->validate([
            'items'                  => 'required|array',
            'items.*.categoria'      => 'required|string|max:100',
            'items.*.requisito'      => 'required|string|max:255',
            'items.*.estado'         => 'required|in:cumple,no_cumple,no_aplica',
            'items.*.observaciones'  => 'nullable|string',
        ]);

        $resultados = [];
        foreach ($request->input('items') as $item) {
            $registro = AnalisisRiesgo::updateOrCreate(
                ['equipo_id' => $equipo->id, 'requisito' => $item['requisito']],
                [
                    'categoria'      => $item['categoria'],
                    'estado'         => $item['estado'],
                    'observaciones'  => $item['observaciones'] ?? null,
                ]
            );
            $resultados[] = $registro;
        }

        return response()->json($resultados);
    }
}
