<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataFeed;
use App\Models\TicketOT;
use App\Models\AsignationOT;
use App\Models\FollowAtention;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
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

        $query = DB::table('asignation_ots')
            ->join('followatention', 'asignation_ots.Folio', '=', 'followatention.Folio')
            ->select(
                'asignation_ots.created_at as asignation_created',
                'followatention.TimeEstimado',
                'followatention.created_at as follow_created',
                'followatention.updated_at as follow_updated'
            );

        if ($year) $query->whereYear('asignation_ots.created_at', $year);
        if ($month !== null && $month !== '') $query->whereMonth('asignation_ots.created_at', $month + 1);
        if ($day) $query->whereDay('asignation_ots.created_at', $day);

        $tickets = $query->get();

        // Si no hay datos, buscar el mes más reciente con datos
        if ($tickets->isEmpty()) {
            $fallback = DB::table('asignation_ots')
                ->join('followatention', 'asignation_ots.Folio', '=', 'followatention.Folio')
                ->select(
                    DB::raw('YEAR(asignation_ots.created_at) as year'),
                    DB::raw('MONTH(asignation_ots.created_at) as month')
                )
                ->orderByDesc('asignation_ots.created_at')
                ->first();
            if ($fallback) {
                $year = $fallback->year;
                $month = $fallback->month - 1; // JS expects 0-based
                // Repetir consulta con el mes más reciente
                $query = DB::table('asignation_ots')
                    ->join('followatention', 'asignation_ots.Folio', '=', 'followatention.Folio')
                    ->select(
                        'asignation_ots.created_at as asignation_created',
                        'followatention.TimeEstimado',
                        'followatention.created_at as follow_created',
                        'followatention.updated_at as follow_updated'
                    )
                    ->whereYear('asignation_ots.created_at', $year)
                    ->whereMonth('asignation_ots.created_at', $month + 1);
                $tickets = $query->get();
            }
        }

        $total = $tickets->count();
        $efectivos = 0;

        foreach ($tickets as $t) {
            if (!$t->asignation_created || !$t->follow_created || !$t->follow_updated || !$t->TimeEstimado) continue;
            $inicio = \Carbon\Carbon::parse($t->follow_created);
            $fin = \Carbon\Carbon::parse($t->follow_updated);
            $minutos = $fin->diffInMinutes($inicio);
            list($h, $m, $s) = explode(':', $t->TimeEstimado);
            $estimadoMin = ($h * 60) + $m + ($s > 0 ? 1 : 0);
            if ($minutos <= $estimadoMin) {
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
    public function tops()
    {
        // Top 3 máquinas con más problemas
        $topMaquinas = \App\Models\AsignationOT::select('Maquina', DB::raw('count(*) as total'))
            ->whereNotNull('Maquina')
            ->groupBy('Maquina')
            ->orderByDesc('total')
            ->limit(3)
            ->get();

        // Top 3 módulos con mayor generación de tickets
        $topModulos = \App\Models\AsignationOT::select('Modulo', DB::raw('count(*) as total'))
            ->whereNotNull('Modulo')
            ->groupBy('Modulo')
            ->orderByDesc('total')
            ->limit(3)
            ->get();

        // Agrupar problemas similares usando Gemini API
        $problemasRaw = \App\Models\AsignationOT::whereNotNull('Problema')->pluck('Problema')->toArray();
        $geminiApiKey = env('GEMINI_API_KEY');
        // Usa el modelo correcto y endpoint actualizado
        $geminiEndpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' . $geminiApiKey;
        $prompt = "Agrupa y cuenta los siguientes problemas de tickets que sean iguales o muy parecidos, aunque tengan diferencias de redacción. Devuélveme un JSON con los 3 problemas más frecuentes y su cantidad, con el formato: [{\"problema\": \"nombre\", \"total\": cantidad}, ...]. Lista de problemas:\n" . implode("\n", $problemasRaw);
        $response = \Illuminate\Support\Facades\Http::post($geminiEndpoint, [
            "contents" => [
                [
                    "role" => "user",
                    "parts" => [
                        ["text" => $prompt]
                    ]
                ]
            ]
        ]);
        $topProblemas = [];
        if ($response->ok()) {
            $geminiText = data_get($response->json(), 'candidates.0.content.parts.0.text');
            // --- LIMPIEZA DEL BLOQUE MARKDOWN ---
            if ($geminiText) {
                // Elimina bloques de código markdown y espacios
                $geminiText = preg_replace('/^```json|^```/m', '', $geminiText);
                $geminiText = preg_replace('/```$/m', '', $geminiText);
                $geminiText = trim($geminiText);
            }
            $topProblemas = json_decode($geminiText, true);
            if (!is_array($topProblemas)) {
                $topProblemas = \App\Models\AsignationOT::select('Problema', DB::raw('count(*) as total'))
                    ->whereNotNull('Problema')
                    ->groupBy('Problema')
                    ->orderByDesc('total')
                    ->limit(3)
                    ->get();
            }
        } else {
            $topProblemas = \App\Models\AsignationOT::select('Problema', DB::raw('count(*) as total'))
                ->whereNotNull('Problema')
                ->groupBy('Problema')
                ->orderByDesc('total')
                ->limit(3)
                ->get();
        }
        // Cuarto top preparado (ejemplo: top supervisores u otro)
        $topExtra = []; // Aquí puedes agregar la lógica para el cuarto top

        return response()->json([
            'maquinas' => $topMaquinas,
            'problemas' => $topProblemas,
            'modulos' => $topModulos,
            'extra' => $topExtra,
        ]);
    }

    public function creadasVsCompletadas(Request $request)
    {
        $year = $request->query('year');
        $month = $request->query('month');
        $day = $request->query('day');

        // Si no hay año/mes específico, usar el actual
        if (!$year || !isset($month)) {
            $now = now();
            $year = $now->year;
            $month = $now->month - 1; // JS expects 0-based
        }

        $creadasQuery = \App\Models\AsignationOT::selectRaw('DATE(created_at) as date, COUNT(*) as creadas')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month + 1);

        if ($day) $creadasQuery->whereDay('created_at', $day);
        $creadasPorDia = $creadasQuery->groupBy('date')->orderBy('date')->get()->keyBy('date');

        // Si no hay datos para el mes solicitado, buscar el mes más reciente con datos
        if ($creadasPorDia->isEmpty()) {
            $lastRecord = \App\Models\AsignationOT::latest('created_at')->first();
            if ($lastRecord) {
                $year = $lastRecord->created_at->year;
                $month = $lastRecord->created_at->month - 1;

                $creadasPorDia = \App\Models\AsignationOT::selectRaw('DATE(created_at) as date, COUNT(*) as creadas')
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month + 1)
                    ->groupBy('date')->orderBy('date')->get()->keyBy('date');
            }
        }

        $completadasQuery = FollowAtention::selectRaw('DATE(followatention.updated_at) as date, COUNT(DISTINCT followatention.Folio) as completadas')
            ->join('asignation_ots', 'asignation_ots.Folio', '=', 'followatention.Folio')
            ->whereNotNull('followatention.updated_at')
            ->whereYear('followatention.updated_at', $year)
            ->whereMonth('followatention.updated_at', $month + 1);
        if ($day) $completadasQuery->whereDay('followatention.updated_at', $day);
        $completadasPorDia = $completadasQuery->groupBy('date')->orderBy('date')->get()->keyBy('date');

        // Si ambos están vacíos, buscar el mes más reciente con datos (y traer TODO el mes)
        if ($creadasPorDia->isEmpty() && $completadasPorDia->isEmpty()) {
            $lastMonth = \App\Models\AsignationOT::select(
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('MONTH(created_at) as month')
                )
                ->orderByDesc('created_at')
                ->first();
            if ($lastMonth) {
                $year = $lastMonth->year;
                $month = $lastMonth->month - 1; // JS expects 0-based

                $creadasPorDia = \App\Models\AsignationOT::selectRaw('DATE(created_at) as date, COUNT(*) as creadas')
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month + 1)
                    ->groupBy('date')->orderBy('date')->get()->keyBy('date');
                $completadasPorDia = FollowAtention::selectRaw('DATE(followatention.updated_at) as date, COUNT(DISTINCT followatention.Folio) as completadas')
                    ->join('asignation_ots', 'asignation_ots.Folio', '=', 'followatention.Folio')
                    ->whereNotNull('followatention.updated_at')
                    ->whereYear('followatention.updated_at', $year)
                    ->whereMonth('followatention.updated_at', $month + 1)
                    ->groupBy('date')->orderBy('date')->get()->keyBy('date');
            }
        }

        $fechas = collect($creadasPorDia->keys())
            ->merge($completadasPorDia->keys())
            ->unique()
            ->sort()
            ->values();

        $result = [];
        foreach ($fechas as $fecha) {
            $result[] = [
                'date' => $fecha,
                'creadas' => (int) ($creadasPorDia[$fecha]->creadas ?? 0),
                'completadas' => (int) ($completadasPorDia[$fecha]->completadas ?? 0),
            ];
        }

        return response()->json($result);
    }

    public function minutosMaquinasDescompuestas()
    {
        $asignaciones = \App\Models\AsignationOT::all()->keyBy('Folio');
        $follows = \App\Models\FollowAtention::all()->keyBy('Folio');

        // Si no hay datos, intenta buscar el registro más reciente y devolverlo
        if ($asignaciones->isEmpty() || $follows->isEmpty()) {
            $lastAsignacion = \App\Models\AsignationOT::orderByDesc('created_at')->first();
            $lastFollow = \App\Models\FollowAtention::orderByDesc('updated_at')->first();
            if ($lastAsignacion && $lastFollow) {
                $asignaciones = collect([$lastAsignacion])->keyBy('Folio');
                $follows = collect([$lastFollow])->keyBy('Folio');
            }
        }

        $modulosPorPlanta = [
            'Planta Ixtlahuaca' => [],
            'Planta San Bartolo' => [],
        ];
        $globalMinutos = 0;
        $globalTickets = 0;
        $detalleFolios = [];

        $eficientes = 0; // Ejemplo: tickets resueltos en menos de 60 minutos

        foreach ($asignaciones as $folio => $asig) {
            if (!isset($follows[$folio])) continue;
            $follow = $follows[$folio];

            if (!$asig->created_at || !$asig->TimeAutReal || !$follow->updated_at) continue;

            // Corregido: TimeAutReal es minutos:segundos
            $parts = explode(':', $asig->TimeAutReal);
            $min = isset($parts[0]) ? intval($parts[0]) : 0;
            $sec = isset($parts[1]) ? intval($parts[1]) : 0;

            $horaLevantamiento = \Carbon\Carbon::parse($asig->created_at);
            $horaInicioReal = $horaLevantamiento->copy()->subMinutes($min)->subSeconds($sec);
            $horaAtencion = \Carbon\Carbon::parse($follow->updated_at);
            $minutosResolucion = $horaAtencion->diffInMinutes($horaInicioReal);

            $globalMinutos += $minutosResolucion;
            $globalTickets++;

            if ($minutosResolucion <= 60) $eficientes++;

            $modulo = intval($follow->Modulo);
            if ($modulo >= 100 && $modulo < 200) {
                $planta = 'Planta Ixtlahuaca';
            } elseif ($modulo >= 200) {
                $planta = 'Planta San Bartolo';
            } else {
                $planta = 'Desconocida';
            }

            if (!isset($modulosPorPlanta[$planta][$modulo])) {
                $modulosPorPlanta[$planta][$modulo] = [
                    'modulo' => $modulo,
                    'minutos' => 0,
                    'tickets' => 0,
                    'folios' => [],
                ];
            }
            $modulosPorPlanta[$planta][$modulo]['minutos'] += $minutosResolucion;
            $modulosPorPlanta[$planta][$modulo]['tickets']++;
            $modulosPorPlanta[$planta][$modulo]['folios'][] = [
                'folio' => $folio,
                'modulo' => $modulo,
                'minutos' => $minutosResolucion,
                'supervisor' => $follow->Supervisor ?? '',
            ];

            // Para tabla global
            $detalleFolios[] = [
                'folio' => $folio,
                'modulo' => $modulo,
                'minutos' => $minutosResolucion,
                'planta' => $planta,
                'supervisor' => $follow->Supervisor ?? '',
            ];
        }

        $plantas = [];
        foreach ($modulosPorPlanta as $planta => $modulos) {
            $totalMin = 0;
            $totalTickets = 0;
            $modulosArr = [];
            $detallePlanta = [];
            foreach ($modulos as $mod) {
                $totalMin += $mod['minutos'];
                $totalTickets += $mod['tickets'];
                $modulosArr[] = [
                    'modulo' => $mod['modulo'],
                    'minutos' => $mod['minutos'],
                    'tickets' => $mod['tickets'],
                ];
                foreach ($mod['folios'] as $folioDet) {
                    $detallePlanta[] = $folioDet;
                }
            }
            $plantas[] = [
                'planta' => $planta,
                'minutos' => $totalMin,
                'tickets' => $totalTickets,
                'modulos' => $modulosArr,
                'detalle' => $detallePlanta,
            ];
        }

        $eficiencia = $globalTickets > 0 ? round(($eficientes / $globalTickets) * 100, 2) : 0;

        // Ejemplo de cálculo extra: promedio de minutos por ticket
        $promedioMin = $globalTickets > 0 ? round($globalMinutos / $globalTickets, 2) : 0;

        return response()->json([
            'global' => [
                'minutos' => $globalMinutos,
                'tickets' => $globalTickets,
                'eficiencia' => $eficiencia,
                'promedio_min' => $promedioMin,
                'detalle' => $detalleFolios,
            ],
            'plantas' => $plantas,
        ]);
    }
}
