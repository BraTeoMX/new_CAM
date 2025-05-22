<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TicketOT;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\NewOrderNotification;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\AsignationOTController;

class FormGuestController extends Controller
{
    public function FormGuest()
    {
        try {
            // Obtener Segundas y Terceras Generales
            return view('pages.FormGuest.FormGuest');
        } catch (\Exception $e) {
            // Manejar la excepción, por ejemplo, loguear el error
            Log::error('Error al obtener Segundas: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al obtener los datos.',
                'status' => 'error'
            ], 500);
        }
    }
    public function ObtenerModulos()
    {
        try {
            $cacheKey = 'modulos';

            Log::info('Verificando el caché...');
            if (cache()->has($cacheKey)) {
                Log::info('Cargando módulos desde el caché...');
                $modulos = cache()->get($cacheKey);
            } else {
                Log::info('Cargando módulos desde la base de datos...');
                $modulos = DB::connection('sqlsrv_dev')
                    ->table('Supervisores_views')
                    ->select('Modulo')
                    ->distinct()
                    ->get();

                Log::info('Módulos obtenidos: ', $modulos->toArray());

                cache()->put($cacheKey, $modulos, now()->addDay());
                Log::info('Módulos almacenados en caché.');
            }

            return response()->json($modulos);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los módulos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function ticketsOT(Request $request)
    {
        try {
            Log::info('Iniciando creación de ticket:', $request->all());

            // Validación actualizada
            $validatedData = $request->validate([
                'modulo' => ['required', 'string', 'max:255'],
                'problema' => ['required', 'string', 'max:255'],
                'maquina' => ['required', 'string', 'max:255'],
                'descripcion' => ['required', 'string', 'max:255'],
                'status' => ['required', 'string', 'in:AUTONOMO,SIN_ASIGNAR'],
            ]);

            // Sanitizar datos
            $sanitizedData = array_map(function($value) {
                return trim(strip_tags($value));
            }, $validatedData);

            // Verificar existencia del módulo
            $moduloExists = DB::connection('sqlsrv_dev')
                ->table('Supervisores_views')
                ->where('Modulo', $sanitizedData['modulo'])
                ->exists();

            if (!$moduloExists) {
                Log::warning('Módulo no encontrado:', ['modulo' => $sanitizedData['modulo']]);
                return response()->json([
                    'success' => false,
                    'message' => 'El módulo especificado no existe'
                ], 422);
            }

            $tiempo_estimado = $request->tiempo_estimado_ia;
            $tiempo_real = $request->tiempo_real_ia;
            // Generar folio único
            $folio = 'OT' .'-'. strtoupper(substr(md5(uniqid()), 0, 6));

            // Preparar datos para el registro
            $ticketData = [
                'Modulo' => $sanitizedData['modulo'],
                'Tip_prob' => $sanitizedData['problema'],
                'Descrip_prob' => $sanitizedData['problema'],
                'Maquina' => $sanitizedData['maquina'],
                'Folio' => $folio,
                'Status' => $sanitizedData['status'],
                'created_at' => now(),
                'updated_at' => now()
            ];

            Log::info('Preparando para crear ticket:', $ticketData);

            // Crear el ticket dentro de una transacción
            $ticket = DB::transaction(function () use ($ticketData) {
                $newTicket = TicketOT::create($ticketData);
                Log::info('Ticket creado exitosamente:', ['folio' => $newTicket->Folio]);
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
                        'status' => $ticket->Status,
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
        $toEmail = 'adejesus@intimark.com.mx'; // Dirección de correo a la que enviar el mensaje
        Mail::send('emails.ticket_created', ['ticket' => $ticket], function ($message) use ($ticket, $toEmail) {
            $message->to($toEmail)
                ->subject('Nuevo Ticket Creado: ' . $ticket->Folio);
        });
    }
}
