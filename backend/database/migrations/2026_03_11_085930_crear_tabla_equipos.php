<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Equipos: núcleo absoluto del sistema.
     * Cada puerta, barrera, muelle o automatismo tiene su ficha maestra aquí.
     */
    public function up(): void
    {
        Schema::create('equipos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('ubicacion_id')->constrained('ubicaciones');
            $table->foreignId('tipo_equipo_id')->nullable()->constrained('tipos_equipo');

            // --- Identificación ---
            $table->string('codigo_equipo', 30)->unique()->nullable();
            $table->string('numero_serie', 100)->nullable();
            $table->string('referencia_interna', 60)->nullable();

            // --- Descripción ---
            $table->string('descripcion_corta', 200);
            $table->text('descripcion_tecnica')->nullable();
            $table->string('fabricante', 150)->nullable();
            $table->string('marca', 100)->nullable();
            $table->string('modelo', 150)->nullable();

            // --- Uso ---
            $table->string('uso_previsto', 200)->nullable();
            $table->string('uso_real', 200)->nullable();

            // --- Fechas ---
            $table->date('fecha_fabricacion')->nullable();
            $table->date('fecha_instalacion')->nullable();
            $table->date('fecha_puesta_servicio')->nullable();

            // --- Estado ---
            $table->enum('estado_equipo', [
                'activo', 'inactivo', 'baja', 'en_revision', 'inmovilizado'
            ])->default('activo');
            $table->enum('origen_equipo', [
                'fabricacion_propia', 'kit_fabricante', 'instalacion_externa', 'adecuacion'
            ])->default('kit_fabricante');

            // --- Dimensiones físicas ---
            $table->decimal('ancho_paso', 6, 2)->nullable()->comment('metros');
            $table->decimal('alto_paso', 6, 2)->nullable()->comment('metros');
            $table->decimal('ancho_hoja', 6, 2)->nullable()->comment('metros');
            $table->decimal('alto_hoja', 6, 2)->nullable()->comment('metros');
            $table->decimal('peso_estimado', 8, 2)->nullable()->comment('kg');
            $table->tinyInteger('numero_hojas')->default(1);
            $table->string('material_principal', 60)->nullable();
            $table->string('acabado', 60)->nullable();
            $table->string('color', 60)->nullable();
            $table->enum('tipo_apertura', [
                'seccional', 'enrollable', 'batiente', 'corredera',
                'basculante', 'rapida', 'peatonal', 'barrera', 'otro'
            ])->nullable();
            $table->decimal('velocidad_apertura', 5, 2)->nullable()->comment('m/s');
            $table->decimal('velocidad_cierre', 5, 2)->nullable()->comment('m/s');

            // --- Estado normativo (expediente CE) ---
            $table->boolean('tiene_marcado_ce')->default(false);
            $table->boolean('expediente_ce_generado')->default(false);
            $table->boolean('declaracion_conformidad_emitida')->default(false);
            $table->boolean('declaracion_prestaciones_emitida')->default(false);
            $table->boolean('manual_usuario_emitido')->default(false);
            $table->boolean('manual_mantenimiento_emitido')->default(false);
            $table->boolean('libro_mantenimiento_activo')->default(false);
            $table->boolean('evaluacion_riesgos_realizada')->default(false);
            $table->enum('estado_normativo', [
                'sin_evaluar', 'conforme', 'no_conforme', 'en_proceso', 'requiere_adecuacion'
            ])->default('sin_evaluar');
            $table->date('fecha_ultima_revision_normativa')->nullable();

            // --- Gestión operativa ---
            $table->foreignId('tecnico_responsable_id')->nullable()->constrained('users');
            $table->enum('criticidad', ['baja', 'media', 'alta', 'critica'])->default('media');
            $table->boolean('revision_periodica_requerida')->default(true);
            $table->integer('periodicidad_mantenimiento')->nullable()->comment('días entre revisiones');
            $table->date('fecha_proximo_mantenimiento')->nullable();

            // Token único para acceso por QR
            $table->string('qr_token', 64)->unique()->nullable();
            $table->text('observaciones_generales')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Índices frecuentes
            $table->index(['cliente_id', 'activo']);
            $table->index(['ubicacion_id']);
            $table->index(['estado_normativo']);
            $table->index(['fecha_proximo_mantenimiento']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipos');
    }
};
