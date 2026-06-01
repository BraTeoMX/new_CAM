<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Notificacion extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'notificaciones';

    protected $fillable = [
        'tipo',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    /**
     * Relación con los usuarios destinatarios de esta notificación.
     */
    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'notificacion_usuario', 'notificacion_id', 'usuario_id')
                    ->withPivot('leido_at')
                    ->withTimestamps();
    }
}
