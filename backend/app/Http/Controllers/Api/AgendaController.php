<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AgendaTarea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AgendaTarea::with(['equipo.cliente', 'tecnico']);

        if ($request->filled('tecnico_id')) $query->where('tecnico_id', $request->tecnico_id);
        if ($request->filled('estado')) $query->where('estado', $request->estado);

        return response()->json($query->orderBy('fecha_programada')->paginate(25));
    }

    public function hoy(): JsonResponse
    {
        $tareas = AgendaTarea::with(['equipo.cliente', 'tecnico'])
            ->whereDate('fecha_programada', today())
            ->orderBy('fecha_programada')
            ->get();

        return response()->json($tareas);
    }

    public function semana(): JsonResponse
    {
        $tareas = AgendaTarea::with(['equipo.cliente', 'tecnico'])
            ->whereBetween('fecha_programada', [now()->startOfWeek(), now()->endOfWeek()])
            ->orderBy('fecha_programada')
            ->get();

        return response()->json($tareas);
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'tipo_tarea'       => 'required|string',
            'equipo_id'        => 'nullable|exists:equipos,id',
            'tecnico_id'       => 'nullable|exists:users,id',
            'fecha_programada' => 'required|date',
            'franja_horaria'   => 'nullable|string|max:60',
            'prioridad'        => 'nullable|string',
            'observaciones'    => 'nullable|string',
        ]);

        $tarea = AgendaTarea::create($datos);
        return response()->json($tarea->load(['equipo', 'tecnico']), 201);
    }

    public function show(AgendaTarea $agenda): JsonResponse
    {
        return response()->json($agenda->load(['equipo.cliente', 'tecnico']));
    }

    public function update(Request $request, AgendaTarea $agenda): JsonResponse
    {
        $datos = $request->validate([
            'estado'           => 'sometimes|string',
            'fecha_programada' => 'sometimes|date',
            'franja_horaria'   => 'nullable|string',
            'tecnico_id'       => 'nullable|exists:users,id',
            'observaciones'    => 'nullable|string',
        ]);

        $agenda->update($datos);
        return response()->json($agenda);
    }

    public function destroy(AgendaTarea $agenda): JsonResponse
    {
        $agenda->delete();
        return response()->json(['mensaje' => 'Tarea eliminada.']);
    }
}
