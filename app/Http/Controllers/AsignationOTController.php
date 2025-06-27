<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Vinculacion;
use App\Models\AsignationOT;
use App\Models\CatalogoProblema;
use Carbon\Carbon;
use App\Events\AsignacionOTCreated;
use App\Events\ComidaBreakLimpiado; // Agrega este use
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
            // Buscar supervisor por el módulo (primer supervisor encontrado)
            $supervisor = Vinculacion::where('Modulo', $modulo)->value('Supervisor');
            // Guardar la asignación con mecánico y cve_mecanico null y status SIN_ASIGNAR, pero con supervisor si existe
            $asignacion = AsignationOT::create([
                'Folio'     => $request->input('folio'),
                'Modulo'    => $modulo,
                'Operario'  => $request->input('operario'),
                'NombreOperario' => $request->input('nombreoperario'),
                'Num_Mecanico' => null,
                'Mecanico'  => null,
                'TimeAutEst' => $request->input('timeAutonomo'),
                'TimeAutReal' => $request->input('timerealAutonomo'),
                'Supervisor'=> $supervisor,
                'Maquina' => $request->input('maquina'),
                'Problema'  => $request->input('descripcion'),
                'Status'    => 'SIN_ASIGNAR',
                'ComidaBreak' => null,
                'TerminoComidaBreack' => null,
            ]);
            Log::info("Asignación OT guardada como SIN_ASIGNAR: " . json_encode($asignacion->toArray()));
            // Emitir evento broadcast si es necesario
            broadcast(new AsignacionOTCreated($asignacion))->toOthers();
            return response()->json([
                'success' => true,
                'folio' => $request->input('folio'),
                'modulo' => $modulo,
                'operario' => $request->input('Operario'),
                'nombre_operario' => $request->input('NombreOperario'),
                'cve_mecanico' => null,
                'mecanico_asignado' => null,
                'supervisor' => $supervisor,
                'Maquina' => $request->input('maquina'),
                'problema' => $request->input('descripcion'),
                'status' => 'SIN_ASIGNAR',
                'asignacion_hora' => now()->toDateTimeString(),
                'ComidaBreak' => null,
                'termino_comida_break' => null,
            ]);
        }

        $now = Carbon::parse($createdAt);

        // Determinar para cada mecánico si está en break o comida y la hora de término
        $mecanicos = $mecanicos->map(function ($mec) use ($now) {
            $dia = $now->englishDayOfWeek;
            $enComida = false;
            $enBreak = false;
            $termino = null;
            $motivo = null;

            // Comida
            if ($mec->Hora_Comida_Inicio && $mec->Hora_Comida_Fin) {
                $inicio = Carbon::parse($mec->Hora_Comida_Inicio);
                $fin = Carbon::parse($mec->Hora_Comida_Fin);
                if ($now->between($inicio, $fin)) {
                    $enComida = true;
                    $termino = $fin;
                    $motivo = "El mecanico no esta disponible, se encuentra en su hora de comida";
                }
            }
            // Breaks
            if (in_array($dia, ['Monday','Tuesday','Wednesday','Thursday'])) {
                if ($mec->Break_Lun_Jue_Inicio && $mec->Break_Lun_Jue_Fin) {
                    $inicio = Carbon::parse($mec->Break_Lun_Jue_Inicio);
                    $fin = Carbon::parse($mec->Break_Lun_Jue_Fin);
                    if ($now->between($inicio, $fin)) {
                        $enBreak = true;
                        $termino = $fin;
                        $motivo = "El mecanico no esta disponible, se encuentra en su hora de break";
                    }
                }
            }
            if ($dia === 'Friday') {
                if ($mec->Break_Viernes_Inicio && $mec->Break_Viernes_Fin) {
                    $inicio = Carbon::parse($mec->Break_Viernes_Inicio);
                    $fin = Carbon::parse($mec->Break_Viernes_Fin);
                    if ($now->between($inicio, $fin)) {
                        $enBreak = true;
                        $termino = $fin;
                        $motivo = "El mecanico no esta disponible, se encuentra en su hora de break";
                    }
                }
            }
            $mec->enComida = $enComida;
            $mec->enBreak = $enBreak;
            $mec->terminoComidaBreak = $termino ? $termino->toDateTimeString() : null;
            $mec->motivoComidaBreak = $motivo;
            return $mec;
        });

        // Selecciona aleatoriamente un mecánico presente
        $asignado = $mecanicos->random();
        $asignacionHora = $now;

        // Determina si está en break o comida y la hora de término
        $motivoComidaBreak = $asignado->motivoComidaBreak;
        $terminoComidaBreak = $asignado->terminoComidaBreak;

        $StatusEntrante = strtoupper($request->input('status'));
        $statusAsignar = $StatusEntrante === 'SIN_ASIGNAR' ? 'ASIGNADO' : $StatusEntrante;
       $supervisor = $mecanicos->where('Num_Mecanico', $asignado->Num_Mecanico)->first()->Supervisor;
        // Validación para status AUTONOMO
        if ($statusAsignar === 'AUTONOMO') {
            $nombreMecanico = 'AUTONOMO';
            $cvetra = null;
        }elseif($statusAsignar === 'CANCELADO') {
            $nombreMecanico = 'CANCELADO';
            $cvetra = null;
        }else {
            // Obtener nombre del mecánico por cvetra (Num_Mecanico)
            Log::info("Buscando nombre del mecánico en cat_empleados por cvetra: " . $asignado->Num_Mecanico);
            $mecanicoData = DB::connection('sqlsrv_dev')
                ->table('cat_empleados')
                ->where('cvetra', $asignado->Num_Mecanico)
                ->select('cvetra', 'nombre')
                ->first();

            $cvetra = $mecanicoData ? $mecanicoData->cvetra : $asignado->Num_Mecanico;
            $nombreMecanico = $mecanicoData ? $mecanicoData->nombre : $asignado->Mecanico;
        }

        // Guardar la asignación en la base de datos
        $asignacion = AsignationOT::create([
            'Folio'     => $request->input('folio'),
            'Modulo'    => $modulo,
            'Operario'  => $request->input('operario'),
            'NombreOperario' => $request->input('nombreoperario'),
            'Num_Mecanico' => $cvetra,
            'Mecanico'  => $nombreMecanico,
            'TimeAutEst' => $request->input('timeAutonomo'),
            'TimeAutReal' => $request->input('timerealAutonomo'),
            'Supervisor'=> $supervisor,
            'Maquina' => $request->input('maquina'),
            'Problema'  => $request->input('descripcion'),
            'Status'    => $statusAsignar,
            'ComidaBreak' => $motivoComidaBreak ?? null,
            'TerminoComidaBreack' => $terminoComidaBreak ?? null,
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
            'operario' => $request->input('Operario'),
            'nombre_operario' => $request->input('NombreOperario'),
            'cve_mecanico' => $cvetra,
            'mecanico_asignado' => $nombreMecanico,
            'supervisor' => $asignado->Supervisor,
            'Maquina' => $request->input('maquina'),
            'problema' => $request->input('descripcion'),
            'status' => $statusAsignar,
            'asignacion_hora' => $asignacionHora->toDateTimeString(),
            'foto' => $asignado->foto ?? null,
            'ComidaBreak' => $motivoComidaBreak,
            'termino_comida_break' => $terminoComidaBreak,
        ]);
    }

    // Nuevo método para obtener asignaciones (para AJAX)
    public function getAsignaciones()
    {
        $asignaciones = AsignationOT::orderBy('id', 'desc')->get();
        return response()->json($asignaciones);
    }

    // Nuevo método para limpiar ComidaBreak y TerminoComidaBreack por folio
    public function limpiarComidaBreak(Request $request)
    {
        $folio = $request->input('folio');
        $asignacion = AsignationOT::where('Folio', $folio)->first();
        if ($asignacion) {
            $asignacion->ComidaBreak = null;
            $asignacion->TerminoComidaBreack = null;
            $asignacion->save();
            // Opcional: emitir evento si quieres que se actualice en tiempo real
            broadcast(new AsignacionOTCreated($asignacion))->toOthers();
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
    }

    // Nuevo método para limpiar ComidaBreak y TerminoComidaBreack de varios folios
    public function limpiarComidaBreakMasivo(Request $request)
    {
        $folios = $request->input('folios', []);
        if (!is_array($folios) || empty($folios)) {
            return response()->json(['success' => false, 'message' => 'No hay folios'], 400);
        }
        \App\Models\AsignationOT::whereIn('Folio', $folios)
            ->update(['ComidaBreak' => null, 'TerminoComidaBreack' => null]);
        // Emitir evento para que todos los clientes recarguen
        broadcast(new ComidaBreakLimpiado())->toOthers();
        return response()->json(['success' => true]);
    }

    public function catalogoProblemas()
    {
        $problemas = CatalogoProblema::where('estatus', 1)
            ->orderBy('nombre', 'asc')
            ->get(['id', 'nombre', 'descripcion', 'pasos']);
        return response()->json($problemas);
    }
}
