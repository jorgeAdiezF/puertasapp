<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    /**
     * Listado de clientes con búsqueda y paginación.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Cliente::query()->withCount('equipos');

        // Búsqueda por nombre o CIF
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('razon_social', 'ilike', "%{$buscar}%")
                  ->orWhere('nombre_comercial', 'ilike', "%{$buscar}%")
                  ->orWhere('cif_nif', 'ilike', "%{$buscar}%")
                  ->orWhere('codigo_interno', 'ilike', "%{$buscar}%");
            });
        }

        if ($request->filled('activo')) {
            $query->where('activo', filter_var($request->activo, FILTER_VALIDATE_BOOLEAN));
        }

        $clientes = $query->orderBy('razon_social')
                          ->paginate($request->get('por_pagina', 25));

        return response()->json($clientes);
    }

    /**
     * Crear nuevo cliente.
     */
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'razon_social'    => 'required|string|max:200',
            'nombre_comercial'=> 'nullable|string|max:200',
            'cif_nif'         => 'nullable|string|max:20',
            'direccion_fiscal'=> 'nullable|string|max:300',
            'poblacion'       => 'nullable|string|max:100',
            'provincia'       => 'nullable|string|max:100',
            'codigo_postal'   => 'nullable|string|max:10',
            'pais'            => 'nullable|string|max:60',
            'telefono'        => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:150',
            'web'             => 'nullable|url|max:200',
            'observaciones'   => 'nullable|string',
        ]);

        // Generar código interno automático si no se proporciona
        if (empty($datos['codigo_interno'])) {
            $ultimo = Cliente::max('id') ?? 0;
            $datos['codigo_interno'] = 'CLI-' . str_pad($ultimo + 1, 5, '0', STR_PAD_LEFT);
        }

        $cliente = Cliente::create($datos);

        return response()->json($cliente, 201);
    }

    /**
     * Ficha completa de un cliente.
     */
    public function show(Cliente $cliente): JsonResponse
    {
        $cliente->load(['ubicaciones', 'contactos', 'contratos']);
        $cliente->loadCount('equipos');

        return response()->json($cliente);
    }

    /**
     * Actualizar cliente.
     */
    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        $datos = $request->validate([
            'razon_social'    => 'sometimes|string|max:200',
            'nombre_comercial'=> 'nullable|string|max:200',
            'cif_nif'         => 'nullable|string|max:20',
            'direccion_fiscal'=> 'nullable|string|max:300',
            'poblacion'       => 'nullable|string|max:100',
            'provincia'       => 'nullable|string|max:100',
            'codigo_postal'   => 'nullable|string|max:10',
            'pais'            => 'nullable|string|max:60',
            'telefono'        => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:150',
            'web'             => 'nullable|url|max:200',
            'observaciones'   => 'nullable|string',
            'activo'          => 'boolean',
        ]);

        $cliente->update($datos);

        return response()->json($cliente);
    }

    /**
     * Eliminación lógica del cliente.
     */
    public function destroy(Cliente $cliente): JsonResponse
    {
        $cliente->delete();

        return response()->json(['mensaje' => 'Cliente eliminado correctamente.']);
    }

    /**
     * Equipos del cliente con estado normativo.
     */
    public function equipos(Cliente $cliente): JsonResponse
    {
        $equipos = $cliente->equipos()
                           ->with(['ubicacion', 'tipoEquipo'])
                           ->orderBy('descripcion_corta')
                           ->get();

        return response()->json($equipos);
    }
}
