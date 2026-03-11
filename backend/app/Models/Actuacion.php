<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Actuacion extends Model
{
    use SoftDeletes;

    protected $table = 'actuaciones';

    protected $fillable = [
        'equipo_id', 'contrato_id', 'tipo_actuacion', 'fecha_inicio', 'fecha_fin',
        'usuario_responsable_id', 'equipo_tecnico', 'origen_actuacion', 'estado',
        'resumen', 'observaciones', 'actualiza_expediente_ce', 'duracion_minutos',
    ];

    protected $casts = [
        'fecha_inicio'            => 'datetime',
        'fecha_fin'               => 'datetime',
        'equipo_tecnico'          => 'array',
        'actualiza_expediente_ce' => 'boolean',
    ];

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function usuarioResponsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_responsable_id');
    }

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    public function instalacionDetalle(): HasOne
    {
        return $this->hasOne(InstalacionDetalle::class, 'actuacion_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(Archivo::class, 'entidad_id')
                    ->where('entidad_tipo', 'actuacion');
    }

    public function firmas(): HasMany
    {
        return $this->hasMany(Firma::class, 'entidad_id')
                    ->where('entidad_tipo', 'actuacion');
    }
}
