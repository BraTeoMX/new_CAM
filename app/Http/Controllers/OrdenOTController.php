<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\TicketOT;

class OrdenOTController extends Controller
{
    public function OrdenOT()
    {
        $attributes = '';
        try {
            // Obtener Segundas y Terceras Generales
            return view('pages.FormGuest.ViewsTicketsOp',compact('attributes'));
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
            $ots = TicketOT::all();
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
                'id' => 'required|integer|exists:ticketsot,id', // Verifica que el ID exista en la tabla 'ots'
                'status' => 'required|string',
            ]);
            Log::info('Datos validados: ' . json_encode($validated));
            // Buscar la OT y actualizar el estatus
            $ot = TicketOT::find($validated['id']);
            $ot->Status = $validated['status'];
            $ot->save();
            Log::info('OT encontrada: ' . json_encode($ot));
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
