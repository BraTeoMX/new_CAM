<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataFeed;
use App\Models\TicketOT;
use App\Models\AsignationOT;
use App\Models\FollowAtention;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        return view('pages.dashboard.dashboard');
    }

    public function getTimelineData(Request $request)
    {
        // Obtener todos los folios únicos de AsignationOT y FollowAtention
        $folios = AsignationOT::pluck('Folio')
            ->merge(FollowAtention::pluck('Folio'))
            ->unique();

        $timeline = [];

        foreach ($folios as $folio) {
            $asignation = AsignationOT::where('Folio', $folio)->first();
            $follow = FollowAtention::where('Folio', $folio)->orderBy('created_at')->first();

            if ($asignation && $follow) {
                // Calcular diferencia entre created_at de AsignationOT y updated_at de FollowAtention
                $diff = $follow->updated_at->diffInMinutes($asignation->created_at);

                $timeline[] = [
                    'Folio' => $folio,
                    'Modulo' => $follow->Modulo,
                    'Problema' => $follow->Problema,
                    'Maquina' => $follow->Maquina,
                    'Mecanico' => $follow->Mecanico,
                    'AsignationCreated' => $asignation->created_at,
                    'FollowCreated' => $follow->updated_at, // Fin de la línea de tiempo
                    'TimeInicio' => $follow->created_at,    // Marca intermedia en la línea de tiempo
                    'TiempoAtencionMin' => $diff,
                ];
            }
        }

        return response()->json($timeline);
    }

}
