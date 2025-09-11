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
use App\Models\TiempoBahia;
use App\Models\Falla;
use App\Models\CatalogoProblema;
use App\Models\Causa;
use App\Models\Accion;

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
            $modulos = TicketOt::where('created_at', '>=', now()->subDays(4)) // 1. Filtra por los últimos 30 días
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
                ->where('created_at', '>=', now()->subDays(4))
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
                    'asignaciones.diagnostico.tiemposBahia'
                ])
                ->where('modulo', $modulo)
                ->where('created_at', '>=', now()->subDays(4))
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($ticket) {
                    $ticket->fecha_creacion_formateada = Carbon::parse($ticket->created_at)->format('d/m/Y, H:i:s');
                    $ticket->fecha_actualizacion_formateada = Carbon::parse($ticket->updated_at)->format('d/m/Y, H:i:s');

                    $diagnostico = $ticket->asignaciones->first()?->diagnostico;

                    if ($diagnostico) {
                        // --- Datos para estados 'EN PROCESO' y 'ATENDIDO' ---
                        $ticket->hora_inicio_diagnostico = $diagnostico->hora_inicio ?? 'N/A';
                        $ticket->tiempo_estimado_minutos = is_numeric($diagnostico->tiempo_estimado) ? intval($diagnostico->tiempo_estimado / 60) : null;
                        $ticket->estado_bahia = $diagnostico->estado_bahia;
                        $ticket->tiempos_bahia_data = $diagnostico->tiemposBahia;
                        
                        // --- NUEVO CÁLCULO PARA EL TIEMPO REAL ---
                        // Suma la duración de todas las pausas finalizadas.
                        $total_duracion_segundos = $diagnostico->tiemposBahia->sum('duracion_segundos');
                        $tiempo_ejecucion = is_numeric($diagnostico->tiempo_ejecucion) ? (int)$diagnostico->tiempo_ejecucion : 0;
                        
                        $ticket->tiempo_real_calculado = $tiempo_ejecucion - $total_duracion_segundos;

                        // --- NUEVA CONVERSIÓN A MINUTOS Y SEGUNDOS ---
                        $totalSegundosReales = $ticket->tiempo_real_calculado > 0 ? $ticket->tiempo_real_calculado : 0;
                        $ticket->tiempo_real_minutos = floor($totalSegundosReales / 60);
                        $ticket->tiempo_real_segundos = $totalSegundosReales % 60;
                        
                        $ticket->diagnostico_completo = $diagnostico;

                    } else {
                        // Valores por defecto si no hay diagnóstico
                        $ticket->tiempo_estimado_minutos = null;
                        $ticket->estado_bahia = 0;
                        $ticket->tiempos_bahia_data = [];
                        $ticket->tiempo_real_calculado = 0;
                        $ticket->diagnostico_completo = null;
                    }

                    return $ticket;
                });

            return response()->json($tickets);

        } catch (\Exception $e) {
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

    public function obtenerFallas()
    {
        $fallas = CatalogoProblema::select('id', 'nombre')->orderBy('nombre')->get();
        return response()->json($fallas);
    }

    public function obtenerCausas()
    {
        $causas = Causa::select('id', 'nombre')->orderBy('nombre')->get();
        return response()->json($causas);
    }

    public function obtenerAcciones()
    {
        $acciones = Accion::select('id', 'nombre')->orderBy('nombre')->get();
        return response()->json($acciones);
    }


    public function finalizarAtencion(Request $request)
    {
        Log::info('Finalizando atención para el ticket: ' . $request->input('ticket_id'), $request->all());

        $validatedData = $request->validate([
            'ticket_id' => 'required|integer|exists:tickets_ot,id',
            'falla' => 'required|string|max:255',
            'causa_falla' => 'required|string|max:255',
            'accion_implementada' => 'required|string|max:255',
            'hora_finalizacion' => 'required|date_format:H:i:s',
            'comentarios' => 'nullable|string',
            'satisfaccion' => 'required|integer|between:1,4',
        ]);

        try {
            DB::transaction(function () use ($validatedData) {
                // Encontramos la asignación del ticket.
                $asignacion = AsignacionOt::where('ticket_ot_id', $validatedData['ticket_id'])->firstOrFail();

                // <-- 2. OBTENEMOS EL DIAGNÓSTICO PARA LEER LA HORA DE INICIO
                $diagnostico = $asignacion->diagnostico;

                // Verificación por si acaso el diagnóstico no existiera.
                if (!$diagnostico) {
                    throw new \Exception('No se encontró un diagnóstico iniciado para esta asignación.');
                }

                // <-- 3. CÁLCULO DEL TIEMPO DE EJECUCIÓN
                // Convertimos las horas (string) a objetos Carbon para poder calcular la diferencia.
                $horaInicio = Carbon::parse($diagnostico->hora_inicio);
                $horaFinal = Carbon::parse($validatedData['hora_finalizacion']);

                // Calculamos la diferencia total en segundos.
                $tiempoDeEjecucionEnSegundos = $horaFinal->diffInSeconds($horaInicio);

                // <-- 4. ACTUALIZAMOS EL DIAGNÓSTICO (INCLUYENDO EL NUEVO CÁLCULO)
                // Usamos el objeto $diagnostico que ya obtuvimos para hacer el update.
                $diagnostico->update([
                    'falla' => $validatedData['falla'],
                    'causa' => $validatedData['causa_falla'],
                    'accion_correctiva' => $validatedData['accion_implementada'],
                    'comentarios' => $validatedData['comentarios'],
                    'hora_final' => $validatedData['hora_finalizacion'],
                    'tiempo_ejecucion' => $tiempoDeEjecucionEnSegundos, // <-- Guardamos el valor calculado
                    'encuesta' => $validatedData['satisfaccion'],
                ]);
                
                // 5. Actualizamos el estado del ticket principal a 5 ("ATENDIDO").
                $asignacion->ticket()->update(['estado' => 5]);
            });

            return response()->json(['success' => true, 'message' => 'Atención finalizada y registrada correctamente.']);

        } catch (\Exception $e) {
            Log::error('Error al finalizar atención para el ticket ' . ($validatedData['ticket_id'] ?? 'N/A') . ': ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'No se pudo registrar la finalización de la atención.'], 500);
        }
    }

    public function activarBahia(Request $request)
    {
        // 1. Validación de los datos
        $validatedData = $request->validate([
            'ticket_id' => 'required|integer|exists:tickets_ot,id',
            'motivo' => 'nullable|string|max:255',
        ]);

        try {
            DB::transaction(function () use ($validatedData) {
                // 2. Encontrar el diagnóstico asociado al ticket
                $diagnostico = TicketOt::findOrFail($validatedData['ticket_id'])
                                    ->asignaciones->first()
                                    ->diagnostico;

                if (!$diagnostico) {
                    throw new \Exception('No se encontró un diagnóstico activo para este ticket.');
                }

                // 3. Actualizar el estado del diagnóstico a "pausado"
                $diagnostico->update(['estado_bahia' => 1]);

                // 4. Crear el nuevo registro en la tabla de pausas
                $diagnostico->tiemposBahia()->create([
                    'hora_inicio_pausa' => now(),
                    'hora_fin_pausa' => null, // Se deja nulo porque la pausa está activa
                    'motivo' => $validatedData['motivo'],
                ]);
            });

            return response()->json(['success' => true, 'message' => 'El tiempo de bahía ha sido activado.']);

        } catch (\Exception $e) {
            Log::error('Error al activar tiempo de bahía para ticket ' . $validatedData['ticket_id'] . ': ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Ocurrió un error al intentar activar la pausa.'], 500);
        }
    }

    public function finalizarBahia(Request $request)
    {
        // 1. Validación simple, solo necesitamos el ID del ticket
        $validatedData = $request->validate([
            'ticket_id' => 'required|integer|exists:tickets_ot,id',
        ]);

        try {
            DB::transaction(function () use ($validatedData) {
                // 2. Encontrar el diagnóstico asociado al ticket
                $diagnostico = TicketOt::findOrFail($validatedData['ticket_id'])
                                    ->asignaciones->first()
                                    ->diagnostico;

                if (!$diagnostico) {
                    throw new \Exception('No se encontró un diagnóstico activo para este ticket.');
                }

                // 3. Encontrar la última pausa activa (la que no tiene hora de fin)
                $pausaActiva = $diagnostico->tiemposBahia()
                                        ->whereNull('hora_fin_pausa')
                                        ->latest('hora_inicio_pausa') // Por seguridad, tomamos la más reciente
                                        ->first();

                if (!$pausaActiva) {
                    throw new \Exception('No se encontró una pausa activa para reanudar.');
                }

                // 4. Actualizar la pausa activa
                $horaFin = now();
                $horaInicio = Carbon::parse($pausaActiva->hora_inicio_pausa);
                
                $pausaActiva->update([
                    'hora_fin_pausa' => $horaFin,
                    'duracion_segundos' => $horaFin->diffInSeconds($horaInicio) // Calculamos y guardamos la duración
                ]);

                // 5. Actualizar el estado del diagnóstico principal a "activo"
                $diagnostico->update(['estado_bahia' => 0]);
            });

            return response()->json(['success' => true, 'message' => 'La atención ha sido reanudada.']);

        } catch (\Exception $e) {
            Log::error('Error al finalizar tiempo de bahía para ticket ' . $validatedData['ticket_id'] . ': ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Ocurrió un error al intentar reanudar la atención.'], 500);
        }
    }

}
