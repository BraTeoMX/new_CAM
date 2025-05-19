<?php

namespace App\Events;

use App\Models\AsignationOT;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class AsignacionOTCreated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $asignacion;

    public function __construct(AsignationOT $asignacion)
    {
        $this->asignacion = $asignacion;
    }

    public function broadcastOn()
    {
        return new Channel('asignaciones-ot');
    }

    public function broadcastWith()
    {
        return $this->asignacion->toArray();
    }
}
