<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Contactos de cliente: interlocutores reales del cliente.
     */
    public function up(): void
    {
        Schema::create('contactos_cliente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->string('nombre', 100);
            $table->string('apellidos', 150)->nullable();
            $table->string('cargo', 100)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('movil', 20)->nullable();
            $table->string('email', 150)->nullable();
            // Canal preferido de contacto
            $table->enum('preferencia_contacto', ['telefono', 'movil', 'email', 'cualquiera'])
                  ->default('cualquiera');
            $table->boolean('contacto_principal')->default(false);
            $table->text('observaciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contactos_cliente');
    }
};
