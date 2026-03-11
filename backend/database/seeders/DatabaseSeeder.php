<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Cliente;
use App\Models\Ubicacion;
use App\Models\TipoEquipo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Datos iniciales de la aplicación.
     */
    public function run(): void
    {
        // --- Tipos de equipo ---
        $tipos = [
            ['nombre' => 'Puerta seccional',             'familia' => 'industrial',  'requiere_ensayo_fuerzas' => true,  'requiere_declaracion_prestaciones' => true],
            ['nombre' => 'Puerta enrollable',             'familia' => 'industrial',  'requiere_ensayo_fuerzas' => true,  'requiere_declaracion_prestaciones' => true],
            ['nombre' => 'Puerta rápida industrial',      'familia' => 'industrial',  'requiere_ensayo_fuerzas' => true,  'requiere_declaracion_prestaciones' => true],
            ['nombre' => 'Puerta corredera motorizada',   'familia' => 'industrial',  'requiere_ensayo_fuerzas' => true,  'requiere_declaracion_prestaciones' => false],
            ['nombre' => 'Puerta batiente motorizada',    'familia' => 'industrial',  'requiere_ensayo_fuerzas' => false, 'requiere_declaracion_prestaciones' => false],
            ['nombre' => 'Puerta basculante',             'familia' => 'garaje',      'requiere_ensayo_fuerzas' => true,  'requiere_declaracion_prestaciones' => true],
            ['nombre' => 'Puerta garaje seccional',       'familia' => 'garaje',      'requiere_ensayo_fuerzas' => true,  'requiere_declaracion_prestaciones' => true],
            ['nombre' => 'Puerta peatonal automática',    'familia' => 'peatonal',    'requiere_ensayo_fuerzas' => false, 'requiere_declaracion_prestaciones' => false],
            ['nombre' => 'Barrera automática',            'familia' => 'control_acceso', 'requiere_ensayo_fuerzas' => false, 'requiere_declaracion_prestaciones' => false],
            ['nombre' => 'Muelle de carga',               'familia' => 'logistica',   'requiere_ensayo_fuerzas' => false, 'requiere_declaracion_prestaciones' => false],
            ['nombre' => 'Abrigo de muelle',              'familia' => 'logistica',   'requiere_ensayo_fuerzas' => false, 'requiere_declaracion_prestaciones' => false],
            ['nombre' => 'Puerta cortafuegos automatizada','familia' => 'seguridad',  'requiere_ensayo_fuerzas' => false, 'requiere_declaracion_prestaciones' => true],
        ];

        foreach ($tipos as $tipo) {
            TipoEquipo::firstOrCreate(
                ['nombre' => $tipo['nombre']],
                array_merge($tipo, [
                    'requiere_marcado_ce'          => true,
                    'requiere_manual_usuario'       => true,
                    'requiere_manual_mantenimiento' => true,
                    'requiere_declaracion_ce'       => true,
                    'requiere_analisis_riesgos'     => true,
                    'activo'                        => true,
                    'normas_aplicables'             => json_encode($this->normasPorFamilia($tipo['familia'])),
                ])
            );
        }

        // --- Usuario administrador ---
        $admin = User::firstOrCreate(
            ['email' => 'admin@empresa.local'],
            [
                'name'     => 'Administrador',
                'password' => Hash::make('admin1234'),
                'perfil'   => 'administrador',
                'activo'   => true,
            ]
        );

        // --- Usuario técnico de ejemplo ---
        User::firstOrCreate(
            ['email' => 'tecnico@empresa.local'],
            [
                'name'     => 'Técnico Instalador',
                'password' => Hash::make('tecnico1234'),
                'perfil'   => 'tecnico_instalador',
                'activo'   => true,
            ]
        );

        // --- Cliente de ejemplo ---
        $cliente = Cliente::firstOrCreate(
            ['cif_nif' => 'B12345678'],
            [
                'codigo_interno'   => 'CLI-00001',
                'razon_social'     => 'Industrias Ejemplo S.L.',
                'nombre_comercial' => 'Industrias Ejemplo',
                'direccion_fiscal' => 'Calle Mayor 10',
                'poblacion'        => 'Madrid',
                'provincia'        => 'Madrid',
                'codigo_postal'    => '28001',
                'telefono'         => '910000001',
                'email'            => 'contacto@industriasejemplo.com',
                'activo'           => true,
            ]
        );

        // --- Ubicación de ejemplo ---
        Ubicacion::firstOrCreate(
            ['cliente_id' => $cliente->id, 'nombre_centro' => 'Nave Principal'],
            [
                'codigo_ubicacion'     => 'UBI-00001',
                'direccion'            => 'Polígono Industrial Norte, Nave 5',
                'localidad'            => 'Alcalá de Henares',
                'provincia'            => 'Madrid',
                'cp'                   => '28801',
                'tipo_ubicacion'       => 'nave_industrial',
                'persona_responsable'  => 'Juan García',
                'telefono_acceso'      => '680000001',
                'activo'               => true,
            ]
        );

        $this->command->info('Datos iniciales cargados correctamente.');
        $this->command->info('Admin:   admin@empresa.local / admin1234');
        $this->command->info('Técnico: tecnico@empresa.local / tecnico1234');
    }

    /**
     * Normas aplicables según la familia del equipo.
     */
    private function normasPorFamilia(string $familia): array
    {
        $base = ['2006/42/CE', 'EN ISO 12100'];

        return match ($familia) {
            'industrial', 'garaje' => array_merge($base, [
                'UNE-EN 13241', 'UNE-EN 12453', 'UNE-EN 12445', 'EN 12604', 'EN 12978',
            ]),
            'peatonal' => array_merge($base, ['EN 16005', 'UNE-EN 12453']),
            'logistica' => array_merge($base, ['EN 1398']),
            'seguridad' => array_merge($base, ['EN 16034', 'UNE-EN 13241']),
            default     => $base,
        };
    }
}
