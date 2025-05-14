<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vinculacion extends Model
{
    protected $table = 'vinculaciones';

    protected $fillable = [
        'Supervisor',
        'Mecanico',
        'Modulo',
        'Hora_Comida_Inicio',
        'Hora_Comida_Fin',
        'Break_Lun_Jue_Inicio',
        'Break_Lun_Jue_Fin',
        'Break_Viernes_Inicio',
        'Break_Viernes_Fin'
    ];

    protected $casts = [
        'Hora_Comida_Inicio' => 'datetime:H:i',
        'Hora_Comida_Fin' => 'datetime:H:i',
        'Break_Lun_Jue_Inicio' => 'datetime:H:i',
        'Break_Lun_Jue_Fin' => 'datetime:H:i',
        'Break_Viernes_Inicio' => 'datetime:H:i',
        'Break_Viernes_Fin' => 'datetime:H:i',
    ];
}
