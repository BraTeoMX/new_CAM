<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\TicketOTs;

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
}
