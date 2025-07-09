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
use Intervention\Image\Facades\Image;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\Encoders\WebpEncoder;

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
                    ->table('catalogo_mecanicos')
                    ->select('nombre', 'numero_empleado', 'puesto', 'planta')
                    ->orderBy('nombre')
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
    /**
     * Obtiene la foto de un usuario, la convierte a WebP v3, la cachea y la sirve.
     *
     * @param string|int $id
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function userPhoto($id)
    {
        Log::info("--- INICIO de petición de foto para ID: {$id} ---");

        if (!Auth::check()) {
            Log::warning("Petición para ID: {$id} DENEGADA. Usuario no autenticado.");
            return response()->json(['message' => 'No autorizado'], 401);
        }

        // Ruta donde guardarás las imágenes en tu proyecto Laravel
        $storagePath = public_path('fotos-usuarios');
        if (!file_exists($storagePath)) {
            mkdir($storagePath, 0755, true);
        }

        $filenameWebp = $id . '.webp';
        $fullPath = $storagePath . '/' . $filenameWebp;

        // Si el archivo ya existe, simplemente lo retornamos
        if (file_exists($fullPath)) {
            Log::info("Imagen para ID: {$id} ya existe localmente. Sirviendo desde almacenamiento.");
            return response()->file($fullPath, [
                'Content-Type' => 'image/webp',
                'Content-Disposition' => 'inline; filename="' . $filenameWebp . '"',
            ]);
        }

        // Verificar si ya se intentó esta descarga hoy
        $cacheKeyCheck = 'user-photo-daily-check-' . $id;
        if (Cache::has($cacheKeyCheck)) {
            Log::info("Ya se intentó obtener imagen del ID: {$id} hoy. No se volverá a intentar.");
            return $this->serveDefaultAvatar($id);
        }

        // Registrar que ya se intentó hoy (1 día de vida)
        Cache::put($cacheKeyCheck, true, now()->addDay());

        // Si no existe, intentamos descargarla desde servidor externo
        $externalUrl = "http://128.150.102.45:8000/Intimark/" . $id . '.jpg';

        try {
            $response = Http::timeout(5)->get($externalUrl);

            if ($response->successful() && str_starts_with($response->header('Content-Type'), 'image/')) {
                // Convertir a WebP y guardar
                $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                $image = $manager->read($response->body());
                $encodedImage = $image->encode(new \Intervention\Image\Encoders\WebpEncoder(quality: 75));

                file_put_contents($fullPath, (string)$encodedImage);

                Log::info("Imagen para ID: {$id} descargada, convertida y guardada localmente.");

                return response()->file($fullPath, [
                    'Content-Type' => 'image/webp',
                    'Content-Disposition' => 'inline; filename="' . $filenameWebp . '"',
                ]);
            } else {
                Log::warning("Respuesta inválida para ID: {$id}. Status: {$response->status()}");
            }
        } catch (\Exception $e) {
            Log::error("Error al obtener o convertir imagen para ID: {$id}. " . $e->getMessage());
        }

        // Si falla todo, mostrar avatar por defecto
        return $this->serveDefaultAvatar($id);
    }

    private function serveDefaultAvatar($id)
    {
        $defaultPath = public_path('default-avatar.webp');
        if (!file_exists($defaultPath)) {
            $defaultPath = public_path('default-avatar.jpg');
        }

        Log::info("Sirviendo avatar por defecto para ID: {$id}");

        return response()->file($defaultPath, [
            'Content-Disposition' => 'inline; filename="default-avatar.' . pathinfo($defaultPath, PATHINFO_EXTENSION) . '"',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
