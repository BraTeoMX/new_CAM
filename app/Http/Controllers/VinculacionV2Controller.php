<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\NewOrderNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\CatalogoArea;
use App\Models\TicketOt;
use App\Models\Vinculacion;

class VinculacionV2Controller extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('vinculacion.index');
    }

    public function obtenerMecanicos()
    {
        try {
            $mecanicos = Cache::remember('mecanicos_cache', now()->addHours(2), function () {
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

    public function obtenerSupervisores()
    {
        try {
            $supervisores = Cache::remember('vinculo_ supervisores_cache', now()->addHours(2), function () {
                // 1. Obtener áreas desde MySQL (modelo local)
                $areas = CatalogoArea::selectRaw("nombre as modulo, nombre, 'N/A' as numero_empleado, planta")
                    ->where('estatus', 1)
                    ->orderBy('modulo')
                    ->get()
                    ->map(function ($area) {
                        $area->planta = (string) $area->planta;
                        return $area;
                    });
                // 2. Obtener supervisores desde SQL Server
                $supervisores = DB::connection('sqlsrv_dev')
                    ->table('catalogo_supervisores')
                    ->select('modulo', 'nombre', 'numero_empleado', 'planta')
                    ->orderBy('modulo')
                    ->get();

                // 3. Unir ambas colecciones (áreas primero)
                return $areas->concat($supervisores);
            });
            Log::info('Supervisores obtenidos:', $supervisores->toArray());
            return response()->json($supervisores);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los datos de supervisores.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function guardarVinculacion(Request $request)
    {
        try {
            // Validación de los datos recibidos
            $validatedData = $request->validate([
                'numero_empleado_supervisor' => 'required|string',
                'nombre_supervisor' => 'required|string',
                'planta' => 'required|integer',
                'modulo' => 'required|string',
                'nombre_mecanico' => 'required|string',
                'numero_empleado_mecanico' => 'required|string',
            ]);

            // Crear el nuevo registro usando el modelo Vinculacion
            // Asegúrate que los nombres de las columnas coincidan con tu modelo/migración
            Vinculacion::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Vinculación creada exitosamente.'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al guardar la vinculación: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al guardar la vinculación.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function mostrarRegistros()
    {
        try {
            $vinculaciones = Vinculacion::orderBy('modulo')->get();

            $vinculaciones = $vinculaciones->map(function ($item) {
                // --- INICIO DE LA MODIFICACIÓN ---
                
                // Guardamos los datos originales que necesitaremos en el frontend
                $item->supervisor_original = [
                    'numero_empleado' => $item->numero_empleado_supervisor,
                    'nombre' => $item->nombre_supervisor,
                    'planta' => $item->getOriginal('planta'), // Obtener el valor numérico original
                    'modulo' => $item->modulo,
                ];
                $item->mecanico_original = [
                    'numero_empleado' => $item->numero_empleado_mecanico,
                    'nombre' => $item->nombre_mecanico,
                    'planta' => $item->getOriginal('planta'),
                ];

                // Ahora transformamos el valor de la planta a texto para mostrarlo en la tabla
                $item->planta = match ($item->getOriginal('planta')) {
                    1 => 'Ixtlahuaca',
                    2 => 'San Bartolo',
                    default => 'Sin Planta',
                };
                
                // --- FIN DE LA MODIFICACIÓN ---
                return $item;
            });

            return response()->json($vinculaciones);
        } catch (\Exception $e) {
            Log::error('Error al obtener los registros de vinculaciones: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los registros de vinculaciones.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function actualizarMasivo(Request $request)
    {
        // 1. Validación de los datos recibidos
        $validator = Validator::make($request->all(), [
            // Valida que 'vinculaciones' sea un array y que esté presente
            'vinculaciones'   => 'required|array',
            // Valida cada elemento dentro del array 'vinculaciones'
            'vinculaciones.*.id' => 'required|integer|exists:vinculaciones,id', // El ID debe existir en la tabla
            'vinculaciones.*.hora_comida_inicio' => 'nullable|date_format:H:i',
            'vinculaciones.*.break_lunes_jueves_inicio' => 'nullable|date_format:H:i',
            'vinculaciones.*.break_viernes_fin' => 'nullable|date_format:H:i',
            'vinculaciones.*.hora_comida_fin' => 'nullable|date_format:H:i',
            'vinculaciones.*.break_lunes_jueves_fin' => 'nullable|date_format:H:i',
            'vinculaciones.*.break_viernes_fin' => 'nullable|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422); // Error de validación
        }

        $vinculacionesData = $request->input('vinculaciones');

        // 2. Usar una transacción para garantizar la integridad de los datos
        DB::beginTransaction();
        try {
            foreach ($vinculacionesData as $data) {
                // Busca la vinculación por su ID
                $vinculacion = Vinculacion::find($data['id']);

                if ($vinculacion) {
                    // Actualiza solo los campos necesarios
                    $vinculacion->update([
                        // Si el valor es un string vacío "" (desde el "Seleccionar"), lo convierte a null
                        'hora_comida_inicio' => $data['hora_comida_inicio'] ?: null,
                        'break_lunes_jueves_inicio' => $data['break_lunes_jueves_inicio'] ?: null,
                        'break_viernes_inicio' => $data['break_viernes_inicio'] ?: null,
                        'hora_comida_fin' => $data['hora_comida_fin'] ?: null,
                        'break_lunes_jueves_fin' => $data['break_lunes_jueves_fin'] ?: null,
                        'break_viernes_fin' => $data['break_viernes_fin'] ?: null,
                    ]);
                }
            }

            DB::commit(); // Confirma los cambios si todo salió bien

            return response()->json(['message' => 'Vinculaciones actualizadas correctamente.']);

        } catch (\Exception $e) {
            DB::rollBack(); // Revierte todos los cambios si algo falla
            Log::error('Error en la actualización masiva de vinculaciones: ' . $e->getMessage());

            return response()->json(['message' => 'Ocurrió un error en el servidor.'], 500);
        }
    }

    public function actualizarIndividual(Request $request, $id)
    {
        // 1. Validación de los datos recibidos
        $validator = Validator::make($request->all(), [
            'numero_empleado_supervisor' => 'required|string',
            'nombre_supervisor'      => 'required|string',
            'planta'                 => 'required|integer',
            'modulo'                 => 'required|string',
            'nombre_mecanico'        => 'required|string',
            'numero_empleado_mecanico' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Buscar la vinculación a actualizar
        $vinculacion = Vinculacion::find($id);

        if (!$vinculacion) {
            return response()->json(['message' => 'El registro no fue encontrado.'], 404);
        }

        // 3. Actualizar el registro
        try {
            $vinculacion->update($request->all());

            return response()->json(['message' => 'La vinculación ha sido actualizada correctamente.']);

        } catch (\Exception $e) {
            Log::error('Error al actualizar vinculación individual: ' . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error en el servidor al actualizar.'], 500);
        }
    }

}
