<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $tipclassmach_id
 * @property int $mach_id
 * @property int $class_id
 * @property string $mach
 * @property string $class
 * @property string|null $TimeEstimado
 * @property string|null $status
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina query()
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina whereClass($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina whereClassId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina whereMach($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina whereMachId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina whereTimeEstimado($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ClasseMaquina whereTipclassmachId($value)
 * @mixin \Eloquent
 */
class ClasseMaquina extends Model
{
    use HasFactory;
    protected $table = 'tip_class_mach';

    protected $fillable = [
        'tipclassmach_id',
        'mach_id',
        'class_id',
        'mach',
        'class',
        'TimeEstimado',
        'status',
    ];
}
