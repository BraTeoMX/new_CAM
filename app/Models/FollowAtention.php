<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string|null $Folio
 * @property string|null $Num_Mecanico
 * @property string|null $Mecanico
 * @property string|null $Modulo
 * @property string|null $Operario
 * @property string|null $NombreOperario
 * @property string|null $Supervisor
 * @property string|null $Problema
 * @property string|null $NumMach
 * @property string|null $Maquina
 * @property string|null $Classe
 * @property \Illuminate\Support\Carbon|null $TimeEstimado
 * @property \Illuminate\Support\Carbon|null $TimeInicio
 * @property string|null $TimeFinal
 * @property string|null $TimeReal
 * @property string|null $TimeEjecucion
 * @property string|null $Falla
 * @property string|null $Causa
 * @property string|null $Accion
 * @property string|null $Comentarios
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property-read \App\Models\AsignationOT|null $asignation_ot
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention query()
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereAccion($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereCausa($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereClasse($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereComentarios($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereFalla($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereFolio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereMaquina($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereMecanico($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereModulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereNombreOperario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereNumMach($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereNumMecanico($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereOperario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereProblema($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereSupervisor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereTimeEjecucion($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereTimeEstimado($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereTimeFinal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereTimeInicio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereTimeReal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|FollowAtention whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
        'Operario',
        'NombreOperario',
        'Supervisor',
        'Problema',
        'Maquina',
        'NumMach',
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
        'created_at',
        'updated_at',

    ];
      protected $casts = [
        'TimeEstimado' => 'datetime:H:i',
         'TimeInicio' => 'datetime:H:i',
    ];

    public function asignation_ot()
    {
        return $this->belongsTo(AsignationOT::class, 'Folio', 'Folio');
    }
}
