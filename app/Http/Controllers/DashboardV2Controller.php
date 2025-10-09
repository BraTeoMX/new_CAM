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
                // Para cada diagnóstico, trae sus tiempos de bahía y updated_at
                $query->select('id', 'asignacion_ot_id', 'tiempo_ejecucion', 'updated_at', 'hora_final')
                      ->with(['tiemposBahia' => function($subQuery) {
                          $subQuery->select('diagnostico_solucion_id', 'duracion_segundos');
                      }]);
            }
        ])
        ->whereYear('created_at', $year)
        ->whereMonth('created_at', $month)
        ->whereIn('estado', [1, 5, 7, 8])
        ->select('id', 'planta', 'created_at') // Agregamos created_at para calcular tiempo bruto
        ->get();

        // 2. INICIALIZAR ACUMULADORES
        // Un array para cada grupo que necesitamos.
        $results = [
            'planta_1' => ['total_tickets' => 0, 'sum_segundos_brutos_sin_bahia' => 0],
            'planta_2' => ['total_tickets' => 0, 'sum_segundos_brutos_sin_bahia' => 0],
            'general'  => ['total_tickets' => 0, 'sum_segundos_brutos_sin_bahia' => 0],
        ];

        // 3. PROCESAR LOS DATOS EN PHP (UNA SOLA PASADA)
        foreach ($tickets as $ticket) {
            $ticketKey = 'planta_' . $ticket->planta;

            $segundosBrutosSinBahiaTicket = 0;

            // Sumamos los tiempos brutos sin bahía de todas las asignaciones/diagnósticos del ticket
            foreach ($ticket->asignaciones as $asignacion) {
                if ($asignacion->diagnostico) {
                    // Calcular segundos brutos por asignación
                    $segundosBrutos = $asignacion->diagnostico->hora_final->diffInSeconds($ticket->created_at);
                    $tiempoBahiaSeg = $asignacion->diagnostico->tiemposBahia->sum('duracion_segundos');
                    $segundosBrutosSinBahia = $segundosBrutos - $tiempoBahiaSeg;
                    $segundosBrutosSinBahiaTicket += $segundosBrutosSinBahia;
                }
            }

            // Acumular en el grupo de la planta correspondiente
            if (array_key_exists($ticketKey, $results)) {
                $results[$ticketKey]['total_tickets']++;
                $results[$ticketKey]['sum_segundos_brutos_sin_bahia'] += $segundosBrutosSinBahiaTicket;
            }

            // Acumular siempre en el grupo general
            $results['general']['total_tickets']++;
            $results['general']['sum_segundos_brutos_sin_bahia'] += $segundosBrutosSinBahiaTicket;
        }

        // 4. CALCULAR LOS VALORES FINALES Y FORMATEAR LA RESPUESTA
        $finalResponse = [
            'plantas' => [],
            'global' => []
        ];

        foreach ($results as $key => $data) {
            $totalTickets = $data['total_tickets'];
            
            if ($totalTickets > 0) {
                // 1. Usamos la suma de segundos brutos sin bahía
                $segundosNetos = $data['sum_segundos_brutos_sin_bahia'];

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
        ->select('id', 'planta', 'modulo', 'folio', 'nombre_supervisor', 'numero_empleado_operario', 'created_at')
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

                // Usamos las fechas como objetos Carbon para calcular la diferencia fácilmente.
                $fechaCreacionTicket = $ticket->created_at;
                $fechaFinalizacionDiagnostico = $asignacion->diagnostico->hora_final; 

                // Calculamos la diferencia total en segundos
                $segundosBrutos = $fechaFinalizacionDiagnostico->diffInSeconds($fechaCreacionTicket);

                // Formateamos el tiempo bruto de la misma manera que el neto
                $minutosBrutos = floor($segundosBrutos / 60);
                $segundosBrutosRestantes = $segundosBrutos % 60;
                $tiempoBrutoFormateado = $minutosBrutos . ' min ' . $segundosBrutosRestantes . ' seg';

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
                    'tiempo_bruto_formateado' => $tiempoBrutoFormateado,
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

    public function obtenerDetallesAutonomosCancelados(Request $request)
    {
        // 1. OBTENER PARÁMETROS (sin cambios)
        $month = $request->input('month', now()->month);
        $year = now()->year;

        // 2. CONSULTA (sin cambios)
        $tickets = TicketOt::with(['asignaciones', 'catalogoEstado'])
            ->whereIn('estado', [1, 7])
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->get();

        // 3. INICIALIZAR CONTADORES Y LISTAS
        $stats = [
            'autonomos' => 0,
            'cancelados' => 0,
        ];
        $details = [];
        $totalSegundosReales = 0; // <-- NUEVO: Para calcular el total de minutos

        // 4. PROCESAR LOS DATOS (lógica de cálculo añadida)
        foreach ($tickets as $ticket) {
            if ($ticket->estado == 1) $stats['autonomos']++;
            if ($ticket->estado == 7) $stats['cancelados']++;

            $asignacion = $ticket->asignaciones->first();
            if ($asignacion) {
                $segundosReales = (int) $asignacion->tiempo_real_minutos;
                $totalSegundosReales += $segundosReales; // <-- NUEVO: Acumulamos los segundos

                // ... (lógica de formateo de tiempo, sin cambios)
                $segundosEstimados = (int) $asignacion->tiempo_estimado_minutos;
                $minutosEstimados = floor($segundosEstimados / 60);
                $segundosEstimadosRestantes = $segundosEstimados % 60;
                $tiempoEstimadoFormateado = $minutosEstimados . ' min ' . $segundosEstimadosRestantes . ' seg';

                $minutosReales = floor($segundosReales / 60);
                $segundosRealesRestantes = $segundosReales % 60;
                $tiempoUsoFormateado = $minutosReales . ' min ' . $segundosRealesRestantes . ' seg';

                $details[] = [
                    'planta' => ($ticket->planta == 1) ? 'Ixtlahuaca' : 'San Bartolo',
                    'folio' => $ticket->folio,
                    'estado' => optional($ticket->catalogoEstado)->nombre ?? 'Desconocido',
                    'supervisor' => $ticket->nombre_supervisor,
                    'tiempo_estimado' => $tiempoEstimadoFormateado,
                    'tiempo_de_uso' => $tiempoUsoFormateado,
                ];
            }
        }

        // --- INICIO: NUEVO BLOQUE DE CÁLCULO DE RESUMEN ---
        $totalTickets = count($details);
        $totalMinutos = $totalSegundosReales / 60;
        $promedioMin = ($totalTickets > 0) ? ($totalMinutos / $totalTickets) : 0;

        $resumen = [
            'nombre' => 'Autónomos y Cancelados',
            'minutos' => $totalMinutos,
            'tickets' => $totalTickets,
            'promedio_min' => $promedioMin,
        ];
        // --- FIN: NUEVO BLOQUE DE CÁLCULO DE RESUMEN ---

        // 5. DEVOLVER LA RESPUESTA COMPLETA Y ESTRUCTURADA
        return response()->json([
            'resumen' => $resumen, // Resumen para las tarjetas de stats
            'details' => $details,   // Detalles para la tabla
        ]);
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
        $estadosValidos = [2, 3, 5, 8]; // Estados a considerar

        $tickets = TicketOt::with([
                'asignaciones.diagnostico' // Carga ansiosa de las relaciones necesarias
            ])
            ->whereIn('estado', $estadosValidos) // <-- NUEVO: Filtra solo los estados válidos
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $queryMonth)
            ->get();

        // 3. INICIALIZAR CONTADORES
        $totalAsignaciones = 0;
        $asignacionesEfectivas = 0;

        // 4. PROCESAR LOS RESULTADOS
        foreach ($tickets as $ticket) {
            $totalAsignaciones++;
            foreach ($ticket->asignaciones as $asignacion) {
                // Omitir si una asignación no tiene un diagnóstico registrado
                if (!$diagnostico = $asignacion->diagnostico) {
                    continue;
                }

                // Contamos esta asignación para el total
                

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

    public function calendarioTickets(Request $request)
    {
        try {
            Log::info('Calendario Tickets - Request data: ', $request->all());
            // 1. Obtener mes y año de la petición, con valores por defecto al mes/año actual.
            $year = $request->input('year', Carbon::now()->year);
            $month = $request->input('month', Carbon::now()->month); // Espera el mes como 1-12

            // 2. Realizar la consulta optimizada
            $activity = AsignacionOt::select(
                    // Extrae el DÍA de la fecha y lo nombra 'day'
                    DB::raw('DAY(created_at) as day'),
                    // Cuenta cuántos registros hay por cada día y lo nombra 'total'
                    DB::raw('COUNT(*) as total')
                )
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->groupBy('day') // Agrupa los resultados por el día
                ->orderBy('day', 'asc') // Opcional: ordena los resultados
                ->get();

            // 3. Devolver la respuesta JSON ya procesada
            return response()->json($activity);

        } catch (\Exception $e) {
            Log::error('Error en calendarioTickets: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo obtener la actividad.'], 500);
        }
    }

    public function obtenerEstatus(Request $request)
    {
        try {
            // 1. Obtener parámetros con valores por defecto al mes y año actual
            $year = $request->input('year', Carbon::now()->year);
            // El frontend enviará el mes como 1-12, lo cual es correcto para esta consulta
            $month = $request->input('month', Carbon::now()->month);

            // 2. Realizar la consulta optimizada
            $statusCounts = TicketOt::query()
                // Une la tabla de tickets con la tabla del catálogo de estados
                ->join('catalogo_estados', 'tickets_ot.estado', '=', 'catalogo_estados.id')
                
                // Filtra por el año y mes de creación del ticket
                ->whereYear('tickets_ot.created_at', $year)
                ->whereMonth('tickets_ot.created_at', $month)
                
                // Selecciona el nombre del estado y el conteo total
                ->select(
                    'catalogo_estados.nombre as Status', // Renombra 'nombre' a 'Status' para que coincida con el JS
                    DB::raw('COUNT(tickets_ot.id) as total')
                )
                
                // Agrupa los resultados por el nombre del estado
                ->groupBy('catalogo_estados.nombre')
                
                // Opcional pero recomendado: ordena los resultados en el backend
                ->orderByDesc('total')
                
                ->get();

            // 3. Devuelve el resultado en formato JSON
            return response()->json($statusCounts);

        } catch (\Exception $e) {
            Log::error('Error en obtenerEstatus: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo obtener el conteo de estatus.'], 500);
        }
    }

    public function obtenerCreadosCompletados(Request $request)
    {
        try {
            // 1. Obtener parámetros con valores por defecto
            $year = $request->input('year', Carbon::now()->year);
            // El frontend enviará el mes como 1-12, que es lo que espera esta consulta
            $month = $request->input('month', Carbon::now()->month);

            // 2. Obtener los tickets CREADOS en ese mes, agrupados por día
            $creados = TicketOt::query()
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->select(DB::raw('DAY(created_at) as day'), DB::raw('COUNT(*) as total'))
                ->groupBy('day')
                ->pluck('total', 'day'); // Devuelve un array asociativo [día => total]

            // 3. Obtener los tickets COMPLETADOS (estado=5) en ese mes, agrupados por día de ACTUALIZACIÓN
            $completados = TicketOt::query()
                ->where('estado', 5) // El estado "Atendido" o "Completado"
                ->whereYear('updated_at', $year) // Usamos 'updated_at' como fecha de completado
                ->whereMonth('updated_at', $month)
                ->select(DB::raw('DAY(updated_at) as day'), DB::raw('COUNT(*) as total'))
                ->groupBy('day')
                ->pluck('total', 'day');

            // 4. Construir la respuesta final día por día
            $daysInMonth = Carbon::createFromDate($year, $month)->daysInMonth;
            $data = [];

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $formattedDate = Carbon::createFromDate($year, $month, $day)->format('d/m');
                $data[] = [
                    'date' => $formattedDate,
                    'creadas' => $creados->get($day, 0), // Obtiene el total o 0 si no hay
                    'completadas' => $completados->get($day, 0) // Obtiene el total o 0 si no hay
                ];
            }

            return response()->json($data);

        } catch (\Exception $e) {
            Log::error('Error en obtenerCreadosCompletados: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo obtener la comparación de tickets.'], 500);
        }
    }

}
