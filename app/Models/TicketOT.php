<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Events\NewOrderNotification;

/**
 * 
 *
 * @property int $id
 * @property string|null $Folio
 * @property string|null $Modulo
 * @property string|null $Tip_prob
 * @property string|null $Descrip_prob
 * @property string|null $Maquina
 * @property string|null $Status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT query()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereDescripProb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereFolio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereMaquina($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereModulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereTipProb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOT withoutTrashed()
 * @mixin \Eloquent
 */
class TicketOT extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ticketsot';

    protected $fillable = [
        'Modulo',
        'Tip_prob',
        'Descrip_prob',
        'Folio',
        'Status',
        'Maquina',
    ];

    // Habilitar manejo de timestamps
    public $timestamps = true;

    // Si tu tabla tiene soft deletes
    protected $dates = ['deleted_at'];

    /**
     * El evento "booted" permite registrar acciones en eventos del modelo.
     */
    protected static function booted()
    {
        static::created(function ($ticket) {
            // Disparar el evento cuando se crea un nuevo TicketOT
            event(new NewOrderNotification($ticket));
        });
    }
}
