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
        Schema::create('bahias', function (Blueprint $table) {
            $table->id(); // Columna 'id' autoincremental y clave primaria
            $table->string('Folio')->unique(); // Columna 'Folio', podría ser un identificador único
            $table->dateTime('InicioBahia'); // Columna para la fecha y hora de inicio
            $table->dateTime('FinBahia')->nullable(); // Columna para la fecha y hora de fin, puede ser nula si aún no ha terminado
            $table->timestamps(); // Columnas 'created_at' y 'updated_at'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bahias');
    }
};
