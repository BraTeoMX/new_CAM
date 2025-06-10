<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string|null $Folio
 * @property string|null $Problema
 * @property string|null $Num_Mecanico
 * @property string|null $Mecanico
 * @property string|null $TimeAutEst
 * @property string|null $TimeAutReal
 * @property string|null $Modulo
 * @property string|null $Operario
 * @property string|null $NombreOperario
 * @property string|null $Supervisor
 * @property string|null $Status
 * @property string|null $Maquina
 * @property string|null $ComidaBreak
 * @property string|null $TerminoComidaBreack
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT query()
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereComidaBreak($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereFolio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereMaquina($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereMecanico($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereModulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereNombreOperario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereNumMecanico($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereOperario($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereProblema($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereSupervisor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereTerminoComidaBreack($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereTimeAutEst($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereTimeAutReal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AsignationOT whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class AsignationOT extends Model
{
    use HasFactory;
    protected $table = 'asignation_ots';

    protected $fillable = [
        'id',
        'Folio',
        'Modulo',
        'Operario',
        'NombreOperario',
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
