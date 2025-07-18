<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Vinculacion;

class CatalogosController extends Controller
{
    public function Catalogos()
    {
        return view('profile.AdminCatal');
    }

    public function getMecanicos()
    {
        try {
            Log::info('Petición recibida en getMecanicos');
            $mecanicos = DB::connection('sqlsrv_dev')
                ->table('cat_empleados')
                ->select('nombre', 'cvetra')
                ->where('despue', 'LIKE', '%MECANICO%')
                ->orderBy('nombre')
                ->get();

            Log::info('Mecánicos obtenidos:', $mecanicos->toArray());
            return response()->json($mecanicos);
        } catch (\Exception $e) {
            Log::error('Error al obtener mecánicos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los datos de mecánicos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSupervisores()
    {
        try {
            Log::info('Petición recibida en getSupervisores');
            $supervisores = DB::connection('sqlsrv_dev')
                ->table('Supervisores_views')
                ->select('Modulo', 'Nombre')
                ->orderBy('Modulo')
                ->get();

            Log::info('Supervisores obtenidos:', $supervisores->toArray());
            return response()->json($supervisores);
        } catch (\Exception $e) {
            Log::error('Error al obtener supervisores: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los datos de supervisores.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getVinculaciones()
    {
        try {
            // Sincronizar supervisores antes de retornar las vinculaciones
            $this->syncSupervisoresWithCatalog();

            $vinculaciones = Vinculacion::select(
                'id',
                'Supervisor',
                'Num_Mecanico',
                'Mecanico',
                'Modulo',
                'Hora_Comida_Inicio',
                'Hora_Comida_Fin',
                'Break_Lun_Jue_Inicio',
                'Break_Lun_Jue_Fin',
                'Break_Viernes_Inicio',
                'Break_Viernes_Fin'
            )->get();

            return response()->json($vinculaciones);
        } catch (\Exception $e) {
            Log::error('Error al obtener vinculaciones: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener las vinculaciones.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sincroniza los supervisores de la tabla vinculaciones con el catálogo de supervisores.
     */
    protected function syncSupervisoresWithCatalog()
    {
        // Obtener supervisores del catálogo
        $supervisoresCatalogo = DB::connection('sqlsrv_dev')
            ->table('Supervisores_views')
            ->select('Modulo', 'Nombre')
            ->get()
            ->keyBy('Modulo');

        // Obtener módulos únicos en vinculaciones
        $modulosVinculaciones = DB::table('vinculaciones')
            ->select('Modulo', 'Supervisor')
            ->distinct()
            ->get();

        foreach ($modulosVinculaciones as $vinc) {
            $modulo = $vinc->Modulo;
            $supervisorActual = $vinc->Supervisor;
            $supervisorCatalogo = $supervisoresCatalogo[$modulo]->Nombre ?? null;

            if ($supervisorCatalogo && $supervisorActual !== $supervisorCatalogo) {
                // Actualizar supervisor en todas las vinculaciones de ese módulo
                DB::table('vinculaciones')
                    ->where('Modulo', $modulo)
                    ->update(['Supervisor' => $supervisorCatalogo]);
            }
        }
    }

    public function saveVinculaciones(Request $request)
    {
        Log::info('Iniciando saveVinculaciones');
        DB::beginTransaction();

        try {
            Log::info('Datos recibidos:', ['vinculaciones' => $request->input('vinculaciones')]);
            $vinculacionesNuevas = collect($request->input('vinculaciones', []));

            // Procesar actualizaciones y nuevas vinculaciones
            foreach ($vinculacionesNuevas as $vinculacion) {
                Log::info('Procesando vinculación:', $vinculacion);

                if (!empty($vinculacion['id'])) {
                    // Actualizar vinculación existente usando su ID específico
                    Log::info('Actualizando vinculación existente:', ['id' => $vinculacion['id']]);
                    Vinculacion::where('id', $vinculacion['id'])
                        ->update([
                            'Supervisor' => $vinculacion['Supervisor'],
                            'Num_Mecanico' => $vinculacion['Num_Mecanico'],
                            'Mecanico' => $vinculacion['Mecanico'],
                            'Modulo' => $vinculacion['Modulo'],
                            'Hora_Comida_Inicio' => $vinculacion['Hora_Comida_Inicio'],
                            'Hora_Comida_Fin' => $vinculacion['Hora_Comida_Fin'],
                            'Break_Lun_Jue_Inicio' => $vinculacion['Break_Lun_Jue_Inicio'],
                            'Break_Lun_Jue_Fin' => $vinculacion['Break_Lun_Jue_Fin'],
                            'Break_Viernes_Inicio' => $vinculacion['Break_Viernes_Inicio'],
                            'Break_Viernes_Fin' => $vinculacion['Break_Viernes_Fin']
                        ]);
                } else if (!empty($vinculacion['Supervisor']) && !empty($vinculacion['Mecanico'])) {
                    // Crear nueva vinculación
                    Log::info('Creando nueva vinculación');
                    Vinculacion::create([
                        'Supervisor' => $vinculacion['Supervisor'],
                        'Num_Mecanico' => $vinculacion['Num_Mecanico'],
                        'Mecanico' => $vinculacion['Mecanico'],
                        'Modulo' => $vinculacion['Modulo'],
                        'Hora_Comida_Inicio' => $vinculacion['Hora_Comida_Inicio'],
                        'Hora_Comida_Fin' => $vinculacion['Hora_Comida_Fin'],
                        'Break_Lun_Jue_Inicio' => $vinculacion['Break_Lun_Jue_Inicio'],
                        'Break_Lun_Jue_Fin' => $vinculacion['Break_Lun_Jue_Fin'],
                        'Break_Viernes_Inicio' => $vinculacion['Break_Viernes_Inicio'],
                        'Break_Viernes_Fin' => $vinculacion['Break_Viernes_Fin']
                    ]);
                }
            }

            DB::commit();
            Log::info('Transacción completada exitosamente');

            return response()->json([
                'success' => true,
                'message' => 'Vinculaciones actualizadas correctamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en saveVinculaciones:', [
                'mensaje' => $e->getMessage(),
                'linea' => $e->getLine(),
                'archivo' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar las vinculaciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteVinculacion($id)
    {
        try {
            Log::info('Iniciando eliminación de vinculación:', ['id' => $id]);

            $vinculacion = Vinculacion::find($id);

            if (!$vinculacion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vinculación no encontrada'
                ], 404);
            }

            $vinculacion->delete();

            Log::info('Vinculación eliminada correctamente');

            return response()->json([
                'success' => true,
                'message' => 'Vinculación eliminada correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar vinculación:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la vinculación'
            ], 500);
        }
    }
}
