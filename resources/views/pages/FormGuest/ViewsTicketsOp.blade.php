<x-guest-layout>
    <!-- Form Guest actions -->
    <div class="sm:flex sm:justify-between sm:items-center mb-8">
        <!-- Left: Title -->
        <div class="mb-4 sm:mb-0">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">OT's Asignadas
            </h1>
        </div>
    </div>
    <!-- Barra de resumen -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-blue-100 text-blue-800 rounded-lg p-4 flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-4xl md:text-5xl">
                assignment_ind
            </span>
            <div class="flex flex-col items-start">
                <span class="text-2xl font-bold" id="ot-asignadas">0</span>
                <span class="text-xs font-semibold mt-1">Asignadas</span>
            </div>
        </div>
        <div class="bg-yellow-100 text-yellow-800 rounded-lg p-4 flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-4xl md:text-5xl">
                av_timer
            </span>
            <div class="flex flex-col items-start">
                <span class="text-2xl font-bold" id="ot-proceso">0</span>
                <span class="text-xs font-semibold mt-1">En Proceso</span>
            </div>
        </div>
        <div class="bg-red-100 text-red-800 rounded-lg p-4 flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-4xl md:text-5xl">
                pending_actions
            </span>
            <div class="flex flex-col items-start">
                <span class="text-2xl font-bold" id="ot-pendientes">0</span>
                <span class="text-xs font-semibold mt-1">Pendientes</span>
            </div>
        </div>
        <div class="bg-green-100 text-green-800 rounded-lg p-4 flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-4xl md:text-5xl">
                preliminary
            </span>
            <div class="flex flex-col items-start">
                <span class="text-2xl font-bold" id="ot-atendidas">0</span>
                <span class="text-xs font-semibold mt-1">Atendidas</span>
            </div>
        </div>
        <div class="bg-gray-100 text-gray-800 rounded-lg p-4 flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-4xl md:text-5xl">
                numbers
            </span>
            <div class="flex flex-col items-start">
                <span class="text-2xl font-bold" id="ot-total">0</span>
                <span class="text-xs font-semibold mt-1">Total</span>
            </div>
        </div>
    </div>
    <!-- Filtros y búsqueda -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div class="flex gap-2">
            <input type="text" id="search-ot"
                class="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 px-3 py-2"
                placeholder="Buscar por folio, módulo, mecánico...">
            <select id="filter-status" class="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 px-3 py-2">
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="ASIGNADO">Asignado</option>
                <option value="PROCESO">En Proceso</option>
                <option value="ATENDIDO">Atendida</option>
                <option value="FINALIZADO">Finalizada</option>
            </select>
        </div>
    </div>
    <br>
    <br>
    <br>
    <!-- Contenedor para las tarjetas de asignaciones -->
    <div id="asignaciones-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/laravel-echo/dist/echo.iife.js"></script>
    <script src="https://js.pusher.com/7.2/pusher.min.js"></script>
    @vite(['resources/js/AsignationOt.js'])
</x-guest-layout>
