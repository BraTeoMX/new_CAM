<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\StoreTicketV3Request;
use App\Models\CatalogoProblema;
use App\Models\ModuloLocal;
use App\Models\OperarioLocal;
use App\Models\TicketOt;
use App\Services\TicketCreationService;
use Exception;

class FormGuestV3Controller extends Controller
{
    protected $ticketService;

    public function __construct(TicketCreationService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    public function index()
    {
        return view('formGuest.v3.index');
    }

    public function obtenerAreasModulos()
    {
        try {
            // Consultas a BD local sincronizada para evitar penalidad de red externa
            $modulos = ModuloLocal::orderBy('modulo')->get();
            return response()->json($modulos);
        } catch (Exception $e) {
            Log::error('V3 Error obtener modulos: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error'], 500);
        }
    }

    public function obtenerOperarios(Request $request)
    {
        try {
            $moduloSolicitado = $request->modulo;

            // Directamente en MySQL usando índices
            $operariosDelModulo = OperarioLocal::where('modulo', $moduloSolicitado)
                ->orderBy('nombre')
                ->get();

            $otrosOperarios = OperarioLocal::where('modulo', '!=', $moduloSolicitado)
                ->orderBy('nombre')
                ->get();

            $operariosFinal = $operariosDelModulo->concat($otrosOperarios);

            return response()->json($operariosFinal);
        } catch (Exception $e) {
            Log::error('V3 Error obtener operarios: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error'], 500);
        }
    }

    public function catalogoProblemas()
    {
        $problemas = CatalogoProblema::where('estatus', 1)
            ->orderBy('nombre', 'asc')
            ->get(['id', 'nombre', 'descripcion', 'pasos']);
        return response()->json($problemas);
    }

    public function guardarRegistro(StoreTicketV3Request $request)
    {
        try {
            $ticket = $this->ticketService->createTicket($request->validated(), $request->all());

            return response()->json([
                'success' => true,
                'folio'   => $ticket->folio,
                'message' => 'Ticket creado con éxito',
                'data'    => [
                    'modulo'     => $ticket->modulo,
                    'estado'     => $ticket->estado,
                    'created_at' => $ticket->created_at,
                    'notification_sent' => true
                ]
            ], 201);
        } catch (Exception $e) {
            Log::error('V3 Error guardarRegistro: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function obtenerAreasModulosSeguimiento()
    {
        try {
            $modulos = TicketOt::where('created_at', '>=', now()->subDays(4))
                              ->select('modulo')
                              ->distinct()
                              ->orderBy('modulo', 'asc')
                              ->get();
            return response()->json($modulos);
        } catch (Exception $e) {
            Log::error('V3 Error al obtener módulos Seguimiento: ' . $e->getMessage());
            return response()->json(['error' => 'No se pudieron cargar'], 500);
        }
    }
}
