<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 */
class Vinculacion extends Model
{
    protected $table = 'vinculaciones';

    protected $fillable = [
        'numero_empleado_supervisor',
        'nombre_supervisor',
        'planta',
        'modulo',
        'nombre_mecanico',
        'numero_empleado_mecanico',
        'hora_comida_inicio',
        'break_lunes_jueves_inicio',
        'break_viernes_inicio',
        'hora_comida_fin',
        'break_lunes_jueves_fin',
        'break_viernes_fin',
    ];

}
