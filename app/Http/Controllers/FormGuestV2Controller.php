<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Events\NewOrderNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\CatalogoArea;
use App\Models\TicketOt;
use App\Models\CatalogoProblema;
use App\Models\Vinculacion;
use App\Models\AsignacionOt;

class FormGuestV2Controller extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('formGuest.index');
    }

    public function obtenerAreasModulos()
    {
        try {
            $cacheKey = 'modulos_combinados_con_tipo'; // Nueva clave del caché

            if (Cache::has($cacheKey)) {
                $modulos = Cache::get($cacheKey);
            } else {
                // 1. Obtener los módulos de CatalogoArea
                $modulosCatalogo = CatalogoArea::select('nombre as modulo', 'planta')
                                            ->where('estatus', 1)
                                            ->orderBy('modulo')
                                            ->get()
                                            ->map(function ($item) {
                                                $item->planta = (string) $item->planta;
                                                $item->tipo = 'catalogo';
                                                $item->nombre_supervisor = 'N/A';
                                                $item->numero_empleado_supervisor = 'N/A';
                                                return $item;
                                            });

                // 2. Obtener los módulos de modulo_supervisor_views
                $modulosSupervisores = DB::connection('sqlsrv_dev')
                                        ->table('modulo_supervisor_views')
                                        ->select('modulo', 'planta', 'nombre as nombre_supervisor', 'numero_empleado as numero_empleado_supervisor')
                                        ->distinct()
                                        ->orderBy('modulo')
                                        ->get()
                                        ->map(function ($item) {
                                            // ESTA ES LA CORRECCIÓN CLAVE: Usar sintaxis de objeto para stdClass
                                            $item->tipo = 'supervisor';
                                            return $item;
                                        });

                // 3. Combinar ambos conjuntos de datos
                $modulos = collect($modulosCatalogo)->concat($modulosSupervisores);

                // 4. Eliminar duplicados basándose en el campo 'modulo' y reindexar
                $modulos = $modulos->unique('modulo')->values(); 

                // Guardar en caché por un día
                Cache::put($cacheKey, $modulos, now()->addDay());
            }

            return response()->json($modulos);
        } catch (\Exception $e) {
            Log::error('Error al obtener módulos: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los módulos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function obtenerOperarios(Request $request)
    {
        try {
            // Clave de caché para todos los operarios, no específica del módulo
            $cacheKeyAllOperarios = 'all_operarios_list';
            $moduloSolicitado = $request->modulo;

            //Log::info('Verificando el caché para la llave: ' . $cacheKeyAllOperarios);

            if (Cache::has($cacheKeyAllOperarios)) {
                //Log::info('Cargando todos los operarios desde el caché...');
                $allOperarios = Cache::get($cacheKeyAllOperarios);
            } else {
                //Log::info('Cargando todos los operarios desde la base de datos...');
                $allOperarios = DB::connection('sqlsrv_dev')
                    ->table('Operarios_Views')
                    ->select('NumOperario', 'Nombre', 'Modulo') // Asegúrate de seleccionar 'Modulo'
                    ->distinct()
                    ->get();

                //Log::info('Operarios obtenidos de la BD: ', $allOperarios->toArray());

                // Almacenar todos los operarios en caché por 60 minutos (o el tiempo que consideres adecuado)
                Cache::put($cacheKeyAllOperarios, $allOperarios, now()->addMinutes(10));
                //Log::info('Todos los operarios almacenados en caché.');
            }

            // Aplicar lógica de ordenamiento y filtrado en el controlador
            $operariosDelModulo = collect();
            $otrosOperarios = collect();

            foreach ($allOperarios as $operario) {
                if ($operario->Modulo === $moduloSolicitado) {
                    $operariosDelModulo->push($operario);
                } else {
                    $otrosOperarios->push($operario);
                }
            }

            // Ordenar alfabéticamente los operarios del módulo
            $operariosDelModulo = $operariosDelModulo->sortBy('Nombre');

            // Ordenar alfabéticamente el resto de los operarios
            $otrosOperarios = $otrosOperarios->sortBy('Nombre');

            // Combinar las colecciones, poniendo primero los del módulo
            // Si $operariosDelModulo está vacío, $operariosFinal seguirá conteniendo todos los otros operarios
            $operariosFinal = $operariosDelModulo->merge($otrosOperarios);

            // Asegurarse de que no haya duplicados finales, aunque con distinct() y la lógica de merge es poco probable
            // Puedes agregar un unique si hay riesgo de que el merge introduzca duplicados (e.g., si un operario puede estar en múltiples módulos y se quiere ver solo una vez)
            // En este caso, ya que usamos distinct() al obtener, y luego los separamos por módulo, el merge no debería duplicar si NumOperario es único globalmente.
            // Si NumOperario no es globalmente único (ej. mismo NumOperario en diferentes módulos), deberías considerar qué campo es el único.
            // Por simplicidad, asumiremos que NumOperario es único para cada persona.

            return response()->json($operariosFinal->values()); // .values() para reindexar el array JSON
        } catch (\Exception $e) {
            Log::error('Error en ObtenerOperarios: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los Operarios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function catalogoProblemas()
    {
        $problemas = CatalogoProblema::where('estatus', 1)
            ->orderBy('nombre', 'asc')
            ->get(['id', 'nombre', 'descripcion', 'pasos']);
        return response()->json($problemas);
    }

    public function guardarRegistro(Request $request)
    {
        try {
            Log::info('Iniciando creación de ticket:', $request->all());

            // 1. VALIDACIÓN Y SANITIZACIÓN (SIN CAMBIOS)
            Log::info('Validando datos del formulario:', $request->all());
            $validatedData = $request->validate([
                'modulo'      => ['required', 'string', 'max:255'],
                'problema'    => ['required', 'string', 'max:255'],
                'maquina'     => ['required', 'string', 'max:255'],
                'descripcion' => ['required', 'string', 'max:255'],
                'status'      => 'required|string|in:1,2,3',
            ]);

            $sanitizedData = array_map(function ($value) {
                return trim(strip_tags($value));
            }, $validatedData);

            // Obtenemos el resto de los datos del request
            $tiempo_estimado = $request->tiempo_estimado_ia;
            $tiempo_real = $request->tiempo_real_ia;
            $Operario = $request->Operario;
            $NombreOperario = $request->NombreOperario;

            // Inicializamos la variable del mecánico. Será null a menos que lo busquemos y encontremos.
            $mecanicoAsignado = null;

            // 2. LÓGICA CONDICIONAL: BUSCAR MECÁNICO SÓLO SI ES NECESARIO
            // Si el estatus es '2' (Pendiente de asignar), ejecutamos la lógica de búsqueda.
            // Para estatus '1' (Resuelto) y '3' (Cancelado), nos saltamos este bloque.
            if ($sanitizedData['status'] === '2') {
                Log::info('Estatus es 2. Iniciando búsqueda de mecánico disponible.');

                $vinculaciones = Vinculacion::where('modulo', $sanitizedData['modulo'])->get();
                $ahora = now();
                $diaDeLaSemana = $ahora->dayOfWeekIso; // 1 para Lunes, 7 para Domingo.
                $mecanicosDisponibles = [];

                foreach ($vinculaciones as $vinculacion) {
                    $estaEnDescanso = false;
                    // Lógica de descansos y comidas... (sin cambios)
                    if ($diaDeLaSemana >= 1 && $diaDeLaSemana <= 5) {
                        $comidaInicio = Carbon::parse($vinculacion->hora_comida_inicio);
                        $comidaFin = Carbon::parse($vinculacion->hora_comida_fin);
                        if ($ahora->between($comidaInicio, $comidaFin)) {
                            $estaEnDescanso = true;
                        }
                        if (!$estaEnDescanso) {
                            $breakInicio = ($diaDeLaSemana <= 4) ? Carbon::parse($vinculacion->break_lunes_jueves_inicio) : Carbon::parse($vinculacion->break_viernes_inicio);
                            $breakFin = ($diaDeLaSemana <= 4) ? Carbon::parse($vinculacion->break_lunes_jueves_fin) : Carbon::parse($vinculacion->break_viernes_fin);
                            if ($ahora->between($breakInicio, $breakFin)) {
                                $estaEnDescanso = true;
                            }
                        }
                    }

                    if (!$estaEnDescanso) {
                        $mecanicosDisponibles[] = $vinculacion;
                    }
                }

                // Lógica de asignación por carga de trabajo... (sin cambios)
                if (count($mecanicosDisponibles) === 1) {
                    $mecanicoAsignado = $mecanicosDisponibles[0];
                } elseif (count($mecanicosDisponibles) > 1) {
                    $numerosEmpleado = collect($mecanicosDisponibles)->pluck('numero_empleado_mecanico');
                    $conteoTicketsHoy = AsignacionOt::whereIn('numero_empleado_mecanico', $numerosEmpleado)
                        ->whereDate('created_at', today())
                        ->select('numero_empleado_mecanico', DB::raw('count(*) as total'))
                        ->groupBy('numero_empleado_mecanico')
                        ->pluck('total', 'numero_empleado_mecanico');
                    
                    $mecanicosConCarga = collect($mecanicosDisponibles)->map(function ($mecanico) use ($conteoTicketsHoy) {
                        $mecanico->carga_hoy = $conteoTicketsHoy->get($mecanico->numero_empleado_mecanico, 0);
                        return $mecanico;
                    });
                    $mecanicoAsignado = $mecanicosConCarga->sortBy('carga_hoy')->first();
                }
                 Log::info('Búsqueda finalizada.', ['mecanico_encontrado' => $mecanicoAsignado ? $mecanicoAsignado->numero_empleado_mecanico : 'Ninguno']);
            } else {
                 Log::info('Estatus es 1 (Resuelto) o 3 (Cancelado). Omitiendo búsqueda de mecánico.');
            }


            // 3. CREAR REGISTROS EN UNA TRANSACCIÓN (Lógica unificada)
            $ticket = DB::transaction(function () use (
                $sanitizedData,
                $request,
                $mecanicoAsignado,
                $tiempo_estimado,
                $tiempo_real,
                $Operario,
                $NombreOperario
            ) {
                // Determinar el estado final del TICKET
                $estadoFinalDelTicket = 0;
                switch ($sanitizedData['status']) {
                    case '1':
                        $estadoFinalDelTicket = 1; // Resuelto
                        break;
                    case '3':
                        $estadoFinalDelTicket = 7; // Cancelado (mapeado a 7 como solicitaste)
                        break;
                    case '2':
                        // Si se buscó mecánico, el estado depende de si se encontró uno o no.
                        $estadoFinalDelTicket = $mecanicoAsignado ? $sanitizedData['status'] : 6; // 2: Asignado, 6: Pendiente
                        break;
                }

                // Generar folio único
                $folio = 'OT' . '-' . strtoupper(substr(md5(uniqid()), 0, 6));

                // Crear el TicketOT
                $newTicket = TicketOT::create([
                    'modulo'                     => $sanitizedData['modulo'],
                    'planta'                     => $request->planta ?? '1',
                    'nombre_supervisor'          => $request->nombre_supervisor ?? 'N/A',
                    'numero_empleado_supervisor' => $request->numero_empleado_supervisor ?? 'N/A',
                    'numero_empleado_operario'   => $Operario ?? 'N/A',
                    'nombre_operario'            => $NombreOperario ?? 'N/A',
                    'tipo_problema'              => $sanitizedData['problema'],
                    'descripcion_problema'       => $sanitizedData['descripcion'],
                    'maquina'                    => $sanitizedData['maquina'],
                    'folio'                      => $folio,
                    'estado'                     => $estadoFinalDelTicket,
                    'created_at'                 => now(),
                    'updated_at'                 => now()
                ]);
                Log::info('Ticket creado en transacción:', ['folio' => $newTicket->folio, 'estado_final' => $estadoFinalDelTicket]);

                // Preparar datos para la tabla de Asignación
                $asignacionData = [];
                if ($sanitizedData['status'] === '2' && $mecanicoAsignado) {
                    // CASO A: Se buscó y encontró un mecánico.
                    $asignacionData = [
                        'numero_empleado_mecanico' => $mecanicoAsignado->numero_empleado_mecanico,
                        'nombre_mecanico'          => $mecanicoAsignado->nombre_mecanico,
                        'estado_asignacion'        => 4, // Asignado
                        'comida_break_disponible'  => 1, // Disponible
                    ];
                } elseif ($sanitizedData['status'] === '2' && !$mecanicoAsignado) {
                    // CASO B: Se buscó pero NO se encontró un mecánico.
                    $asignacionData = [
                        'numero_empleado_mecanico' => 'pendiente',
                        'nombre_mecanico'          => 'pendiente',
                        'estado_asignacion'        => 6, // Estatus sin asignar
                        'comida_break_disponible'  => 0, // No disponible
                    ];
                } else {
                    // CASO C: El estatus era 1 (Resuelto) o 3 (Cancelado). No se buscó mecánico.
                    $asignacionData = [
                        'numero_empleado_mecanico' => 'N/A',
                        'nombre_mecanico'          => 'N/A',
                        'estado_asignacion'        => 0, // 0 Indica que no aplica asignación
                        'comida_break_disponible'  => 0, // No disponible
                    ];
                }

                // Crear la AsignacionOt
                AsignacionOt::create(array_merge($asignacionData, [
                    'ticket_ot_id'            => $newTicket->id,
                    'tiempo_estimado_minutos' => $tiempo_estimado ?? 0,
                    'tiempo_real_minutos'     => $tiempo_real ?? 0,
                    'fecha_asignacion'        => now(),
                ]));
                Log::info('Asignación creada en transacción.');
                
                return $newTicket; // La transacción devuelve el ticket
            });

            // 4. EMITIR EVENTO Y DEVOLVER RESPUESTA (SIN CAMBIOS)
            if ($ticket) {
                event(new NewOrderNotification($ticket));
                return response()->json([
                    'success' => true,
                    'folio'   => $ticket->folio,
                    'message' => 'Ticket creado con éxito',
                    'data'    => [
                        'modulo'     => $ticket->modulo,
                        'estado'     => $ticket->estado,
                        'created_at' => $ticket->created_at,
                    ]
                ], 201);
            }

            throw new \Exception('No se pudo completar la transacción para crear el ticket.');

        } catch (ValidationException $e) {
            Log::error('Error de validación:', ['errors' => $e->errors(), 'input' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Error de validación. Por favor, verifica todos los campos.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error inesperado:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString(), 'input' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    private function sendTicketCreatedEmail($ticket)
    {
        $toEmail = 'bteofilo@intimark.com.mx'; // Dirección de correo a la que enviar el mensaje
        Mail::send('emails.ticket_created', ['ticket' => $ticket], function ($message) use ($ticket, $toEmail) {
            $message->to($toEmail)
                ->subject('Nuevo Ticket Creado: ' . $ticket->Folio);
        });
    }

    public function obtenerAreasModulosSeguimiento()
    {
        try {
            $modulos = TicketOt::where('created_at', '>=', now()->subDays(10)) // 1. Filtra por los últimos 30 días
                              ->select('modulo')      // 2. Selecciona solo la columna 'modulo'
                              ->distinct()            // 3. Obtiene solo valores únicos
                              ->orderBy('modulo', 'asc') // 4. Ordena alfabéticamente
                              ->get();       // 5. Devuelve un array simple ['Modulo A', 'Modulo B', ...]

            return response()->json($modulos);

        } catch (\Exception $e) {
            Log::error('Error al obtener módulos desde TicketsOt: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudieron cargar los módulos'], 500);
        }
    }

}
