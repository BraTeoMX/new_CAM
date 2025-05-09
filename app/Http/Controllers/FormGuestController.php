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
            $cacheKey = 'modulos';

            Log::info('Verificando el caché...');
            if (cache()->has($cacheKey)) {
                Log::info('Cargando módulos desde el caché...');
                $modulos = cache()->get($cacheKey);
            } else {
                Log::info('Cargando módulos desde la base de datos...');
                $modulos = DB::connection('sqlsrv')
                    ->table('CatModuloOperario_View')
                    ->select('MODULEID')
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
            Log::info('Datos recibidos:', $request->all());  // Agregar log para debug

            // Validar los datos de entrada
            $validatedData = $request->validate([
                'modulo' => 'required|string|max:255',
                'problema' => 'required|string|max:255',
                'descripcion' => 'required|string|max:5000',
                'status' => 'required|string|in:Autonomo,SIN_ASIGNAR'
            ]);

            // Generar un folio único más corto
            $folio = 'OT-' . strtoupper(substr(md5(uniqid()), 0, 6));

            // Mapear los campos al formato esperado por el modelo
            $ticketData = [
                'Modulo' => $validatedData['modulo'],
                'Tip_prob' => $validatedData['problema'],
                'Descrip_prob' => $validatedData['descripcion'],
                'Folio' => $folio,
                'Status' => $validatedData['status']
            ];

            // Guardar en la base de datos
            $ticket = TicketOT::create($ticketData);

            Log::info('Ticket creado:', $ticket->toArray());

            // Emitir el evento NewOrderNotification
            event(new NewOrderNotification($ticket));

            // Enviar correo electrónico
            $this->sendTicketCreatedEmail($ticket);

            return response()->json([
                'success' => true,
                'folio' => $folio,
                'message' => 'Ticket creado con éxito'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error inesperado:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al registrar el ticket: ' . $e->getMessage()
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
