<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tipos de equipo: catálogo parametrizado con requisitos normativos por tipo.
     * Define qué documentación y ensayos son obligatorios para cada tipología.
     */
    public function up(): void
    {
        Schema::create('tipos_equipo', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->string('familia', 60); // industrial, comercial, garaje, peatonal
            // Indicadores de requisitos normativos por tipo
            $table->boolean('requiere_marcado_ce')->default(true);
            $table->boolean('requiere_ensayo_fuerzas')->default(false);
            $table->boolean('requiere_manual_usuario')->default(true);
            $table->boolean('requiere_manual_mantenimiento')->default(true);
            $table->boolean('requiere_declaracion_ce')->default(true);
            $table->boolean('requiere_declaracion_prestaciones')->default(false);
            $table->boolean('requiere_analisis_riesgos')->default(true);
            // IDs de plantillas de checklist asociadas (se rellenan en fase 2)
            $table->unsignedBigInteger('plantilla_checklist_instalacion_id')->nullable();
            $table->unsignedBigInteger('plantilla_checklist_mantenimiento_id')->nullable();
            // Reglas normativas específicas en JSON (motor de reglas fase 2)
            $table->json('reglas_normativas')->nullable();
            // Normas aplicables como array JSON
            $table->json('normas_aplicables')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_equipo');
    }
};
