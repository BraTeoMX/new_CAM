<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiagnosticoSolucion extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'diagnosticos_solucion';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'asignacion_ot_id',
        'clase_maquina',
        'numero_maquina',
        'tiempo_estimado',
        'hora_inicio',
        'hora_final',
        'tiempo_real',
        'tiempo_ejecucion',
        'falla',
        'causa',
        'accion_correctiva',
        'comentarios',
        'encuesta',
        'estado_bahia',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'hora_inicio' => 'datetime',
        'hora_final' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Define la relación inversa de uno a uno con AsignacionOt.
     * Un diagnóstico pertenece a una única asignación.
     */
    public function asignacion()
    {
        return $this->belongsTo(AsignacionOt::class, 'asignacion_ot_id', 'id');
    }

    public function tiemposBahia()
    {
        return $this->hasMany(TiempoBahia::class, 'diagnostico_solucion_id', 'id');
    }

}
