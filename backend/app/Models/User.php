<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name', 'email', 'password', 'telefono', 'movil',
        'perfil', 'activo', 'firma_imagen_ruta', 'ultimo_acceso',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'ultimo_acceso'     => 'datetime',
        'password'          => 'hashed',
        'activo'            => 'boolean',
    ];

    // Equipos asignados como técnico responsable
    public function equiposResponsable(): HasMany
    {
        return $this->hasMany(Equipo::class, 'tecnico_responsable_id');
    }

    // Actuaciones realizadas
    public function actuaciones(): HasMany
    {
        return $this->hasMany(Actuacion::class, 'usuario_responsable_id');
    }

    // Tareas en agenda
    public function tareas(): HasMany
    {
        return $this->hasMany(AgendaTarea::class, 'tecnico_id');
    }
}
