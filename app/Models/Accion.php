<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $Accion
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Accion newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Accion newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Accion query()
 * @method static \Illuminate\Database\Eloquent\Builder|Accion whereAccion($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Accion whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Accion whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Accion whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Accion extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'catalogo_acciones'; // Nombre de la tabla

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre', // Columna para el nombre o descripción de la acción
    ];

    /**
     * Indica si el modelo debe tener timestamps (created_at, updated_at).
     *
     * @var bool
     */
    public $timestamps = true;
}
