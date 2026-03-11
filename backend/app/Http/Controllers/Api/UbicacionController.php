<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ubicacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UbicacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ubicacion::with('cliente')->withCount('equipos');

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        return response()->json($query->orderBy('nombre_centro')->paginate(50));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'cliente_id'          => 'required|exists:clientes,id',
            'nombre_centro'       => 'required|string|max:200',
            'codigo_ubicacion'    => 'nullable|string|max:20',
            'direccion'           => 'nullable|string|max:300',
            'numero'              => 'nullable|string|max:10',
            'localidad'           => 'nullable|string|max:100',
            'provincia'           => 'nullable|string|max:100',
            'cp'                  => 'nullable|string|max:10',
            'tipo_ubicacion'      => 'nullable|string',
            'observaciones_acceso'=> 'nullable|string',
            'horario_acceso'      => 'nullable|string|max:200',
            'persona_responsable' => 'nullable|string|max:150',
            'telefono_acceso'     => 'nullable|string|max:20',
        ]);

        $ubicacion = Ubicacion::create($datos);
        return response()->json($ubicacion->load('cliente'), 201);
    }

    public function show(Ubicacion $ubicacion): JsonResponse
    {
        return response()->json($ubicacion->load(['cliente', 'equipos']));
    }

    public function update(Request $request, Ubicacion $ubicacion): JsonResponse
    {
        $datos = $request->validate([
            'nombre_centro'       => 'sometimes|string|max:200',
            'direccion'           => 'nullable|string|max:300',
            'localidad'           => 'nullable|string|max:100',
            'provincia'           => 'nullable|string|max:100',
            'cp'                  => 'nullable|string|max:10',
            'tipo_ubicacion'      => 'nullable|string',
            'persona_responsable' => 'nullable|string|max:150',
            'telefono_acceso'     => 'nullable|string|max:20',
            'activo'              => 'boolean',
        ]);

        $ubicacion->update($datos);
        return response()->json($ubicacion);
    }

    public function destroy(Ubicacion $ubicacion): JsonResponse
    {
        $ubicacion->delete();
        return response()->json(['mensaje' => 'Ubicación eliminada.']);
    }
}
