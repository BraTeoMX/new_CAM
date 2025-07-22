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
        ->whereIn('estado', [3, 5])
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

    public function obtenerDetallesTickets(Request $request)
    {
        // 1. OBTENER PARÁMETROS
        $month = $request->input('month', Carbon::now()->month);
        $year = Carbon::now()->year;

        // 2. CONSULTA OPTIMIZADA (sin cambios aquí)
        $tickets = TicketOt::with([
            'asignaciones' => function ($query) {
                $query->with('diagnostico.tiemposBahia');
            }
        ])
        ->whereYear('created_at', $year)
        ->whereMonth('created_at', $month)
        ->select('id', 'planta', 'modulo', 'folio', 'nombre_supervisor', 'numero_empleado_operario')
        ->get();

        // 3. INICIALIZAR LA ESTRUCTURA DE RESPUESTA AGRUPADA
        $finalResponse = [
            'global'   => [],
            'planta_1' => [],
            'planta_2' => [],
        ];

        // 4. PROCESAR Y AGREGAR DATOS A LOS GRUPOS CORRESPONDIENTES
        foreach ($tickets as $ticket) {
            foreach ($ticket->asignaciones as $asignacion) {
                if (!$asignacion->diagnostico) {
                    continue;
                }

                // --- Lógica de cálculo de tiempo por asignación ---
                $tiempoEjecucionSeg = (int) $asignacion->diagnostico->tiempo_ejecucion;
                $tiempoBahiaSeg = $asignacion->diagnostico->tiemposBahia->sum('duracion_segundos');
                
                $segundosNetos = $tiempoEjecucionSeg - $tiempoBahiaSeg;

                // --- Formateo del tiempo (la doble solución recomendada) ---
                // Versión numérica con decimales (para ordenar/calcular en el frontend)
                $minutosDecimal = ($segundosNetos > 0) ? round($segundosNetos / 60, 2) : 0;
                
                // Versión de texto (para mostrar al usuario)
                $minutosParaMostrar = floor($segundosNetos / 60);
                $segundosParaMostrar = $segundosNetos % 60;
                $tiempoFormateado = $minutosParaMostrar . ' min ' . $segundosParaMostrar . ' seg';

                // Construimos la fila de detalle
                $filaDetalle = [
                    'planta' => ($ticket->planta == 1) ? 'Ixtlahuaca' : 'San Bartolo',
                    'modulo' => $ticket->modulo,
                    'folio' => $ticket->folio,
                    'supervisor' => $ticket->nombre_supervisor,
                    'operario_num_empleado' => $ticket->numero_empleado_operario,
                    'mecanico_nombre' => $asignacion->nombre_mecanico,
                    'minutos_netos' => $minutosDecimal,
                    'tiempo_neto_formateado' => $tiempoFormateado,
                ];

                // --- Lógica de asignación a los grupos ---
                
                // Asignar a la lista de la planta específica
                $ticketKey = 'planta_' . $ticket->planta; // Crea 'planta_1' o 'planta_2'
                if (array_key_exists($ticketKey, $finalResponse)) {
                    $finalResponse[$ticketKey][] = $filaDetalle;
                }

                // Asignar siempre a la lista global
                $finalResponse['global'][] = $filaDetalle;
            }
        }
        
        // 4. DEVOLVER LA RESPUESTA
        return response()->json($finalResponse);
    }

    /**
     * Calcula y devuelve los rankings "Top 5" de problemas, módulos y máquinas
     * para un mes y año específicos.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function tops(Request $request)
    {
        // 1. OBTENER PARÁMETROS DE LA PETICIÓN
        // Se obtiene el mes de la URL. Si no se proporciona, se usa el mes actual.
        $month = $request->input('month', Carbon::now()->month);
        // Se usa siempre el año actual para los cálculos.
        $year = Carbon::now()->year;

        // 2. CREAR LA CONSULTA BASE
        // Para no repetir el filtro de fecha en cada consulta, creamos una base.
        // Esto hace el código más limpio y fácil de mantener.
        // Solo seleccionamos los tickets del mes y año solicitados.
        $baseQuery = TicketOt::whereYear('created_at', $year)
                             ->whereMonth('created_at', $month);

        // 3. REALIZAR LOS CÁLCULOS DE LOS "TOPS"
        
        // --- 3.1. Top 5 Problemas ---
        // Clonamos la consulta base para no modificarla.
        // Usamos DB::raw para poder contar y agrupar.
        $topProblemas = $baseQuery->clone() // Usamos clone() para empezar desde la baseQuery limpia
            ->select('tipo_problema', DB::raw('COUNT(*) as total'))
            ->whereNotNull('tipo_problema') // Opcional: Ignorar registros con problema nulo
            ->groupBy('tipo_problema')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        // --- 3.2. Top 5 Módulos ---
        $topModulos = $baseQuery->clone()
            ->select('modulo', DB::raw('COUNT(*) as total'))
            ->whereNotNull('modulo') // Opcional: Ignorar registros con módulo nulo
            ->groupBy('modulo')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        // --- 3.3. Top 5 Máquinas ---
        // Aquí agregamos la condición específica de no incluir 'N/A'.
        $topMaquinas = $baseQuery->clone()
            ->where('maquina', '!=', 'N/A') // Condición clave: descartar 'N/A'
            ->whereNotNull('maquina') // Opcional: Por si hubiera valores nulos además de 'N/A'
            ->select('maquina', DB::raw('COUNT(*) as total'))
            ->groupBy('maquina')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        // 4. CONSTRUIR Y DEVOLVER LA RESPUESTA JSON
        // Agrupamos los 3 resultados en un único objeto JSON para el frontend.
        // Si una consulta no devuelve resultados, Eloquent entregará una colección vacía [],
        // lo cual es perfecto para que el frontend lo maneje sin errores.
        return response()->json([
            'top_problemas' => $topProblemas,
            'top_modulos'   => $topModulos,
            'top_maquinas'  => $topMaquinas,
        ]);
    }

    public function efectividad(Request $request)
    {
        // 1. OBTENER PARÁMETROS DE LA URL (con valores por defecto al mes y año actual)
        // El script de JS envía el mes como 0-11, PHP Carbon lo entiende así.
        $month = $request->input('month', Carbon::now()->month - 1);
        $year = $request->input('year', Carbon::now()->year);

        // Como el script JS envía el mes como 0-11 y la BBDD lo quiere como 1-12, sumamos 1.
        $queryMonth = $month + 1;

        // 2. CONSULTA CON ELOQUENT
        // Usamos 'whereHas' para asegurarnos de que solo traemos tickets que tienen asignaciones con diagnóstico.
        $tickets = TicketOt::with([
                'asignaciones.diagnostico' // Carga ansiosa de las relaciones necesarias
            ])
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $queryMonth)
            // Si el día es un parámetro, también lo filtramos
            ->when($request->has('day'), function ($query) use ($request) {
                return $query->whereDay('created_at', $request->input('day'));
            })
            ->get();

        // 3. INICIALIZAR CONTADORES
        $totalAsignaciones = 0;
        $asignacionesEfectivas = 0;

        // 4. PROCESAR LOS RESULTADOS
        foreach ($tickets as $ticket) {
            foreach ($ticket->asignaciones as $asignacion) {
                // Omitir si una asignación no tiene un diagnóstico registrado
                if (!$diagnostico = $asignacion->diagnostico) {
                    continue;
                }

                // Contamos esta asignación para el total
                $totalAsignaciones++;

                // --- LÓGICA DE NEGOCIO PRINCIPAL ---
                $tiempoRealSeg = (int) $diagnostico->tiempo_ejecucion;
                
                // !!! IMPORTANTE: Reemplaza 'tiempo_estimado_segundos' con el nombre real de tu campo
                $tiempoEstimadoSeg = (int) $diagnostico->tiempo_estimado; 

                // Comparamos si la ejecución fue dentro del tiempo estimado
                if ($tiempoRealSeg > 0 && $tiempoEstimadoSeg > 0 && $tiempoRealSeg <= $tiempoEstimadoSeg) {
                    $asignacionesEfectivas++;
                }
            }
        }

        // 5. CALCULAR EL PORCENTAJE FINAL
        $efectividadCalculada = ($totalAsignaciones > 0)
            ? round(($asignacionesEfectivas / $totalAsignaciones) * 100, 2)
            : 0;

        // 6. DEVOLVER LA RESPUESTA JSON (con los mismos alias que espera el script)
        return response()->json([
            'efectividad' => $efectividadCalculada,
            'total'       => $totalAsignaciones,
            'efectivos'   => $asignacionesEfectivas,
        ]);
    }


}
