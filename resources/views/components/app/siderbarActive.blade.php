<div class="min-w-fit">
    <!-- Sidebar backdrop (mobile only) -->
    <div class="fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200"
        :class="sidebarActiveOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'" aria-hidden="true" x-cloak></div>

    <!-- Sidebar -->
    <div id="sidebar-active"
        class="flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] max-h-[100dvh] overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-gray-900 text-white p-4 pb-24 transition-all duration-200 ease-in-out"
        :class="sidebarActiveOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-64'" @click.outside="sidebarActiveOpen = false"
        @keydown.escape.window="sidebarActiveOpen = false" x-data="{ sidebarActiveOpen: false }">

        <!-- Sidebar header -->
        <div class="flex justify-between mb-4 pr-3 sm:px-2">
            <!-- Close button -->
            <button class="lg:hidden text-gray-400 hover:text-gray-200" @click.stop="sidebarActiveOpen = !sidebarActiveOpen"
                aria-controls="sidebar-active" :aria-expanded="sidebarActiveOpen">
                <span class="sr-only">Cerrar sidebar</span>
                <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
                </svg>
            </button>
            <h2 class="text-lg font-semibold">Usuarios Activos</h2>
        </div>

        <!-- Usuarios activos -->
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
</div>
