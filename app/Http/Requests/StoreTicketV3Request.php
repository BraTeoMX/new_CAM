<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketV3Request extends FormRequest
{
    public function authorize()
    {
        return true; // Asumiendo que esta vista es pública/guest
    }

    public function rules()
    {
        return [
            'modulo'      => ['required', 'string', 'max:255'],
            'problema'    => ['required', 'string', 'max:255'],
            'maquina'     => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
            'status'      => ['required', 'string', 'in:1,2,3'],
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validatedData = parent::validated($key, $default);

        // Limpieza y sanitización
        return array_map(function ($value) {
            return trim(strip_tags($value));
        }, $validatedData);
    }
}
