<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoEstado extends Model
{
    use HasFactory;

    // Asegúrate de que esta tabla sea la correcta donde tienes los estados (ej. 'autonomo', 'en proceso')
    protected $table = 'catalogo_estados'; // Asumo que la tabla es 'catalogo_estados'

    protected $primaryKey = 'id'; // Asumo que la clave primaria es 'id'

    // Si tu tabla de catálogo tiene una columna 'nombre' para el estado
    protected $fillable = ['nombre']; // Asegúrate de que 'nombre' sea fillable si lo vas a asignar masivamente
}