<?php

namespace App\Events;

use App\Models\Notificacion;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificacionEnviada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $notificacion;

    /**
     * Create a new event instance.
     */
    public function __construct($userId, Notificacion $notificacion)
    {
        $this->userId = $userId;
        $this->notificacion = $notificacion;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('usuarios.' . $this->userId),
        ];
    }
    
    /**
     * Data enviada al frontend por websocket.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->notificacion->id,
            'tipo' => $this->notificacion->tipo,
            'data' => $this->notificacion->data,
            'created_at' => $this->notificacion->created_at->toISOString(),
        ];
    }
}
