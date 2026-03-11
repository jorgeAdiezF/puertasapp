<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Componente;
use App\Models\Equipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComponenteController extends Controller
{
    // Componentes de un equipo específico
    public function porEquipo(Equipo $equipo): JsonResponse
    {
        return response()->json($equipo->componentes()->orderBy('categoria')->get());
    }

    public function show(Componente $componente): JsonResponse
    {
        return response()->json($componente);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'equipo_id'               => 'required|exists:equipos,id',
            'categoria'               => 'required|string',
            'subcategoria'            => 'nullable|string|max:100',
            'fabricante'              => 'nullable|string|max:150',
            'marca'                   => 'nullable|string|max:100',
            'modelo'                  => 'nullable|string|max:150',
            'numero_serie'            => 'nullable|string|max:100',
            'referencia'              => 'nullable|string|max:80',
            'tension'                 => 'nullable|string|max:30',
            'potencia'                => 'nullable|string|max:30',
            'caracteristicas_tecnicas'=> 'nullable|string',
            'fecha_instalacion'       => 'nullable|date',
            'es_critico'              => 'boolean',
            'requiere_revision'       => 'boolean',
            'observaciones'           => 'nullable|string',
        ]);

        $componente = Componente::create($datos);
        return response()->json($componente, 201);
    }

    public function update(Request $request, Componente $componente): JsonResponse
    {
        $datos = $request->validate([
            'estado'          => 'sometimes|string',
            'fecha_sustitucion'=> 'nullable|date',
            'observaciones'   => 'nullable|string',
            'es_critico'      => 'boolean',
            'requiere_revision'=> 'boolean',
        ]);

        $componente->update($datos);
        return response()->json($componente);
    }

    public function destroy(Componente $componente): JsonResponse
    {
        $componente->delete();
        return response()->json(['mensaje' => 'Componente eliminado.']);
    }
}
