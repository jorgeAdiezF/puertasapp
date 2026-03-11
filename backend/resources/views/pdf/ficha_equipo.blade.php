<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Ficha de Equipo — {{ $equipo->codigo_equipo }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1a1a1a; }
  .page { padding: 28px 32px; }

  /* Cabecera */
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; }
  .header-title h1 { font-size: 16px; font-weight: bold; color: #1e40af; }
  .header-title p { font-size: 9px; color: #6b7280; margin-top: 2px; }
  .header-meta { text-align: right; font-size: 9px; color: #6b7280; }
  .header-meta .codigo { font-size: 13px; font-weight: bold; color: #111; font-family: monospace; }

  /* Secciones */
  .section { margin-bottom: 14px; }
  .section-title { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px; }

  /* Grid de campos */
  .fields { display: flex; flex-wrap: wrap; gap: 6px 0; }
  .field { width: 33%; padding-right: 10px; margin-bottom: 6px; }
  .field-label { font-size: 8px; font-weight: bold; color: #9ca3af; text-transform: uppercase; }
  .field-value { font-size: 10px; color: #111; margin-top: 1px; }

  /* Badge estado */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 8px; font-weight: bold; }
  .badge-green  { background: #dcfce7; color: #166534; }
  .badge-red    { background: #fee2e2; color: #991b1b; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-orange { background: #ffedd5; color: #9a3412; }
  .badge-gray   { background: #f3f4f6; color: #374151; }

  /* Check CE */
  .ce-grid { display: flex; flex-wrap: wrap; }
  .ce-item { width: 50%; display: flex; align-items: center; gap: 5px; padding: 3px 0; font-size: 9px; }
  .check-yes { color: #16a34a; font-weight: bold; }
  .check-no  { color: #9ca3af; }
  .progress-bar-bg { background: #e5e7eb; border-radius: 4px; height: 8px; margin-top: 4px; }
  .progress-bar-fill { background: #2563eb; border-radius: 4px; height: 8px; }

  /* Tabla componentes */
  table { width: 100%; border-collapse: collapse; font-size: 9px; }
  th { background: #f3f4f6; text-align: left; padding: 5px 8px; font-weight: bold; color: #6b7280; text-transform: uppercase; font-size: 8px; }
  td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }

  /* Pie */
  .footer { border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 16px; display: flex; justify-content: space-between; font-size: 8px; color: #9ca3af; }

  /* Firma */
  .firma-box { border: 1px solid #d1d5db; border-radius: 6px; height: 50px; margin-top: 6px; }
</style>
</head>
<body>
<div class="page">

  <!-- Cabecera -->
  <div class="header">
    <div class="header-title">
      <h1>Ficha de Equipo</h1>
      <p>{{ $equipo->cliente->razon_social ?? '' }} · {{ $equipo->ubicacion->nombre_centro ?? '' }}</p>
    </div>
    <div class="header-meta">
      <div class="codigo">{{ $equipo->codigo_equipo }}</div>
      <div>Generado: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</div>
      @php
        $badgeClass = match($equipo->estado_normativo) {
          'conforme' => 'badge-green',
          'no_conforme' => 'badge-red',
          'en_proceso' => 'badge-yellow',
          'requiere_adecuacion' => 'badge-orange',
          default => 'badge-gray',
        };
        $labelEstado = [
          'conforme' => 'Conforme', 'no_conforme' => 'No conforme',
          'en_proceso' => 'En proceso', 'requiere_adecuacion' => 'Requiere adecuación',
          'sin_evaluar' => 'Sin evaluar',
        ][$equipo->estado_normativo] ?? $equipo->estado_normativo;
      @endphp
      <span class="badge {{ $badgeClass }}" style="margin-top:4px; display:inline-block;">{{ $labelEstado }}</span>
    </div>
  </div>

  <!-- Información general -->
  <div class="section">
    <div class="section-title">Información general</div>
    <div class="fields">
      <div class="field"><div class="field-label">Descripción</div><div class="field-value">{{ $equipo->descripcion_corta }}</div></div>
      <div class="field"><div class="field-label">Tipo de equipo</div><div class="field-value">{{ $equipo->tipoEquipo->nombre ?? '—' }}</div></div>
      <div class="field"><div class="field-label">Tipo apertura</div><div class="field-value">{{ $equipo->tipo_apertura ?? '—' }}</div></div>
      <div class="field"><div class="field-label">Fabricante</div><div class="field-value">{{ $equipo->fabricante ?? '—' }}</div></div>
      <div class="field"><div class="field-label">Marca / Modelo</div><div class="field-value">{{ implode(' / ', array_filter([$equipo->marca, $equipo->modelo])) ?: '—' }}</div></div>
      <div class="field"><div class="field-label">Nº serie</div><div class="field-value">{{ $equipo->numero_serie ?? '—' }}</div></div>
      <div class="field"><div class="field-label">Fecha instalación</div><div class="field-value">{{ $equipo->fecha_instalacion ? \Carbon\Carbon::parse($equipo->fecha_instalacion)->format('d/m/Y') : '—' }}</div></div>
      <div class="field"><div class="field-label">Ancho paso</div><div class="field-value">{{ $equipo->ancho_paso ? $equipo->ancho_paso . ' m' : '—' }}</div></div>
      <div class="field"><div class="field-label">Alto paso</div><div class="field-value">{{ $equipo->alto_paso ? $equipo->alto_paso . ' m' : '—' }}</div></div>
      <div class="field"><div class="field-label">Criticidad</div><div class="field-value">{{ $equipo->criticidad ?? '—' }}</div></div>
      <div class="field"><div class="field-label">Periodicidad mantenimiento</div><div class="field-value">{{ $equipo->periodicidad_mantenimiento ? $equipo->periodicidad_mantenimiento . ' días' : '—' }}</div></div>
      <div class="field"><div class="field-label">Próx. mantenimiento</div><div class="field-value">{{ $equipo->fecha_proximo_mantenimiento ? \Carbon\Carbon::parse($equipo->fecha_proximo_mantenimiento)->format('d/m/Y') : '—' }}</div></div>
    </div>
  </div>

  <!-- Expediente CE -->
  <div class="section">
    <div class="section-title">
      Expediente CE — Completitud: {{ $equipo->completitud_ce }}%
    </div>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" style="width: {{ $equipo->completitud_ce }}%;"></div>
    </div>
    <div class="ce-grid" style="margin-top:8px;">
      @php
        $camposCE = [
          ['tiene_marcado_ce',               'Marcado CE'],
          ['expediente_ce_generado',          'Expediente técnico'],
          ['declaracion_conformidad_emitida', 'Declaración de conformidad'],
          ['declaracion_prestaciones_emitida','Declaración de prestaciones'],
          ['manual_usuario_emitido',          'Manual de usuario'],
          ['manual_mantenimiento_emitido',    'Manual de mantenimiento'],
          ['libro_mantenimiento_activo',      'Libro de mantenimiento'],
          ['evaluacion_riesgos_realizada',    'Evaluación de riesgos'],
        ];
      @endphp
      @foreach($camposCE as [$campo, $label])
        <div class="ce-item">
          @if($equipo->$campo)
            <span class="check-yes">✓</span>
          @else
            <span class="check-no">✗</span>
          @endif
          {{ $label }}
        </div>
      @endforeach
    </div>
  </div>

  <!-- Componentes -->
  @if($equipo->componentes->count() > 0)
  <div class="section">
    <div class="section-title">Componentes ({{ $equipo->componentes->count() }})</div>
    <table>
      <thead>
        <tr>
          <th>Categoría</th>
          <th>Fabricante / Modelo</th>
          <th>Nº serie</th>
          <th>Estado</th>
          <th>F. instalación</th>
        </tr>
      </thead>
      <tbody>
        @foreach($equipo->componentes as $c)
        <tr>
          <td>{{ str_replace('_', ' ', $c->categoria) }}{{ $c->subcategoria ? ' · ' . $c->subcategoria : '' }}</td>
          <td>{{ implode(' · ', array_filter([$c->fabricante, $c->modelo])) ?: '—' }}</td>
          <td style="font-family:monospace;">{{ $c->numero_serie ?? '—' }}</td>
          <td>{{ $c->estado }}{{ $c->es_critico ? ' ⚡' : '' }}</td>
          <td>{{ $c->fecha_instalacion ? \Carbon\Carbon::parse($c->fecha_instalacion)->format('d/m/Y') : '—' }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
  @endif

  <!-- Últimas actuaciones -->
  @if($actuaciones->count() > 0)
  <div class="section">
    <div class="section-title">Últimas actuaciones</div>
    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Fecha</th>
          <th>Responsable</th>
          <th>Estado</th>
          <th>Resumen</th>
        </tr>
      </thead>
      <tbody>
        @foreach($actuaciones as $a)
        <tr>
          <td>{{ str_replace('_', ' ', $a->tipo_actuacion) }}</td>
          <td>{{ \Carbon\Carbon::parse($a->fecha_inicio)->format('d/m/Y') }}</td>
          <td>{{ $a->usuarioResponsable->name ?? '—' }}</td>
          <td>{{ str_replace('_', ' ', $a->estado) }}</td>
          <td>{{ \Illuminate\Support\Str::limit($a->resumen, 60) }}</td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
  @endif

  <!-- Observaciones -->
  @if($equipo->observaciones_generales)
  <div class="section">
    <div class="section-title">Observaciones</div>
    <p style="font-size:9px; color:#374151; line-height:1.5;">{{ $equipo->observaciones_generales }}</p>
  </div>
  @endif

  <!-- Pie -->
  <div class="footer">
    <span>Portal Puertas — Gestión Técnica</span>
    <span>{{ $equipo->codigo_equipo }} · {{ \Carbon\Carbon::now()->format('d/m/Y') }}</span>
  </div>

</div>
</body>
</html>
