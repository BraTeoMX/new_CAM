@if ($errors->any())
    <div {{ $attributes }}>
        <div class="px-4 py-2 rounded-lg text-sm bg-red-800 text-white">
            <div class="font-medium">{{ __('Error al iniciar sesion, si usuario y contraseña son correctos contacte con el administrador del sistema') }}</div>
        </div>         
    </div>
@endif
