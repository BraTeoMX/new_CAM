<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\AsignationOT;
use App\Events\AsignacionOTReasignada;
use App\Models\Vinculacion;
use App\Events\StatusOTUpdated;

class AtencionOT extends Controller
{
    public function AtencionOT()
    {
        try {
            // Obtener Segundas y Terceras Generales
            return view('pages.AtencionOT.AtencionOT');
        } catch (\Exception $e) {
            // Manejar la excepción, por ejemplo, loguear el error
            Log::error('Error al obtener Segundas: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al obtener los datos.',
                'status' => 'error'
            ], 500);
        }
    }

    public function cardsAteOTs()
    {
        try {
            // Obtener todas las OTs
            $ots = AsignationOT::all();
            return response()->json($ots);
        } catch (\Exception $e) {
            // Manejar la excepción, por ejemplo, loguear el error
            Log::error('Error al obtener OTs: ' . $e->getMessage());

            return response()->json([
                'message' => 'Error al obtener los datos.',
                'status' => 'error'
            ], 500);
        }
    }
    public function updateStatus(Request $request)
    {
        try {
            // Validar los datos recibidos
            $validated = $request->validate([
                'id' => 'required|integer|exists:asignation_ots,id', // Verifica que el ID exista en la tabla 'ots'
                'status' => 'required|string',
            ]);
            Log::info('Datos validados: ' . json_encode($validated));
            // Buscar la OT y actualizar el estatus
            $ot = AsignationOT::find($validated['id']);
            $ot->Status = $validated['status'];
            $ot->save();
            Log::info('OT encontrada: ' . json_encode($ot));
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }
    public function reasignarOT(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:asignation_ots,id',
            'num_mecanico' => 'required|string',
            'nombre' => 'required|string',
            'status' => 'nullable|string',
        ]);
        $ot = AsignationOT::findOrFail($validated['id']);

        // Si el status recibido es SIN_ASIGNAR, cambia a ASIGNADO y actualiza todo
        if (isset($validated['status']) && $validated['status'] === 'SIN_ASIGNAR') {
            $ot->Num_Mecanico = $validated['num_mecanico'];
            $ot->Mecanico = $validated['nombre'];
            $ot->Status = 'ASIGNADO';
        } else {
            // Solo actualiza num_mecanico y mecanico
            $ot->Num_Mecanico = $validated['num_mecanico'];
            $ot->Mecanico = $validated['nombre'];
            // No cambia el status
        }
        $ot->save();

        // Emitir evento broadcast para que lo escuche AsignationOt.js
        broadcast(new AsignacionOTReasignada($ot))->toOthers();

        return response()->json(['success' => true, 'ot' => $ot]);
    }
    public function broadcastStatusOT(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:asignation_ots,id',
            'status' => 'required|string',
        ]);
        $ot = AsignationOT::findOrFail($validated['id']);
        $ot->Status = $validated['status'];
        $ot->save();

        // Emitir evento broadcast para que lo escuchen ambos scripts
        broadcast(new StatusOTUpdated($ot))->toOthers();

        return response()->json(['success' => true, 'ot' => $ot]);
    }
}
