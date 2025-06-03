<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FormOTMecaController extends Controller
{
    public function FormOTMec()
    {
        return view('pages.FormatoMecanico.FormOTMecanicos');
    }
}
