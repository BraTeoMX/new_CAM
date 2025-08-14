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
                    'Numero_Mecanico' => $asignacion->numero_empleado_mecanico ?? 'Sin Asignar', // ¡Se accede al numero empleado mecanico directamente!
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
        // Mantenemos la validación. Asegúrate de incluir 'planta' si la estás enviando.
        $validatedData = $request->validate([
            'numero_empleado' => 'required',
            'nombre_mecanico' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();
            
            // ---- CAMBIO CLAVE ----
            // 1. Buscamos la asignación existente. Si no existe, fallará y saltará al bloque CATCH.
            $asignacion = AsignacionOt::where('ticket_ot_id', $id)->firstOrFail();

            // 2. Si llegamos aquí, la asignación SÍ existe. La actualizamos con los nuevos datos.
            $asignacion->update([
                'numero_empleado_mecanico' => $validatedData['numero_empleado'],
                'nombre_mecanico'          => $validatedData['nombre_mecanico'],
            ]);

            // 3. También actualizamos el estado del ticket principal (si es necesario).
            $ticket = TicketOt::findOrFail($id);
            $ticket->estado = 2; // Estado "Asignada" o "Reasignada"
            $ticket->save();

            DB::commit();
            // Cambiamos el mensaje para reflejar que fue una reasignación exitosa.
            return response()->json(['success' => 'Mecánico reasignado correctamente.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // --- ESTE ES EL MANEJO DE ERROR ESPECÍFICO ---
            // Este bloque se ejecuta SOLAMENTE si firstOrFail() no encontró el registro.
            DB::rollBack();
            Log::warning("Intento de reasignar una OT sin asignación previa. Ticket ID: {$id}");
            // Devolvemos un error 404 (No Encontrado) con un mensaje claro.
            return response()->json([
                'error' => 'Error de lógica: No se encontró una asignación previa para esta OT. No se puede reasignar.'
            ], 404);

        } catch (\Exception $e) {
            // Este bloque captura cualquier otro error inesperado.
            DB::rollBack();
            Log::error('Error al reasignar mecánico: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo reasignar el mecánico debido a un error inesperado.'], 500);
        }
    }

    public function revertirAAsignado(Request $request, $id)
    {
        try {
            $ticket = TicketOt::findOrFail($id);

            // Opcional: Podrías añadir una validación para asegurarte
            // de que solo se pueden revertir OTs que están en estado 3 ("En Proceso").
            // if ($ticket->estado != 3) {
            //     return response()->json(['error' => 'Esta OT no está "En Proceso" y no puede ser revertida.'], 409); // 409 Conflict
            // }

            $ticket->estado = 2; // Estado "Asignado"
            $ticket->save();

            return response()->json(['success' => 'El estado de la OT ha sido revertido a ASIGNADO.']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning("Intento de revertir una OT inexistente. Ticket ID: {$id}");
            return response()->json(['error' => 'La OT que intentas revertir no fue encontrada.'], 404);
        } catch (\Exception $e) {
            Log::error('Error al revertir estado de la OT: ' . $e->getMessage());
            return response()->json(['error' => 'Ocurrió un error inesperado al revertir el estado.'], 500);
        }
    }

}