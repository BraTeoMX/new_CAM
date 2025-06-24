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
    public function update(Request $request, User $user)
    {
        Log::info('Actualizando usuario : ' . $user->name);
        // Define mensajes personalizados para una mejor experiencia de usuario.
        $messages = [
            'name.unique' => 'El nombre ":input" ya está en uso por otro usuario.',
            'num_empleado.unique' => 'El número de empleado ":input" ya ha sido asignado a otro usuario.',
            'email.unique' => 'El email ":input" ya está registrado por otro usuario.',
            'password.min' => 'La nueva contraseña debe tener al menos :min caracteres.',
            'required' => 'El campo :attribute es obligatorio.'
        ];

        // Valida los datos. La regla 'unique' ya ignora el registro del usuario actual.
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:users,name,' . $user->id,
            'num_empleado' => 'required|string|max:255|unique:users,num_empleado,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'puesto' => 'required|string|max:255',
            'password' => 'nullable|string|min:6', // 'nullable' permite que el campo esté vacío.
        ], $messages);

        try {
            Log::info('Datos validados para actualización: ' . json_encode($validatedData));
            // Prepara los datos para la actualización.
            $updateData = [
                'name' => $validatedData['name'],
                'num_empleado' => $validatedData['num_empleado'],
                'email' => $validatedData['email'],
                'puesto' => $validatedData['puesto'],
            ];

            // Solo si se envió una nueva contraseña, la encriptamos y la añadimos.
            if (!empty($validatedData['password'])) {
                $updateData['password'] = Hash::make($validatedData['password']);
                Log::info('Contraseña actualizada para el usuario ID ' . $user->id);
            }

            // Actualiza el usuario con los datos preparados.
            $user->update($updateData);

            return response()->json(['message' => 'Usuario actualizado correctamente']);

        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario ID ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error inesperado al actualizar el usuario.'], 500);
        }
    }

    public function updateStatus(User $user)
    {
        try {
            // Invierte el valor del estatus
            // Si es 1 (Activo), lo convierte a 0 (Inactivo) y viceversa.
            $user->status = !$user->status;
            $user->save();
            
            $newStatus = $user->status ? 'Activo' : 'Inactivo';
            Log::info("Estatus del usuario {$user->name} (ID: {$user->id}) cambiado a {$newStatus}.");

            return response()->json([
                'message' => 'Estatus del usuario actualizado correctamente.',
                'new_status' => $newStatus
            ]);

        } catch (\Exception $e) {
            Log::error("Error al cambiar estatus del usuario ID {$user->id}: " . $e->getMessage());
            return response()->json(['message' => 'Ocurrió un error inesperado.'], 500);
        }
    }

}
