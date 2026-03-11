<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Equipo extends Model
{
    use SoftDeletes;

    protected $table = 'equipos';

    protected $fillable = [
        'cliente_id', 'ubicacion_id', 'tipo_equipo_id',
        'codigo_equipo', 'numero_serie', 'referencia_interna',
        'descripcion_corta', 'descripcion_tecnica', 'fabricante', 'marca', 'modelo',
        'uso_previsto', 'uso_real',
        'fecha_fabricacion', 'fecha_instalacion', 'fecha_puesta_servicio',
        'estado_equipo', 'origen_equipo',
        'ancho_paso', 'alto_paso', 'ancho_hoja', 'alto_hoja',
        'peso_estimado', 'numero_hojas', 'material_principal', 'acabado', 'color',
        'tipo_apertura', 'velocidad_apertura', 'velocidad_cierre',
        'tiene_marcado_ce', 'expediente_ce_generado', 'declaracion_conformidad_emitida',
        'declaracion_prestaciones_emitida', 'manual_usuario_emitido',
        'manual_mantenimiento_emitido', 'libro_mantenimiento_activo',
        'evaluacion_riesgos_realizada', 'estado_normativo', 'fecha_ultima_revision_normativa',
        'tecnico_responsable_id', 'criticidad', 'revision_periodica_requerida',
        'periodicidad_mantenimiento', 'fecha_proximo_mantenimiento',
        'qr_token', 'observaciones_generales', 'activo',
    ];

    protected $casts = [
        'fecha_fabricacion'              => 'date',
        'fecha_instalacion'              => 'date',
        'fecha_puesta_servicio'          => 'date',
        'fecha_ultima_revision_normativa'=> 'date',
        'fecha_proximo_mantenimiento'    => 'date',
        'tiene_marcado_ce'               => 'boolean',
        'expediente_ce_generado'         => 'boolean',
        'declaracion_conformidad_emitida'=> 'boolean',
        'declaracion_prestaciones_emitida'=> 'boolean',
        'manual_usuario_emitido'         => 'boolean',
        'manual_mantenimiento_emitido'   => 'boolean',
        'libro_mantenimiento_activo'     => 'boolean',
        'evaluacion_riesgos_realizada'   => 'boolean',
        'revision_periodica_requerida'   => 'boolean',
        'activo'                         => 'boolean',
        'ancho_paso'                     => 'decimal:2',
        'alto_paso'                      => 'decimal:2',
        'peso_estimado'                  => 'decimal:2',
        'velocidad_apertura'             => 'decimal:2',
        'velocidad_cierre'               => 'decimal:2',
    ];

    // Genera automáticamente el QR token al crear
    protected static function booted(): void
    {
        static::creating(function (Equipo $equipo) {
            if (empty($equipo->qr_token)) {
                $equipo->qr_token = Str::uuid()->toString();
            }
        });
    }

    // --- Relaciones ---

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function ubicacion(): BelongsTo
    {
        return $this->belongsTo(Ubicacion::class, 'ubicacion_id');
    }

    public function tipoEquipo(): BelongsTo
    {
        return $this->belongsTo(TipoEquipo::class, 'tipo_equipo_id');
    }

    public function tecnicoResponsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_responsable_id');
    }

    public function componentes(): HasMany
    {
        return $this->hasMany(Componente::class, 'equipo_id');
    }

    public function actuaciones(): HasMany
    {
        return $this->hasMany(Actuacion::class, 'equipo_id')->orderByDesc('fecha_inicio');
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(ContratoEquipo::class, 'equipo_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(Archivo::class, 'entidad_id')
                    ->where('entidad_tipo', 'equipo');
    }

    public function qrToken(): HasOne
    {
        return $this->hasOne(QrToken::class, 'equipo_id')->where('activo', true);
    }

    // --- Accessors ---

    // Porcentaje de completitud del expediente CE
    public function getCompletitudCeAttribute(): int
    {
        $campos = [
            'tiene_marcado_ce', 'expediente_ce_generado', 'declaracion_conformidad_emitida',
            'manual_usuario_emitido', 'manual_mantenimiento_emitido',
            'libro_mantenimiento_activo', 'evaluacion_riesgos_realizada',
        ];
        $completados = collect($campos)->filter(fn($c) => (bool) $this->$c)->count();
        return (int) round(($completados / count($campos)) * 100);
    }

    // ¿Tiene revisión vencida?
    public function getRevisionVencidaAttribute(): bool
    {
        return $this->fecha_proximo_mantenimiento
            && $this->fecha_proximo_mantenimiento->isPast();
    }
}
