<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analisis_riesgos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('equipo_id')->constrained('equipos')->onDelete('cascade');
            $table->string('categoria', 100);
            $table->string('requisito', 255);
            $table->enum('estado', ['cumple', 'no_cumple', 'no_aplica'])->default('no_aplica');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->unique(['equipo_id', 'requisito']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analisis_riesgos');
    }
};
