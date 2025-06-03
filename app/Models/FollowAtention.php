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
