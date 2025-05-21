<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
