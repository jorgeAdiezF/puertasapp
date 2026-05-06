<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalisisRiesgo extends Model
{
    protected $table = 'analisis_riesgos';

    protected $fillable = [
        'equipo_id',
        'categoria',
        'requisito',
        'estado',
        'observaciones',
    ];

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class);
    }
}
