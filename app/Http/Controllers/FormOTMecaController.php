<?php

namespace App\Http\Controllers;

use App\Models\AsignationOT;
use App\Models\FollowAtention;
use Illuminate\Http\Request;

class FormOTMecaController extends Controller
{
    public function FormOTMec()
    {
        return view('pages.FormatoMecanico.FormOTMecanicos');
    }

    public function getData()
    {
        $data = FollowAtention::all()->map(function ($followAtention) {
            $asignationOT = \App\Models\AsignationOT::where('Folio', $followAtention->Folio)->first();
            return [
                'follow_atention' => $followAtention,
                'asignation_ot' => $asignationOT,
            ];
        });

        return response()->json($data);
    }
}
