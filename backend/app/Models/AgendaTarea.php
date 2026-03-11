<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgendaTarea extends Model
{
    protected $table = 'agenda_tareas';

    protected $fillable = [
        'tipo_tarea', 'referencia_entidad_tipo', 'referencia_entidad_id',
        'equipo_id', 'tecnico_id', 'fecha_programada', 'franja_horaria',
        'prioridad', 'estado', 'observaciones',
    ];

    protected $casts = [
        'fecha_programada' => 'datetime',
    ];

    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }
}
