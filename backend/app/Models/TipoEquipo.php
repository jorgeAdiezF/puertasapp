<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoEquipo extends Model
{
    // El nombre de tabla no sigue la convención de pluralización inglesa
    protected $table = 'tipos_equipo';

    protected $fillable = [
        'nombre', 'familia',
        'requiere_marcado_ce', 'requiere_ensayo_fuerzas',
        'requiere_manual_usuario', 'requiere_manual_mantenimiento',
        'requiere_declaracion_ce', 'requiere_declaracion_prestaciones',
        'requiere_analisis_riesgos',
        'plantilla_checklist_instalacion_id', 'plantilla_checklist_mantenimiento_id',
        'reglas_normativas', 'normas_aplicables', 'activo',
    ];

    protected $casts = [
        'requiere_marcado_ce'              => 'boolean',
        'requiere_ensayo_fuerzas'          => 'boolean',
        'requiere_manual_usuario'          => 'boolean',
        'requiere_manual_mantenimiento'    => 'boolean',
        'requiere_declaracion_ce'          => 'boolean',
        'requiere_declaracion_prestaciones'=> 'boolean',
        'requiere_analisis_riesgos'        => 'boolean',
        'activo'                           => 'boolean',
        'reglas_normativas'                => 'array',
        'normas_aplicables'                => 'array',
    ];

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'tipo_equipo_id');
    }
}
