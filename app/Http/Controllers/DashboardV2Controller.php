<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\TicketOt;
use App\Models\AsignacionOt;
use App\Models\CatalogoEstado;
use App\Models\CatalogoArea;
use App\Models\DiagnosticoSolucion;
use App\Models\TiempoBahia;

class DashboardV2Controller extends Controller
{
    public function index()
    {
        return view('dashboard.index');
    }

    /**
     * Obtiene y devuelve los meses del año actual que tienen registros en `tickets_ot`.
     * Esta función está diseñada para ser llamada vía AJAX.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function obtenerMeses()
    {
        try {
            $currentYear = Carbon::now()->year;

            // Consulta para obtener los meses únicos del año actual que tienen tickets.
            // Se ordena de forma descendente para que el mes más reciente aparezca primero.
            $monthsData = TicketOt::select(
                    DB::raw('DISTINCT MONTH(created_at) as month_number')
                )
                ->whereYear('created_at', $currentYear)
                ->orderBy('month_number', 'desc') // Ordenar de más reciente a más antiguo
                ->get();
            
            // Si no se encuentran meses, devuelve un array vacío.
            if ($monthsData->isEmpty()) {
                return response()->json([]);
            }

            // Transforma la colección para que sea fácil de usar en JavaScript.
            // Incluye el número del mes y el nombre traducido.
            $formattedMonths = $monthsData->map(function ($item) {
                return [
                    'value' => $item->month_number,
                    'text' => Carbon::create()->month($item->month_number)->translatedFormat('F') // ej. "Julio"
                ];
            });

            return response()->json($formattedMonths);

        } catch (\Exception $e) {
            // En caso de un error de base de datos, devuelve un error 500.
            // Log::error('Error al obtener meses del dashboard: ' . $e->getMessage()); // Opcional: loguear el error
            return response()->json(['error' => 'No se pudieron cargar los datos de los meses.'], 500);
        }
    }
}
