<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agenda de tareas: planificación y asignación de trabajos a técnicos.
     */
    public function up(): void
    {
        Schema::create('agenda_tareas', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo_tarea', [
                'instalacion', 'mantenimiento', 'incidencia',
                'inspeccion', 'adecuacion', 'visita_tecnica'
            ]);
            // Relación polimórfica al origen de la tarea
            $table->string('referencia_entidad_tipo', 60)->nullable();
            $table->unsignedBigInteger('referencia_entidad_id')->nullable();
            $table->foreignId('equipo_id')->nullable()->constrained('equipos');
            $table->foreignId('tecnico_id')->nullable()->constrained('users');
            $table->dateTime('fecha_programada');
            $table->string('franja_horaria', 60)->nullable();
            $table->enum('prioridad', ['baja', 'normal', 'alta', 'urgente'])->default('normal');
            $table->enum('estado', [
                'pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada', 'reprogramada'
            ])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['tecnico_id', 'fecha_programada']);
            $table->index(['estado', 'fecha_programada']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agenda_tareas');
    }
};
