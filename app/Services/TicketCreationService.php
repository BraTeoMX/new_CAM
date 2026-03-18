<?php

namespace App\Services;

use App\Models\TicketOt;
use App\Models\AsignacionOt;
use App\Actions\FindMechanicAction;
use App\Events\NewOrderNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketCreationService
{
    protected $findMechanicAction;

    public function __construct(FindMechanicAction $findMechanicAction)
    {
        $this->findMechanicAction = $findMechanicAction;
    }

    public function createTicket(array $sanitizedData, array $allRequestData)
    {
        $mecanicoAsignado = null;

        if ($sanitizedData['status'] === '2') {
            $mecanicoAsignado = $this->findMechanicAction->execute($sanitizedData['modulo']);
        }

        $ticket = DB::transaction(function () use ($sanitizedData, $allRequestData, $mecanicoAsignado) {
            $estadoFinalDelTicket = 0;
            switch ($sanitizedData['status']) {
                case '1':
                    $estadoFinalDelTicket = 1; // Resuelto
                    break;
                case '3':
                    $estadoFinalDelTicket = 7; // Cancelado
                    break;
                case '2':
                    $estadoFinalDelTicket = $mecanicoAsignado ? $sanitizedData['status'] : 6;
                    break;
            }

            $folio = 'OT' . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
            $tiempoExtra = $this->calcularTiempoExtra(now());

            $newTicket = TicketOt::create([
                'modulo'                     => $sanitizedData['modulo'],
                'planta'                     => $allRequestData['planta'] ?? '1',
                'nombre_supervisor'          => $allRequestData['nombre_supervisor'] ?? 'N/A',
                'numero_empleado_supervisor' => $allRequestData['numero_empleado_supervisor'] ?? 'N/A',
                'numero_empleado_operario'   => $allRequestData['Operario'] ?? 'N/A',
                'nombre_operario'            => $allRequestData['NombreOperario'] ?? 'N/A',
                'tipo_problema'              => $sanitizedData['problema'],
                'descripcion_problema'       => $sanitizedData['descripcion'],
                'maquina'                    => $sanitizedData['maquina'],
                'folio'                      => $folio,
                'estado'                     => $estadoFinalDelTicket,
                'tiempo_extra'               => $tiempoExtra,
                'created_at'                 => now(),
                'updated_at'                 => now()
            ]);

            $asignacionData = [];
            if ($sanitizedData['status'] === '2' && $mecanicoAsignado) {
                $asignacionData = [
                    'numero_empleado_mecanico' => $mecanicoAsignado->numero_empleado_mecanico,
                    'nombre_mecanico'          => $mecanicoAsignado->nombre_mecanico,
                    'estado_asignacion'        => 4,
                    'comida_break_disponible'  => 1,
                ];
            } elseif ($sanitizedData['status'] === '2' && !$mecanicoAsignado) {
                $asignacionData = [
                    'numero_empleado_mecanico' => 'pendiente',
                    'nombre_mecanico'          => 'pendiente',
                    'estado_asignacion'        => 6,
                    'comida_break_disponible'  => 0,
                ];
            } else {
                $asignacionData = [
                    'numero_empleado_mecanico' => 'N/A',
                    'nombre_mecanico'          => 'N/A',
                    'estado_asignacion'        => 0,
                    'comida_break_disponible'  => 0,
                ];
            }

            AsignacionOt::create(array_merge($asignacionData, [
                'ticket_ot_id'            => $newTicket->id,
                'tiempo_estimado_minutos' => $allRequestData['tiempo_estimado_ia'] ?? 0,
                'tiempo_real_minutos'     => $allRequestData['tiempo_real_ia'] ?? 0,
                'fecha_asignacion'        => now(),
            ]));

            return $newTicket;
        });

        if ($ticket) {
            try {
                event(new NewOrderNotification($ticket));
            } catch (\Exception $e) {
                Log::error('V3 Error evento NewOrderNotification: ' . $e->getMessage());
            }
        }

        return $ticket;
    }

    private function calcularTiempoExtra(Carbon $fechaHora): int
    {
        $diaSemana = $fechaHora->dayOfWeekIso;
        $hora = $fechaHora->format('H:i');

        if ($diaSemana === 6 || $diaSemana === 7) return 1;

        if ($diaSemana >= 1 && $diaSemana <= 4) {
            if ($hora >= '08:00' && $hora <= '19:00') return 0;
            return 1;
        }

        if ($diaSemana === 5) {
            if ($hora >= '08:00' && $hora <= '14:00') return 0;
            return 1;
        }

        return 1;
    }
}
