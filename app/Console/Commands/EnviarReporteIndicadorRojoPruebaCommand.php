<?php

namespace App\Console\Commands;

use App\Mail\ReporteIndicadorRojoPruebaMail;
use App\Services\FollowOT\ReporteIndicadorRojoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class EnviarReporteIndicadorRojoPruebaCommand extends Command
{
    protected $signature = 'reporte:indicador-rojo-prueba';

    protected $description = 'Envia el reporte de tickets en indicador rojo.';

    public function handle(ReporteIndicadorRojoService $reporteIndicadorRojoService): int
    {
        $destinatarios = config('reportes.indicador_rojo.mails', []);

        $this->info('Iniciando envio de reporte de indicador rojo.');

        if (empty($destinatarios)) {
            $this->error('No hay destinatarios configurados para el reporte de indicador rojo.');

            return self::FAILURE;
        }

        $this->info('Destinatarios configurados: ' . implode(', ', $destinatarios));

        try {
            $reporte = $reporteIndicadorRojoService->generarReporte();
            $kpis = $reporte['kpis'];

            $this->info('Tickets rojos encontrados: ' . $kpis['total_tickets_rojos']);
            $this->info('Mecanico con mas tickets rojos: ' . $kpis['mecanico_mas_tickets'] . ' (' . $kpis['mecanico_mas_tickets_total'] . ')');
            $this->info('Modulo con mas tickets rojos: ' . $kpis['modulo_mas_tickets'] . ' (' . $kpis['modulo_mas_tickets_total'] . ')');

            Mail::to($destinatarios)->send(new ReporteIndicadorRojoPruebaMail($reporte));

            $this->info('Correo enviado correctamente.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No fue posible enviar el reporte de indicador rojo. Revisa la configuracion SMTP y los logs.');

            Log::error('Error al enviar reporte de indicador rojo.', [
                'message' => $e->getMessage(),
                'destinatarios' => $destinatarios,
            ]);

            return self::FAILURE;
        }
    }
}
