<?php

namespace App\Actions;

use App\Models\Vinculacion;
use App\Models\AsignacionOt;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FindMechanicAction
{
    public function execute(string $modulo)
    {
        $vinculaciones = Vinculacion::where('modulo', $modulo)->get();
        $ahora = now();
        $diaDeLaSemana = $ahora->dayOfWeekIso;
        $mecanicosDisponibles = [];

        foreach ($vinculaciones as $vinculacion) {
            $estaEnDescanso = false;
            
            if ($diaDeLaSemana >= 1 && $diaDeLaSemana <= 5) {
                $comidaInicio = Carbon::parse($vinculacion->hora_comida_inicio);
                $comidaFin = Carbon::parse($vinculacion->hora_comida_fin);
                if ($ahora->between($comidaInicio, $comidaFin)) {
                    $estaEnDescanso = true;
                }
                if (!$estaEnDescanso) {
                    $breakInicio = ($diaDeLaSemana <= 4) ? Carbon::parse($vinculacion->break_lunes_jueves_inicio) : Carbon::parse($vinculacion->break_viernes_inicio);
                    $breakFin = ($diaDeLaSemana <= 4) ? Carbon::parse($vinculacion->break_lunes_jueves_fin) : Carbon::parse($vinculacion->break_viernes_fin);
                    if ($ahora->between($breakInicio, $breakFin)) {
                        $estaEnDescanso = true;
                    }
                }
            }

            if (!$estaEnDescanso) {
                $mecanicosDisponibles[] = $vinculacion;
            }
        }

        if (count($mecanicosDisponibles) === 1) {
            return $mecanicosDisponibles[0];
        } elseif (count($mecanicosDisponibles) > 1) {
            $numerosEmpleado = collect($mecanicosDisponibles)->pluck('numero_empleado_mecanico');
            $conteoTicketsHoy = AsignacionOt::whereIn('numero_empleado_mecanico', $numerosEmpleado)
                ->whereDate('created_at', today())
                ->select('numero_empleado_mecanico', DB::raw('count(*) as total'))
                ->groupBy('numero_empleado_mecanico')
                ->pluck('total', 'numero_empleado_mecanico');
            
            $mecanicosConCarga = collect($mecanicosDisponibles)->map(function ($mecanico) use ($conteoTicketsHoy) {
                $mecanico->carga_hoy = $conteoTicketsHoy->get($mecanico->numero_empleado_mecanico, 0);
                return $mecanico;
            });
            return $mecanicosConCarga->sortBy('carga_hoy')->first();
        }

        return null;
    }
}
