<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoProblema extends Model
{
    use HasFactory;
    protected $table = 'catalogo_problemas'; // Nombre de la tabla

    protected $fillable = [
        'nombre',
        'descripcion',
    ];
}
