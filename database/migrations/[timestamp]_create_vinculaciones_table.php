<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vinculaciones', function (Blueprint $table) {
            $table->id();
            $table->string('Supervisor');
            $table->string('Mecanico');
            $table->string('Modulo');
            $table->time('Hora_Comida_Inicio')->nullable();
            $table->time('Hora_Comida_Fin')->nullable();
            $table->time('Break_Lun_Jue_Inicio')->nullable();
            $table->time('Break_Lun_Jue_Fin')->nullable();
            $table->time('Break_Viernes_Inicio')->nullable();
            $table->time('Break_Viernes_Fin')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('vinculaciones');
    }
};
