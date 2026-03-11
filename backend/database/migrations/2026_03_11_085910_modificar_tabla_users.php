<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Extiende la tabla users con campos propios de la plataforma.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('telefono', 20)->nullable()->after('email');
            $table->string('movil', 20)->nullable()->after('telefono');
            // Perfil funcional visible en la app (complementa el sistema de permisos)
            $table->enum('perfil', [
                'administrador',
                'oficina_tecnica',
                'tecnico_instalador',
                'tecnico_mantenedor',
                'gerencia',
            ])->default('tecnico_instalador')->after('movil');
            $table->boolean('activo')->default(true)->after('perfil');
            $table->string('firma_imagen_ruta')->nullable()->after('activo');
            $table->timestamp('ultimo_acceso')->nullable()->after('firma_imagen_ruta');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'telefono', 'movil', 'perfil', 'activo',
                'firma_imagen_ruta', 'ultimo_acceso',
            ]);
        });
    }
};
