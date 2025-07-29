<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index() // SUGERENCIA: Renombrar 'Admin' a 'index' es una convención RESTful.
    {
        return view('menu.index'); // SUGERENCIA: Nombres de vistas en minúscula.
    }

}
