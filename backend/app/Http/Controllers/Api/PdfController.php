<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actuacion;
use App\Models\Equipo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PdfController extends Controller
{
    /**
     * Genera la ficha completa de un equipo en PDF.
     */
    public function fichaEquipo(Equipo $equipo): Response
    {
        $equipo->load([
            'cliente', 'ubicacion', 'tipoEquipo', 'componentes',
            'actuaciones' => fn($q) => $q->with('usuarioResponsable')
                                         ->orderByDesc('fecha_inicio')
                                         ->limit(10),
        ]);

        $equipo->append(['completitud_ce', 'revision_vencida']);

        $actuaciones = $equipo->actuaciones;

        $pdf = Pdf::loadView('pdf.ficha_equipo', compact('equipo', 'actuaciones'));
        $pdf->setPaper('A4', 'portrait');

        $nombre = 'ficha-' . strtolower($equipo->codigo_equipo) . '.pdf';

        return $pdf->download($nombre);
    }

    /**
     * Genera el parte de trabajo de una actuación en PDF.
     */
    public function parteActuacion(Actuacion $actuacion): Response
    {
        $actuacion->load([
            'equipo.cliente',
            'equipo.ubicacion',
            'equipo.tipoEquipo',
            'usuarioResponsable',
        ]);

        $pdf = Pdf::loadView('pdf.parte_actuacion', compact('actuacion'));
        $pdf->setPaper('A4', 'portrait');

        $nombre = 'parte-' . str_pad($actuacion->id, 5, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->download($nombre);
    }
}
