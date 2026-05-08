<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactoCliente extends Model
{
    protected $table = 'contactos_cliente';

    protected $fillable = [
        'cliente_id', 'nombre', 'apellidos', 'cargo',
        'telefono', 'movil', 'email', 'preferencia_contacto',
        'contacto_principal', 'observaciones', 'activo',
    ];

    protected $casts = [
        'contacto_principal' => 'boolean',
        'activo'             => 'boolean',
    ];
}
