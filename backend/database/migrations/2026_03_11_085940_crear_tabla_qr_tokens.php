<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * QR tokens: identificadores únicos para acceso rápido a ficha del equipo desde móvil.
     */
    public function up(): void
    {
        Schema::create('qr_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')->constrained('equipos')->onDelete('cascade');
            // Token UUID único impreso en la etiqueta QR
            $table->string('token', 64)->unique();
            $table->boolean('activo')->default(true);
            $table->timestamp('fecha_revocacion')->nullable();
            $table->integer('total_escaneos')->default(0);
            $table->timestamp('ultimo_escaneo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_tokens');
    }
};
