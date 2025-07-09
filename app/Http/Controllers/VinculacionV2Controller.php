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
            $mecanicos = DB::connection('sqlsrv_dev')
                ->table('catalogo_mecanicos')
                ->select('nombre', 'numero_empleado', 'planta')
                ->orderBy('nombre')
                ->get();

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
            $supervisores = DB::connection('sqlsrv_dev')
                ->table('catalogo_supervisores')
                ->select('modulo', 'nombre', 'numero_empleado', 'planta')
                ->orderBy('modulo')
                ->get();
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

}
