<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Detalle específico de actuaciones de tipo instalación o puesta en servicio.
     * Registra el checklist técnico de la instalación.
     */
    public function up(): void
    {
        Schema::create('instalacion_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actuacion_id')->unique()->constrained('actuaciones')->onDelete('cascade');

            // --- Comprobaciones de montaje ---
            $table->boolean('verificacion_superficie_fijacion')->nullable();
            $table->string('tipo_anclaje', 100)->nullable();
            $table->boolean('comprobacion_nivelacion')->nullable();
            $table->boolean('comprobacion_guiado')->nullable();
            $table->boolean('comprobacion_cableado')->nullable();

            // --- Comprobaciones de funcionamiento ---
            $table->boolean('comprobacion_maniobra_manual')->nullable();
            $table->boolean('comprobacion_sentido_movimiento')->nullable();
            $table->boolean('comprobacion_finales_carrera')->nullable();

            // --- Comprobaciones de seguridad ---
            $table->boolean('comprobacion_elementos_seguridad')->nullable();
            $table->boolean('pruebas_funcionamiento')->nullable();
            $table->boolean('comprobacion_parada_emergencia')->nullable();
            $table->boolean('comprobacion_fotocelulas')->nullable();
            $table->boolean('comprobacion_bandas_sensibles')->nullable();

            // --- Documentación entregada ---
            $table->boolean('manual_usuario_entregado')->default(false);
            $table->boolean('manual_mantenimiento_entregado')->default(false);
            $table->boolean('declaracion_ce_entregada')->default(false);

            $table->text('incidencias_detectadas')->nullable();
            $table->text('observaciones_finales')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instalacion_detalle');
    }
};
