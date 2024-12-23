<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TicketOT;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\NewOrderNotification;
use Illuminate\Support\Facades\Mail;

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
            // Clave única para identificar el cache de módulos
            $cacheKey = 'modulos';

            // Verificar si los módulos están en caché
            if (cache()->has($cacheKey)) {
                Log::info('Cargando módulos desde el caché...');
                $modulos = cache()->get($cacheKey);
            } else {
                Log::info('Cargando módulos desde la base de datos...');
                // Consultar la base de datos
                $modulos = DB::connection('sqlsrv')
                    ->table('CatModuloOperario_View')
                    ->select('MODULEID')
                    ->distinct()
                    ->get();

                // Guardar en caché por 1 día
                cache()->put($cacheKey, $modulos, now()->addDay());
                Log::info('Módulos almacenados en caché.');
            }

            return response()->json($modulos);
        } catch (\Exception $e) {
            // Manejo de errores
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
                // Validar los datos de entrada
                $validatedData = $request->validate([
                    'modulo' => 'required|string|max:255',
                    'numeroEmpleado' => 'required|string|max:255',
                    'subject' => 'required|string|max:255',
                    'description' => 'required|string|max:5000',
                ]);

                Log::info('Datos validados: ', $validatedData);

                // Generar un folio único más corto (Ejemplo: OT-1A3B6C)
                $folio = 'OT-' . strtoupper(substr(md5(uniqid()), 0, 6));

                // Guardar en la base de datos
                $ticket = TicketOT::create([
                    'Modulo' => $validatedData['modulo'],
                    'Num_empl' => $validatedData['numeroEmpleado'],
                    'Tip_prob' => $validatedData['subject'],
                    'Descrip_prob' => $validatedData['description'],
                    'Folio' => $folio,
                    'Status' => 'SIN ASIGNAR',
                ]);

                Log::info('Ticket creado: ', $ticket->toArray());

                // Emitir el evento NewOrderNotification
                event(new NewOrderNotification($ticket));
                Log::info('Evento NewOrderNotification emitido', ['ticket' => $ticket]);

                // Enviar correo electrónico
                $this->sendTicketCreatedEmail($ticket);

                // Respuesta de éxito
                return response()->json([
                    'success' => true,
                    'folio' => $folio,
                    'message' => 'Ticket creado con éxito.',
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                // Errores de validación
                Log::error('Error de validación: ', $e->errors());
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $e->errors(),
                ], 422);
            } catch (\Exception $e) {
                // Otros errores
                Log::error('Error inesperado: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Ocurrió un error al registrar el ticket',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        public function updateTicketStatus(Request $request, $folio)
        {
            try {
                $ticket = TicketOT::where('Folio', $folio)->firstOrFail();
                $ticket->Status = $request->input('status');
                $ticket->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Estado del ticket actualizado con éxito.',
                ]);
            } catch (\Exception $e) {
                Log::error('Error al actualizar el estado del ticket: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Ocurrió un error al actualizar el estado del ticket',
                    'error' => $e->getMessage(),
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
?>
