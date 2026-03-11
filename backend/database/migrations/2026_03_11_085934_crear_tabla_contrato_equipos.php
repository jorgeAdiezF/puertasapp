<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla pivote: equipos incluidos en cada contrato con cobertura específica.
     */
    public function up(): void
    {
        Schema::create('contrato_equipos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            $table->foreignId('equipo_id')->constrained('equipos')->onDelete('cascade');
            // Periodicidad específica que puede diferir del contrato general
            $table->enum('periodicidad_especifica', [
                'mensual', 'bimestral', 'trimestral', 'semestral', 'anual', 'bianual'
            ])->nullable();
            $table->string('cobertura', 200)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['contrato_id', 'equipo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrato_equipos');
    }
};
