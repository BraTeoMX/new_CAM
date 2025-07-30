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

        // 2. CONSULTA OPTIMIZADA (sin cambios aquí)
        $tickets = TicketOt::with([
            'asignaciones' => function ($query) {
                $query->with('diagnostico.tiemposBahia');
            }
        ])
        ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
        ->get(); // MODIFICADO: Eliminé el select() para traer todos los campos necesarios

        // 3. INICIALIZAR LA ESTRUCTURA DE RESPUESTA (Sin cambios)
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

                // --- Lógica de cálculo de tiempo (Sin cambios) ---
                $tiempoEjecucionSeg = (int) $asignacion->diagnostico->tiempo_ejecucion;
                $tiempoBahiaSeg = $asignacion->diagnostico->tiemposBahia->sum('duracion_segundos');
                $segundosNetos = $tiempoEjecucionSeg - $tiempoBahiaSeg;
                $minutosDecimal = ($segundosNetos > 0) ? round($segundosNetos / 60, 2) : 0;
                $minutosParaMostrar = floor($segundosNetos / 60);
                $segundosParaMostrar = $segundosNetos % 60;
                $tiempoFormateado = $minutosParaMostrar . ' min ' . $segundosParaMostrar . ' seg';

                // --- MODIFICADO: Construimos la fila de detalle con más información ---
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
                    // NUEVO: Hora en que se creó el registro de diagnóstico (inicio).
                    'hora_inicio_diagnostico' => $asignacion->diagnostico->created_at->toDateTimeString(),
                    
                    // NUEVO: Hora en que se actualizó por última vez (fin).
                    'hora_final_diagnostico' => $asignacion->diagnostico->updated_at->toDateTimeString(),
                    
                    'minutos_netos' => $minutosDecimal,
                    'tiempo_neto_formateado' => $tiempoFormateado,

                    // NUEVO: Un array con la duración en segundos de cada parada en bahía.
                    'tiempos_bahia_individuales_seg' => $asignacion->diagnostico->tiemposBahia->pluck('duracion_segundos'),

                    'numero_maquina' => $asignacion->diagnostico->numero_maquina,
                    'clase_maquina' => $asignacion->diagnostico->clase_maquina,
                    // --- MEJORA: AÑADIR OTROS DETALLES ÚTILES ---
                    'problema' => $ticket->problema_reportado, // Asumiendo que el campo se llama así
                    'falla' => $asignacion->diagnostico->falla,
                    'causa' => $asignacion->diagnostico->causa,
                    'accion' => $asignacion->diagnostico->accion_correctiva,
                    'encuesta' => $asignacion->diagnostico->encuesta,
                ];

                // --- Lógica de asignación a los grupos (Sin cambios) ---
                $ticketKey = 'planta_' . $ticket->planta;
                if (array_key_exists($ticketKey, $finalResponse)) {
                    $finalResponse[$ticketKey][] = $filaDetalle;
                }
                $finalResponse['global'][] = $filaDetalle;
            }
        }
        
        // 5. DEVOLVER LA RESPUESTA (Sin cambios)
        return response()->json($finalResponse);
    }

}
