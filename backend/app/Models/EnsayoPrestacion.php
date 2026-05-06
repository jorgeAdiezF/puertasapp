<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnsayoPrestacion extends Model
{
    protected $table = 'ensayos_prestaciones';

    protected $fillable = [
        'equipo_id',
        'tipo',
        'punto',
        'fuerza_obtenida',
        'fuerza_limite',
        'conforme',
        'observaciones',
    ];

    protected $casts = [
        'fuerza_obtenida' => 'decimal:2',
        'fuerza_limite'   => 'decimal:2',
        'conforme'        => 'boolean',
    ];

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }
}
