<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AsignationOT extends Model
{
    use HasFactory;
    protected $table = 'asignation_ots';

    protected $fillable = [
        'id',
        'Folio',
        'Modulo',
        'Num_Mecanico',
        'Mecanico',
        'TimeAutEst',
        'TimeAutReal',
        'Maquina',
        'Supervisor',
        'Problema',
         'Status',
         'ComidaBreak',
         'TerminoComidaBreack',
         'created_at',
         'updated_at',
    ];
}
