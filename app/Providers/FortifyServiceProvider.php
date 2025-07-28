<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;
// --- IMPORTACIONES AÑADIDAS ---
use Laravel\Fortify\Contracts\LoginResponse;
use Illuminate\Support\Facades\Auth;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);

        Fortify::authenticateUsing(function (Request $request) {
            $login = $request->input(Fortify::username());
            $user = User::where(function ($query) use ($login) {
                $query->where('email', $login)
                      ->orWhere('num_empleado', $login);
            })->first();
            // --- TERMINA LA MODIFICACIÓN ---


            if (
                $user &&
                Hash::check($request->password, $user->password) &&
                $user->status == 1
            ) {
                return $user;
            }

            return null;
        });

        // ... Tu código de RateLimiter se queda igual ...
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());
            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        // --- BLOQUE AÑADIDO PARA REDIRECCIÓN PERSONALIZADA ---
        $this->app->singleton(LoginResponse::class, function ($app) {
            return new class implements LoginResponse
            {
                public function toResponse($request)
                {
                    // Tu lógica de redirección basada en el rol
                    $puesto = Auth::user()->puesto;

                    if ($puesto == 'Administrador') {
                        return redirect()->intended('/dashboardV2');
                    }
                    
                    // Para cualquier otro puesto
                    return redirect()->intended('/vista_loca');
                }
            };
        });
        // --- FIN DEL BLOQUE AÑADIDO ---
    }
}