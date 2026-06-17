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

    /**
     * @var array<int, string>
     */
    private array $destinatarios = [
        'bteofilo@intimark.com.mx',
        'brateomx@gmail.com',
    ];

    public function handle(): int
    {
        $this->info('Iniciando envio de correo de prueba.');
        $this->info('Destinatarios configurados: ' . implode(', ', $this->destinatarios));

        try {
            Mail::to($this->destinatarios)->send(new ReporteIndicadorRojoPruebaMail());

            $this->info('Correo enviado correctamente.');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('No fue posible enviar el correo de prueba. Revisa la configuracion SMTP y los logs.');

            Log::error('Error al enviar reporte de indicador rojo de prueba.', [
                'message' => $e->getMessage(),
                'destinatarios' => $this->destinatarios,
            ]);

            return self::FAILURE;
        }
    }
}
