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
        Schema::dropIfExists('notificacion_usuario'); // <-- Precaución contra creación fantasma en MySQL
        Schema::create('notificacion_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('notificacion_id')->constrained('notificaciones')->cascadeOnDelete();
            // Reemplazo para soportar bases de datos heredadas (INT en vez de BIGINT)
            $table->unsignedInteger('usuario_id');
            $table->foreign('usuario_id')->references('id')->on('users')->cascadeOnDelete();
            
            $table->timestamp('leido_at')->nullable();
            $table->timestamps();
            
            // Un usuario no debe recibir la misma notificación exactamente más de una vez a nivel duplicado de tabla
            $table->unique(['notificacion_id', 'usuario_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificacion_usuario');
    }
};
