<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\CatalogoArea;

class SyncSQLServerDataCommand extends Command
{
    protected $signature = 'sync:sqlserver-data';
    protected $description = 'Synchronize data from SQL Server and CatalogoArea to local MySQL tables for faster querying.';

    public function handle()
    {
        $this->info('Iniciando sincronización...');
        Log::info('SyncSQLServerDataCommand: Iniciando sincronización...');

        try {
            // 1. Sincronizar Módulos Originales (V2 cache logic)
            $modulosCatalogo = CatalogoArea::select('nombre as modulo', 'planta')
                ->where('estatus', 1)
                ->get()
                ->map(function ($item) {
                    return [
                        'modulo' => $item->modulo,
                        // Convertimos a entero. Si es nulo o vacío, asignamos 1 por defecto.
                        'planta' => (int) ($item->planta ?: 1),
                        'tipo' => 'catalogo',
                        'nombre_supervisor' => 'N/A',
                        'numero_empleado_supervisor' => 'N/A',
                    ];
                })->toArray();

            $modulosSupervisores = DB::connection('sqlsrv_dev')
                ->table('modulo_supervisor_views')
                ->select('modulo', 'planta', 'nombre as nombre_supervisor', 'numero_empleado as numero_empleado_supervisor')
                ->distinct()
                ->get()
                ->map(function ($item) {
                    return [
                        'modulo' => $item->modulo,
                        // Convertimos a entero. Si es nulo o vacío, asignamos 1 por defecto.
                        'planta' => (int) ($item->planta ?: 1),
                        'tipo' => 'supervisor',
                        'nombre_supervisor' => $item->nombre_supervisor,
                        'numero_empleado_supervisor' => $item->numero_empleado_supervisor,
                    ];
                })->toArray();

            $todosLosModulos = collect($modulosCatalogo)->concat($modulosSupervisores)->unique('modulo')->values()->toArray();

            DB::table('modulos_locales')->truncate(); // Precaución: Truncate borra todos los datos antes de insertar
            foreach (array_chunk($todosLosModulos, 500) as $chunk) {
                // Add timestamps manually
                $chunkWithTimestamps = array_map(function ($item) {
                    $item['created_at'] = now();
                    $item['updated_at'] = now();
                    return $item;
                }, $chunk);
                // DB::table() usa la conexión por defecto (MySQL)
                DB::table('modulos_locales')->insert($chunkWithTimestamps);
            }
            $this->info('Módulos sincronizados.');

            // 2. Sincronizar Operarios
            $allOperarios = DB::connection('sqlsrv_dev')
                ->table('Operarios_Views')
                ->select('NumOperario', 'Nombre', 'Modulo')
                ->distinct()
                ->get()
                ->map(function ($item) {
                    // Cambiamos las llaves al formato snake_case para coincidir con la base de datos MySQL
                    return [
                        'num_operario' => $item->NumOperario,
                        'nombre' => $item->Nombre,
                        'modulo' => $item->Modulo,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                })->toArray();

            DB::table('operarios_locales')->truncate();
            foreach (array_chunk($allOperarios, 500) as $chunk) {
                // DB::table() usa la conexión por defecto (MySQL)
                DB::table('operarios_locales')->insert($chunk);
            }
            $this->info('Operarios sincronizados.');

            Log::info('SyncSQLServerDataCommand: Sincronización finalizada exitosamente.');
        } catch (\Exception $e) {
            $this->error('Error en la sincronización: ' . $e->getMessage());
            Log::error('SyncSQLServerDataCommand Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
        }
    }
}
