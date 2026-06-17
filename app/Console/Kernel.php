<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        $schedule->command('sync:sqlserver-data')->everyFifteenMinutes();

        // Programacion temporal del correo de prueba; despues enviara el reporte real de indicadores rojos.
        $schedule->command('reporte:indicador-rojo-prueba')
            ->weekdays()
            ->days([1, 2, 3, 4])
            ->hourly()
            ->between('8:00', '19:00');

        // Programacion temporal del correo de prueba para viernes; despues enviara el reporte real de indicadores rojos.
        $schedule->command('reporte:indicador-rojo-prueba')
            ->fridays()
            ->hourly()
            ->between('8:00', '14:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
