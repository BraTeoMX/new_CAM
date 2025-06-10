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
    /**
     * Obtiene la foto de un usuario, la convierte a WebP v3, la cachea y la sirve.
     *
     * @param string|int $id
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function userPhoto($id)
    {
        // 1. Punto de Entrada
        Log::info("--- INICIO de petición de foto para ID: {$id} ---");

        if (!Auth::check()) {
            Log::warning("Petición para ID: {$id} DENEGADA. Usuario no autenticado.");
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $cacheKey = 'user-photo-webp-v3-' . $id;
        $cacheDuration = 3600;

        // 2. Lógica de Caché
        //Log::info("Para ID: {$id}, buscando en caché con la clave: '{$cacheKey}'");
        $imageData = Cache::remember($cacheKey, $cacheDuration, function () use ($id) {

            // Este bloque solo se ejecuta si la imagen NO está en el caché.
            //Log::info("Para ID: {$id}, no se encontró en caché. Iniciando obtención externa.");

            $filename = $id . '.jpg';
            $externalUrl = "http://128.150.102.45:8000/Intimark/" . $filename;
            Log::info("Para ID: {$id}, URL externa a consultar: {$externalUrl}");

            try {
                $response = Http::timeout(5)->get($externalUrl);
                Log::info("Para ID: {$id}, respuesta del servidor externo recibida con status: " . $response->status());

                if ($response->successful() && str_starts_with($response->header('Content-Type'), 'image/')) {
                    Log::info("Para ID: {$id}, la respuesta fue exitosa y es una imagen. Iniciando conversión a WebP.");

                    // --- Lógica de Intervention Image v3 ---
                    $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                    Log::info("Para ID: {$id}, ImageManager creado.");

                    $image = $manager->read($response->body());
                    Log::info("Para ID: {$id}, imagen leída en memoria.");

                    $encodedImage = $image->encode(new \Intervention\Image\Encoders\WebpEncoder(quality: 75));
                    Log::info("Para ID: {$id}, imagen codificada a WebP exitosamente.");

                    // Se retorna la imagen para ser guardada en caché.
                    return (string) $encodedImage;
                } else {
                    Log::warning("Para ID: {$id}, la respuesta del servidor externo NO fue exitosa o no es una imagen. Status: {$response->status()}, Content-Type: {$response->header('Content-Type')}");
                    return null; // No cachear un resultado fallido
                }

            } catch (\Exception $e) {
                Log::error("Para ID: {$id}, EXCEPCIÓN CATASTRÓFICA durante la obtención/conversión: " . $e->getMessage());
                return null; // No cachear un resultado fallido
            }
        });

        // 3. Lógica de Respuesta
        if ($imageData) {
            Log::info("Para ID: {$id}, se encontraron datos de imagen (desde caché o recién creados). Enviando respuesta WEBP.");
            Log::info("--- FIN de petición para ID: {$id} ---");
            return \Illuminate\Support\Facades\Response::make($imageData, 200, [
                'Content-Type' => 'image/webp',
                'Content-Disposition' => 'inline; filename="' . $id . '.webp"',
                'Cache-Control' => 'public, max-age=' . $cacheDuration,
            ]);
        }

        // 4. Lógica de Fallback (si todo lo anterior falló)
        Log::warning("Para ID: {$id}, no se pudieron obtener los datos de la imagen. Sirviendo AVATAR POR DEFECTO.");

        $defaultPath = public_path('default-avatar.webp');
        if (!file_exists($defaultPath)) {
            $defaultPath = public_path('default-avatar.jpg');
        }

        Log::info("Para ID: {$id}, ruta del avatar por defecto: {$defaultPath}");
        Log::info("--- FIN de petición para ID: {$id} (con fallback) ---");

        return \Illuminate\Support\Facades\Response::file($defaultPath, [
            'Content-Disposition' => 'inline; filename="default-avatar.' . pathinfo($defaultPath, PATHINFO_EXTENSION) . '"',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
