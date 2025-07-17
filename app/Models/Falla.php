<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $id
 * @property string $Fallas
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Falla newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Falla newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Falla query()
 * @method static \Illuminate\Database\Eloquent\Builder|Falla whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Falla whereFallas($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Falla whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Falla whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Falla extends Model
{
    use HasFactory;

    /**
     * El nombre de la tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'catalogo_fallas';

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre', // El nombre de tu columna de texto
    ];

    /**
     * Indica si el modelo debe tener timestamps (created_at, updated_at).
     *
     * @var bool
     */
    public $timestamps = true; // Opcional, Laravel los maneja por defecto
}
