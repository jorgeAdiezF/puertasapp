<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Componente extends Model
{
    protected $table = 'componentes';

    protected $fillable = [
        'equipo_id', 'categoria', 'subcategoria', 'fabricante', 'marca', 'modelo',
        'numero_serie', 'referencia', 'tension', 'potencia', 'caracteristicas_tecnicas',
        'fecha_instalacion', 'fecha_sustitucion', 'estado',
        'es_critico', 'requiere_revision', 'observaciones',
    ];

    protected $casts = [
        'fecha_instalacion' => 'date',
        'fecha_sustitucion' => 'date',
        'es_critico'        => 'boolean',
        'requiere_revision' => 'boolean',
    ];

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }
}
