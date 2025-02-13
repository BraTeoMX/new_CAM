<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DeepseekPhp\DeepseekClient;
use DeepseekPhp\Enums\Queries\QueryRoles;
use DeepseekPhp\Enums\Models;
use Illuminate\Support\Facades\Log;

class DeepSeekController extends Controller
{
    public function index(){

        return view('pages.InteractionIA.InteractionIA');
    }
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
    public function chatWithAI(Request $request)
{
    $apiKey = config('deepseek.api_key');
    $baseUrl = config('deepseek.base_url', 'https://api.deepseek.com/v2');
    $timeout = config('deepseek.timeout', 500);

    try {
        Log::info('Mensaje recibido:', ['message' => $request->input('message')]);

        // Construir el cliente y la consulta como una sola operación
        $client = DeepseekClient::build($apiKey, $baseUrl, $timeout)
            ->query("Eres un asistente amigable y servicial que proporciona respuestas claras y concisas.", 'system')
            ->query($request->input('message'), 'user')
            ->withModel(Models::CHAT->value);

        // Obtener la respuesta directamente del cliente
        $response = $client;

        Log::info('Respuesta de DeepSeek:', ['response' => $response]);

        // Si no hay respuesta, lanzar excepción
        if (empty($response)) {
            throw new \Exception('No se recibió respuesta del servidor DeepSeek');
        }

        return response()->json([
            'success' => true,
            'data' => $response,
            'debug_info' => [
                'type' => gettype($response),
                'raw_response' => $response
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Error en el chat con IA:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}

}
