<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contrato extends Model
{
    use SoftDeletes;

    protected $table = 'contratos';

    protected $fillable = [
        'cliente_id', 'ubicacion_id', 'numero_contrato', 'tipo_contrato',
        'fecha_inicio', 'fecha_fin', 'renovacion_automatica', 'periodicidad_visitas',
        'alcance', 'incluye_repuestos', 'importe', 'moneda', 'observaciones', 'estado',
    ];

    protected $casts = [
        'fecha_inicio'         => 'date',
        'fecha_fin'            => 'date',
        'renovacion_automatica'=> 'boolean',
        'incluye_repuestos'    => 'boolean',
        'importe'              => 'decimal:2',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function ubicacion(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function equipos(): BelongsToMany
    {
        return $this->belongsToMany(Equipo::class, 'contrato_equipos')
                    ->withPivot('periodicidad_especifica', 'cobertura', 'observaciones')
                    ->withTimestamps();
    }

    public function actuaciones(): HasMany
    {
        return $this->hasMany(Actuacion::class, 'contrato_id');
    }
}
