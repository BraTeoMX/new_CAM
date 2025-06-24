<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
        // Define los mensajes personalizados aquí
        $messages = [
            'name.unique' => 'Ya existe un usuario con este nombre. Por favor, elige otro.',
            'email.unique' => 'El correo electrónico que ingresaste ya está registrado en el sistema.',
            'num_empleado.unique' => 'Este número de empleado ya pertenece a otro usuario.',
            'password.min' => 'La contraseña debe tener al menos :min caracteres.',
            'required' => 'El campo :attribute es obligatorio.' // Mensaje genérico para campos requeridos
        ];

        // Pasa las reglas y los mensajes al validador
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:users,name',
            'email' => 'required|email|max:255|unique:users,email',
            'num_empleado' => 'required|string|max:255|unique:users,num_empleado',
            'password' => 'required|string|min:6',
            'puesto' => 'required|string|max:255',
        ], $messages);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'num_empleado' => $validated['num_empleado'],
                'password' => bcrypt($validated['password']),
                'puesto' => $validated['puesto'],
            ]);

            return response()->json(['message' => 'Usuario creado correctamente', 'user' => $user], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear usuario: ' . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error inesperado al crear el usuario.'], 500);
        }
    }

    public function show(User $user)
    {
        return response()->json($user);
    }

    // Actualizar usuario
    public function update(Request $request, User $user) // <-- PASO 1: Firma corregida
    {
        // Usamos $user->id para ignorar el email del propio usuario en la regla 'unique'
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'puesto' => 'required|string|max:255',
            'password' => 'nullable|string|min:6', // <-- PASO 2: 'nullable' es la clave
        ]);

        try {
            // PASO 3: Eliminamos la búsqueda manual, Laravel ya nos dio el $user.
            // $user = User::where('id', $id)->firstOrFail(); // <-- Ya no es necesaria

            // Si se proporcionó una nueva contraseña, la encriptamos.
            if (!empty($validatedData['password'])) {
                $validatedData['password'] = Hash::make($validatedData['password']);
            } else {
                // Si la contraseña está vacía, la eliminamos del array para no sobreescribirla.
                unset($validatedData['password']);
            }

            // Actualizamos el usuario con los datos validados.
            $user->update($validatedData);

            return response()->json(['message' => 'Usuario actualizado correctamente']);

        } catch (\Exception $e) { // <-- PASO 4: Implementación del try-catch
            Log::error('Error al actualizar usuario: ' . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error inesperado al actualizar el usuario.'], 500);
        }
    }

    // Eliminar usuario
    public function destroy($id)
    {
        $user = User::where('id', $id)->firstOrFail();
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }
}
