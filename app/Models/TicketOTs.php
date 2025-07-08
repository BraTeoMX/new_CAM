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
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs query()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereDescripProb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereFolio($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereMaquina($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereModulo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereTipProb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|TicketOTs withoutTrashed()
 * @mixin \Eloquent
 */
class TicketOTs extends Model
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
            // Disparar el evento cuando se crea un nuevo TicketOTs
            event(new NewOrderNotification($ticket));
        });
    }
}
