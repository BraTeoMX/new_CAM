<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $codigo
 * @property string $Causa
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Causa newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Causa newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Causa query()
 * @method static \Illuminate\Database\Eloquent\Builder|Causa whereCausa($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Causa whereCodigo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Causa whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Causa whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Causa whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Causa extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'catalogo_causas'; // Nombre de la tabla

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'codigo',
        'nombre', // El nombre de tu columna de texto para la descripción de la causa
    ];

    /**
     * Indica si el modelo debe tener timestamps (created_at, updated_at).
     *
     * @var bool
     */
    public $timestamps = true;
}
