<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticket;

    /**
     * Create a new event instance.
     *
     * @param $ticket
     */
    public function __construct($ticket)
    {
        $this->ticket = $ticket;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Cambia "notifications" por el nombre del canal que desees usar
        return new Channel('notifications');
    }

    /**
     * Formato de datos que se enviará al cliente.
     */
    public function broadcastWith()
    {
        return [
            'folio' => $this->ticket->Folio,
            'modulo'=> $this->ticket->Modulo,
            'status' => $this->ticket->Status,
            'descripcion' => $this->ticket->Descrip_prob,
            'created_at' => $this->ticket->created_at->toDateTimeString(),
        ];
    }
}
