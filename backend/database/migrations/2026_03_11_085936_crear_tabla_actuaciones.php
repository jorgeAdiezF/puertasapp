<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Actuaciones: registro de toda intervención técnica sobre un equipo.
     * Cubre instalaciones, mantenimientos, reparaciones, adecuaciones e inspecciones.
     */
    public function up(): void
    {
        Schema::create('actuaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')->constrained('equipos');
            $table->foreignId('contrato_id')->nullable()->constrained('contratos');
            $table->enum('tipo_actuacion', [
                'instalacion_nueva', 'automatizacion', 'sustitucion_parcial',
                'reparacion', 'mantenimiento_preventivo', 'mantenimiento_correctivo',
                'adecuacion_normativa', 'inspeccion_tecnica', 'baja'
            ]);
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->foreignId('usuario_responsable_id')->nullable()->constrained('users');
            // Equipo técnico adicional como array JSON
            $table->json('equipo_tecnico')->nullable();
            $table->enum('origen_actuacion', [
                'contrato', 'averia', 'solicitud_cliente', 'inspeccion', 'adecuacion', 'interno'
            ])->default('contrato');
            $table->enum('estado', [
                'pendiente', 'en_curso', 'completada', 'cancelada', 'pendiente_validacion'
            ])->default('pendiente');
            $table->text('resumen')->nullable();
            $table->text('observaciones')->nullable();
            // Indica si esta actuación generó o actualizó el expediente CE
            $table->boolean('actualiza_expediente_ce')->default(false);
            $table->integer('duracion_minutos')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['equipo_id', 'tipo_actuacion']);
            $table->index(['fecha_inicio']);
            $table->index(['estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actuaciones');
    }
};
