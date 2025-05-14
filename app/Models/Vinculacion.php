<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vinculacion extends Model
{
    use HasFactory;
    protected $table = 'plan_horarios';

    protected $fillable = [
        'id',
        'Supervisor',
        'Mecanico',
        'Modulo',
        'Hora_Comida',
        'Break_Lun_Jue',
        'Break_Viernes',
        'Fecha_Registro',
    ];
}
