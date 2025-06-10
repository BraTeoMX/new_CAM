<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $Folio
 * @property string|null $Pulsaciones
 * @property \Illuminate\Support\Carbon $InicioBahia
 * @property \Illuminate\Support\Carbon|null $FinBahia
 * @property \Illuminate\Support\Carbon|null $InicioBahia1
 * @property \Illuminate\Support\Carbon|null $FinBahia1
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia query()
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereFinBahia($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereFinBahia1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereFolio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereInicioBahia($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereInicioBahia1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia wherePulsaciones($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Bahia whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Bahia extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'bahias'; // Nombre de la tabla en plural

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'Folio',
        'Pulsaciones',
        'InicioBahia',
        'FinBahia',
        'InicioBahia1',
        'FinBahia1',
    ];

    /**
     * Los atributos que deben ser casteados a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'InicioBahia' => 'datetime',
        'FinBahia' => 'datetime',
        'InicioBahia1' => 'datetime',
        'FinBahia1' => 'datetime',
    ];

    /**
     * Indica si el modelo debe tener timestamps (created_at, updated_at).
     * Por defecto es true, lo dejamos explícito para claridad.
     *
     * @var bool
     */
    public $timestamps = true;
}
