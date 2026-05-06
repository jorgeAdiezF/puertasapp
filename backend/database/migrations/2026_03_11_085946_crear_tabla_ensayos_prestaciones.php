<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ensayos_prestaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')->constrained('equipos')->onDelete('cascade');
            $table->enum('tipo', ['apertura', 'cierre']);
            $table->string('punto', 100);
            $table->decimal('fuerza_obtenida', 8, 2)->nullable();
            $table->decimal('fuerza_limite', 8, 2)->default(150.00);
            $table->boolean('conforme')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['equipo_id', 'tipo', 'punto']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ensayos_prestaciones');
    }
};
