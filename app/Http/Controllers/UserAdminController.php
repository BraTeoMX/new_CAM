<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class UserAdminController extends Controller
{
    public function index() // SUGERENCIA: Renombrar 'Admin' a 'index' es una convención RESTful.
    {
        return view('user.index'); // SUGERENCIA: Nombres de vistas en minúscula.
    }

    public function getUsers()
    {
        try {
            $users = User::select(
                'id',
                'name',
                'email',
                'num_empleado',
                'puesto',
                DB::raw("CASE 
                            WHEN status = 1 THEN 'Activo' 
                            WHEN status = 0 THEN 'Baja' 
                            ELSE 'Desconocido' 
                         END AS status") // Asigna un valor por defecto si no es 0 o 1
            )->get();

            return response()->json($users);

        } catch (\Exception $e) {
            Log::error('Error al obtener la lista de usuarios: ' . $e->getMessage());
            return response()->json(['message' => 'No se pudo obtener la lista de usuarios.'], 500);
        }
    }

    public function getPuestos()
    {
        $puestos = DB::connection('sqlsrv_dev')
            ->table('cat_puestos')
            ->select('despue')
            ->pluck('despue')
            ->toArray();

        // Agrega "Administrador" al inicio
        array_unshift($puestos, 'Administrador');

        return response()->json($puestos);
    }

    // Crear usuario
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'num_empleado' => 'required|string|max:255|unique:users,num_empleado',
            'password' => 'required|string|min:6',
            'puesto' => 'required|string|max:255',
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'num_empleado' => $validated['num_empleado'],
                'password' => bcrypt($validated['password']),
                'puesto' => $validated['puesto'],
            ]);

            return response()->json(['message' => 'Usuario creado correctamente', 'user' => $user], 201); // 201 Created es más semántico

        } catch (\Exception $e) {
            Log::error('Error al crear usuario: ' . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error inesperado al crear el usuario.'], 500);
        }
    }

    public function edit($id)
    {
        $user = User::where('id', $id)->firstOrFail();
        return response()->json($user);
    }

    // Actualizar usuario
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id . ',id',
            'puesto' => 'required|string|max:255',
        ]);

        $user = User::where('id', $id)->firstOrFail();
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'puesto' => $request->puesto
        ]);

        return response()->json(['message' => 'Usuario actualizado correctamente']);
    }

    // Eliminar usuario
    public function destroy($id)
    {
        $user = User::where('id', $id)->firstOrFail();
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }
}
