<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Firmas digitales: trazabilidad de firmas sobre cualquier documento o actuación.
     */
    public function up(): void
    {
        Schema::create('firmas', function (Blueprint $table) {
            $table->id();
            // Relación polimórfica igual que archivos
            $table->string('entidad_tipo', 60);
            $table->unsignedBigInteger('entidad_id');
            $table->string('firmado_por_nombre', 150);
            $table->string('firmado_por_dni', 20)->nullable();
            $table->enum('calidad_firmante', [
                'tecnico', 'cliente', 'responsable_recepcion', 'oficina_tecnica'
            ]);
            $table->timestamp('fecha_firma');
            $table->string('ip', 45)->nullable();
            $table->string('dispositivo', 200)->nullable();
            // Imagen del trazo en base64 o ruta al archivo
            $table->string('trazo_imagen_ruta', 500)->nullable();
            $table->string('hash_integridad', 64)->nullable();
            $table->timestamps();

            $table->index(['entidad_tipo', 'entidad_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('firmas');
    }
};
