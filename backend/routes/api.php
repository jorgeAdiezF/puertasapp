<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\UbicacionController;
use App\Http\Controllers\Api\EquipoController;
use App\Http\Controllers\Api\ComponenteController;
use App\Http\Controllers\Api\ActuacionController;
use App\Http\Controllers\Api\ContratoController;
use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\AnalisisRiesgoController;
use App\Http\Controllers\Api\EnsayoPrestacionController;

/*
|--------------------------------------------------------------------------
| Rutas públicas (sin autenticación)
|--------------------------------------------------------------------------
*/

// Autenticación
Route::post('/auth/login', [AuthController::class, 'login']);

// Acceso público por QR (para técnicos en campo sin sesión)
Route::get('/qr/{token}', [EquipoController::class, 'porQr']);

/*
|--------------------------------------------------------------------------
| Rutas protegidas con Sanctum
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Sesión
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Dashboard y KPIs
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // --- Clientes ---
    Route::apiResource('clientes', ClienteController::class);
    Route::get('clientes/{cliente}/equipos',   [ClienteController::class, 'equipos']);

    // --- Ubicaciones ---
    Route::apiResource('ubicaciones', UbicacionController::class);

    // --- Equipos ---
    Route::apiResource('equipos', EquipoController::class);
    Route::get('equipos/{equipo}/componentes', [ComponenteController::class, 'porEquipo']);
    Route::get('equipos/{equipo}/actuaciones', [ActuacionController::class, 'porEquipo']);

    // --- Componentes ---
    Route::apiResource('componentes', ComponenteController::class)->except(['index']);

    // --- Actuaciones ---
    Route::apiResource('actuaciones', ActuacionController::class);

    // --- Contratos ---
    Route::apiResource('contratos', ContratoController::class);

    // --- Agenda ---
    Route::apiResource('agenda', AgendaController::class);
    Route::get('agenda/hoy',   [AgendaController::class, 'hoy']);
    Route::get('agenda/semana',[AgendaController::class, 'semana']);

    // --- Análisis de riesgos CE ---
    Route::get('equipos/{equipo}/analisis-riesgos',  [AnalisisRiesgoController::class, 'index']);
    Route::post('equipos/{equipo}/analisis-riesgos', [AnalisisRiesgoController::class, 'bulkUpdate']);

    // --- Ensayos de prestaciones CE ---
    Route::get('equipos/{equipo}/ensayos-prestaciones',  [EnsayoPrestacionController::class, 'index']);
    Route::post('equipos/{equipo}/ensayos-prestaciones', [EnsayoPrestacionController::class, 'bulkUpdate']);

    // --- PDF ---
    Route::get('equipos/{equipo}/pdf',      [PdfController::class, 'fichaEquipo']);
    Route::get('actuaciones/{actuacion}/pdf',[PdfController::class, 'parteActuacion']);

    // --- Catálogos (solo lectura) ---
    Route::get('tipos-equipo', function () {
        return response()->json(\App\Models\TipoEquipo::where('activo', true)->orderBy('nombre')->get());
    });
    Route::get('usuarios', function () {
        return response()->json(\App\Models\User::where('activo', true)
            ->select('id', 'name', 'perfil')->orderBy('name')->get());
    });
});
