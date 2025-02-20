<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // Si no hay usuario autenticado, redirigir al login
        if (!$user) {
            return redirect()->route('login');
        }

        // Verificar si el puesto del usuario está en los roles permitidos
        if (!in_array($user->puesto, $roles)) {
            abort(403, 'No tienes permiso para acceder a esta página.');
        }

        return $next($request);
    }
}
