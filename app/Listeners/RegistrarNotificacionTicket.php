<?php

namespace App\Listeners;

use App\Events\TicketCreado;
use App\Models\User;
use App\Services\NotificacionService;

class RegistrarNotificacionTicket
{
    /**
     * Handle the event.
     */
    public function handle(TicketCreado $event): void
    {
        $ticket = $event->ticket;
        
        // Determinar quién debe recibir la notificación. 
        // Ejemplo: Enviarlo a todos los 'Administradores' y/o a quienes corresponda.
        $usuariosDestino = User::where('puesto', 'Administrador')->get();

        if ($usuariosDestino->isEmpty()) {
            return;
        }

        $dataNotificacion = [
            'titulo' => 'Nuevo Ticket Creado',
            'mensaje' => "El ticket {$ticket->folio} ha sido generado por {$ticket->nombre_operario}.",
            'url' => "/tickets/{$ticket->id}", // Cambiar si la URL es otra
            'icono' => 'document-report',
        ];

        // Usar nuestro servicio óptimo
        NotificacionService::enviarMasiva($usuariosDestino, $dataNotificacion, 'ticket_creado');
    }
}
