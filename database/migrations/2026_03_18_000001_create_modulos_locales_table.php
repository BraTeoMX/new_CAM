<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('modulos_locales', function (Blueprint $table) {
            $table->id();
            $table->string('modulo')->index();
            // Definido como entero, no nulo y con 1 por defecto
            $table->integer('planta')->default(1);
            $table->string('tipo')->nullable();
            $table->string('nombre_supervisor')->nullable();
            $table->string('numero_empleado_supervisor')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('modulos_locales');
    }
};
