<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstalacionDetalle extends Model
{
    protected $table = 'instalacion_detalle';

    protected $fillable = [
        'actuacion_id', 'tipo_instalacion', 'descripcion',
        'observaciones', 'completado',
    ];

    protected $casts = ['completado' => 'boolean'];
}
