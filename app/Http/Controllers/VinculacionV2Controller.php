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
use App\Models\CatalogoProblema;

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
                ->select('nombre', 'numero_empleado')
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

}
