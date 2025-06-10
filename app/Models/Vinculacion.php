<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $Supervisor
 * @property string|null $Num_Mecanico
 * @property string $Mecanico
 * @property string $Modulo
 * @property \Illuminate\Support\Carbon|null $Hora_Comida_Inicio
 * @property \Illuminate\Support\Carbon|null $Hora_Comida_Fin
 * @property \Illuminate\Support\Carbon|null $Break_Lun_Jue_Inicio
 * @property \Illuminate\Support\Carbon|null $Break_Lun_Jue_Fin
 * @property \Illuminate\Support\Carbon|null $Break_Viernes_Inicio
 * @property \Illuminate\Support\Carbon|null $Break_Viernes_Fin
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion query()
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereBreakLunJueFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereBreakLunJueInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereBreakViernesFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereBreakViernesInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereHoraComidaFin($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereHoraComidaInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereMecanico($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereModulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereNumMecanico($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereSupervisor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Vinculacion whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Vinculacion extends Model
{
    protected $table = 'vinculaciones';

    protected $fillable = [
        'Supervisor',
        'Num_Mecanico',
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
