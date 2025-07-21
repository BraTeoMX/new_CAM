<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\TicketOt;
use App\Models\AsignacionOt;
use App\Models\CatalogoEstado;
use App\Models\CatalogoArea;
use App\Models\DiagnosticoSolucion;
use App\Models\TiempoBahia;

class DashboardV2Controller extends Controller
{
    public function index()
    {
        return view('dashboard.index');
    }

    /**
     * Obtiene y devuelve los meses del año actual que tienen registros en `tickets_ot`.
     * Esta función está diseñada para ser llamada vía AJAX.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerMeses()
    {
        try {
            $currentYear = Carbon::now()->year;

            // Consulta para obtener los meses únicos del año actual que tienen tickets.
            // Se ordena de forma descendente para que el mes más reciente aparezca primero.
            $monthsData = TicketOt::select(
                    DB::raw('DISTINCT MONTH(created_at) as month_number')
                )
                ->whereYear('created_at', $currentYear)
                ->orderBy('month_number', 'desc') // Ordenar de más reciente a más antiguo
                ->get();
            
            // Si no se encuentran meses, devuelve un array vacío.
            if ($monthsData->isEmpty()) {
                return response()->json([]);
            }

            // Transforma la colección para que sea fácil de usar en JavaScript.
            // Incluye el número del mes y el nombre traducido.
            $formattedMonths = $monthsData->map(function ($item) {
                return [
                    'value' => $item->month_number,
                    'text' => Carbon::create()->month($item->month_number)->translatedFormat('F') // ej. "Julio"
                ];
            });

            return response()->json($formattedMonths);

        } catch (\Exception $e) {
            // En caso de un error de base de datos, devuelve un error 500.
            // Log::error('Error al obtener meses del dashboard: ' . $e->getMessage()); // Opcional: loguear el error
            return response()->json(['error' => 'No se pudieron cargar los datos de los meses.'], 500);
        }
    }

    public function calcularMinutos(Request $request)
    {
        Log::info('Calcular minutos - Request data: ', $request->all());
        $month = $request->input('month', Carbon::now()->month);
        $year = Carbon::now()->year;

        // 1. LA CONSULTA ÚNICA Y OPTIMIZADA
        // Traemos todos los tickets del mes con sus relaciones anidadas,
        // seleccionando solo las columnas que realmente necesitamos.
        $tickets = TicketOt::with([
            'asignaciones.diagnostico' => function ($query) {
                // Para cada diagnóstico, trae sus tiempos de bahía
                $query->select('id', 'asignacion_ot_id', 'tiempo_ejecucion')
                      ->with(['tiemposBahia' => function($subQuery) {
                          $subQuery->select('diagnostico_solucion_id', 'duracion_segundos');
                      }]);
            }
        ])
        ->whereYear('created_at', $year)
        ->whereMonth('created_at', $month)
        ->select('id', 'planta') // Solo necesitamos id y planta del ticket principal
        ->get();

        // 2. INICIALIZAR ACUMULADORES
        // Un array para cada grupo que necesitamos.
        $results = [
            'planta_1' => ['total_tickets' => 0, 'sum_tiempo_ejecucion' => 0, 'sum_duracion_segundos' => 0],
            'planta_2' => ['total_tickets' => 0, 'sum_tiempo_ejecucion' => 0, 'sum_duracion_segundos' => 0],
            'general'  => ['total_tickets' => 0, 'sum_tiempo_ejecucion' => 0, 'sum_duracion_segundos' => 0],
        ];

        // 3. PROCESAR LOS DATOS EN PHP (UNA SOLA PASADA)
        foreach ($tickets as $ticket) {
            $ticketKey = 'planta_' . $ticket->planta;
            
            $tiempoEjecucionTicket = 0;
            $duracionSegundosTicket = 0;

            // Sumamos los tiempos de todas las asignaciones/diagnósticos del ticket
            foreach ($ticket->asignaciones as $asignacion) {
                if ($asignacion->diagnostico) {
                    $tiempoEjecucionTicket += (int) $asignacion->diagnostico->tiempo_ejecucion;
                    // Sumamos los tiempos de bahía de este diagnóstico
                    $duracionSegundosTicket += $asignacion->diagnostico->tiemposBahia->sum('duracion_segundos');
                }
            }

            // Acumular en el grupo de la planta correspondiente
            if (array_key_exists($ticketKey, $results)) {
                $results[$ticketKey]['total_tickets']++;
                $results[$ticketKey]['sum_tiempo_ejecucion'] += $tiempoEjecucionTicket;
                $results[$ticketKey]['sum_duracion_segundos'] += $duracionSegundosTicket;
            }

            // Acumular siempre en el grupo general
            $results['general']['total_tickets']++;
            $results['general']['sum_tiempo_ejecucion'] += $tiempoEjecucionTicket;
            $results['general']['sum_duracion_segundos'] += $duracionSegundosTicket;
        }

        // 4. CALCULAR LOS VALORES FINALES Y FORMATEAR LA RESPUESTA
        $finalResponse = [
            'plantas' => [],
            'global' => []
        ];

        foreach ($results as $key => $data) {
            $totalTickets = $data['total_tickets'];
            
            if ($totalTickets > 0) {
                // 1. Restamos los segundos directamente
                $segundosNetos = $data['sum_tiempo_ejecucion'] - $data['sum_duracion_segundos'];
                
                // 2. Convertimos el resultado neto a minutos. Usamos floor para obtener minutos completos.
                $minutosTotales = floor($segundosNetos / 60);

                // 3. Para el promedio, usamos el valor en segundos para mayor precisión antes de redondear.
                // Se divide el total de segundos netos entre 60 y luego entre el número de tickets.
                $promedioMinutos = round(($segundosNetos / 60) / $totalTickets, 2);

                $formattedData = [
                    'minutos' => $minutosTotales,
                    'tickets' => $totalTickets,
                    'promedio_min' => $promedioMinutos
                ];
            } else {
                // Si no hay tickets, todos los valores son 0.
                $formattedData = ['minutos' => 0, 'tickets' => 0, 'promedio_min' => 0];
            }
            
            if ($key === 'general') {
                $finalResponse['global'] = $formattedData;
            } else {
                // Añadimos el nombre de la planta para la UI
                $formattedData['planta'] = ($key === 'planta_1') ? 'Ixtlahuaca' : 'San Bartolo';
                $finalResponse['plantas'][] = $formattedData;
            }
        }
        
        return response()->json($finalResponse);
    }

}
