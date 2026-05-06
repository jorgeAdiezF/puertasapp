<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EnsayoPrestacion;
use App\Models\Equipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnsayoPrestacionController extends Controller
{
    // Puntos de medición según UNE-EN 12453
    private const PUNTOS_DEFAULT = [
        ['tipo' => 'apertura', 'punto' => 'F1 – Borde libre inferior', 'fuerza_limite' => 150.00],
        ['tipo' => 'apertura', 'punto' => 'F2 – Centro de hoja',       'fuerza_limite' => 150.00],
        ['tipo' => 'apertura', 'punto' => 'F3 – Borde fijo lateral',   'fuerza_limite' => 150.00],
        ['tipo' => 'apertura', 'punto' => 'F4 – Umbral inferior',      'fuerza_limite' => 150.00],
        ['tipo' => 'cierre',   'punto' => 'F1 – Borde libre inferior', 'fuerza_limite' => 150.00],
        ['tipo' => 'cierre',   'punto' => 'F2 – Centro de hoja',       'fuerza_limite' => 150.00],
        ['tipo' => 'cierre',   'punto' => 'F3 – Borde fijo lateral',   'fuerza_limite' => 150.00],
        ['tipo' => 'cierre',   'punto' => 'F4 – Umbral inferior',      'fuerza_limite' => 150.00],
    ];

    public function index(Equipo $equipo): JsonResponse
    {
        $registros = EnsayoPrestacion::where('equipo_id', $equipo->id)->get();

        if ($registros->isEmpty()) {
            $datos = collect(self::PUNTOS_DEFAULT)->map(function ($item) use ($equipo) {
                return array_merge($item, [
                    'id'              => null,
                    'equipo_id'       => $equipo->id,
                    'fuerza_obtenida' => null,
                    'conforme'        => null,
                    'observaciones'   => null,
                ]);
            });
            return response()->json($datos);
        }

        // Completar con puntos que aún no existan en la BD
        $existentes = $registros->map(fn($r) => $r->tipo . '|' . $r->punto)->toArray();
        $faltantes = collect(self::PUNTOS_DEFAULT)
            ->filter(fn($p) => !in_array($p['tipo'] . '|' . $p['punto'], $existentes))
            ->map(fn($item) => array_merge($item, [
                'id'              => null,
                'equipo_id'       => $equipo->id,
                'fuerza_obtenida' => null,
                'conforme'        => null,
                'observaciones'   => null,
            ]));

        $todos = $registros->toArray();
        foreach ($faltantes as $f) {
            $todos[] = $f;
        }

        // Ordenar: primero apertura luego cierre, dentro del mismo tipo por orden canónico
        $orden = collect(self::PUNTOS_DEFAULT)->map(fn($p) => $p['tipo'] . '|' . $p['punto'])->toArray();
        usort($todos, fn($a, $b) => array_search($a['tipo'] . '|' . $a['punto'], $orden) - array_search($b['tipo'] . '|' . $b['punto'], $orden));

        return response()->json($todos);
    }

    public function bulkUpdate(Request $request, Equipo $equipo): JsonResponse
    {
        $request->validate([
            'items'                    => 'required|array',
            'items.*.tipo'             => 'required|in:apertura,cierre',
            'items.*.punto'            => 'required|string|max:100',
            'items.*.fuerza_obtenida'  => 'nullable|numeric|min:0',
            'items.*.fuerza_limite'    => 'required|numeric|min:0',
            'items.*.observaciones'    => 'nullable|string',
        ]);

        $resultados = [];
        foreach ($request->input('items') as $item) {
            $fuerza_obtenida = isset($item['fuerza_obtenida']) ? (float) $item['fuerza_obtenida'] : null;
            $fuerza_limite   = (float) $item['fuerza_limite'];
            $conforme        = $fuerza_obtenida !== null ? $fuerza_obtenida <= $fuerza_limite : null;

            $registro = EnsayoPrestacion::updateOrCreate(
                ['equipo_id' => $equipo->id, 'tipo' => $item['tipo'], 'punto' => $item['punto']],
                [
                    'fuerza_obtenida' => $fuerza_obtenida,
                    'fuerza_limite'   => $fuerza_limite,
                    'conforme'        => $conforme,
                    'observaciones'   => $item['observaciones'] ?? null,
                ]
            );
            $resultados[] = $registro;
        }

        return response()->json($resultados);
    }
}
