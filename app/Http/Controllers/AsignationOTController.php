<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
        Log::info('--- INICIO asignarOT ---');
        Log::info('Datos recibidos:', $request->all());

        $modulo = $request->input('modulo');
        $createdAt = $request->input('created_at') ?? now();

        Log::info("Buscando mecánicos vinculados al módulo: $modulo");
        $mecanicos = Vinculacion::where('Modulo', $modulo)->get();

        if ($mecanicos->isEmpty()) {
            Log::info("No hay mecánicos asignados al módulo: $modulo");
            return response()->json([
                'success' => false,
                'message' => 'No hay mecánicos asignados a este módulo.'
            ], 404);
        }

        Log::info("Mecánicos vinculados encontrados: " . $mecanicos->pluck('Num_Mecanico')->implode(', '));

        // Validar que los mecánicos hayan llegado a la planta hoy (comparando por IdPoblacion)
        Log::info("Consultando Emple_Movimientos para asistencia del día...");
        $usuariosActivos = DB::connection('sqlsrv_dev')
            ->table('Emple_Movimientos')
            ->whereRaw("CAST(FechaRegistro AS DATE) = CAST(GETDATE() AS DATE)")
            ->whereBetween('HoraRegistro', ['07:00:00', '08:50:00'])
            ->orderBy('HoraRegistro', 'ASC')
            ->get();

        $idsPresentes = $usuariosActivos->pluck('IdPoblacion')->map(function($id) {
            return trim($id);
        })->toArray();

        Log::info("IdPoblacion presentes hoy: " . implode(', ', $idsPresentes));

        $mecanicos = $mecanicos->filter(function($mec) use ($idsPresentes) {
            return in_array(trim($mec->Num_Mecanico), $idsPresentes);
        });

        Log::info("Mecánicos presentes tras filtro asistencia: " . $mecanicos->pluck('Num_Mecanico')->implode(', '));

        if ($mecanicos->isEmpty()) {
            Log::info("No hay mecánicos presentes en planta para el módulo: $modulo");
            return response()->json([
                'success' => false,
                'message' => 'No hay mecánicos presentes en planta para este módulo.'
            ], 404);
        }

        $now = Carbon::parse($createdAt);

        // Filtrar mecánicos disponibles (no en break/comida)
        Log::info("Filtrando mecánicos disponibles (no en break/comida)...");
        $disponibles = $mecanicos->filter(function ($mec) use ($now) {
            $dia = $now->englishDayOfWeek;
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

        Log::info("Mecánicos disponibles tras filtro de horario: " . $disponibles->pluck('Num_Mecanico')->implode(', '));

        if ($disponibles->isNotEmpty()) {
            $asignado = $disponibles->random();
            $asignacionHora = $now;
            Log::info("Mecánico asignado aleatoriamente de los disponibles: " . $asignado->Num_Mecanico);
        } else {
            Log::info("Todos los mecánicos están en break/comida, buscando el más próximo disponible...");
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
                $asignado = $mecanicos->random();
                $asignacionHora = $now;
                Log::info("No hay break/comida próximos, asignando aleatoriamente: " . $asignado->Num_Mecanico);
            } else {
                $min = collect($proximos)->sortBy('hora')->first();
                $asignado = $min['mecanico'];
                $asignacionHora = $min['hora'];
                Log::info("Asignando al mecánico que antes queda libre: " . $asignado->Num_Mecanico . " a las " . $asignacionHora);
            }
        }

        // Obtener nombre del mecánico por cvetra (Num_Mecanico)
        Log::info("Buscando nombre del mecánico en cat_empleados por cvetra: " . $asignado->Num_Mecanico);
        $mecanicoData = DB::connection('sqlsrv_dev')
            ->table('cat_empleados')
            ->where('cvetra', $asignado->Num_Mecanico)
            ->select('cvetra', 'nombre')
            ->first();

        $cvetra = $mecanicoData ? $mecanicoData->cvetra : $asignado->Num_Mecanico;
        $nombreMecanico = $mecanicoData ? $mecanicoData->nombre : $asignado->Mecanico;

        Log::info("Datos del mecánico asignado: cvetra=$cvetra, nombre=$nombreMecanico");

        $StatusEntrante = strtoupper($request->input('status'));
        $statusAsignar = $StatusEntrante === 'SIN_ASIGNAR' ? 'ASIGNADO' : $StatusEntrante;

        Log::info("Status entrante: $StatusEntrante, status a asignar: $statusAsignar");

        // Guardar la asignación en la base de datos
        $asignacion = AsignationOT::create([
            'Folio'     => $request->input('folio'),
            'Modulo'    => $modulo,
            'Num_Mecanico' => $cvetra,
            'Mecanico'  => $nombreMecanico,
            'Supervisor'=> $asignado->Supervisor,
            'Maquina' => $request->input('maquina'),
            'Problema'  => $request->input('descripcion'),
            'Status'    => $statusAsignar,
        ]);

        Log::info("Asignación OT guardada: " . json_encode($asignacion->toArray()));

        // Emitir evento broadcast para Echo/Pusher
        broadcast(new AsignacionOTCreated($asignacion))->toOthers();
        Log::info("Evento AsignacionOTCreated emitido para folio: " . $asignacion->Folio);

        Log::info('--- FIN asignarOT ---');

        return response()->json([
            'success' => true,
            'folio' => $request->input('folio'),
            'modulo' => $modulo,
            'cve_mecanico' => $cvetra,
            'mecanico_asignado' => $nombreMecanico,
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
