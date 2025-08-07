<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use App\Models\TicketOt;
use App\Models\AsignacionOt;

class ReasignacionManualController extends Controller
{
    public function index()
    {
        return view('reasignacion.index');
    }

    public function getOtsSinAsignar()
    {
        return $this->obtenerRegistros(6, null); // Estado 6 = Sin Asignar
    }

    public function buscarOts(Request $request)
    {
        return $this->obtenerRegistros(null, $request);
    }

    private function obtenerRegistros($estado = null, Request $request = null)
    {
        try {
            // Cargamos únicamente las relaciones que SÍ existen y necesitamos.
            // 'maquina' ya no está aquí porque es un atributo, no una relación.
            $query = TicketOt::with(['catalogoEstado', 'asignaciones']);

            if ($estado !== null) {
                $query->where('estado', $estado);
            }

            if ($request) {
                if ($request->filled('folio')) {
                    $query->where('folio', 'like', '%' . $request->folio . '%');
                }
                if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
                    $startDate = Carbon::parse($request->fecha_inicio)->startOfDay();
                    $endDate = Carbon::parse($request->fecha_fin)->endOfDay();
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }
            }

            $tickets = $query->orderBy('created_at', 'desc')->get();

            // Mapeamos los resultados accediendo directamente a los atributos del modelo.
            $resultados = $tickets->map(function ($ticket) {
                $asignacion = $ticket->asignaciones->first();

                return [
                    'id' => $ticket->id,
                    'Folio' => $ticket->folio, // Usamos 'folio' como en el modelo
                    'Modulo' => $ticket->modulo,
                    'Maquina' => $ticket->maquina, // ¡Se accede directamente al atributo!
                    'Problema' => $ticket->descripcion_problema, // Usando el campo correcto de tu modelo
                    'Status' => $ticket->catalogoEstado->nombre ?? 'N/A',
                    'estado_id' => $ticket->estado,
                    'Mecanico' => $asignacion->nombre_mecanico ?? 'Sin Asignar', // ¡Se accede al nombre directamente!
                    'Supervisor' => $ticket->nombre_supervisor ?? 'N/A', // El supervisor está en el ticket principal
                    'fecha_creacion' => Carbon::parse($ticket->created_at)->format('d/m/Y H:i'),
                ];
            });

            return response()->json($resultados);

        } catch (\Exception $e) {
            Log::error('Error al obtener los registros de OT: ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['error' => 'No se pudieron cargar los registros'], 500);
        }
    }

    /**
     * Obtiene la lista de mecánicos para el MODAL.
     * Esta función está perfecta y no necesita cambios.
     */

    public function getMecanicos()
    {
        try {
            $mecanicos = Cache::remember('mecanicos_cache', now()->addHours(12), function () {
                return DB::connection('sqlsrv_dev')
                    ->table('catalogo_mecanicos')
                    ->select('nombre', 'numero_empleado', 'planta')
                    ->orderBy('nombre')
                    ->get();
            });

            Log::info('Mecánicos obtenidos:', $mecanicos->toArray());
            return response()->json($mecanicos);
        } catch (\Exception $e) {
            Log::error('Error al obtener mecánicos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los datos de mecánicos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Asigna un mecánico a una OT.
     * Esta función también está correcta.
     */
    public function asignarMecanico(Request $request, $id)
    {
        // 1. Actualizamos la validación para que coincida con los nuevos datos enviados
        $request->validate([
            'numero_empleado' => 'required',
            'nombre_mecanico' => 'required|string|max:255',
            //'planta'          => 'required|string|max:50',
        ]);

        try {
            DB::beginTransaction();
            
            $ticket = TicketOt::findOrFail($id);
            $ticket->estado = 2; // Asumiendo 1 = Asignado
            $ticket->save();

            // 2. ¡ELIMINAMOS LA CONSULTA EXTRA! Ya no es necesaria.
            //    Los datos del mecánico vienen directamente desde la petición.

            // 3. Usamos updateOrCreate con los datos recibidos del request.
            AsignacionOt::updateOrCreate(
                ['ticket_ot_id' => $ticket->id],
                [
                    'numero_empleado_mecanico' => $request->numero_empleado,
                    'nombre_mecanico'          => $request->nombre_mecanico,
                    //'planta_mecanico'          => $request->planta, 
                ]
            );

            DB::commit();
            return response()->json(['success' => 'Mecánico asignado correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al asignar mecánico: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo asignar el mecánico.'], 500);
        }
    }
}