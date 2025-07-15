<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ClasseMaquina;
use Illuminate\Support\Facades\DB;
use App\Models\TicketOt;
use App\Models\AsignacionOt;
use App\Models\CatalogoEstado;
use App\Models\CatalogoArea;
use App\Models\DiagnosticoSolucion;

class FollowAtentionV2Controller extends Controller
{

    public function index()
    {
        return view('followOT.index');
    }

    public function obtenerAreaModulos()
    {
        try {
            $modulos = TicketOt::where('created_at', '>=', now()->subDays(10)) // 1. Filtra por los últimos 30 días
                              ->select('modulo')      // 2. Selecciona solo la columna 'modulo'
                              ->distinct()            // 3. Obtiene solo valores únicos
                              ->orderBy('modulo', 'asc') // 4. Ordena alfabéticamente
                              ->pluck('modulo');       // 5. Devuelve un array simple ['Modulo A', 'Modulo B', ...]

            return response()->json($modulos);

        } catch (\Exception $e) {
            Log::error('Error al obtener módulos desde TicketsOt: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudieron cargar los módulos'], 500);
        }
    }
}
