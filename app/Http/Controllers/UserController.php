<?php

namespace App\Http\Controllers;


use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

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
     public function userPhoto($id)
    {
        // Solo usuarios autenticados pueden ver fotos
        if (!Auth::check()) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $filename = $id . '.jpg';
        $externalUrl = "http://128.150.102.45:8000/Intimark/" . $filename;

        try {
            // Intenta obtener la imagen del servidor externo
            $response = Http::timeout(5)->get($externalUrl);

            if ($response->successful() && $response->header('Content-Type') === 'image/jpeg') {
                return Response::make($response->body(), 200, [
                    'Content-Type' => 'image/jpeg',
                    'Content-Disposition' => 'inline; filename="' . $filename . '"',
                    'Cache-Control' => 'max-age=3600, public',
                ]);
            }
        } catch (\Exception $e) {
            // Log::error('Error obteniendo imagen externa: ' . $e->getMessage());
        }

        // Si no existe o hay error, retorna avatar por defecto
        $defaultPath = public_path('default-avatar.jpg');
        return Response::make(file_get_contents($defaultPath), 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Disposition' => 'inline; filename="default-avatar.jpg"',
            'Cache-Control' => 'max-age=3600, public',
        ]);
    }
}
