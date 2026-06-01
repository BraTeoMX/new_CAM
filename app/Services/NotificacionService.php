<?php

namespace App\Services;

use App\Models\Notificacion;
use App\Events\NotificacionEnviada;

class NotificacionService
{
    /**
     * Envía una notificación masiva a múltiples usuarios optimizando la base de datos.
     *
     * @param iterable|array $usuarios Lista de IDs de usuarios o Colección de usuarios.
     * @param array $data Contenido de la notificación (título, mensaje, etc.)
     * @param string $tipo Tipo de la notificación
     */
    public static function enviarMasiva($usuarios, array $data, string $tipo = 'general')
    {
        // 1. Asegurar que tenemos un array de IDs de usuario
        $userIds = collect($usuarios)->map(function ($usuario) {
            return is_object($usuario) ? $usuario->id : $usuario;
        })->toArray();

        if (empty($userIds)) {
            return null;
        }

        // 2. Crear un único registro de notificación
        $notificacion = Notificacion::create([
            'tipo' => $tipo,
            'data' => $data,
        ]);

        // 3. Preparar la data pivote masiva con read_at en null (leido_at)
        $pivotData = collect($userIds)->mapWithKeys(function ($userId) {
            return [$userId => ['leido_at' => null]];
        })->toArray();

        // 4. Sincronizar masivamente en tabla pivote
        $notificacion->usuarios()->syncWithoutDetaching($pivotData);

        // 5. Emitir el evento de Broadcasting a cada usuario involucrado
        try {
            foreach ($userIds as $userId) {
                event(new NotificacionEnviada($userId, $notificacion));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error al emitir evento de notificación (Websockets/Pusher): ' . $e->getMessage());
        }

        return $notificacion;
    }
}
