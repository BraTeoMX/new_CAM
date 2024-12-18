<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketOT extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ticketsot';

    protected $fillable = [
        'Folio',
        'Modulo',
        'Num_empl',
        'Nombre',
        'Tip_prob',
        'Descrip_prob',
        'Status',
    ];

    // Habilitar manejo de timestamps
    public $timestamps = true;

    // Si tu tabla tiene soft deletes
    protected $dates = ['deleted_at'];
}
