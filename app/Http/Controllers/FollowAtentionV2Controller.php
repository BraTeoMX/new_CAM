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

    public function obtenerResumen($modulo)
    {
        try {
            Log::info('Obteniendo resumen para el módulo: ' . $modulo);
            // 1. Obtenemos todos los nombres de estados posibles desde el catálogo.
            // Esto nos asegura que siempre devolveremos todos los contadores, incluso si están en 0.
            $todosLosEstados = CatalogoEstado::pluck('nombre')->flip()->map(fn() => 0)->all();
            
            // 2. Hacemos la consulta para contar los tickets por estado para el módulo y fecha dados.
            $conteoPorEstado = TicketOt::with('catalogoEstado') // Precargamos la relación
                ->where('modulo', $modulo)
                ->where('created_at', '>=', now()->subDays(10))
                ->select('estado', DB::raw('count(*) as total'))
                ->groupBy('estado')
                ->get()
                ->pluck('total', 'catalogoEstado.nombre'); // Clave: nombre del estado, Valor: total

            // 3. Combinamos el conteo real con nuestra plantilla de ceros.
            $resumen = array_merge($todosLosEstados, $conteoPorEstado->all());

            // 4. Calculamos el total general.
            $resumen['TOTAL'] = array_sum($resumen);
            
            return response()->json($resumen);

        } catch (\Exception $e) {
            Log::error('Error al obtener el resumen: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudo cargar el resumen'], 500);
        }
    }

}
