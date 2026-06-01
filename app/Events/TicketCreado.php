<?php

namespace App\Events;

use App\Models\TicketOt;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreado
{
    use Dispatchable, SerializesModels;

    public $ticket;

    /**
     * Create a new event instance.
     */
    public function __construct(TicketOt $ticket)
    {
        $this->ticket = $ticket;
    }
}
