<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\CatalogoArea;

class FormGuestV2Controller extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('formGuest.index');
    }

    public function obtenerAreasModulos()
    {
        try {
            $cacheKey = 'modulos_combinados_con_tipo'; // Nueva clave del caché

            if (Cache::has($cacheKey)) {
                $modulos = Cache::get($cacheKey);
            } else {
                // 1. Obtener los módulos de CatalogoArea
                // Añadimos una columna 'tipo' para identificar su origen
                $modulosCatalogo = CatalogoArea::select('nombre as modulo')
                                               ->where('estatus', 1)
                                               ->orderBy('modulo')
                                               ->get()
                                               ->map(function ($item) {
                                                   $item['tipo'] = 'catalogo'; // Añadimos el tipo 'catalogo'
                                                   return $item;
                                               });

                // 2. Obtener los módulos de modulo_supervisor_views
                // Añadimos una columna 'tipo' para identificar su origen
                $modulosSupervisores = DB::connection('sqlsrv_dev')
                                         ->table('modulo_supervisor_views')
                                         ->select('modulo', 'planta')
                                         ->distinct()
                                         ->orderBy('modulo')
                                         ->get()
                                         ->map(function ($item) {
                                             $item['tipo'] = 'supervisor'; // Añadimos el tipo 'supervisor'
                                             return $item;
                                         });

                // 3. Combinar ambos conjuntos de datos
                // Usamos concat para unir las colecciones
                $modulos = collect($modulosCatalogo)->concat($modulosSupervisores);

                // 4. Eliminar duplicados basándose en el campo 'modulo' y reindexar
                // Primero mantenemos los de 'catalogo' si hay duplicados,
                // luego los de 'supervisor' si no hay un 'catalogo' con el mismo nombre.
                $modulos = $modulos->unique('modulo')->values(); 
                Log::info('Módulos combinados obtenidos correctamente', [
                    'modulos_count' => $modulos->count(),
                    'modulos' => $modulos->toArray(),
                ]);
                // Opcional: Reordenar si quieres un orden específico después de combinar
                // $modulos = $modulos->sortBy('modulo');

                // Guardar en caché por un día
                Cache::put($cacheKey, $modulos, now()->addDay());
            }

            return response()->json($modulos);
        } catch (\Exception $e) {
            Log::error('Error al obtener módulos: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los módulos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
