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
        $startDate = $request->input('startDate', Carbon::today()->toDateString());
        $endDate = $request->input('endDate', Carbon::today()->toDateString());

        // 2. CONSULTA OPTIMIZADA
        $tickets = TicketOt::with([
            'asignaciones' => function ($query) {
                $query->with('diagnostico.tiemposBahia');
            }
        ])
        ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
        ->get();

        // 3. INICIALIZAR LA ESTRUCTURA DE RESPUESTA
        $finalResponse = [
            'global'   => [],
            'planta_1' => [],
            'planta_2' => [],
        ];

        // 4. PROCESAR Y AGREGAR DATOS
        foreach ($tickets as $ticket) {
            foreach ($ticket->asignaciones as $asignacion) {
                if (!$asignacion->diagnostico) {
                    continue;
                }

                // --- Lógica de cálculo de tiempo ---
                $tiempoEjecucionSeg = (int) $asignacion->diagnostico->tiempo_ejecucion;
                $tiempoBahiaSeg = $asignacion->diagnostico->tiemposBahia->sum('duracion_segundos');
                $segundosNetos = $tiempoEjecucionSeg - $tiempoBahiaSeg;
                $minutosDecimal = ($segundosNetos > 0) ? round($segundosNetos / 60, 2) : 0;
                
                // Formateo para tiempo neto
                $minutosNetosParaMostrar = floor($segundosNetos / 60);
                $segundosNetosParaMostrar = $segundosNetos % 60;
                $tiempoNetoFormateado = $minutosNetosParaMostrar . ' min ' . $segundosNetosParaMostrar . ' seg';

                // --- NUEVA LÓGICA: Formateo para el tiempo total en bahía ---
                // Si no hay tiempos en bahía, $tiempoBahiaSeg será 0, cumpliendo con el requisito.
                $minutosBahiaParaMostrar = floor($tiempoBahiaSeg / 60);
                $segundosBahiaParaMostrar = $tiempoBahiaSeg % 60;
                $tiempoBahiaFormateado = $minutosBahiaParaMostrar . ' min ' . $segundosBahiaParaMostrar . ' seg';


                // --- Construimos la fila de detalle con más información ---
                $filaDetalle = [
                    'planta' => ($ticket->planta == 1) ? 'Ixtlahuaca' : 'San Bartolo',
                    'modulo' => $ticket->modulo,
                    'folio' => $ticket->folio,
                    'supervisor' => $ticket->nombre_supervisor,
                    'operario_num_empleado' => $ticket->numero_empleado_operario,
                    'nombre_operario' => $ticket->nombre_operario,
                    'tipo_problema' => $ticket->tipo_problema,
                    'mecanico_nombre' => $asignacion->nombre_mecanico,
                    
                    // --- CAMPOS DE TIEMPO AÑADIDOS ---
                    'hora_inicio_diagnostico' => $asignacion->diagnostico->created_at->toDateTimeString(),
                    'hora_final_diagnostico' => $asignacion->diagnostico->updated_at->toDateTimeString(),
                    
                    'minutos_netos' => $minutosDecimal,
                    'tiempo_neto_formateado' => $tiempoNetoFormateado,

                    // --- MODIFICADO: Se muestra el tiempo total de bahía formateado ---
                    // El método sum() ya maneja el caso de que no existan registros (devuelve 0).
                    'tiempo_total_bahia_formateado' => $tiempoBahiaFormateado,

                    // Se mantiene el desglose individual por si es útil para el frontend
                    'tiempos_bahia_individuales_seg' => $asignacion->diagnostico->tiemposBahia->pluck('duracion_segundos'),

                    'numero_maquina' => $asignacion->diagnostico->numero_maquina,
                    'clase_maquina' => $asignacion->diagnostico->clase_maquina,
                    
                    // --- DETALLES ADICIONALES ---
                    'problema' => $ticket->problema_reportado,
                    'falla' => $asignacion->diagnostico->falla,
                    'causa' => $asignacion->diagnostico->causa,
                    'accion' => $asignacion->diagnostico->accion_correctiva,
                    'valor_encuesta' => $asignacion->diagnostico->encuesta,
                    'encuesta' => match ((int)$asignacion->diagnostico->encuesta) {
                        4 => 'Excelente',
                        3 => 'Bueno',
                        2 => 'Regular',
                        1 => 'Malo',
                        default => 'No calificado',
                    },
                ];

                // --- Lógica de asignación a los grupos ---
                $ticketKey = 'planta_' . $ticket->planta;
                if (array_key_exists($ticketKey, $finalResponse)) {
                    $finalResponse[$ticketKey][] = $filaDetalle;
                }
                $finalResponse['global'][] = $filaDetalle;
            }
        }
        
        // 5. DEVOLVER LA RESPUESTA
        return response()->json($finalResponse);
    }

}
