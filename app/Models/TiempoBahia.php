<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Representa un período de pausa (tiempo de bahía) durante una atención.
 * Un diagnóstico puede tener múltiples tiempos de bahía.
 */
class TiempoBahia extends Model
{
    use HasFactory;

    /**
     * La tabla asociada con el modelo.
     *
     * @var string
     */
    protected $table = 'tiempos_bahia';

    /**
     * Los atributos que se pueden asignar masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'diagnostico_solucion_id',
        'hora_inicio_pausa',
        'hora_fin_pausa',
        'duracion_segundos',
        'motivo',
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Define la relación inversa de uno a muchos con DiagnosticoSolucion.
     * Un tiempo de bahía pertenece a un único diagnóstico.
     */
    public function diagnosticoSolucion()
    {
        return $this->belongsTo(DiagnosticoSolucion::class, 'diagnostico_solucion_id', 'id');
    }
}
