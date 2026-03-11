<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    use SoftDeletes;

    protected $table = 'clientes';

    protected $fillable = [
        'codigo_interno', 'razon_social', 'nombre_comercial', 'cif_nif',
        'direccion_fiscal', 'poblacion', 'provincia', 'codigo_postal', 'pais',
        'telefono', 'email', 'web', 'observaciones', 'activo', 'fecha_baja',
    ];

    protected $casts = [
        'activo'     => 'boolean',
        'fecha_baja' => 'datetime',
    ];

    // Un cliente tiene muchas ubicaciones
    public function ubicaciones(): HasMany
    {
        return $this->hasMany(Ubicacion::class, 'cliente_id');
    }

    // Un cliente tiene muchos contactos
    public function contactos(): HasMany
    {
        return $this->hasMany(ContactoCliente::class, 'cliente_id');
    }

    // Un cliente tiene muchos equipos directamente
    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'cliente_id');
    }

    // Un cliente tiene muchos contratos
    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class, 'cliente_id');
    }

    // Devuelve el nombre visible (comercial si existe, sino razón social)
    public function getNombreDisplayAttribute(): string
    {
        return $this->nombre_comercial ?? $this->razon_social;
    }
}
