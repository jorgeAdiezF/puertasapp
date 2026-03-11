<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Cliente;
use App\Models\Ubicacion;
use App\Models\TipoEquipo;
use App\Models\Equipo;
use App\Models\Componente;
use App\Models\Actuacion;
use App\Models\Contrato;
use App\Models\AgendaTarea;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin   = User::where('email', 'admin@empresa.local')->first();
        $tecnico = User::where('email', 'tecnico@empresa.local')->first();

        // ── CLIENTES ──────────────────────────────────────────────────────────

        $clientes = [
            [
                'codigo_interno'   => 'CLI-00002',
                'razon_social'     => 'Logística del Norte S.A.',
                'nombre_comercial' => 'LogiNorte',
                'cif_nif'          => 'A87654321',
                'direccion_fiscal' => 'Avda. de la Industria 45',
                'poblacion'        => 'Burgos',
                'provincia'        => 'Burgos',
                'codigo_postal'    => '09001',
                'telefono'         => '947100200',
                'email'            => 'mantenimiento@loginorte.com',
                'activo'           => true,
            ],
            [
                'codigo_interno'   => 'CLI-00003',
                'razon_social'     => 'Frigoríficos Mediterráneo S.L.',
                'nombre_comercial' => 'FrigoMed',
                'cif_nif'          => 'B55443322',
                'direccion_fiscal' => 'Polígono Can Parellada, Nave 12',
                'poblacion'        => 'Terrassa',
                'provincia'        => 'Barcelona',
                'codigo_postal'    => '08227',
                'telefono'         => '937200300',
                'email'            => 'obras@frigomed.es',
                'activo'           => true,
            ],
            [
                'codigo_interno'   => 'CLI-00004',
                'razon_social'     => 'Automoción Castilla S.L.',
                'nombre_comercial' => 'AutoCastilla',
                'cif_nif'          => 'B11223344',
                'direccion_fiscal' => 'Calle del Hierro 7',
                'poblacion'        => 'Valladolid',
                'provincia'        => 'Valladolid',
                'codigo_postal'    => '47009',
                'telefono'         => '983400100',
                'email'            => 'taller@autocastilla.com',
                'activo'           => true,
            ],
        ];

        $clienteObjs = [];
        foreach ($clientes as $data) {
            $clienteObjs[] = Cliente::firstOrCreate(['cif_nif' => $data['cif_nif']], $data);
        }
        // Añadir también el cliente del seeder base
        $clienteObjs[] = Cliente::where('cif_nif', 'B12345678')->first();

        // ── UBICACIONES ───────────────────────────────────────────────────────

        $ubicaciones = [
            // LogiNorte
            [
                'cliente_id'          => $clienteObjs[0]->id,
                'codigo_ubicacion'    => 'UBI-00002',
                'nombre_centro'       => 'Centro Logístico Burgos',
                'direccion'           => 'Polígono Industrial Villalonquéjar, Nave 3',
                'localidad'           => 'Burgos',
                'provincia'           => 'Burgos',
                'cp'                  => '09001',
                'tipo_ubicacion'      => 'nave_industrial',
                'persona_responsable' => 'Pedro Martínez',
                'telefono_acceso'     => '620100200',
                'activo'              => true,
            ],
            [
                'cliente_id'          => $clienteObjs[0]->id,
                'codigo_ubicacion'    => 'UBI-00003',
                'nombre_centro'       => 'Almacén Frigorífico Norte',
                'direccion'           => 'Carretera N-1, Km 234',
                'localidad'           => 'Aranda de Duero',
                'provincia'           => 'Burgos',
                'cp'                  => '09400',
                'tipo_ubicacion'      => 'logistica',
                'persona_responsable' => 'Ana López',
                'telefono_acceso'     => '947500100',
                'activo'              => true,
            ],
            // FrigoMed
            [
                'cliente_id'          => $clienteObjs[1]->id,
                'codigo_ubicacion'    => 'UBI-00004',
                'nombre_centro'       => 'Planta Producción Terrassa',
                'direccion'           => 'Polígono Can Parellada, Nave 12',
                'localidad'           => 'Terrassa',
                'provincia'           => 'Barcelona',
                'cp'                  => '08227',
                'tipo_ubicacion'      => 'nave_industrial',
                'persona_responsable' => 'Jordi Puig',
                'telefono_acceso'     => '937200310',
                'activo'              => true,
            ],
            // AutoCastilla
            [
                'cliente_id'          => $clienteObjs[2]->id,
                'codigo_ubicacion'    => 'UBI-00005',
                'nombre_centro'       => 'Taller Principal Valladolid',
                'direccion'           => 'Calle del Hierro 7',
                'localidad'           => 'Valladolid',
                'provincia'           => 'Valladolid',
                'cp'                  => '47009',
                'tipo_ubicacion'      => 'otro',
                'persona_responsable' => 'Carlos Sánchez',
                'telefono_acceso'     => '983400110',
                'activo'              => true,
            ],
            // Industrias Ejemplo (cliente base)
            [
                'cliente_id'          => $clienteObjs[3]->id,
                'codigo_ubicacion'    => 'UBI-00001',
                'nombre_centro'       => 'Nave Principal',
                'direccion'           => 'Polígono Industrial Norte, Nave 5',
                'localidad'           => 'Alcalá de Henares',
                'provincia'           => 'Madrid',
                'cp'                  => '28801',
                'tipo_ubicacion'      => 'nave_industrial',
                'persona_responsable' => 'Juan García',
                'telefono_acceso'     => '680000001',
                'activo'              => true,
            ],
        ];

        $ubicObjs = [];
        foreach ($ubicaciones as $data) {
            $ubicObjs[] = Ubicacion::firstOrCreate(
                ['codigo_ubicacion' => $data['codigo_ubicacion']],
                $data
            );
        }

        // ── EQUIPOS ───────────────────────────────────────────────────────────

        $tipoSeccional   = TipoEquipo::where('nombre', 'Puerta seccional')->first();
        $tipoEnrollable  = TipoEquipo::where('nombre', 'Puerta enrollable')->first();
        $tipoRapida      = TipoEquipo::where('nombre', 'Puerta rápida industrial')->first();
        $tipoCortafuegos = TipoEquipo::where('nombre', 'Puerta cortafuegos automatizada')->first();
        $tipoMuelle      = TipoEquipo::where('nombre', 'Muelle de carga')->first();
        $tipoBarrera     = TipoEquipo::where('nombre', 'Barrera automática')->first();
        $tipoGaraje      = TipoEquipo::where('nombre', 'Puerta garaje seccional')->first();

        $equiposData = [
            // LogiNorte - Centro Burgos
            [
                'codigo_equipo'                => 'EQ-00001',
                'cliente_id'                   => $clienteObjs[0]->id,
                'ubicacion_id'                 => $ubicObjs[0]->id,
                'tipo_equipo_id'               => $tipoSeccional?->id,
                'descripcion_corta'            => 'Puerta seccional nave 1 acceso camiones',
                'fabricante'                   => 'Hörmann',
                'marca'                        => 'Hörmann',
                'modelo'                       => 'SPU F42',
                'numero_serie'                 => 'HOR-2021-00123',
                'ancho_paso'                   => 4.0,
                'alto_paso'                    => 4.5,
                'tipo_apertura'                => 'seccional',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'conforme',
                'fecha_instalacion'            => '2021-03-15',
                'fecha_proximo_mantenimiento'  => Carbon::now()->addMonths(3)->toDateString(),
                'periodicidad_mantenimiento'   => 180,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => true,
                'tiene_marcado_ce'             => true,
                'activo'                       => true,
            ],
            [
                'codigo_equipo'                => 'EQ-00002',
                'cliente_id'                   => $clienteObjs[0]->id,
                'ubicacion_id'                 => $ubicObjs[0]->id,
                'tipo_equipo_id'               => $tipoRapida?->id,
                'descripcion_corta'            => 'Puerta rápida zona expedición',
                'fabricante'                   => 'Efaflex',
                'marca'                        => 'Efaflex',
                'modelo'                       => 'TN-F',
                'numero_serie'                 => 'EFA-2022-00456',
                'ancho_paso'                   => 3.0,
                'alto_paso'                    => 3.0,
                'tipo_apertura'                => 'rapida',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'conforme',
                'fecha_instalacion'            => '2022-06-10',
                'fecha_proximo_mantenimiento'  => Carbon::now()->addMonths(5)->toDateString(),
                'periodicidad_mantenimiento'   => 180,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => true,
                'tiene_marcado_ce'             => true,
                'activo'                       => true,
            ],
            [
                'codigo_equipo'                => 'EQ-00003',
                'cliente_id'                   => $clienteObjs[0]->id,
                'ubicacion_id'                 => $ubicObjs[0]->id,
                'tipo_equipo_id'               => $tipoMuelle?->id,
                'descripcion_corta'            => 'Muelle de carga posición 1',
                'fabricante'                   => 'Stertil',
                'marca'                        => 'Stertil',
                'modelo'                       => 'ST 155',
                'numero_serie'                 => 'STE-2021-00789',
                'tipo_apertura'                => 'otro',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'requiere_adecuacion',
                'fecha_instalacion'            => '2021-03-15',
                'fecha_proximo_mantenimiento'  => Carbon::now()->subDays(15)->toDateString(),
                'periodicidad_mantenimiento'   => 180,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => false,
                'tiene_marcado_ce'             => false,
                'activo'                       => true,
            ],
            // LogiNorte - Almacén Frigorífico
            [
                'codigo_equipo'                => 'EQ-00004',
                'cliente_id'                   => $clienteObjs[0]->id,
                'ubicacion_id'                 => $ubicObjs[1]->id,
                'tipo_equipo_id'               => $tipoRapida?->id,
                'descripcion_corta'            => 'Puerta rápida cámara frigorífica -18°C',
                'fabricante'                   => 'Assa Abloy',
                'marca'                        => 'Crawford',
                'modelo'                       => 'RapidFreeze 3000',
                'numero_serie'                 => 'AAB-2020-01234',
                'ancho_paso'                   => 2.5,
                'alto_paso'                    => 2.8,
                'tipo_apertura'                => 'rapida',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'no_conforme',
                'fecha_instalacion'            => '2020-01-20',
                'fecha_proximo_mantenimiento'  => Carbon::now()->subDays(45)->toDateString(),
                'periodicidad_mantenimiento'   => 180,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => false,
                'tiene_marcado_ce'             => false,
                'activo'                       => true,
            ],
            // FrigoMed
            [
                'codigo_equipo'                => 'EQ-00005',
                'cliente_id'                   => $clienteObjs[1]->id,
                'ubicacion_id'                 => $ubicObjs[2]->id,
                'tipo_equipo_id'               => $tipoEnrollable?->id,
                'descripcion_corta'            => 'Puerta enrollable acceso principal producción',
                'fabricante'                   => 'Jansen',
                'marca'                        => 'Jansen',
                'modelo'                       => 'Nassano Classic 30',
                'numero_serie'                 => 'JAN-2023-00099',
                'ancho_paso'                   => 5.0,
                'alto_paso'                    => 5.0,
                'tipo_apertura'                => 'enrollable',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'en_proceso',
                'fecha_instalacion'            => '2023-02-28',
                'fecha_proximo_mantenimiento'  => Carbon::now()->addMonths(2)->toDateString(),
                'periodicidad_mantenimiento'   => 180,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => true,
                'tiene_marcado_ce'             => true,
                'activo'                       => true,
            ],
            [
                'codigo_equipo'                => 'EQ-00006',
                'cliente_id'                   => $clienteObjs[1]->id,
                'ubicacion_id'                 => $ubicObjs[2]->id,
                'tipo_equipo_id'               => $tipoCortafuegos?->id,
                'descripcion_corta'            => 'Puerta cortafuegos EI2 120 pasillo producción',
                'fabricante'                   => 'Novoferm',
                'marca'                        => 'Novoferm',
                'modelo'                       => 'NovoPorta Fire 30',
                'numero_serie'                 => 'NOV-2023-00201',
                'tipo_apertura'                => 'batiente',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'conforme',
                'fecha_instalacion'            => '2023-02-28',
                'fecha_proximo_mantenimiento'  => Carbon::now()->addMonths(7)->toDateString(),
                'periodicidad_mantenimiento'   => 365,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => true,
                'tiene_marcado_ce'             => true,
                'activo'                       => true,
            ],
            // AutoCastilla
            [
                'codigo_equipo'                => 'EQ-00007',
                'cliente_id'                   => $clienteObjs[2]->id,
                'ubicacion_id'                 => $ubicObjs[3]->id,
                'tipo_equipo_id'               => $tipoGaraje?->id,
                'descripcion_corta'            => 'Puerta seccional garaje taller foso 1',
                'fabricante'                   => 'Hörmann',
                'marca'                        => 'Hörmann',
                'modelo'                       => 'LPU 67 Thermo',
                'numero_serie'                 => 'HOR-2019-00321',
                'ancho_paso'                   => 3.5,
                'alto_paso'                    => 2.2,
                'tipo_apertura'                => 'seccional',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'conforme',
                'fecha_instalacion'            => '2019-11-10',
                'fecha_proximo_mantenimiento'  => Carbon::now()->addMonths(4)->toDateString(),
                'periodicidad_mantenimiento'   => 180,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => true,
                'tiene_marcado_ce'             => true,
                'activo'                       => true,
            ],
            [
                'codigo_equipo'                => 'EQ-00008',
                'cliente_id'                   => $clienteObjs[2]->id,
                'ubicacion_id'                 => $ubicObjs[3]->id,
                'tipo_equipo_id'               => $tipoBarrera?->id,
                'descripcion_corta'            => 'Barrera automática entrada vehículos',
                'fabricante'                   => 'CAME',
                'marca'                        => 'CAME',
                'modelo'                       => 'GARD 8',
                'numero_serie'                 => 'CAM-2022-00555',
                'tipo_apertura'                => 'barrera',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'sin_evaluar',
                'fecha_instalacion'            => '2022-04-05',
                'fecha_proximo_mantenimiento'  => Carbon::now()->addDays(10)->toDateString(),
                'periodicidad_mantenimiento'   => 365,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => false,
                'tiene_marcado_ce'             => false,
                'activo'                       => true,
            ],
            // Industrias Ejemplo
            [
                'codigo_equipo'                => 'EQ-00009',
                'cliente_id'                   => $clienteObjs[3]->id,
                'ubicacion_id'                 => $ubicObjs[4]->id,
                'tipo_equipo_id'               => $tipoSeccional?->id,
                'descripcion_corta'            => 'Puerta seccional acceso nave almacén',
                'fabricante'                   => 'Assa Abloy',
                'marca'                        => 'Crawford',
                'modelo'                       => 'CombiMatic 2000',
                'numero_serie'                 => 'AAB-2020-00777',
                'ancho_paso'                   => 4.0,
                'alto_paso'                    => 4.0,
                'tipo_apertura'                => 'seccional',
                'estado_equipo'                => 'activo',
                'estado_normativo'             => 'conforme',
                'fecha_instalacion'            => '2020-07-01',
                'fecha_proximo_mantenimiento'  => Carbon::now()->addMonth()->toDateString(),
                'periodicidad_mantenimiento'   => 180,
                'tecnico_responsable_id'       => $tecnico?->id,
                'expediente_ce_generado'       => true,
                'tiene_marcado_ce'             => true,
                'activo'                       => true,
            ],
        ];

        $equipoObjs = [];
        foreach ($equiposData as $data) {
            $equipoObjs[] = Equipo::firstOrCreate(
                ['codigo_equipo' => $data['codigo_equipo']],
                $data
            );
        }

        // ── COMPONENTES ───────────────────────────────────────────────────────

        $componentesPorEquipo = [
            0 => [ // EQ-00001 Seccional Hörmann
                ['categoria' => 'motor',          'subcategoria' => 'Motor SupraMatic E',       'referencia' => 'HOR-SUP-E-100', 'estado' => 'activo', 'marca' => 'Hörmann'],
                ['categoria' => 'celula_seguridad','subcategoria' => 'Fotocélula de seguridad',  'referencia' => 'HOR-FC-01',     'estado' => 'activo', 'marca' => 'Hörmann'],
                ['categoria' => 'receptor',        'subcategoria' => 'Mando a distancia (x2)',   'referencia' => 'HOR-HSM4',      'estado' => 'activo', 'marca' => 'Hörmann'],
                ['categoria' => 'muelle',          'subcategoria' => 'Resortes de torsión',      'referencia' => 'HOR-RES-45',    'estado' => 'activo', 'observaciones' => 'Con desgaste moderado. Revisar en próximo mantenimiento.'],
            ],
            1 => [ // EQ-00002 Puerta rápida Efaflex
                ['categoria' => 'motor',    'subcategoria' => 'Motor DC brushless',      'referencia' => 'EFA-MOT-01', 'estado' => 'activo', 'marca' => 'Efaflex'],
                ['categoria' => 'variador', 'subcategoria' => 'Variador de frecuencia',  'referencia' => 'EFA-VFD-01', 'estado' => 'activo', 'marca' => 'Efaflex'],
                ['categoria' => 'detector_presencia', 'subcategoria' => 'Detector bucle inductivo', 'referencia' => 'EFA-DET-01', 'estado' => 'activo'],
            ],
            4 => [ // EQ-00005 Puerta enrollable Jansen
                ['categoria' => 'motor', 'subcategoria' => 'Motor trifásico 0.55kW', 'referencia' => 'JAN-MOT-01', 'estado' => 'activo', 'marca' => 'Jansen'],
                ['categoria' => 'cuadro','subcategoria' => 'Cuadro de maniobra',     'referencia' => 'JAN-CM-01',  'estado' => 'activo', 'marca' => 'Jansen'],
                ['categoria' => 'otro',  'subcategoria' => 'Freno electromagnético', 'referencia' => 'JAN-FRE-01', 'estado' => 'activo', 'observaciones' => 'Ajuste necesario en próxima revisión', 'requiere_revision' => true],
            ],
        ];

        foreach ($componentesPorEquipo as $idx => $comps) {
            foreach ($comps as $comp) {
                Componente::firstOrCreate(
                    ['equipo_id' => $equipoObjs[$idx]->id, 'referencia' => $comp['referencia']],
                    array_merge($comp, ['equipo_id' => $equipoObjs[$idx]->id])
                );
            }
        }

        // ── ACTUACIONES ───────────────────────────────────────────────────────

        $actuacionesData = [
            [
                'equipo_id'              => $equipoObjs[0]->id,
                'tipo_actuacion'         => 'mantenimiento_preventivo',
                'origen_actuacion'       => 'contrato',
                'estado'                 => 'completada',
                'fecha_inicio'           => Carbon::now()->subMonths(3),
                'fecha_fin'              => Carbon::now()->subMonths(3),
                'duracion_minutos'       => 90,
                'usuario_responsable_id' => $tecnico?->id,
                'resumen'                => 'Mantenimiento semestral. Revisión general, engrase de guías y resortes, comprobación de fotocélulas y ajuste de límites de carrera.',
                'observaciones'          => 'Resortes con desgaste moderado. Recomendar sustitución en próximo mantenimiento.',
            ],
            [
                'equipo_id'              => $equipoObjs[1]->id,
                'tipo_actuacion'         => 'mantenimiento_preventivo',
                'origen_actuacion'       => 'contrato',
                'estado'                 => 'completada',
                'fecha_inicio'           => Carbon::now()->subMonths(1),
                'fecha_fin'              => Carbon::now()->subMonths(1),
                'duracion_minutos'       => 60,
                'usuario_responsable_id' => $tecnico?->id,
                'resumen'                => 'Mantenimiento semestral puerta rápida. Revisión de lona, estructura, motor y detectores.',
                'observaciones'          => 'Todo en correcto estado.',
            ],
            [
                'equipo_id'              => $equipoObjs[2]->id,
                'tipo_actuacion'         => 'reparacion',
                'origen_actuacion'       => 'averia',
                'estado'                 => 'completada',
                'fecha_inicio'           => Carbon::now()->subMonths(2),
                'fecha_fin'              => Carbon::now()->subMonths(2),
                'duracion_minutos'       => 180,
                'usuario_responsable_id' => $tecnico?->id,
                'resumen'                => 'Reparación de cilindro hidráulico con fuga de aceite. Sustitución de juntas y recarga de circuito.',
                'observaciones'          => 'Pendiente de realizar mantenimiento preventivo vencido. Informado al cliente.',
            ],
            [
                'equipo_id'              => $equipoObjs[3]->id,
                'tipo_actuacion'         => 'inspeccion_tecnica',
                'origen_actuacion'       => 'averia',
                'estado'                 => 'completada',
                'fecha_inicio'           => Carbon::now()->subMonths(10),
                'fecha_fin'              => Carbon::now()->subMonths(10),
                'duracion_minutos'       => 45,
                'usuario_responsable_id' => $tecnico?->id,
                'resumen'                => 'Inspección por avería: puerta no cierra correctamente. Se detecta desgaste en guías y fallo en sello inferior.',
                'observaciones'          => 'Equipo no conforme hasta sustitución de componentes. No se ha podido acometer la reparación por falta de stock.',
            ],
            [
                'equipo_id'              => $equipoObjs[4]->id,
                'tipo_actuacion'         => 'instalacion_nueva',
                'origen_actuacion'       => 'interno',
                'estado'                 => 'completada',
                'fecha_inicio'           => Carbon::parse('2023-02-28'),
                'fecha_fin'              => Carbon::parse('2023-03-01'),
                'duracion_minutos'       => 480,
                'usuario_responsable_id' => $tecnico?->id,
                'resumen'                => 'Instalación de puerta enrollable nueva. Montaje de estructura, motor trifásico, cuadro de maniobra y pruebas de funcionamiento.',
                'observaciones'          => 'Instalación correcta. Documentación CE entregada al cliente.',
                'actualiza_expediente_ce'=> true,
            ],
            [
                'equipo_id'              => $equipoObjs[6]->id,
                'tipo_actuacion'         => 'mantenimiento_preventivo',
                'origen_actuacion'       => 'contrato',
                'estado'                 => 'completada',
                'fecha_inicio'           => Carbon::now()->subMonths(2),
                'fecha_fin'              => Carbon::now()->subMonths(2),
                'duracion_minutos'       => 75,
                'usuario_responsable_id' => $tecnico?->id,
                'resumen'                => 'Mantenimiento semestral puerta garaje. Revisión de paneles, motor, resortes y mecanismo de desbloqueo de emergencia.',
                'observaciones'          => 'Correcto estado general.',
            ],
            [
                'equipo_id'              => $equipoObjs[0]->id,
                'tipo_actuacion'         => 'mantenimiento_correctivo',
                'origen_actuacion'       => 'averia',
                'estado'                 => 'pendiente',
                'fecha_inicio'           => Carbon::now()->addDays(5),
                'duracion_minutos'       => null,
                'usuario_responsable_id' => $tecnico?->id,
                'resumen'                => 'Sustitución preventiva de resortes de torsión con signos de desgaste detectados en último mantenimiento.',
                'observaciones'          => null,
            ],
        ];

        foreach ($actuacionesData as $data) {
            Actuacion::create($data);
        }

        // ── CONTRATOS ─────────────────────────────────────────────────────────

        $contratosData = [
            [
                'numero_contrato'    => 'CT-2024-001',
                'cliente_id'         => $clienteObjs[0]->id,
                'tipo_contrato'      => 'mantenimiento_preventivo',
                'alcance'            => 'Mantenimiento preventivo semestral de todas las puertas industriales y muelles de carga en instalaciones de Burgos.',
                'fecha_inicio'       => '2024-01-01',
                'fecha_fin'          => '2024-12-31',
                'importe'            => 4800.00,
                'periodicidad_visitas'=> 'semestral',
                'estado'             => 'activo',
            ],
            [
                'numero_contrato'    => 'CT-2024-002',
                'cliente_id'         => $clienteObjs[1]->id,
                'tipo_contrato'      => 'mantenimiento_preventivo',
                'alcance'            => 'Mantenimiento anual de puerta enrollable y puerta cortafuegos en planta de producción.',
                'fecha_inicio'       => '2024-03-01',
                'fecha_fin'          => '2025-02-28',
                'importe'            => 1950.00,
                'periodicidad_visitas'=> 'anual',
                'estado'             => 'activo',
            ],
            [
                'numero_contrato'    => 'CT-2023-005',
                'cliente_id'         => $clienteObjs[2]->id,
                'tipo_contrato'      => 'mantenimiento_preventivo',
                'alcance'            => 'Revisión semestral de puerta seccional de taller y barrera de acceso.',
                'fecha_inicio'       => '2023-06-01',
                'fecha_fin'          => '2024-05-31',
                'importe'            => 1200.00,
                'periodicidad_visitas'=> 'semestral',
                'estado'             => 'vencido',
            ],
            [
                'numero_contrato'    => 'CT-2025-001',
                'cliente_id'         => $clienteObjs[3]->id,
                'tipo_contrato'      => 'mantenimiento_preventivo',
                'alcance'            => 'Contrato de mantenimiento semestral para la puerta seccional de nave almacén.',
                'fecha_inicio'       => '2025-01-01',
                'fecha_fin'          => '2025-12-31',
                'importe'            => 650.00,
                'periodicidad_visitas'=> 'semestral',
                'estado'             => 'activo',
            ],
        ];

        foreach ($contratosData as $data) {
            Contrato::firstOrCreate(['numero_contrato' => $data['numero_contrato']], $data);
        }

        // ── AGENDA ────────────────────────────────────────────────────────────

        $agendaData = [
            [
                'equipo_id'       => $equipoObjs[2]->id,
                'tecnico_id'      => $tecnico?->id,
                'fecha_programada'=> Carbon::now()->addDay()->setHour(9)->setMinute(0),
                'tipo_tarea'      => 'mantenimiento',
                'prioridad'       => 'alta',
                'estado'          => 'pendiente',
                'observaciones'   => 'Mantenimiento semestral vencido - EQ-00003 Muelle de carga. Realizar revisión completa y documentar.',
            ],
            [
                'equipo_id'       => $equipoObjs[3]->id,
                'tecnico_id'      => $tecnico?->id,
                'fecha_programada'=> Carbon::now()->addDays(2)->setHour(8)->setMinute(0),
                'tipo_tarea'      => 'incidencia',
                'prioridad'       => 'urgente',
                'estado'          => 'pendiente',
                'observaciones'   => 'EQ-00004 Puerta rápida cámara frigorífica NO CONFORME. Sustitución de guías y sello inferior para restablecer conformidad.',
            ],
            [
                'equipo_id'       => $equipoObjs[0]->id,
                'tecnico_id'      => $tecnico?->id,
                'fecha_programada'=> Carbon::now()->addDays(5)->setHour(10)->setMinute(0),
                'tipo_tarea'      => 'mantenimiento',
                'prioridad'       => 'alta',
                'estado'          => 'pendiente',
                'observaciones'   => 'EQ-00001 - Cambio preventivo de resortes de torsión con signos de desgaste detectados en último mantenimiento.',
            ],
            [
                'equipo_id'       => $equipoObjs[5]->id,
                'tecnico_id'      => $tecnico?->id,
                'fecha_programada'=> Carbon::now()->addDays(7)->setHour(9)->setMinute(0),
                'tipo_tarea'      => 'mantenimiento',
                'prioridad'       => 'normal',
                'estado'          => 'pendiente',
                'observaciones'   => 'EQ-00006 - Revisión anual obligatoria de puerta cortafuegos automatizada.',
            ],
            [
                'equipo_id'       => $equipoObjs[7]->id,
                'tecnico_id'      => $tecnico?->id,
                'fecha_programada'=> Carbon::now()->addDays(10)->setHour(11)->setMinute(0),
                'tipo_tarea'      => 'inspeccion',
                'prioridad'       => 'normal',
                'estado'          => 'pendiente',
                'observaciones'   => 'EQ-00008 Barrera AutoCastilla - Primera revisión desde instalación. Evaluar estado normativo y documentar.',
            ],
            [
                'equipo_id'       => $equipoObjs[8]->id,
                'tecnico_id'      => $tecnico?->id,
                'fecha_programada'=> Carbon::now()->addMonth()->setHour(9)->setMinute(0),
                'tipo_tarea'      => 'mantenimiento',
                'prioridad'       => 'normal',
                'estado'          => 'pendiente',
                'observaciones'   => 'EQ-00009 - Revisión semestral programada por contrato CT-2025-001.',
            ],
        ];

        foreach ($agendaData as $data) {
            AgendaTarea::create($data);
        }

        $this->command->info('Datos de demostración cargados:');
        $this->command->info('  - 3 clientes nuevos (+ 1 existente)');
        $this->command->info('  - 5 ubicaciones nuevas');
        $this->command->info('  - 9 equipos');
        $this->command->info('  - 10 componentes');
        $this->command->info('  - 7 actuaciones');
        $this->command->info('  - 4 contratos');
        $this->command->info('  - 6 tareas en agenda');
    }
}
