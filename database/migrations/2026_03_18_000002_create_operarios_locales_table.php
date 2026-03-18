<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('operarios_locales', function (Blueprint $table) {
            $table->id();
            // Aplicando snake_case para seguir el estándar de Laravel
            $table->string('num_operario')->index();
            $table->string('nombre');
            $table->string('modulo')->index();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('operarios_locales');
    }
};
