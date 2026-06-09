<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketV3Request;
use App\Models\CatalogoArea;
use App\Models\CatalogoProblema;
use App\Models\ModuloLocal;
use App\Models\OperarioLocal;
use App\Models\TicketOt;
use App\Services\TicketCreationService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

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
            $syncCacheKey = 'form_guest_v3_modulos_locales_sync_hourly';

            $this->ejecutarSincronizacionLocal(
                $syncCacheKey,
                fn () => $this->sincronizarModulosLocales(),
                now()->addHour(),
                'modulos locales'
            );

            $modulos = ModuloLocal::query()
                ->select('modulo', 'tipo', 'planta', 'nombre_supervisor', 'numero_empleado_supervisor')
                ->orderBy('modulo')
                ->get();

            return response()->json($modulos);
        } catch (Exception $e) {
            Log::error('V3 Error obtener modulos: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json(['success' => false, 'message' => 'Error'], 500);
        }
    }

    private function sincronizarModulosLocales(): void
    {
        $this->configurarTimeoutSqlServer();

        $modulosCatalogo = CatalogoArea::select('nombre as modulo', 'planta')
            ->where('estatus', 1)
            ->orderBy('modulo')
            ->get()
            ->map(function ($item) {
                return [
                    'modulo' => $item->modulo,
                    'planta' => (string) $item->planta,
                    'tipo' => 'catalogo',
                    'nombre_supervisor' => 'N/A',
                    'numero_empleado_supervisor' => 'N/A',
                ];
            });

        $modulosSupervisores = DB::connection('sqlsrv_dev')
            ->table('modulo_supervisor_views')
            ->select('modulo', 'planta', 'nombre as nombre_supervisor', 'numero_empleado as numero_empleado_supervisor')
            ->distinct()
            ->orderBy('modulo')
            ->get()
            ->map(function ($item) {
                return [
                    'modulo' => $item->modulo,
                    'planta' => (string) $item->planta,
                    'tipo' => 'supervisor',
                    'nombre_supervisor' => $item->nombre_supervisor ?? 'N/A',
                    'numero_empleado_supervisor' => $item->numero_empleado_supervisor ?? 'N/A',
                ];
            });

        $modulosActuales = $modulosCatalogo
            ->concat($modulosSupervisores)
            ->filter(fn ($item) => filled($item['modulo']))
            ->unique('modulo')
            ->values();

        DB::transaction(function () use ($modulosActuales) {
            if ($modulosActuales->isEmpty()) {
                ModuloLocal::query()->delete();
                return;
            }

            $modulosLocalesVigentes = $modulosActuales->map(function ($item) {
                return ModuloLocal::query()->updateOrCreate(
                    ['modulo' => $item['modulo']],
                    [
                        'tipo' => $item['tipo'],
                        'planta' => $item['planta'],
                        'nombre_supervisor' => $item['nombre_supervisor'],
                        'numero_empleado_supervisor' => $item['numero_empleado_supervisor'],
                    ]
                )->id;
            });

            ModuloLocal::query()
                ->whereNotIn('id', $modulosLocalesVigentes)
                ->delete();
        });
    }

    public function obtenerOperarios(Request $request)
    {
        try {
            $syncCacheKey = 'form_guest_v3_operarios_locales_sync_daily';
            $moduloSolicitado = (string) $request->modulo;

            $this->ejecutarSincronizacionLocal(
                $syncCacheKey,
                fn () => $this->sincronizarOperariosLocales(),
                now()->addDay(),
                'operarios locales'
            );

            $operariosDelModulo = OperarioLocal::query()
                ->select('num_operario', 'nombre', 'modulo')
                ->where('modulo', $moduloSolicitado)
                ->orderBy('nombre')
                ->get();

            $otrosOperarios = OperarioLocal::query()
                ->select('num_operario', 'nombre', 'modulo')
                ->where('modulo', '!=', $moduloSolicitado)
                ->orderBy('nombre')
                ->get();

            return response()->json($operariosDelModulo->concat($otrosOperarios)->values());
        } catch (Exception $e) {
            Log::error('V3 Error obtener operarios: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json(['success' => false, 'message' => 'Error'], 500);
        }
    }

    private function sincronizarOperariosLocales(): void
    {
        $this->configurarTimeoutSqlServer();

        $operariosActuales = DB::connection('sqlsrv_dev')
            ->table('Operarios_Views')
            ->select('NumOperario', 'Nombre', 'Modulo')
            ->distinct()
            ->get()
            ->map(function ($item) {
                return [
                    'num_operario' => $item->NumOperario,
                    'nombre' => $item->Nombre,
                    'modulo' => $item->Modulo,
                ];
            })
            ->filter(fn ($item) => filled($item['num_operario']))
            ->unique('num_operario')
            ->values();

        DB::transaction(function () use ($operariosActuales) {
            if ($operariosActuales->isEmpty()) {
                OperarioLocal::query()->delete();
                return;
            }

            $operariosLocalesVigentes = $operariosActuales->map(function ($item) {
                return OperarioLocal::query()->updateOrCreate(
                    ['num_operario' => $item['num_operario']],
                    [
                        'nombre' => $item['nombre'],
                        'modulo' => $item['modulo'],
                    ]
                )->id;
            });

            OperarioLocal::query()
                ->whereNotIn('id', $operariosLocalesVigentes)
                ->delete();
        });
    }

    private function ejecutarSincronizacionLocal(string $cacheKey, callable $callback, $ttl, string $contexto): void
    {
        $retryCacheKey = $cacheKey . '_retry_after_failure';

        if (Cache::has($cacheKey) || Cache::has($retryCacheKey)) {
            return;
        }

        try {
            $callback();
            Cache::put($cacheKey, true, $ttl);
        } catch (Throwable $e) {
            Cache::put($retryCacheKey, true, now()->addMinutes(10));

            Log::warning("V3 Sincronizacion de {$contexto} omitida, se usaran datos locales.", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    private function configurarTimeoutSqlServer(int $seconds = 60): void
    {
        if (! defined('PDO::SQLSRV_ATTR_QUERY_TIMEOUT')) {
            return;
        }

        DB::connection('sqlsrv_dev')
            ->getPdo()
            ->setAttribute(constant('PDO::SQLSRV_ATTR_QUERY_TIMEOUT'), $seconds);
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
