<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReporteIndicadorRojoPruebaMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public array $reporte
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reporte de tickets en indicador rojo - ' . $this->reporte['fecha_generacion_subject'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.reportes.indicador-rojo-prueba',
            with: [
                'reporte' => $this->reporte,
            ],
        );
    }
}
