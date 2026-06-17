<?php

namespace App\Console\Commands;

use App\Mail\ReporteIndicadorRojoPruebaMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class EnviarReporteIndicadorRojoPruebaCommand extends Command
{
    protected $signature = 'reporte:indicador-rojo-prueba';

    protected $description = 'Envia un correo de prueba para validar la estructura del reporte de indicador rojo.';

    public function handle(): int
    {
        $destinatarios = config('reportes.indicador_rojo.mails', []);

        $this->info('Iniciando envio de correo de prueba.');

        if (empty($destinatarios)) {
            $this->error('No hay destinatarios configurados para el reporte de indicador rojo.');

            return self::FAILURE;
        }

        $this->info('Destinatarios configurados: ' . implode(', ', $destinatarios));

        try {
            Mail::to($destinatarios)->send(new ReporteIndicadorRojoPruebaMail());

            $this->info('Correo enviado correctamente.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No fue posible enviar el correo de prueba. Revisa la configuracion SMTP y los logs.');

            Log::error('Error al enviar reporte de indicador rojo de prueba.', [
                'message' => $e->getMessage(),
                'destinatarios' => $destinatarios,
            ]);

            return self::FAILURE;
        }
    }
}
