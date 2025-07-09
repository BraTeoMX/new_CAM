<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\NewOrderNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\CatalogoArea;
use App\Models\TicketOt;

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
                $modulosCatalogo = CatalogoArea::select('nombre as modulo')
                                            ->where('estatus', 1)
                                            ->orderBy('modulo')
                                            ->get()
                                            ->map(function ($item) {
                                                // CORRECCIÓN: Usar sintaxis de objeto para añadir la propiedad 'tipo'
                                                $item->tipo = 'catalogo';
                                                return $item;
                                            });

                // 2. Obtener los módulos de modulo_supervisor_views
                $modulosSupervisores = DB::connection('sqlsrv_dev')
                                        ->table('modulo_supervisor_views')
                                        ->select('modulo', 'planta')
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
                Log::info('Módulos combinados obtenidos de la base de datos', ['modulos' => $modulos->toArray()]);

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

    public function guardarRegistro(Request $request)
    {
        try {
            //Log::info('Iniciando creación de ticket:', $request->all());

            // Validación actualizada
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

            // Emitir evento y enviar email solo si se creó el ticket
            if ($ticket) {
                event(new NewOrderNotification($ticket));
                $this->sendTicketCreatedEmail($ticket);

                // Llamar a la asignación de OT
                $asignacionController = new AsignationOTController();
                $asignacionRequest = new Request([
                    'folio' => $ticket->Folio,
                    'modulo' => $ticket->Modulo,
                    'operario' => $Operario,
                    'nombreoperario' => $NombreOperario,
                    'maquina' => $ticket->Maquina,
                    'timeAutonomo' => $tiempo_estimado,
                    'timerealAutonomo' => $tiempo_real,
                    'status' => $ticket->Status,
                    'descripcion' => $ticket->Descrip_prob,
                    'created_at' => $ticket->created_at->toDateTimeString(),
                ]);
                $asignacionResponse = $asignacionController->asignarOT($asignacionRequest);
                $asignacionData = $asignacionResponse->getData(true);

                return response()->json([
                    'success' => true,
                    'folio' => $folio,
                    'message' => 'Ticket creado con éxito',
                    'data' => [
                        'modulo' => $ticket->Modulo,
                        'estado' => $ticket->Status,
                        'created_at' => $ticket->created_at,
                        'asignacion' => $asignacionData
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
