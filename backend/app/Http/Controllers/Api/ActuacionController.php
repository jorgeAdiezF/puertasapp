<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actuacion;
use App\Models\Equipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActuacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Actuacion::with(['equipo.cliente', 'usuarioResponsable']);

        if ($request->filled('equipo_id')) $query->where('equipo_id', $request->equipo_id);
        if ($request->filled('tipo_actuacion')) $query->where('tipo_actuacion', $request->tipo_actuacion);
        if ($request->filled('estado')) $query->where('estado', $request->estado);

        return response()->json($query->orderByDesc('fecha_inicio')->paginate(25));
    }

    // Actuaciones de un equipo específico
    public function porEquipo(Equipo $equipo): JsonResponse
    {
        return response()->json(
            $equipo->actuaciones()->with('usuarioResponsable')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'equipo_id'              => 'required|exists:equipos,id',
            'tipo_actuacion'         => 'required|string',
            'fecha_inicio'           => 'required|date',
            'fecha_fin'              => 'nullable|date',
            'usuario_responsable_id' => 'nullable|exists:users,id',
            'tecnico_id'             => 'nullable|exists:users,id',
            'origen_actuacion'       => 'nullable|string',
            'estado'                 => 'nullable|string',
            'resumen'                => 'nullable|string',
            'descripcion'            => 'nullable|string',
            'observaciones'          => 'nullable|string',
            'materiales_usados'      => 'nullable|string',
            'duracion_minutos'       => 'nullable|integer',
        ]);

        // Alias: tecnico_id → usuario_responsable_id
        if (empty($datos['usuario_responsable_id']) && !empty($datos['tecnico_id'])) {
            $datos['usuario_responsable_id'] = $datos['tecnico_id'];
        }
        unset($datos['tecnico_id']);

        // Alias: descripcion → resumen
        if (empty($datos['resumen']) && !empty($datos['descripcion'])) {
            $datos['resumen'] = $datos['descripcion'];
        }
        unset($datos['descripcion']);

        // Alias: materiales_usados → observaciones (se añade al final si hay contenido)
        if (!empty($datos['materiales_usados'])) {
            $sufijo = "\n\nMateriales usados: " . $datos['materiales_usados'];
            $datos['observaciones'] = ($datos['observaciones'] ?? '') . $sufijo;
        }
        unset($datos['materiales_usados']);

        if (empty($datos['estado'])) {
            $datos['estado'] = 'en_curso';
        }

        $actuacion = Actuacion::create($datos);
        return response()->json($actuacion->load('usuarioResponsable'), 201);
    }

    public function show(Actuacion $actuacion): JsonResponse
    {
        return response()->json($actuacion->load(['equipo.cliente', 'usuarioResponsable', 'instalacionDetalle', 'archivos', 'firmas']));
    }

    public function update(Request $request, Actuacion $actuacion): JsonResponse
    {
        $datos = $request->validate([
            'estado'           => 'sometimes|string',
            'fecha_fin'        => 'nullable|date',
            'resumen'          => 'nullable|string',
            'observaciones'    => 'nullable|string',
            'duracion_minutos' => 'nullable|integer',
        ]);

        $actuacion->update($datos);
        return response()->json($actuacion);
    }

    public function destroy(Actuacion $actuacion): JsonResponse
    {
        $actuacion->delete();
        return response()->json(['mensaje' => 'Actuación eliminada.']);
    }
}
