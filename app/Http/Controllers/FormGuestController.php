<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TicketOT;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\NewOrderNotification;

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
    public function ObtenerEmpleados(Request $request)
    {
        // Validar que se recibe el parámetro 'modulo'
        $request->validate([
            'modulo' => 'required'
        ]);

        // Obtener el ID del módulo desde la solicitud
        $moduloID = $request->input('modulo');
        $cacheKey = 'empleados_modulo_' . $moduloID; // Generar clave única para cada módulo

        try {
            // Verificar si los empleados están en caché
            if (cache()->has($cacheKey)) {
                Log::info("Cargando empleados desde el caché para el módulo: $moduloID");
                $empleados = cache()->get($cacheKey);
            } else {
                Log::info("Cargando empleados desde la base de datos para el módulo: $moduloID");
                // Consultar la base de datos
                $empleados = DB::connection('sqlsrv')
                    ->table('CatModuloOperario_View')
                    ->select('PERSONNELNUMBER')
                    ->where('MODULEID', $moduloID) // Filtrar por módulo
                    ->distinct()
                    ->get();

                // Guardar en caché por 1 día
                cache()->put($cacheKey, $empleados, now()->addDay());
                Log::info("Empleados del módulo $moduloID almacenados en caché.");
            }

            // Devolver los resultados en formato JSON
            return response()->json($empleados);
        } catch (\Exception $e) {
            // Manejo de errores
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los empleados',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function ObtenerNombre(Request $request)
    {
        // Validar que se recibe el parámetro 'numeroEmpleado'
        $request->validate([
            'numeroEmpleado' => 'required'
        ]);

        $numeroEmpleado = $request->input('numeroEmpleado'); // Obtener el número de empleado
        Log::info('Número de empleado recibido: ' . $numeroEmpleado);

        // Verificar si el nombre está en la caché
        $cacheKey = "nombre_empleado_{$numeroEmpleado}";

        if (cache()->has($cacheKey)) {
            // Si está en caché, devolverlo desde allí
            $nombre = cache()->get($cacheKey);
        } else {
            // Si no está en caché, realizar la consulta a la base de datos
            try {
                $nombre = DB::connection('sqlsrv')
                    ->table('CatModuloOperario_View')
                    ->select('NAME')
                    ->where('PERSONNELNUMBER', $numeroEmpleado)
                    ->distinct()
                    ->value('NAME'); // Obtener solo un valor único

                // Guardar el nombre en la caché durante 24 horas
                cache()->put($cacheKey, $nombre, now()->addDay());
            } catch (\Exception $e) {
                // Manejo de errores
                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener el nombre',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        // Devolver el nombre en formato JSON
        return response()->json([
            'success' => true,
            'name' => $nombre
        ]);
    }


    public function ticketsOT(Request $request)
    {
        try {
            // Validar los datos de entrada
            $validatedData = $request->validate([
                'modulo' => 'required|string|max:255',
                'numeroEmpleado' => 'required|string|max:255',
                'name' => 'required|string|max:255',
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
                'Nombre' => $validatedData['name'],
                'Tip_prob' => $validatedData['subject'],
                'Descrip_prob' => $validatedData['description'],
                'Folio' => $folio,
                'Status' => 'Aprobado',
            ]);

            Log::info('Ticket creado: ', $ticket->toArray());

            // Emitir el evento NewOrderNotification
            event(new NewOrderNotification($ticket));
            Log::info('Evento NewOrderNotification emitido', ['ticket' => $ticket]);

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

}
