<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActiveUsersController extends Controller
{
    public function getActiveUsers()
    {
        $usuariosActivos = DB::connection('sqlsrv_dev')
            ->table('Emple_Movimientos')
            ->whereRaw("CAST(FechaRegistro AS DATE) = CAST(GETDATE() AS DATE)")
            ->whereBetween('HoraRegistro', ['07:30:00', '08:40:00'])
            ->orderBy('HoraRegistro', 'ASC')
            ->get();

        return response()->json($usuariosActivos);
    }
}
