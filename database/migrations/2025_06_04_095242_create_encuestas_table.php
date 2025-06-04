<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('encuestas', function (Blueprint $table) {
            $table->id(); // Columna ID autoincremental y clave primaria

            // Columna para el Folio
            // Usaremos string para el folio. Puedes hacerlo unique() si cada folio debe ser único.
            $table->string('folio')->unique(); // Asumiendo que el folio debe ser único

            // Columna para la Encuesta
            // Usaremos text para la encuesta, ya que podría contener más información.
            // Si solo es un título o un nombre corto, string podría ser suficiente.
            $table->text('encuesta');
            // Si fuera un nombre corto: $table->string('encuesta');

            $table->timestamps(); // Columnas created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('encuestas');
    }
};
