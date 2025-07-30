<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\TicketOt;
use App\Models\AsignacionOt;

class ReportesController extends Controller
{
    public function index() // SUGERENCIA: Renombrar 'Admin' a 'index' es una convención RESTful.
    {
        return view('reporte.index'); // SUGERENCIA: Nombres de vistas en minúscula.
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

}
