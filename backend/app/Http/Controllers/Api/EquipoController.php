<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipo;
use App\Models\QrToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EquipoController extends Controller
{
    /**
     * Listado de equipos con filtros múltiples.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Equipo::with(['cliente', 'ubicacion', 'tipoEquipo']);

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }
        if ($request->filled('ubicacion_id')) {
            $query->where('ubicacion_id', $request->ubicacion_id);
        }
        if ($request->filled('estado_equipo')) {
            $query->where('estado_equipo', $request->estado_equipo);
        }
        if ($request->filled('estado_normativo')) {
            $query->where('estado_normativo', $request->estado_normativo);
        }
        if ($request->filled('buscar')) {
            $b = $request->buscar;
            $query->where(function ($q) use ($b) {
                $q->where('descripcion_corta', 'like', "%{$b}%")
                  ->orWhere('codigo_equipo', 'like', "%{$b}%")
                  ->orWhere('numero_serie', 'like', "%{$b}%")
                  ->orWhere('modelo', 'like', "%{$b}%");
            });
        }
        // Equipos con revisión vencida
        if ($request->boolean('revision_vencida')) {
            $query->whereNotNull('fecha_proximo_mantenimiento')
                  ->where('fecha_proximo_mantenimiento', '<', now());
        }

        $equipos = $query->orderBy('descripcion_corta')
                         ->paginate($request->get('por_pagina', 25));

        return response()->json($equipos);
    }

    /**
     * Crear equipo y generar su QR token automáticamente.
     */
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'cliente_id'         => 'required|exists:clientes,id',
            'ubicacion_id'       => 'required|exists:ubicaciones,id',
            'tipo_equipo_id'     => 'nullable|exists:tipos_equipo,id',
            'descripcion_corta'  => 'required|string|max:200',
            'descripcion_tecnica'=> 'nullable|string',
            'fabricante'         => 'nullable|string|max:150',
            'marca'              => 'nullable|string|max:100',
            'modelo'             => 'nullable|string|max:150',
            'numero_serie'       => 'nullable|string|max:100',
            'uso_previsto'       => 'nullable|string|max:200',
            'fecha_instalacion'  => 'nullable|date',
            'tipo_apertura'      => 'nullable|string',
            'estado_equipo'      => 'nullable|string',
            'criticidad'         => 'nullable|string',
            'ancho_paso'         => 'nullable|numeric',
            'alto_paso'          => 'nullable|numeric',
            'peso_estimado'      => 'nullable|numeric',
            'periodicidad_mantenimiento' => 'nullable|integer',
            'observaciones_generales'    => 'nullable|string',
        ]);

        // Generar código interno si no se proporciona
        if (empty($datos['codigo_equipo'])) {
            $datos['codigo_equipo'] = 'EQ-' . strtoupper(Str::random(8));
        }

        $equipo = Equipo::create($datos);

        // Crear registro QR vinculado al equipo
        QrToken::create([
            'equipo_id' => $equipo->id,
            'token'     => $equipo->qr_token,
            'activo'    => true,
        ]);

        // Si tiene tipo de equipo, calcular próximo mantenimiento
        if ($equipo->tipo_equipo_id && $equipo->periodicidad_mantenimiento && $equipo->fecha_instalacion) {
            $equipo->update([
                'fecha_proximo_mantenimiento' => $equipo->fecha_instalacion
                    ->addDays($equipo->periodicidad_mantenimiento),
            ]);
        }

        return response()->json($equipo->load(['cliente', 'ubicacion', 'tipoEquipo']), 201);
    }

    /**
     * Ficha completa de un equipo con todo su historial.
     */
    public function show(Equipo $equipo): JsonResponse
    {
        $equipo->load([
            'cliente',
            'ubicacion',
            'tipoEquipo',
            'tecnicoResponsable',
            'componentes',
            'actuaciones.usuarioResponsable',
            'archivos',
        ]);

        // Añadir datos calculados
        $equipo->append(['completitud_ce', 'revision_vencida']);

        return response()->json($equipo);
    }

    /**
     * Actualizar equipo.
     */
    public function update(Request $request, Equipo $equipo): JsonResponse
    {
        $datos = $request->validate([
            'descripcion_corta'       => 'sometimes|string|max:200',
            'descripcion_tecnica'     => 'nullable|string',
            'fabricante'              => 'nullable|string|max:150',
            'marca'                   => 'nullable|string|max:100',
            'modelo'                  => 'nullable|string|max:150',
            'numero_serie'            => 'nullable|string|max:100',
            'uso_previsto'            => 'nullable|string|max:200',
            'uso_real'                => 'nullable|string|max:200',
            'fecha_instalacion'       => 'nullable|date',
            'fecha_puesta_servicio'   => 'nullable|date',
            'estado_equipo'           => 'nullable|string',
            'tipo_apertura'           => 'nullable|string',
            'criticidad'              => 'nullable|string',
            'estado_normativo'        => 'nullable|string',
            'ancho_paso'              => 'nullable|numeric',
            'alto_paso'               => 'nullable|numeric',
            'peso_estimado'           => 'nullable|numeric',
            'velocidad_apertura'      => 'nullable|numeric',
            'velocidad_cierre'        => 'nullable|numeric',
            'periodicidad_mantenimiento' => 'nullable|integer',
            'observaciones_generales' => 'nullable|string',
            'activo'                  => 'boolean',
        ]);

        $equipo->update($datos);

        return response()->json($equipo->fresh(['tipoEquipo']));
    }

    /**
     * Eliminar equipo (lógico).
     */
    public function destroy(Equipo $equipo): JsonResponse
    {
        $equipo->delete();

        return response()->json(['mensaje' => 'Equipo eliminado correctamente.']);
    }

    /**
     * Acceso público por QR: ficha resumida del equipo.
     * No requiere autenticación.
     */
    public function porQr(string $token): JsonResponse
    {
        $qr = QrToken::where('token', $token)->where('activo', true)->firstOrFail();

        // Registrar escaneo
        $qr->increment('total_escaneos');
        $qr->update(['ultimo_escaneo' => now()]);

        $equipo = $qr->equipo()->with(['cliente', 'ubicacion', 'tipoEquipo'])->first();

        return response()->json([
            'equipo'             => [
                'codigo'          => $equipo->codigo_equipo,
                'descripcion'     => $equipo->descripcion_corta,
                'cliente'         => $equipo->cliente->nombre_display,
                'ubicacion'       => $equipo->ubicacion->nombre_centro,
                'tipo'            => $equipo->tipoEquipo?->nombre,
                'estado'          => $equipo->estado_equipo,
                'estado_normativo'=> $equipo->estado_normativo,
            ],
            'ultimo_mantenimiento' => $equipo->actuaciones()
                ->whereIn('tipo_actuacion', ['mantenimiento_preventivo', 'mantenimiento_correctivo'])
                ->whereIn('estado', ['completada'])
                ->latest('fecha_inicio')
                ->value('fecha_inicio'),
            'proximo_mantenimiento' => $equipo->fecha_proximo_mantenimiento,
            'revision_vencida'      => $equipo->revision_vencida,
        ]);
    }
}
