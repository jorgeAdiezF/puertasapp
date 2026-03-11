<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QrToken extends Model
{
    protected $table = 'qr_tokens';

    protected $fillable = ['equipo_id', 'token', 'activo', 'total_escaneos', 'ultimo_escaneo'];

    protected $casts = [
        'activo'         => 'boolean',
        'ultimo_escaneo' => 'datetime',
    ];

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }
}
