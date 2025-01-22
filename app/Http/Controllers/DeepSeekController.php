<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DeepseekPhp\DeepseekClient;
use DeepseekPhp\Enums\Queries\QueryRoles;
use DeepseekPhp\Enums\Models;
use Illuminate\Support\Facades\Log;

class DeepSeekController extends Controller
{
    public function interactWithAI(Request $request)
    {
        // Lee la configuración desde el archivo config/deepseek.php
        $apiKey = config('deepseek.api_key');
        $baseUrl = config('deepseek.base_url', 'https://api.deepseek.com/v2');
        $timeout = config('deepseek.timeout', 500);

        try {
            // Construir el cliente DeepSeek y realizar la consulta
            $response = DeepseekClient::build($apiKey, $baseUrl, $timeout)
                ->query('System setup query', 'system') // Mensaje del sistema
                ->query($request->input('message', 'Default user message'), 'user') // Mensaje del usuario
                ->withModel(Models::CHAT->value); // Modelo a usar

            // Log de éxito
            Log::info('Conexión exitosa con DeepSeek.', [
                'response' => $response,
                'api_key' => $apiKey,
                'base_url' => $baseUrl,
                'timeout' => $timeout,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Conexión exitosa con DeepSeek.',
                'data' => $response,
            ]);
        } catch (\Exception $e) {
            // Log del error
            Log::error('Error al interactuar con DeepSeek.', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'api_key' => $apiKey,
                'base_url' => $baseUrl,
                'timeout' => $timeout,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al interactuar con DeepSeek.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function interact(Request $request)
{
    // Valores predeterminados de configuración
    $apiKey = config('deepseek.api_key');
    $baseUrl = config('deepseek.base_url', 'https://api.deepseek.com/v2');
    $timeout = config('deepseek.timeout', 500);

    try {
        // Crear el cliente de DeepSeek y realizar una consulta con valores fijos
        $client = DeepseekClient::build($apiKey, $baseUrl, $timeout);

        // Consulta predeterminada para probar la conexión
        $response = $client
            ->query('You are a helpful assistant.', 'system') // Mensaje del sistema
            ->query('Hello! How can you assist me?', 'user') // Mensaje del usuario predeterminado
            ->withModel(Models::CODER->value); // Modelo CODER

        // Log de éxito
        Log::info('Conexión exitosa con DeepSeek.', ['response' => $response]);

        // Responder con los datos obtenidos
        return response()->json([
            'success' => true,
            'message' => 'Conexión exitosa con DeepSeek.',
            'data' => $response,
        ]);
    } catch (\Exception $e) {
        // Log de error
        Log::error('Error al interactuar con DeepSeek.', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        // Responder con el error
        return response()->json([
            'success' => false,
            'message' => 'Error al interactuar con DeepSeek.',
            'error' => $e->getMessage(),
        ], 500);
    }
}
}
