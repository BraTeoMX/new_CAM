<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\TicketOT;
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
}
