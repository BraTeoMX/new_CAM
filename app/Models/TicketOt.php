<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Para el campo deleted_at

class TicketOt extends Model
{
    use HasFactory, SoftDeletes; // Usa SoftDeletes para el campo deleted_at

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tickets_ot'; // Opcional, Laravel lo infiere correctamente, pero es buena práctica ser explícito.

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id'; // Opcional, Laravel lo infiere correctamente.

    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'integer'; // Opcional, Laravel lo infiere correctamente.

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true; // Opcional, Laravel lo infiere correctamente.

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'folio',
        'modulo',
        'planta',
        'nombre_supervisor',
        'numero_empleado_supervisor',
        'nombre_operario',
        'numero_empleado_operario',
        'tipo_problema',
        'descripcion_problema',
        'maquina',
        'estado',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'estado' => 'integer', // Asegura que 'estado' se maneje como entero
    ];

    public function asignaciones()
    {
        return $this->hasMany(AsignacionOt::class, 'ticket_ot_id');
    }

    public function catalogoEstado()
    {
        return $this->belongsTo(CatalogoEstado::class, 'estado', 'id');
    }

    public function diagnosticos()
    {
        return $this->hasManyThrough(
            DiagnosticoSolucion::class, // El modelo final al que queremos llegar
            AsignacionOt::class,       // El modelo intermedio
            'ticket_ot_id',            // Foreign key en la tabla intermedia (asignaciones_ot)
            'asignacion_ot_id',        // Foreign key en la tabla final (diagnosticos_solucion)
            'id',                      // Local key en la tabla inicial (tickets_ot)
            'id'                       // Local key en la tabla intermedia (asignaciones_ot)
        );
    }
}