<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AsignacionOt extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asignaciones_ot';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'integer';

    protected $fillable = [
        'ticket_ot_id',
        'numero_empleado_mecanico',
        'nombre_mecanico',
        'estado_asignacion',
        'tiempo_estimado_minutos',
        'tiempo_real_minutos',
        'fecha_asignacion',
        'fecha_inicio_trabajo',
        'fecha_fin_trabajo',
        'comida_break_disponible',
        'hora_comida_inicio',
        'hora_comida_fin',
        'observaciones_mecanico',
        'solucion_aplicada',
    ];

    protected $casts = [
        'fecha_asignacion' => 'datetime',
        'fecha_inicio_trabajo' => 'datetime',
        'fecha_fin_trabajo' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'comida_break_disponible' => 'boolean',
    ];

    /**
     * Relación con la tabla tickets_ot
     */
    public function ticket()
    {
        return $this->belongsTo(TicketOt::class, 'ticket_ot_id');
    }
}
