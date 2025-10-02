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
        Schema::table('tickets_ot', function (Blueprint $table) {
            $table->boolean('tiempo_extra')->default(0)->after('estado')->comment('Indica si el registro se realizó en tiempo extra (1) o tiempo normal (0)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets_ot', function (Blueprint $table) {
            $table->dropColumn('tiempo_extra');
        });
    }
};
