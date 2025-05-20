<?php

namespace App\Events;

use App\Models\AsignationOT;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class AsignacionOTReasignada implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $ot;

    public function __construct(AsignationOT $ot)
    {
        $this->ot = $ot;
    }

    public function broadcastOn()
    {
        return new Channel('asignaciones-ot');
    }

    public function broadcastWith()
    {
        return $this->ot->toArray();
    }
}
