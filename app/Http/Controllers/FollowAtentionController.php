<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\ClasseMaquina;
use App\Models\AsignationOT;
use App\Events\StatusOTUpdated;
use Illuminate\Support\Facades\DB;
use App\Models\FollowAtention;

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
        // También retorna el TimeEstimado para cada clase
        $clases = ClasseMaquina::where('mach', $maquina)
            ->get(['class_id', 'class', 'TimeEstimado']);
        return response()->json($clases);
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
                    'Supervisor'   => $ot->Supervisor,
                    'Problema'     => $ot->Problema,
                    'Maquina'      => $ot->Maquina,
                    'Classe'       => $request->clase,
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

    // Nuevo método para obtener datos de FollowAtention por folio
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
                'success' => false,
                'message' => 'No se encontró el registro'
            ], 404);
        }
    }
}
