<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ClasseMaquina;
use App\Models\AsignationOT;
use App\Events\StatusOTUpdated;
use Illuminate\Support\Facades\DB;
use App\Models\FollowAtention;
use App\Models\Falla;
use App\Models\Causa;
use App\Models\Accion;
use App\Models\Bahia;

class FollowAtentionController extends Controller
{

    public function FollowOT()
    {
        try {
            // Obtener Segundas y Terceras Generales
            return view('pages.FormGuest.FollowUpAtention');
        } catch (\Exception $e) {
            // Manejar la excepción, por ejemplo, loguear el error
            Log::error('Error al obtener Segundas: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al obtener los datos.',
                'status' => 'error'
            ], 500);
        }
    }

    public function getClasesMaquina($maquina)
    {
        try {
            Log::info("Iniciando getClasesMaquina para máquina: $maquina");
            // También retorna el TimeEstimado para cada clase
            $clases = ClasseMaquina::where('mach', $maquina)
                ->get(['class_id', 'class', 'TimeEstimado']);
            Log::info("Clases obtenidas: " . $clases->count());
            $numeroMaquina = $this->getNumeroMaquina($clases);
            Log::info("Número de máquinas obtenidas: " . ($numeroMaquina ? $numeroMaquina->count() : 0));
            return response()->json([
                'clases' => $clases,
                'numeroMaquina' => $numeroMaquina
            ]);
        } catch (\Exception $e) {
            Log::error('Error en getClasesMaquina: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    private function getNumeroMaquina($clases)
    {
        try {
            Log::info("Iniciando getNumeroMaquina");
            // Extraer los valores de 'class' de la colección
            $claseValues = $clases->pluck('class')->toArray();
            Log::info("Valores de clase para búsqueda: " . json_encode($claseValues));

            // Buscar los ID_INTIMARK donde CLASIFICACION esté en la lista de clases
            $numeroMaquina = DB::connection('sqlsrv_dev')
                ->table('InvMecanicos')
                ->whereIn('Clasificacion', $claseValues)
                ->get(['Remplacad']);

            Log::info("IDs de máquina encontrados: " . ($numeroMaquina ? $numeroMaquina->count() : 0));
            return $numeroMaquina; // Retorna solo los datos
        } catch (\Exception $e) {
            Log::error('Error en getNumeroMaquina: ' . $e->getMessage());
            return collect(); // Retorna colección vacía en caso de error
        }
    }
    public function iniciarAtencion(Request $request)
    {
        try {

            // Buscar la OT
            $ot = AsignationOT::where('Folio', $request->folio)->firstOrFail();
            $ot->Status = 'PROCESO';
            $ot->save();
            // Formatear TimeInicio a H:i
            $timeInicio = \Carbon\Carbon::parse($request->time_inicio)->format('H:i');


            // Guardar registro en FollowAtention
            $follow = FollowAtention::updateOrCreate(
                ['Folio' => $ot->Folio],
                [
                    'Num_Mecanico' => $ot->Num_Mecanico,
                    'Mecanico'     => $ot->Mecanico,
                    'Modulo'       => $ot->Modulo,
                    'Operario'     => $ot->Operario,
                    'NombreOperario' => $ot->NombreOperario,
                    'Supervisor'   => $ot->Supervisor,
                    'Problema'     => $ot->Problema,
                    'Maquina'      => $ot->Maquina,
                    'Classe'       => $request->clase,
                    'NumMach' => $request->numero_maquina,
                    'TimeInicio'   => $timeInicio,
                    'TimeEstimado' => $request->tiempo_estimado,
                ]
            );

            broadcast(new StatusOTUpdated($ot))->toOthers();

            return response()->json(['success' => true, 'ot' => $ot, 'follow' => $follow]);
        } catch (\Exception $e) {
            Log::error('Error en iniciarAtencion: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Nuevo método para obtener datos de FollowAtention por folio (si no existe, regresa TimeEjecucion = 0)
    public function getFollowAtentionByFolio($folio)
    {
        $follow = \App\Models\FollowAtention::where('Folio', $folio)->first();
        if ($follow) {
            return response()->json([
                'success' => true,
                'data' => $follow
            ]);
        } else {
            return response()->json([
                'success' => true,
                'data' => ['TimeEjecucion' => 0]
            ]);
        }
    }

    public function finalizarAtencion(Request $request)
    {
        try {
            $follow = FollowAtention::where('Folio', $request->folio)->firstOrFail();
            $follow->TimeFinal = $request->time_final;
            $follow->TimeReal = $request->time_real;
            $follow->TimeEjecucion = $request->time_ejecucion;
            $follow->Falla = $request->falla;
            $follow->Causa = $request->causa;
            $follow->Accion = $request->accion;
            $follow->Comentarios = $request->comentarios ?: null;
            $follow->save();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error en finalizarAtencion: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    // Endpoints de catálogos
    public function getFallas()
    {
        $fallas = Falla::select('id', 'Fallas')->orderBy('Fallas')->get();
        return response()->json($fallas);
    }

    public function getCausas()
    {
        $causas = Causa::select('id', 'Causa')->orderBy('Causa')->get();
        return response()->json($causas);
    }

    public function getAcciones()
    {
        $acciones = Accion::select('id', 'Accion')->orderBy('Accion')->get();
        return response()->json($acciones);
    }

    /**
     * Guardar inicio o fin de Bahía.
     * Espera POST con: folio, tipo ('inicio', 'fin', 'inicio1', 'fin1')
     */
    public function guardarBahia(Request $request)
    {
        $request->validate([
            'folio' => 'required|string',
            'tipo' => 'required|in:inicio,fin,inicio1,fin1',
        ]);

        $folio = $request->folio;
        $tipo = $request->tipo;
        $now = now();

        $bahia = Bahia::where('Folio', $folio)->first();

        if (!$bahia) {
            // Solo puede ser 'inicio' para el primer ciclo
            if ($tipo === 'inicio') {
                $bahia = Bahia::create([
                    'Folio' => $folio,
                    'InicioBahia' => $now,
                    'Pulsaciones' => 1,
                ]);
                return response()->json(['success' => true, 'bahia' => $bahia, 'accion' => 'inicio', 'fecha' => $now]);
            } else {
                return response()->json(['success' => false, 'message' => 'No existe registro de inicio para este folio.'], 404);
            }
        }

        // Lógica de pulsaciones y ciclos
        switch ($tipo) {
            case 'inicio':
                // Primer ciclo, inicio
                $bahia->InicioBahia = $now;
                $bahia->Pulsaciones = 1;
                $bahia->save();
                return response()->json(['success' => true, 'bahia' => $bahia, 'accion' => 'inicio', 'fecha' => $now]);
            case 'fin':
                // Primer ciclo, fin
                $bahia->FinBahia = $now;
                $bahia->Pulsaciones = 2;
                $bahia->save();
                return response()->json(['success' => true, 'bahia' => $bahia, 'accion' => 'fin', 'fecha' => $now]);
            case 'inicio1':
                // Segundo ciclo, inicio
                $bahia->InicioBahia1 = $now;
                $bahia->Pulsaciones = 3;
                $bahia->save();
                return response()->json(['success' => true, 'bahia' => $bahia, 'accion' => 'inicio1', 'fecha' => $now]);
            case 'fin1':
                // Segundo ciclo, fin
                $bahia->FinBahia1 = $now;
                $bahia->Pulsaciones = 4;
                $bahia->save();
                return response()->json(['success' => true, 'bahia' => $bahia, 'accion' => 'fin1', 'fecha' => $now]);
            default:
                return response()->json(['success' => false, 'message' => 'Tipo no válido.'], 400);
        }
    }

    public function getBahiaInfo($folio) {
        $bahia = \App\Models\Bahia::where('Folio', $folio)->first();
        return response()->json(['success' => true, 'bahia' => $bahia]);
    }
}
