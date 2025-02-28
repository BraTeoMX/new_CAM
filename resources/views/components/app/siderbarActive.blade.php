<div class="bg-gray-900 text-white w-64 h-full p-4">
    <h2 class="text-lg font-semibold mb-4">Usuarios Activos</h2>
<ul>
    @forelse ($usuariosActivos as $usuario)
        <li class="p-2 bg-gray-700 rounded mb-2">
            <strong>{{ $usuario->nombre }}</strong>
        </li>
    @empty
        <li class="text-gray-400">No hay usuarios activos.</li>
    @endforelse
</ul>
</div>
