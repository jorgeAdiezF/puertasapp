<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ubicacion extends Model
{
    use SoftDeletes;

    protected $table = 'ubicaciones';

    protected $fillable = [
        'cliente_id', 'codigo_ubicacion', 'nombre_centro', 'direccion', 'numero',
        'localidad', 'provincia', 'cp', 'pais', 'latitud', 'longitud',
        'tipo_ubicacion', 'observaciones_acceso', 'horario_acceso',
        'persona_responsable', 'telefono_acceso', 'activo',
    ];

    protected $casts = [
        'latitud'  => 'decimal:7',
        'longitud' => 'decimal:7',
        'activo'   => 'boolean',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'ubicacion_id');
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class, 'ubicacion_id');
    }

    // Dirección completa formateada
    public function getDireccionCompletaAttribute(): string
    {
        return trim("{$this->direccion} {$this->numero}, {$this->cp} {$this->localidad} ({$this->provincia})");
    }
}
