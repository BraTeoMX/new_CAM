<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function getActiveUsers()
    {
        try {
            $cacheKey = 'active_users_cache';
            $cacheDuration = 1800; // 30 minutos

            // Verificar si los datos están en caché
            if (Cache::has($cacheKey)) {
                Log::info('Datos obtenidos desde el caché.');
                $usuariosActivos = Cache::get($cacheKey);
            } else {
                // Si no están en caché, consultar los datos y almacenarlos
                $usuariosActivos = DB::connection('sqlsrv_dev')
                    ->table('Emple_Movimientos')
                    ->whereRaw("CAST(FechaRegistro AS DATE) = CAST(GETDATE() AS DATE)")
                    ->whereBetween('HoraRegistro', ['07:30:00', '08:50:00'])
                    ->orderBy('HoraRegistro', 'ASC')
                    ->get();



                // Almacenar los datos en caché
                Cache::put($cacheKey, $usuariosActivos, $cacheDuration);

                Log::info('Datos obtenidos desde la consulta y almacenados en caché.');
            }

            return response()->json($usuariosActivos);
        } catch (\Exception $e) {
            Log::error('Error al obtener usuarios activos: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al obtener los datos.',
                'status' => 'error'
            ], 500);
        }
    }
}
