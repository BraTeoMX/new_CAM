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
      protected $casts = [
        'TimeEstimado' => 'datetime:H:i',
         'TimeInicio' => 'datetime:H:i',
    ];
}
