<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataFeed;
use App\Models\TicketOT;
use App\Models\AsignationOT;
use App\Models\FollowAtention;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
                    'created_at' => $asignation->created_at, // <-- AGREGADO PARA FILTRO JS
                ];
            }
        }

        return response()->json($timeline);
    }

    public function getEfectividad(Request $request)
    {
        $year = $request->query('year');
        $month = $request->query('month');
        $day = $request->query('day');

        // Obtener todos los tickets con join a FollowAtention
        $query = DB::table('asignation_ots')
            ->join('followatention', 'asignation_ots.Folio', '=', 'followatention.Folio')
            ->select(
                'asignation_ots.created_at as asignation_created',
                'followatention.TimeEstimado',
                'followatention.created_at as follow_created',
                'followatention.updated_at as follow_updated'
            );

        // Filtros por año, mes, día sobre la fecha de creación del ticket
        if ($year) {
            $query->whereYear('asignation_ots.created_at', $year);
        }
        if ($month !== null && $month !== '') {
            $query->whereMonth('asignation_ots.created_at', $month + 1); // JS months are 0-based
        }
        if ($day) {
            $query->whereDay('asignation_ots.created_at', $day);
        }

        $tickets = $query->get();

        $total = $tickets->count();
        $efectivos = 0;

        foreach ($tickets as $t) {
            // Si alguna fecha falta, no se cuenta
            if (!$t->asignation_created || !$t->follow_created || !$t->follow_updated || !$t->TimeEstimado) continue;

            $inicio = \Carbon\Carbon::parse($t->follow_created);
            $fin = \Carbon\Carbon::parse($t->follow_updated);

            $minutos = $fin->diffInMinutes($inicio);

            // Efectivo si el tiempo real es menor o igual al estimado
            if ($minutos <= intval($t->TimeEstimado)) {
                $efectivos++;
            }
        }

        $efectividad = $total > 0 ? round(($efectivos / $total) * 100, 2) : 0;

        return response()->json([
            'efectividad' => $efectividad,
            'total' => $total,
            'efectivos' => $efectivos,
        ]);
    }
}
