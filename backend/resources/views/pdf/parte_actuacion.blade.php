<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Parte de Trabajo — Actuación #{{ $actuacion->id }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a1a1a; }
  .page { padding: 28px 32px; }

  .header { border-bottom: 2px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
  .header h1 { font-size: 16px; font-weight: bold; color: #1e40af; }
  .header .ref { font-size: 9px; color: #6b7280; margin-top: 2px; }
  .header-meta { text-align: right; font-size: 9px; color: #6b7280; }
  .header-meta .num { font-size: 14px; font-weight: bold; color: #111; font-family: monospace; }

  .section { margin-bottom: 14px; }
  .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px; }
  .fields { display: flex; flex-wrap: wrap; }
  .field { width: 33%; padding-right: 10px; margin-bottom: 8px; }
  .field.half { width: 50%; }
  .field.full { width: 100%; }
  .field-label { font-size: 8px; font-weight: bold; color: #9ca3af; text-transform: uppercase; }
  .field-value { font-size: 10px; color: #111; margin-top: 2px; line-height: 1.4; }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 8px; font-weight: bold; }
  .badge-green  { background: #dcfce7; color: #166534; }
  .badge-blue   { background: #dbeafe; color: #1e40af; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-gray   { background: #f3f4f6; color: #374151; }
  .badge-orange { background: #ffedd5; color: #9a3412; }

  .text-block { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; font-size: 10px; line-height: 1.5; color: #374151; min-height: 50px; }

  .firma-section { display: flex; gap: 20px; margin-top: 8px; }
  .firma-box { flex: 1; }
  .firma-box .firma-label { font-size: 9px; color: #6b7280; margin-bottom: 4px; }
  .firma-area { border: 1px solid #d1d5db; border-radius: 6px; height: 60px; }
  .firma-name { border-top: 1px solid #d1d5db; margin-top: 4px; padding-top: 4px; font-size: 9px; color: #9ca3af; text-align: center; }

  .footer { border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 16px; display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af; }
</style>
</head>
<body>
<div class="page">

  <!-- Cabecera -->
  <div class="header">
    <div>
      <h1>Parte de Trabajo</h1>
      <div class="ref">
        {{ $actuacion->equipo->cliente->razon_social ?? '' }} ·
        {{ $actuacion->equipo->ubicacion->nombre_centro ?? '' }}
      </div>
    </div>
    <div class="header-meta">
      <div class="num">PT-{{ str_pad($actuacion->id, 5, '0', STR_PAD_LEFT) }}</div>
      <div>{{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</div>
      @php
        $badgeEstado = match($actuacion->estado) {
          'completada' => 'badge-green',
          'en_curso' => 'badge-blue',
          'cancelada' => 'badge-gray',
          'pendiente_validacion' => 'badge-orange',
          default => 'badge-yellow',
        };
      @endphp
      <span class="badge {{ $badgeEstado }}" style="margin-top:4px; display:inline-block;">
        {{ str_replace('_', ' ', $actuacion->estado) }}
      </span>
    </div>
  </div>

  <!-- Datos de la actuación -->
  <div class="section">
    <div class="section-title">Datos de la actuación</div>
    <div class="fields">
      <div class="field">
        <div class="field-label">Tipo de actuación</div>
        <div class="field-value">{{ str_replace('_', ' ', $actuacion->tipo_actuacion) }}</div>
      </div>
      <div class="field">
        <div class="field-label">Origen</div>
        <div class="field-value">{{ str_replace('_', ' ', $actuacion->origen_actuacion) }}</div>
      </div>
      <div class="field">
        <div class="field-label">Estado</div>
        <div class="field-value">{{ str_replace('_', ' ', $actuacion->estado) }}</div>
      </div>
      <div class="field">
        <div class="field-label">Fecha inicio</div>
        <div class="field-value">{{ \Carbon\Carbon::parse($actuacion->fecha_inicio)->format('d/m/Y H:i') }}</div>
      </div>
      <div class="field">
        <div class="field-label">Fecha fin</div>
        <div class="field-value">{{ $actuacion->fecha_fin ? \Carbon\Carbon::parse($actuacion->fecha_fin)->format('d/m/Y H:i') : '—' }}</div>
      </div>
      <div class="field">
        <div class="field-label">Duración</div>
        <div class="field-value">{{ $actuacion->duracion_minutos ? $actuacion->duracion_minutos . ' min' : '—' }}</div>
      </div>
      <div class="field">
        <div class="field-label">Técnico responsable</div>
        <div class="field-value">{{ $actuacion->usuarioResponsable->name ?? '—' }}</div>
      </div>
      <div class="field">
        <div class="field-label">Actualiza expediente CE</div>
        <div class="field-value">{{ $actuacion->actualiza_expediente_ce ? 'Sí' : 'No' }}</div>
      </div>
    </div>
  </div>

  <!-- Equipo -->
  <div class="section">
    <div class="section-title">Equipo intervenido</div>
    <div class="fields">
      <div class="field">
        <div class="field-label">Código</div>
        <div class="field-value" style="font-family:monospace;">{{ $actuacion->equipo->codigo_equipo ?? '—' }}</div>
      </div>
      <div class="field">
        <div class="field-label">Descripción</div>
        <div class="field-value">{{ $actuacion->equipo->descripcion_corta ?? '—' }}</div>
      </div>
      <div class="field">
        <div class="field-label">Tipo</div>
        <div class="field-value">{{ $actuacion->equipo->tipoEquipo->nombre ?? '—' }}</div>
      </div>
      <div class="field">
        <div class="field-label">Ubicación</div>
        <div class="field-value">{{ $actuacion->equipo->ubicacion->nombre_centro ?? '—' }}</div>
      </div>
      <div class="field">
        <div class="field-label">Nº serie</div>
        <div class="field-value" style="font-family:monospace;">{{ $actuacion->equipo->numero_serie ?? '—' }}</div>
      </div>
    </div>
  </div>

  <!-- Resumen de trabajos -->
  <div class="section">
    <div class="section-title">Resumen de trabajos realizados</div>
    <div class="text-block">{{ $actuacion->resumen ?: '' }}</div>
  </div>

  <!-- Observaciones -->
  <div class="section">
    <div class="section-title">Observaciones / Incidencias</div>
    <div class="text-block">{{ $actuacion->observaciones ?: '' }}</div>
  </div>

  <!-- Firmas -->
  <div class="section">
    <div class="section-title">Firmas</div>
    <div class="firma-section">
      <div class="firma-box">
        <div class="firma-label">Técnico</div>
        <div class="firma-area"></div>
        <div class="firma-name">{{ $actuacion->usuarioResponsable->name ?? '___________________________' }}</div>
      </div>
      <div class="firma-box">
        <div class="firma-label">Cliente / Receptor</div>
        <div class="firma-area"></div>
        <div class="firma-name">___________________________</div>
      </div>
    </div>
  </div>

  <!-- Pie -->
  <div class="footer">
    <span>Portal Puertas — Gestión Técnica</span>
    <span>PT-{{ str_pad($actuacion->id, 5, '0', STR_PAD_LEFT) }} · {{ \Carbon\Carbon::now()->format('d/m/Y') }}</span>
  </div>

</div>
</body>
</html>
