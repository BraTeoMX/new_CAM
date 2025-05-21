<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowAtention extends Model
{
    use HasFactory;
    protected $table = 'followatention';

    protected $fillable = [
        'id',
        'Folio',
        'Num_Mecanico',
        'Mecanico',
        'Modulo',
        'Supervisor',
        'Problema',
        'Maquina',
        'Classe',
        'TimeEstimado',
        'TimeInicio',
        'TimeFinal',
        'TimeReal',
        'TimeEjecucion',
        'Falla',
        'Causa',
        'Accion',
        'Comentarios',
        'Classe',
    ];

    // Solo castea TimeInicio si es necesario, NO TimeEstimado, TimeReal, TimeFinal, TimeEjecucion
    protected $casts = [
        'TimeInicio' => 'datetime:H:i',
    ];
}
