<x-app-layout>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Dashboard actions -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">OTs en Pausa o Pendientes
                </h1>
            </div>
        </div>

        <!-- Filtros -->
        <div class="mb-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Filtro de Prioridad -->
                <div>
                    <label for="priority-filter" class="block text-sm font-medium text-gray-100">Filtrar por
                        Prioridad</label>
                    <select id="priority-filter"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">Todas</option>
                    </select>
                </div>

                <!-- Filtro de Responsable -->
                <div>
                    <label for="responsible-filter" class="block text-sm font-medium text-gray-100">Filtrar por
                        Responsable</label>
                    <select id="responsible-filter"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">Todos</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Calendario -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Programar OTs por tiempo determinado
            </h2>
            <div id="calendar"></div>
        </div>

        <x-livewire.modals-calendar />
    </div>

    <!-- Scripts -->
    @vite(['resources/js/calendar.js'])
</x-app-layout>
