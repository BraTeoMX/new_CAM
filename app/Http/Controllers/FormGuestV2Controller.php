<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Events\NewOrderNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

            // Validación actualizada
            Log::info('Validando datos del formulario:', $request->all());
            $validatedData = $request->validate([
                'modulo' => ['required', 'string', 'max:255'],
                'problema' => ['required', 'string', 'max:255'],
                'maquina' => ['required', 'string', 'max:255'],
                'descripcion' => ['required', 'string', 'max:255'],
                'status' => 'required|string|in:1,2,3', 
            ]);

            // Sanitizar datos
            $sanitizedData = array_map(function($value) {
                return trim(strip_tags($value));
            }, $validatedData);

            $tiempo_estimado = $request->tiempo_estimado_ia;
            $tiempo_real = $request->tiempo_real_ia;
            $Operario = $request->Operario;
            $NombreOperario = $request->NombreOperario;

            // Generar folio único
            $folio = 'OT' .'-'. strtoupper(substr(md5(uniqid()), 0, 6));

            // Preparar datos para el registro
            $ticketData = [
                'modulo' => $sanitizedData['modulo'],
                'planta' => $request->planta ?? '1', // Asignar planta por defecto si no se proporciona
                'nombre_supervisor' => $request->nombre_supervisor ?? 'N/A', // Asignar nombre de supervisor por defecto si no se proporciona
                'numero_empleado_supervisor' => $request->numero_empleado_supervisor ?? 'N/A', // Asignar número de empleado de supervisor por defecto si no se proporciona
                'numero_empleado_operario' => $Operario,
                'nombre_operario' => $NombreOperario,
                'tipo_problema' => $sanitizedData['problema'],
                'descripcion_problema' => $sanitizedData['problema'],
                'maquina' => $sanitizedData['maquina'],
                'folio' => $folio,
                'estado' => $sanitizedData['status'],
                'created_at' => now(),
                'updated_at' => now()
            ];

            //Log::info('Preparando para crear ticket:', $ticketData);

            // Crear el ticket dentro de una transacción
            $ticket = DB::transaction(function () use ($ticketData) {
                $newTicket = TicketOT::create($ticketData);
                //Log::info('Ticket creado exitosamente:', ['folio' => $newTicket->Folio]);
                return $newTicket;
            });
            // 1. Obtener todas las vinculaciones para el módulo del ticket.
            $vinculaciones = Vinculacion::where('modulo', $ticket->modulo)->get();

            $mecanicoSeleccionado = null;
            $ahora = now(); // Obtiene la fecha y hora actual.
            $diaDeLaSemana = $ahora->dayOfWeekIso; // 1 para Lunes, 7 para Domingo.

            $mecanicosDisponibles = [];

            // 2. Filtrar para encontrar todos los mecánicos DISPONIBLES POR HORARIO.
            foreach ($vinculaciones as $vinculacion) {
                $estaEnDescanso = false;

                // Solo se realizan verificaciones de horario de Lunes a Viernes.
                if ($diaDeLaSemana >= 1 && $diaDeLaSemana <= 5) {
                    // Verificación de Hora de Comida
                    $comidaInicio = Carbon::parse($vinculacion->hora_comida_inicio);
                    $comidaFin = Carbon::parse($vinculacion->hora_comida_fin);
                    if ($ahora->between($comidaInicio, $comidaFin)) {
                        $estaEnDescanso = true;
                    }

                    // Verificación de Breaks (solo si no está en hora de comida)
                    if (!$estaEnDescanso) {
                        $breakInicio = null;
                        $breakFin = null;
                        if ($diaDeLaSemana <= 4) { // Lunes a Jueves
                            $breakInicio = Carbon::parse($vinculacion->break_lunes_jueves_inicio);
                            $breakFin = Carbon::parse($vinculacion->break_lunes_jueves_fin);
                        } else { // Viernes
                            $breakInicio = Carbon::parse($vinculacion->break_viernes_inicio);
                            $breakFin = Carbon::parse($vinculacion->break_viernes_fin);
                        }
                        if ($ahora->between($breakInicio, $breakFin)) {
                            $estaEnDescanso = true;
                        }
                    }
                }
                
                // Si el mecánico no está en descanso, se añade a la lista de disponibles.
                if (!$estaEnDescanso) {
                    $mecanicosDisponibles[] = $vinculacion;
                }
            }

            // 3. Evaluar la lista de mecánicos disponibles y aplicar la nueva lógica.
            $cantidadDisponibles = count($mecanicosDisponibles);

            if ($cantidadDisponibles === 1) {
                // CASO 1: Solo hay un mecánico disponible. Se le asigna directamente.
                $mecanicoAsignado = $mecanicosDisponibles[0];

            } elseif ($cantidadDisponibles > 1) {
                // CASO 2: Hay múltiples mecánicos disponibles. Evaluar carga de trabajo.
                
                // Obtener los números de empleado de los mecánicos disponibles
                $numerosEmpleado = collect($mecanicosDisponibles)->pluck('numero_empleado_mecanico');

                // Contar los tickets asignados HOY para cada mecánico disponible
                $conteoTicketsHoy = AsignacionOt::whereIn('numero_empleado_mecanico', $numerosEmpleado)
                                            ->whereDate('created_at', today())
                                            ->select('numero_empleado_mecanico', DB::raw('count(*) as total'))
                                            ->groupBy('numero_empleado_mecanico')
                                            ->pluck('total', 'numero_empleado_mecanico');

                // Añadir el conteo de tickets a cada mecánico disponible. Si no tiene, su conteo es 0.
                $mecanicosConCarga = collect($mecanicosDisponibles)->map(function ($mecanico) use ($conteoTicketsHoy) {
                    $mecanico->carga_hoy = $conteoTicketsHoy->get($mecanico->numero_empleado_mecanico, 0);
                    return $mecanico;
                });

                // Ordenar los mecánicos por su carga de trabajo (de menor a mayor).
                // El primero de la lista será el que tenga menos trabajo.
                $mecanicoAsignado = $mecanicosConCarga->sortBy('carga_hoy')->first();
            }
            // Si $cantidadDisponibles es 0, $mecanicoAsignado permanecerá como null y se creará una asignación pendiente.


            // 4. Crear el registro de asignación basado en el mecánico seleccionado.
            if ($mecanicoAsignado) {
                // Se encontró y seleccionó un mecánico.
                AsignacionOt::create([
                    'ticket_ot_id' => $ticket->id,
                    'numero_empleado_mecanico' => $mecanicoAsignado->numero_empleado_mecanico,
                    'nombre_mecanico' => $mecanicoAsignado->nombre_mecanico,
                    'estado_asignacion' => 4, // Asignado
                    'tiempo_estimado_minutos' => $tiempo_estimado,
                    'tiempo_real_minutos' => $tiempo_real,
                    'fecha_asignacion' => now(),
                    'comida_break_disponible' => 1 // Disponible
                ]);

                // Actualizar el ticket con el mecánico asignado
                //$ticket->numero_empleado_mecanico = $mecanicoAsignado->numero_empleado_mecanico;
                $ticket->save();

            } else {
                // No se encontró ningún mecánico disponible.
                AsignacionOt::create([
                    'ticket_ot_id' => $ticket->id,
                    'numero_empleado_mecanico' => 'pendiente',
                    'nombre_mecanico' => 'pendiente',
                    'estado_asignacion' => 5, // Pendiente por disponibilidad
                    'tiempo_estimado_minutos' => $tiempo_estimado,
                    'tiempo_real_minutos' => $tiempo_real,
                    'fecha_asignacion' => now(),
                    'comida_break_disponible' => 0 // No disponible
                ]);
            }

            // Emitir evento y enviar email solo si se creó el ticket
            if ($ticket) {
                event(new NewOrderNotification($ticket));
                // desccomentar la siguiente línea si se desea enviar un correo electrónico al crear el ticket
                //$this->sendTicketCreatedEmail($ticket);

                // Llamar a la asignación de OT
                /* $asignacionController = new AsignationOTController();
                $asignacionRequest = new Request([
                    'folio' => $ticket->folio,
                    'modulo' => $ticket->modulo,
                    'operario' => $ticket->nombre_operario,
                    'maquina' => $ticket->maquina,
                    'timeAutonomo' => $tiempo_estimado,
                    'timerealAutonomo' => $tiempo_real,
                    'status' => $ticket->Status,
                    'descripcion' => $ticket->Descrip_prob,
                    'created_at' => $ticket->created_at->toDateTimeString(),
                ]);
                $asignacionResponse = $asignacionController->asignarOT($asignacionRequest);
                $asignacionData = $asignacionResponse->getData(true);
                */
                return response()->json([
                    'success' => true,
                    'folio' => $folio,
                    'message' => 'Ticket creado con éxito',
                    'data' => [
                        'modulo' => $ticket->modulo,
                        'estado' => $ticket->estado,
                        'created_at' => $ticket->created_at,
                        //'asignacion' => $asignacionData
                    ]
                ], 201);
                
            }

            throw new \Exception('No se pudo crear el ticket');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación:', [
                'errors' => $e->errors(),
                'input' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error de validación. Por favor, verifica todos los campos.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error inesperado:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud',
                'error' => $e->getMessage()
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

}
