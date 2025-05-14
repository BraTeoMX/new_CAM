<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class CatalogosController extends Controller
{
    public function Catalogos()
    {
        try {
            return view('profile.AdminCatal');
        } catch (\Exception $e) {
            Log::error('Error al obtener Segundas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los datos.',
                'status' => 'error'
            ], 500);
        }
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
            $vinculaciones = \App\Models\Vinculacion::all();
            return response()->json($vinculaciones);
        } catch (\Exception $e) {
            Log::error('Error al obtener vinculaciones: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener las vinculaciones.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function saveVinculaciones(Request $request)
    {
        try {
            $data = $request->input('vinculaciones', []);
            foreach ($data as $v) {
                if (!empty($v['id'])) {
                    // Actualizar si existe
                    \App\Models\Vinculacion::where('id', $v['id'])->update([
                        'Supervisor' => $v['Supervisor'],
                        'Mecanico' => $v['Mecanico'],
                        'Modulo' => $v['Modulo'],
                        'Hora_Comida' => $v['Hora_Comida'],
                        'Break_Lun_Jue' => $v['Break_Lun_Jue'],
                        'Break_Viernes' => $v['Break_Viernes'],
                    ]);
                } else {
                    // Crear nuevo si no existe
                    \App\Models\Vinculacion::create([
                        'Supervisor' => $v['Supervisor'],
                        'Mecanico' => $v['Mecanico'],
                        'Modulo' => $v['Modulo'],
                        'Hora_Comida' => $v['Hora_Comida'],
                        'Break_Lun_Jue' => $v['Break_Lun_Jue'],
                        'Break_Viernes' => $v['Break_Viernes'],
                    ]);
                }
            }
            return response()->json(['success' => true, 'message' => 'Vinculaciones guardadas correctamente']);
        } catch (\Exception $e) {
            Log::error('Error al guardar vinculaciones: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar las vinculaciones.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
