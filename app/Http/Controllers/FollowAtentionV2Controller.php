<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ClasseMaquina;
use Illuminate\Support\Facades\DB;
use App\Models\TicketOt;
use App\Models\AsignacionOt;
use App\Models\CatalogoEstado;
use App\Models\CatalogoArea;
use App\Models\DiagnosticoSolucion;

use Illuminate\Support\Carbon;

class FollowAtentionV2Controller extends Controller
{

    public function index()
    {
        return view('followOT.index');
    }

    public function obtenerAreaModulos()
    {
        try {
            $modulos = TicketOt::where('created_at', '>=', now()->subDays(10)) // 1. Filtra por los últimos 30 días
                              ->select('modulo')      // 2. Selecciona solo la columna 'modulo'
                              ->distinct()            // 3. Obtiene solo valores únicos
                              ->orderBy('modulo', 'asc') // 4. Ordena alfabéticamente
                              ->pluck('modulo');       // 5. Devuelve un array simple ['Modulo A', 'Modulo B', ...]

            return response()->json($modulos);

        } catch (\Exception $e) {
            Log::error('Error al obtener módulos desde TicketsOt: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudieron cargar los módulos'], 500);
        }
    }

    public function obtenerResumen($modulo)
    {
        try {
            Log::info('Obteniendo resumen para el módulo: ' . $modulo);
            // 1. Obtenemos todos los nombres de estados posibles desde el catálogo.
            // Esto nos asegura que siempre devolveremos todos los contadores, incluso si están en 0.
            $todosLosEstados = CatalogoEstado::pluck('nombre')->flip()->map(fn() => 0)->all();
            
            // 2. Hacemos la consulta para contar los tickets por estado para el módulo y fecha dados.
            $conteoPorEstado = TicketOt::with('catalogoEstado') // Precargamos la relación
                ->where('modulo', $modulo)
                ->where('created_at', '>=', now()->subDays(10))
                ->select('estado', DB::raw('count(*) as total'))
                ->groupBy('estado')
                ->get()
                ->pluck('total', 'catalogoEstado.nombre'); // Clave: nombre del estado, Valor: total

            // 3. Combinamos el conteo real con nuestra plantilla de ceros.
            $resumen = array_merge($todosLosEstados, $conteoPorEstado->all());

            // 4. Calculamos el total general.
            $resumen['TOTAL'] = array_sum($resumen);
            
            return response()->json($resumen);

        } catch (\Exception $e) {
            Log::error('Error al obtener el resumen: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo cargar el resumen'], 500);
        }
    }

    public function obtenerRegistros($modulo)
    {
        try {
            $tickets = TicketOt::with([
                    'catalogoEstado', 
                    'asignaciones.diagnostico' 
                ])
                ->where('modulo', $modulo)
                ->where('created_at', '>=', now()->subDays(10))
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($ticket) {
                    $ticket->fecha_creacion_formateada = Carbon::parse($ticket->created_at)->format('d/m/Y, H:i:s');

                    $diagnostico = $ticket->asignaciones->first()?->diagnostico;

                    // Agregamos datos del diagnóstico si existe
                    if ($diagnostico) {
                        $ticket->diagnostico_data = $diagnostico;

                        $ticket->hora_inicio_diagnostico = $diagnostico->hora_inicio ?? 'N/A';

                        // Conversión de segundos (hora_final) a minutos enteros
                        $ticket->hora_final_minutos = is_numeric($diagnostico->hora_final)
                            ? intval($diagnostico->hora_final / 60)
                            : null;

                        $ticket->fecha_actualizacion_formateada = $diagnostico->created_at
                            ? Carbon::parse($diagnostico->created_at)->format('d/m/Y, H:i:s')
                            : 'N/A';
                    } else {
                        $ticket->diagnostico_data = null;
                        $ticket->hora_final_minutos = null;
                        $ticket->fecha_actualizacion_formateada = 'N/A';
                    }

                    return $ticket;
                });

            return response()->json($tickets);

        }catch (\Exception $e) {
            Log::error('Error al obtener los registros detallados: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudieron cargar los registros'], 500);
        }
    }

    public function obtenerCatalogoEstados()
    {
        try {
            // Devolvemos todos los estados para que el frontend los pueda usar.
            $estados = CatalogoEstado::orderBy('nombre', 'asc')->get();
            return response()->json($estados);
        } catch (\Exception $e) {
            Log::error('Error al obtener el catálogo de estados: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo cargar el catálogo de estados'], 500);
        }
    }

    public function obtenerClasesMaquina($maquina)
    {
        try {
            // También retorna el TimeEstimado para cada clase
            $clases = ClasseMaquina::where('mach', $maquina)
                ->get(['class_id', 'class', 'TimeEstimado']);
            
            $numeroMaquina = $this->obtenerNumeroMaquina($clases);
            
            return response()->json([
                'clases' => $clases,
                'numeroMaquina' => $numeroMaquina
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getClasesMaquina: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function obtenerNumeroMaquina($clases)
    {
        try {
            $claseValues = $clases->pluck('class')->toArray();

            $numeroMaquina = DB::connection('sqlsrv_dev')
                ->table('InvMecanicos')
                ->whereIn('Clasificacion', $claseValues)
                ->get(['Remplacad']);
            
            return $numeroMaquina;
        } catch (\Exception $e) {
            Log::error('Error en getNumeroMaquina: ' . $e->getMessage());
            return collect(); // Retorna colección vacía en caso de error
        }
    }

    public function iniciarAtencion(Request $request)
    {
        Log::info('Iniciando atención para el ticket: ' . $request->input('ticket_id'));
        // Validación de los datos recibidos desde el frontend
        $validatedData = $request->validate([
            'ticket_id' => 'required|integer|exists:tickets_ot,id',
            'clase' => 'required|string',
            'numero_maquina' => 'required|string',
            'tiempo_estimado' => 'required|string', // Recibimos como "HH:MM:SS"
        ]);

        try {
            // Usamos una transacción para asegurar que todas las operaciones se completen o ninguna lo haga.
            DB::transaction(function () use ($validatedData) {
                // 1. Encontramos la primera asignación asociada al ticket.
                $asignacion = AsignacionOt::where('ticket_ot_id', $validatedData['ticket_id'])->firstOrFail();

                // 2. Convertimos el tiempo estimado de "HH:MM:SS" a segundos.
                $parts = explode(':', $validatedData['tiempo_estimado']); // [HH, MM, SS]
                $tiempoEnSegundos = ((int)$parts[0] * 3600) + ((int)$parts[1] * 60) + ((int)$parts[2]);

                // 3. Creamos el registro de diagnóstico usando la relación del modelo AsignacionOt.
                // updateOrCreate previene duplicados si se hace clic dos veces.
                $asignacion->diagnostico()->updateOrCreate(
                    ['asignacion_ot_id' => $asignacion->id], // Condición para buscar
                    [ // Datos para crear o actualizar
                        'clase_maquina' => $validatedData['clase'], // Asumo que 'clase' va en 'clase_falla'
                        'numero_maquina' => $validatedData['numero_maquina'],
                        'tiempo_estimado' => $tiempoEnSegundos,
                        'hora_inicio' => now(), // Guardamos la hora actual como inicio
                    ]
                );
                
                // 4. Actualizamos el estado del ticket principal a 3 ("EN PROCESO").
                $asignacion->ticket()->update(['estado' => 3]);
            });

            return response()->json(['success' => true, 'message' => 'Atención iniciada correctamente.']);

        } catch (\Exception $e) {
            Log::error('Error al iniciar atención: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'No se pudo iniciar la atención.'], 500);
        }
    }

    public function finalizarAtencion(Request $request)
    {
        Log::info('Finalizando atención para el ticket: ' . $request->input('ticket_id'));
        // Validación de los datos recibidos desde el frontend
        $validatedData = $request->validate([
            'ticket_id' => 'required|integer|exists:tickets_ot,id',
        ]);

        try {
            // Usamos una transacción para asegurar que todas las operaciones se completen o ninguna lo haga.
            DB::transaction(function () use ($validatedData) {
                // 1. Encontramos la primera asignación asociada al ticket.
                $asignacion = AsignacionOt::where('ticket_ot_id', $validatedData['ticket_id'])->firstOrFail();

                
                $asignacion->diagnostico()->update(
                    ['asignacion_ot_id' => $asignacion->id], // Condición para buscar
                    [ // Datos para crear o actualizar
                        'hora_fin' => $tiempo = 0,//tiempo del boton de "Finalizar Atención",
                        'hora_inicio' => '0',
                    ]
                );
                
                // 4. Actualizamos el estado del ticket principal a 5 ("Atendido").
                $asignacion->ticket()->update(['estado' => 5]);
            });

            return response()->json(['success' => true, 'message' => 'Atención iniciada correctamente.']);

        } catch (\Exception $e) {
            Log::error('Error al iniciar atención: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'No se pudo iniciar la atención.'], 500);
        }
    }
}
