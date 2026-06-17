<?php

namespace App\Services\FollowOT;

use App\Models\TicketOt;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ReporteIndicadorRojoService
{
    public function obtenerDatosMonitor(): array
    {
        $tickets = $this->obtenerTicketsMonitor();

        $ticketsEnAtencion = $tickets
            ->filter(function (TicketOt $ticket) {
                $diagnostico = $ticket->asignaciones->first()?->diagnostico;

                return filled($diagnostico?->hora_inicio);
            })
            ->map(fn (TicketOt $ticket) => $this->formatearTicketMonitor($ticket, 'atencion'))
            ->sortByDesc('tiempo_transcurrido_minutos')
            ->values();

        $ticketsSinIniciar = $tickets
            ->filter(function (TicketOt $ticket) {
                $diagnostico = $ticket->asignaciones->first()?->diagnostico;

                return blank($diagnostico?->hora_inicio);
            })
            ->map(fn (TicketOt $ticket) => $this->formatearTicketMonitor($ticket, 'asignado'))
            ->sortByDesc('tiempo_transcurrido_minutos')
            ->values();

        return [
            'actualizado_en' => now()->format('d/m/Y H:i:s'),
            'tickets_en_atencion' => $ticketsEnAtencion,
            'tickets_sin_iniciar' => $ticketsSinIniciar,
        ];
    }

    public function generarReporte(): array
    {
        $datosMonitor = $this->obtenerDatosMonitor();
        $fechaGeneracion = now();

        $ticketsRojos = $datosMonitor['tickets_en_atencion']
            ->merge($datosMonitor['tickets_sin_iniciar'])
            ->filter(fn (array $ticket) => $ticket['severidad'] === 'rojo')
            ->sortByDesc('tiempo_transcurrido_minutos')
            ->values();

        return [
            'fecha_generacion' => $fechaGeneracion,
            'fecha_generacion_formateada' => $fechaGeneracion->format('d/m/Y H:i:s'),
            'fecha_generacion_subject' => $fechaGeneracion->format('d/m/Y H:i'),
            'tickets' => $ticketsRojos,
            'kpis' => $this->calcularKpis($ticketsRojos, $fechaGeneracion),
            'resumen' => $this->calcularResumen($ticketsRojos),
        ];
    }

    private function obtenerTicketsMonitor(): Collection
    {
        return TicketOt::with([
                'catalogoEstado',
                'asignaciones.diagnostico.tiemposBahia',
            ])
            ->where(function ($query) {
                $query->whereDate('created_at', today())
                    ->orWhereHas('asignaciones', function ($asignacionQuery) {
                        $asignacionQuery->whereDate('fecha_asignacion', today())
                            ->orWhereHas('diagnostico', function ($diagnosticoQuery) {
                                $diagnosticoQuery->whereDate('hora_inicio', today());
                            });
                    });
            })
            ->whereHas('asignaciones', function ($query) {
                $query->whereNotNull('numero_empleado_mecanico')
                    ->whereNotIn('numero_empleado_mecanico', ['pendiente', 'N/A', ''])
                    ->whereNotNull('nombre_mecanico')
                    ->whereNotIn('nombre_mecanico', ['pendiente', 'N/A', '']);
            })
            ->whereHas('catalogoEstado', function ($query) {
                $query->whereNotIn('nombre', ['ATENDIDO', 'CANCELADO', 'AUTONOMO', 'PENDIENTE']);
            })
            ->get();
    }

    private function formatearTicketMonitor(TicketOt $ticket, string $tipo): array
    {
        $asignacion = $ticket->asignaciones->first();
        $diagnostico = $asignacion?->diagnostico;
        $referencia = $tipo === 'atencion'
            ? $diagnostico?->hora_inicio
            : ($asignacion?->fecha_asignacion ?? $ticket->created_at);

        $minutos = $this->calcularMinutosTranscurridos($referencia);
        $tiemposBahia = $diagnostico?->tiemposBahia ?? collect();
        $bahiaActiva = $tiemposBahia->firstWhere('hora_fin_pausa', null);
        $segundosBahia = (int) $tiemposBahia->sum('duracion_segundos');

        if ($bahiaActiva?->hora_inicio_pausa) {
            $segundosBahia += Carbon::parse($bahiaActiva->hora_inicio_pausa)->diffInSeconds(now());
        }

        return [
            'id' => $ticket->id,
            'folio' => $ticket->folio,
            'mecanico' => $asignacion?->nombre_mecanico ?? 'Sin asignar',
            'numero_empleado' => $asignacion?->numero_empleado_mecanico ?? 'N/A',
            'estado' => $ticket->catalogoEstado?->nombre ?? 'DESCONOCIDO',
            'estado_id' => $ticket->estado,
            'tipo_monitor' => $tipo,
            'tipo_monitor_label' => $tipo === 'atencion' ? 'En atencion' : 'Asignado sin iniciar',
            'tiempo_transcurrido_minutos' => $minutos,
            'tiempo_transcurrido_formateado' => $this->formatearMinutos($minutos),
            'severidad' => $this->obtenerSeveridadMonitor($minutos),
            'area' => $ticket->modulo,
            'modulo' => $ticket->modulo,
            'maquina' => $ticket->maquina,
            'planta' => $ticket->planta,
            'supervisor' => $ticket->nombre_supervisor ?: 'N/A',
            'numero_empleado_supervisor' => $ticket->numero_empleado_supervisor ?: 'N/A',
            'tipo_falla' => $ticket->tipo_problema,
            'descripcion' => $ticket->descripcion_problema,
            'fecha_creacion' => optional($ticket->created_at)->format('d/m/Y H:i:s'),
            'fecha_asignacion' => optional($asignacion?->fecha_asignacion)->format('d/m/Y H:i:s'),
            'fecha_inicio_atencion' => optional($diagnostico?->hora_inicio)->format('d/m/Y H:i:s'),
            'clase_maquina' => $diagnostico?->clase_maquina ?: 'N/A',
            'numero_maquina' => $diagnostico?->numero_maquina ?: 'N/A',
            'tiempo_estimado_formateado' => is_numeric($diagnostico?->tiempo_estimado)
                ? $this->formatearSegundos((int) $diagnostico->tiempo_estimado)
                : 'N/A',
            'falla' => $diagnostico?->falla ?: 'N/A',
            'causa' => $diagnostico?->causa ?: 'N/A',
            'accion_correctiva' => $diagnostico?->accion_correctiva ?: 'N/A',
            'comentarios' => $diagnostico?->comentarios ?: 'N/A',
            'tiempo_bahia' => [
                'activo' => (bool) $bahiaActiva,
                'registrado' => $tiemposBahia->isNotEmpty(),
                'total_segundos' => $segundosBahia,
                'total_formateado' => $this->formatearSegundos($segundosBahia),
                'motivo_activo' => $bahiaActiva?->motivo ?: 'N/A',
            ],
        ];
    }

    private function calcularKpis(Collection $ticketsRojos, Carbon $fechaGeneracion): array
    {
        $mecanicoTop = $this->obtenerGrupoTop($ticketsRojos, 'mecanico');
        $moduloTop = $this->obtenerGrupoTop($ticketsRojos, 'modulo');
        $ticketMayorMinutos = $ticketsRojos->first();

        return [
            'total_tickets_rojos' => $ticketsRojos->count(),
            'mecanico_mas_tickets' => $mecanicoTop['nombre'],
            'mecanico_mas_tickets_total' => $mecanicoTop['total'],
            'modulo_mas_tickets' => $moduloTop['nombre'],
            'modulo_mas_tickets_total' => $moduloTop['total'],
            'ticket_mayor_minutos' => $ticketMayorMinutos['folio'] ?? 'N/A',
            'ticket_mayor_minutos_total' => $ticketMayorMinutos['tiempo_transcurrido_minutos'] ?? 0,
            'ticket_mayor_minutos_formateado' => $ticketMayorMinutos['tiempo_transcurrido_formateado'] ?? 'N/A',
            'fecha_generacion' => $fechaGeneracion->format('d/m/Y H:i:s'),
        ];
    }

    private function calcularResumen(Collection $ticketsRojos): array
    {
        return [
            'en_atencion' => $ticketsRojos->where('tipo_monitor', 'atencion')->count(),
            'sin_iniciar' => $ticketsRojos->where('tipo_monitor', 'asignado')->count(),
            'por_planta' => $ticketsRojos->countBy('planta')->sortDesc(),
            'por_estado' => $ticketsRojos->countBy('estado')->sortDesc(),
        ];
    }

    private function obtenerGrupoTop(Collection $tickets, string $campo): array
    {
        $grupo = $tickets
            ->groupBy(fn (array $ticket) => $ticket[$campo] ?: 'N/A')
            ->map(fn (Collection $items, string $nombre) => [
                'nombre' => $nombre,
                'total' => $items->count(),
            ])
            ->sortByDesc('total')
            ->first();

        return $grupo ?? [
            'nombre' => 'N/A',
            'total' => 0,
        ];
    }

    private function calcularMinutosTranscurridos($fecha): int
    {
        if (blank($fecha)) {
            return 0;
        }

        return max(0, Carbon::parse($fecha)->diffInMinutes(now()));
    }

    private function obtenerSeveridadMonitor(int $minutos): string
    {
        if ($minutos > 40) {
            return 'rojo';
        }

        if ($minutos >= 30) {
            return 'naranja';
        }

        if ($minutos >= 20) {
            return 'amarillo';
        }

        return 'verde';
    }

    private function formatearMinutos(int $minutos): string
    {
        $horas = intdiv($minutos, 60);
        $minutosRestantes = $minutos % 60;

        if ($horas > 0) {
            return "{$horas}h {$minutosRestantes}m";
        }

        return "{$minutosRestantes}m";
    }

    private function formatearSegundos(int $segundos): string
    {
        $segundos = max(0, $segundos);
        $horas = intdiv($segundos, 3600);
        $minutos = intdiv($segundos % 3600, 60);
        $segundosRestantes = $segundos % 60;

        if ($horas > 0) {
            return sprintf('%dh %02dm %02ds', $horas, $minutos, $segundosRestantes);
        }

        return sprintf('%dm %02ds', $minutos, $segundosRestantes);
    }
}
