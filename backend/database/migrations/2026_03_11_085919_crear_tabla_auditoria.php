<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Auditoría: registro inmutable de cambios sensibles para trazabilidad legal.
     */
    public function up(): void
    {
        Schema::create('auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('users');
            $table->string('accion', 60); // crear, modificar, eliminar, generar_doc, firmar, etc.
            $table->string('entidad_tipo', 60);
            $table->unsignedBigInteger('entidad_id');
            // Estado anterior y posterior en JSON para comparación
            $table->json('valor_anterior')->nullable();
            $table->json('valor_nuevo')->nullable();
            $table->timestamp('fecha');
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 300)->nullable();
            $table->string('descripcion', 500)->nullable();

            $table->index(['entidad_tipo', 'entidad_id']);
            $table->index(['usuario_id', 'fecha']);
            $table->index(['accion', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auditoria');
    }
};
