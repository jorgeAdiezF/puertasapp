<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ubicaciones: centros o instalaciones donde están los equipos.
     */
    public function up(): void
    {
        Schema::create('ubicaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->string('codigo_ubicacion', 20)->nullable();
            $table->string('nombre_centro', 200);
            $table->string('direccion', 300)->nullable();
            $table->string('numero', 10)->nullable();
            $table->string('localidad', 100)->nullable();
            $table->string('provincia', 100)->nullable();
            $table->string('cp', 10)->nullable();
            $table->string('pais', 60)->default('España');
            // Coordenadas GPS para localizar en campo
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->enum('tipo_ubicacion', [
                'nave_industrial', 'edificio_oficinas', 'comunidad_vecinos',
                'centro_comercial', 'hospital', 'logistica', 'otro'
            ])->default('nave_industrial');
            $table->text('observaciones_acceso')->nullable();
            $table->string('horario_acceso', 200)->nullable();
            $table->string('persona_responsable', 150)->nullable();
            $table->string('telefono_acceso', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ubicaciones');
    }
};
