<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Contrato::with(['cliente', 'ubicacion'])->withCount('equipos');

        if ($request->filled('cliente_id')) $query->where('cliente_id', $request->cliente_id);
        if ($request->filled('estado')) $query->where('estado', $request->estado);

        return response()->json($query->orderByDesc('fecha_inicio')->paginate(25));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'cliente_id'           => 'required|exists:clientes,id',
            'ubicacion_id'         => 'nullable|exists:ubicaciones,id',
            'numero_contrato'      => 'nullable|string|max:40|unique:contratos',
            'tipo_contrato'        => 'required|string',
            'fecha_inicio'         => 'required|date',
            'fecha_fin'            => 'nullable|date',
            'periodicidad_visitas' => 'nullable|string',
            'alcance'              => 'nullable|string',
            'incluye_repuestos'    => 'boolean',
            'importe'              => 'nullable|numeric',
            'observaciones'        => 'nullable|string',
        ]);

        $contrato = Contrato::create($datos);
        return response()->json($contrato->load('cliente'), 201);
    }

    public function show(Contrato $contrato): JsonResponse
    {
        return response()->json($contrato->load(['cliente', 'ubicacion', 'equipos']));
    }

    public function update(Request $request, Contrato $contrato): JsonResponse
    {
        $datos = $request->validate([
            'estado'               => 'sometimes|string',
            'fecha_fin'            => 'nullable|date',
            'periodicidad_visitas' => 'nullable|string',
            'alcance'              => 'nullable|string',
            'importe'              => 'nullable|numeric',
            'observaciones'        => 'nullable|string',
        ]);

        $contrato->update($datos);
        return response()->json($contrato);
    }

    public function destroy(Contrato $contrato): JsonResponse
    {
        $contrato->delete();
        return response()->json(['mensaje' => 'Contrato eliminado.']);
    }
}
