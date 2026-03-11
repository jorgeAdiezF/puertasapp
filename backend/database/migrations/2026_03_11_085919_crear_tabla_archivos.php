<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Archivos y evidencias: fotos, documentos, manuales y planos asociados a cualquier entidad.
     * Usa relación polimórfica para asociarse a equipos, actuaciones, incidencias, etc.
     */
    public function up(): void
    {
        Schema::create('archivos', function (Blueprint $table) {
            $table->id();
            // Relación polimórfica: permite asociar archivos a cualquier modelo
            $table->string('entidad_tipo', 60);  // equipo, actuacion, incidencia, etc.
            $table->unsignedBigInteger('entidad_id');
            $table->enum('categoria', [
                'foto_instalacion', 'foto_mantenimiento', 'foto_incidencia',
                'plano', 'manual_fabricante', 'certificado_componente',
                'ensayo', 'firma', 'presupuesto', 'contrato', 'otro'
            ])->default('otro');
            $table->string('nombre_original', 255);
            $table->string('ruta', 500);
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('tamano_bytes')->nullable();
            $table->string('hash', 64)->nullable()->comment('SHA-256 para integridad');
            $table->foreignId('usuario_id')->nullable()->constrained('users');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['entidad_tipo', 'entidad_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archivos');
    }
};
