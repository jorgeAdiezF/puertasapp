<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Componentes: árbol de elementos instalados en cada equipo.
     */
    public function up(): void
    {
        Schema::create('componentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')->constrained('equipos')->onDelete('cascade');
            $table->enum('categoria', [
                'motor', 'cuadro', 'receptor', 'fotocélula', 'banda_sensible',
                'detector_presencia', 'final_carrera', 'guia', 'muelle', 'cableado',
                'desbloqueo_manual', 'semaforo', 'pulsador', 'radar', 'cremallera',
                'brazo', 'variador', 'encoder', 'celula_seguridad', 'otro'
            ]);
            $table->string('subcategoria', 100)->nullable();
            $table->string('fabricante', 150)->nullable();
            $table->string('marca', 100)->nullable();
            $table->string('modelo', 150)->nullable();
            $table->string('numero_serie', 100)->nullable();
            $table->string('referencia', 80)->nullable();
            // Datos técnicos eléctricos
            $table->string('tension', 30)->nullable()->comment('V');
            $table->string('potencia', 30)->nullable()->comment('W');
            $table->text('caracteristicas_tecnicas')->nullable();
            $table->date('fecha_instalacion')->nullable();
            $table->date('fecha_sustitucion')->nullable();
            $table->enum('estado', ['activo', 'sustituido', 'averiado', 'retirado'])->default('activo');
            $table->boolean('es_critico')->default(false);
            $table->boolean('requiere_revision')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('componentes');
    }
};
