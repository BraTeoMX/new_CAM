<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class ComidaBreakLimpiado implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public function broadcastOn()
    {
        return new Channel('asignaciones-ot');
    }
}
