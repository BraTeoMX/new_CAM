<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('causas', function (Blueprint $table) {
            $table->id(); // Columna 'id' autoincremental y clave primaria
            $table->string('codigo', 10)->unique(); // Columna 'codigo', ej. 'A', 'B'. Hacemos que sea único y con longitud máxima de 10.
            $table->string('Causa'); // Columna para el texto de la causa/descripción
            $table->timestamps(); // Columnas 'created_at' y 'updated_at'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('causas');
    }
};
