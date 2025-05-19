<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vinculacion;
use App\Models\AsignationOT;
use Carbon\Carbon;
use App\Events\AsignacionOTCreated;
use Illuminate\Support\Facades\DB;

class AsignationOTController extends Controller
{
    /**
     * Asigna una OT a un mecánico disponible para el módulo dado.
     * Si hay más de un mecánico, la asignación es aleatoria.
     * Si todos los mecánicos están en break/comida, asigna después del break/comida.
     */
    public function asignarOT(Request $request)
    {
        // Espera: folio, modulo, descripcion, created_at
        $modulo = $request->input('modulo');
        $createdAt = $request->input('created_at') ?? now();

        // Obtener todos los mecánicos vinculados al módulo
        $mecanicos = Vinculacion::where('Modulo', $modulo)->get();

        if ($mecanicos->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No hay mecánicos asignados a este módulo.'
            ], 404);
        }

        $now = Carbon::parse($createdAt);

        // Filtrar mecánicos disponibles (no en break/comida)
        $disponibles = $mecanicos->filter(function ($mec) use ($now) {
            // Revisar break/comida según el día
            $dia = $now->englishDayOfWeek; // Monday, Tuesday, etc.

            // Comida
            if ($mec->Hora_Comida_Inicio && $mec->Hora_Comida_Fin) {
                $inicio = Carbon::parse($mec->Hora_Comida_Inicio);
                $fin = Carbon::parse($mec->Hora_Comida_Fin);
                if ($now->between($inicio, $fin)) return false;
            }

            // Breaks
            if (in_array($dia, ['Monday','Tuesday','Wednesday','Thursday'])) {
                if ($mec->Break_Lun_Jue_Inicio && $mec->Break_Lun_Jue_Fin) {
                    $inicio = Carbon::parse($mec->Break_Lun_Jue_Inicio);
                    $fin = Carbon::parse($mec->Break_Lun_Jue_Fin);
                    if ($now->between($inicio, $fin)) return false;
                }
            }
            if ($dia === 'Friday') {
                if ($mec->Break_Viernes_Inicio && $mec->Break_Viernes_Fin) {
                    $inicio = Carbon::parse($mec->Break_Viernes_Inicio);
                    $fin = Carbon::parse($mec->Break_Viernes_Fin);
                    if ($now->between($inicio, $fin)) return false;
                }
            }
            return true;
        });

        if ($disponibles->isNotEmpty()) {
            $asignado = $disponibles->random();
            $asignacionHora = $now;
        } else {
            // Todos están en break/comida, buscar el más próximo disponible
            $proximos = [];
            foreach ($mecanicos as $mec) {
                $horas = [];
                if ($mec->Hora_Comida_Fin && $now->lt(Carbon::parse($mec->Hora_Comida_Fin))) {
                    $horas[] = Carbon::parse($mec->Hora_Comida_Fin);
                }
                if ($now->isWeekday() && $mec->Break_Lun_Jue_Fin && $now->lt(Carbon::parse($mec->Break_Lun_Jue_Fin))) {
                    $horas[] = Carbon::parse($mec->Break_Lun_Jue_Fin);
                }
                if ($now->isFriday() && $mec->Break_Viernes_Fin && $now->lt(Carbon::parse($mec->Break_Viernes_Fin))) {
                    $horas[] = Carbon::parse($mec->Break_Viernes_Fin);
                }
                if (!empty($horas)) {
                    $proximos[] = [
                        'mecanico' => $mec,
                        'hora' => collect($horas)->max()
                    ];
                }
            }
            if (empty($proximos)) {
                // No hay break/comida próximos, asignar cualquiera
                $asignado = $mecanicos->random();
                $asignacionHora = $now;
            } else {
                // Asignar al mecánico que antes quede libre
                $min = collect($proximos)->sortBy('hora')->first();
                $asignado = $min['mecanico'];
                $asignacionHora = $min['hora'];
            }
        }

      $cvetra = DB::connection('sqlsrv_dev')
                ->table('cat_empleados')
                ->where('nombre', $asignado->Mecanico)
                ->value('cvetra'); 

        $StatusEntrante = strtoupper($request->input('status'));
        $statusAsignar = $StatusEntrante === 'SIN_ASIGNAR' ? 'ASIGNADO' : $StatusEntrante;

        // Guardar la asignación en la base de datos
        $asignacion = AsignationOT::create([
            'Folio'     => $request->input('folio'),
            'Modulo'    => $modulo,
            'Num_Mecanico' => $cvetra,
            'Mecanico'  => $asignado->Mecanico,
            'Supervisor'=> $asignado->Supervisor,
            'Maquina' => $request->input('maquina'),
            'Problema'  => $request->input('descripcion'),
            'Status'    => $statusAsignar,
        ]);

        // Emitir evento broadcast para Echo/Pusher
        broadcast(new AsignacionOTCreated($asignacion))->toOthers();

        return response()->json([
            'success' => true,
            'folio' => $request->input('folio'),
            'modulo' => $modulo,
            'cve_mecanico' => $cvetra,
            'mecanico_asignado' => $asignado->Mecanico,
            'supervisor' => $asignado->Supervisor,
            'Maquina' => $request->input('maquina'),
            'problema' => $request->input('descripcion'),
            'status' => $statusAsignar,
            'asignacion_hora' => $asignacionHora->toDateTimeString(),
            'foto' => $asignado->foto ?? null, // si tienes campo foto
        ]);
    }

    // Nuevo método para obtener asignaciones (para AJAX)
    public function getAsignaciones()
    {
        $asignaciones = AsignationOT::orderBy('id', 'desc')->get();
        return response()->json($asignaciones);
    }
}
