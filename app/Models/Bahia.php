<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'InicioBahia',
        'FinBahia',
    ];

    /**
     * Los atributos que deben ser casteados a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'InicioBahia' => 'datetime',
        'FinBahia' => 'datetime',
    ];

    /**
     * Indica si el modelo debe tener timestamps (created_at, updated_at).
     * Por defecto es true, lo dejamos explícito para claridad.
     *
     * @var bool
     */
    public $timestamps = true;
}
