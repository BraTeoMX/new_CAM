<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $folio
 * @property string $encuesta
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta query()
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta whereEncuesta($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta whereFolio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Encuesta whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Encuesta extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'folio',
        'encuesta',
    ];
}
