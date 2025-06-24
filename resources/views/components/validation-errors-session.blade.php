@if ($errors->any())
    <div {{ $attributes }}>
        <div class="px-4 py-2 rounded-lg text-sm bg-red-500 text-white">
            <div class="font-medium">{{ __('Error al iniciar sesion, contacte con el administrador del sistema si usuario y contraseña son correctos') }}</div>
        </div>         
    </div>
@endif
