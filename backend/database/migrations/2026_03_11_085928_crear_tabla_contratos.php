<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Contratos de mantenimiento: vinculan obligaciones periódicas a clientes.
     */
    public function up(): void
    {
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('ubicacion_id')->nullable()->constrained('ubicaciones');
            $table->string('numero_contrato', 40)->unique()->nullable();
            $table->enum('tipo_contrato', [
                'mantenimiento_preventivo', 'mantenimiento_integral',
                'servicio_tecnico', 'adecuacion', 'inspeccion'
            ])->default('mantenimiento_preventivo');
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->boolean('renovacion_automatica')->default(false);
            // Periodicidad general del contrato (puede sobreescribirse por equipo)
            $table->enum('periodicidad_visitas', [
                'mensual', 'bimestral', 'trimestral', 'semestral', 'anual', 'bianual'
            ])->default('anual');
            $table->text('alcance')->nullable();
            $table->boolean('incluye_repuestos')->default(false);
            $table->decimal('importe', 10, 2)->nullable();
            $table->string('moneda', 3)->default('EUR');
            $table->text('observaciones')->nullable();
            $table->enum('estado', ['borrador', 'activo', 'vencido', 'cancelado'])->default('activo');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
