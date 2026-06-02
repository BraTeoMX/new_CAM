<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketV3Request;
use App\Models\CatalogoProblema;
use App\Models\ModuloLocal;
use App\Models\OperarioLocal;
use App\Models\TicketOt;
use App\Services\TicketCreationService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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
            $modulos = Cache::remember('form_guest_v3_modulos_locales', now()->addMinutes(30), function () {
                return ModuloLocal::query()
                    ->select('modulo', 'tipo', 'planta', 'nombre_supervisor', 'numero_empleado_supervisor')
                    ->orderBy('modulo')
                    ->get();
            });

            return response()->json($modulos);
        } catch (Exception $e) {
            Log::error('V3 Error obtener modulos: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Error'], 500);
        }
    }

    public function obtenerOperarios(Request $request)
    {
        try {
            $moduloSolicitado = (string) $request->modulo;

            $operariosDelModulo = Cache::remember(
                'form_guest_v3_operarios_modulo_' . md5($moduloSolicitado),
                now()->addMinutes(15),
                function () use ($moduloSolicitado) {
                    return OperarioLocal::query()
                        ->select('num_operario', 'nombre', 'modulo')
                        ->where('modulo', $moduloSolicitado)
                        ->orderBy('nombre')
                        ->get();
                }
            );

            $otrosOperarios = Cache::remember(
                'form_guest_v3_operarios_otros_' . md5($moduloSolicitado),
                now()->addMinutes(15),
                function () use ($moduloSolicitado) {
                    return OperarioLocal::query()
                        ->select('num_operario', 'nombre', 'modulo')
                        ->where('modulo', '!=', $moduloSolicitado)
                        ->orderBy('nombre')
                        ->get();
                }
            );

            return response()->json($operariosDelModulo->concat($otrosOperarios)->values());
        } catch (Exception $e) {
            Log::error('V3 Error obtener operarios: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Error'], 500);
        }
    }

    public function catalogoProblemas()
    {
        $problemas = Cache::remember('form_guest_v3_catalogo_problemas', now()->addMinutes(30), function () {
            return CatalogoProblema::where('estatus', 1)
                ->orderBy('nombre', 'asc')
                ->get(['id', 'nombre', 'descripcion', 'pasos']);
        });

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
            $modulos = Cache::remember('form_guest_v3_modulos_seguimiento', now()->addMinutes(2), function () {
                return TicketOt::where('created_at', '>=', now()->subDays(4))
                    ->select('modulo')
                    ->distinct()
                    ->orderBy('modulo', 'asc')
                    ->get();
            });

            return response()->json($modulos);
        } catch (Exception $e) {
            Log::error('V3 Error al obtener modulos Seguimiento: ' . $e->getMessage());

            return response()->json(['error' => 'No se pudieron cargar'], 500);
        }
    }
}
