<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Support\Facades\View; // Importar la fachada View
use Carbon\Carbon;
use Illuminate\Support\Facades\DB; // Para manejar fechas y horas
use Illuminate\Support\Facades\Cache;

class InteractionIA extends Controller
{
    public function index()
    {

        return view('pages.InteractionIA.InteractionIA');
    }
 // Las constantes siguen aquí, no hay cambios en ellas
    private const MACHINES = [
        'RECTA 1 AGUJA',
        'RECTA 2 AGUJAS',
        'OVERLOCK',
        'COVERSTITCH',
        'PRESILLADORA',
        'ZZ',
        'OJAL',
        'BOTON',
        'SCHIPS',
        'ISEW',
        'FLAT SEAMER',
        'SUPREME'
    ];

    private const STEPS = [
        ['name' => 'TENSIÓN', 'key' => 'tension', 'times' => [2, 2, 3, 3, 2, 3, 3, 3, 3, 3, 5, 2]],
        ['name' => 'TIPO Y POSICIÓN DE AGUJAS', 'key' => 'agujas', 'times' => [1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1]],
        ['name' => 'ENHEBRADO HILO', 'key' => 'enhebrado', 'times' => [1, 0.5, 2, 2, 1, 1, 1, 1, 2, 2, 4, 4]],
        ['name' => 'PRESIÓN PRENSATELAS', 'key' => 'prensatelas', 'times' => [0.5, 1, 0.5, 0.5, null, 0.5, null, null, 0.5, 0.5, 1, null]],
        ['name' => 'PPP', 'key' => 'ppp', 'times' => [1, 1, 1, 1, null, 1, null, null, 1, 1, null, null]]
    ];

    /**
     * Función auxiliar para renderizar el componente Blade `chatBubble`.
     *
     * @param string $message El cuerpo del mensaje.
     * @param string $senderName El nombre de quien envía (Tornillin o Usuario).
     * @param bool $isUser Si es un mensaje del usuario.
     * @param string|null $timestamp La hora del mensaje. Si es null, usa la actual.
     * @return string El HTML renderizado del componente.
     */
    private function renderChatBubble($message, $senderName, $isUser, $timestamp = null)
    {
        $time = $timestamp ? Carbon::parse($timestamp)->format('h:i A') : Carbon::now('America/Mexico_City')->format('h:i A');

        // Renderizar el componente Blade directamente.
        // Las props que se pasan son las que espera el componente `chatBubble`.
        return View::make('components.IAChat.chatBubble', [
            'message' => $message,
            'senderName' => $senderName,
            'time' => $time,
            'isUser' => $isUser,
        ])->render();
    }
  /**
     * Renderiza un componente de burbuja de chat para un mensaje de usuario.
     * Este endpoint es llamado por el frontend para obtener el HTML de la burbuja del usuario.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function renderUserBubble(Request $request)
    {
        $messageContent = $request->input('message', 'Mensaje de usuario');

        $renderedMessageHtml = $this->renderChatBubble(
            $messageContent,
            'Tú', // Nombre del usuario
            true // Es un mensaje del usuario
        );

        return response()->json([
            'status' => 'success',
            'html' => $renderedMessageHtml,
        ]);
    }
    /**
     * Muestra el saludo inicial y las opciones de acción (Crear/Seguimiento).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function startConversation(Request $request)
    {
        try {
            $hour = Carbon::now('America/Mexico_City')->hour;
            $greeting = '';
            if ($hour >= 5 && $hour < 12) {
                $greeting = '¡Buenos días!';
            } elseif ($hour >= 12 && $hour < 19) {
                $greeting = '¡Buenas tardes!';
            } else {
                $greeting = '¡Buenas noches!';
            }

            $messageContent = "{$greeting}<br>Soy el asistente virtual para ayudarte con tus requerimientos de producción.<br>¿Qué es lo que deseas hacer?";

            $renderedMessageHtml = $this->renderChatBubble(
                $messageContent,
                'Tornillin',
                false
            );

            return response()->json([
                'status' => 'success',
                'html' => $renderedMessageHtml,
                'type' => 'action_buttons',
                'buttons' => [
                    ['id' => 'btn-crear-ticket', 'text' => 'Crear ticket', 'class' => 'bg-blue-500 hover:bg-blue-700'],
                    ['id' => 'btn-seguimiento-ticket', 'text' => 'Dar seguimiento a un ticket', 'class' => 'bg-green-500 hover:bg-green-700']
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Error en startConversation: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Ocurrió un error al iniciar la conversación. Por favor, inténtalo de nuevo.',
            ], 500);
        }
    }

    /**
     * Maneja la solicitud de crear un ticket.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleCreateTicket()
    {
        try {
            $messageContent = 'Entendido, vamos a crear un nuevo ticket. ¿Para qué máquina es el problema?';

            $renderedMessageHtml = $this->renderChatBubble(
                $messageContent,
                'Tornillin',
                false
            );

            return response()->json([
                'status' => 'success',
                'html' => $renderedMessageHtml,
                'type' => 'machine_selection',
                'data' => [
                    'machines' => self::MACHINES
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Error en handleCreateTicket: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al iniciar el proceso de creación de ticket.',
            ], 500);
        }
    }

    /**
     * Maneja la solicitud de dar seguimiento a un ticket.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function handleTrackTicket()
    {
        try {
            $messageContent = 'Claro, para dar seguimiento a un ticket, por favor indícame el número de ticket o el módulo.<br>¿A qué módulo quieres dar seguimiento?';

            $renderedMessageHtml = $this->renderChatBubble(
                $messageContent,
                'Tornillin',
                false
            );

            return response()->json([
                'status' => 'success',
                'html' => $renderedMessageHtml,
                'type' => 'module_select',
            ]);
        } catch (Exception $e) {
            Log::error('Error en handleTrackTicket: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Error al iniciar el proceso de seguimiento de ticket.',
            ], 500);
        }
    }

    /**
     * Obtiene los módulos para Select2, usando la función existente con caché y añadiendo filtro.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getModules(Request $request) // Renombrado de ObtenerModulos a getModules
    {
        try {
            $search = $request->input('search'); // Obtener el término de búsqueda de Select2
            $cacheKey = 'modulos_select2'; // Nueva clave de caché para la versión filtrada/formateada

            Log::info('Verificando el caché para Select2...');
            if (Cache::has($cacheKey)) { // Usar la fachada Cache
                Log::info('Cargando módulos formateados desde el caché...');
                $modulos = Cache::get($cacheKey);
            } else {
                Log::info('Cargando módulos desde la base de datos para Select2...');
                $modulos = DB::connection('sqlsrv_dev')
                    ->table('Supervisores_views')
                    ->select('Modulo')
                    ->distinct()
                    ->orderBy('Modulo') // Ordenar para que la búsqueda sea más predecible
                    ->get();

                // Formatear los resultados para Select2 antes de almacenar en caché
                $formattedModulos = $modulos->map(function ($item) {
                    return ['id' => $item->Modulo, 'text' => $item->Modulo];
                })->toArray(); // Convertir a array para almacenar en caché más fácilmente

                Cache::put($cacheKey, $formattedModulos, now()->addDay());
                Log::info('Módulos formateados almacenados en caché.');
                $modulos = $formattedModulos; // Usar los módulos formateados
            }

            // Aplicar el filtro de búsqueda si existe
            if (!empty($search)) {
                $searchLower = strtolower($search);
                $modulos = array_filter($modulos, function ($modulo) use ($searchLower) {
                    return str_contains(strtolower($modulo['text']), $searchLower);
                });
                // Reindexar el array después de filtrar
                $modulos = array_values($modulos);
            }

            // Select2 espera una estructura { results: [...] } si no se usa processResults en el frontend
            // Pero como lo estamos usando, solo necesitamos el array de objetos directamente.
            return response()->json($modulos);

        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los módulos',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
