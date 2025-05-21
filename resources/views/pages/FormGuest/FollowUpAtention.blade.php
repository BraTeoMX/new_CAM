<x-guest-layout>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <div x-cloak x-data="{ init() {} }">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Seguimiento de solicitudes
                </h1>
            </div>
        </div>
        <!-- Selector de módulo -->
        <div class="mb-6">
            <select id="modulo-select" style="width:100%"
                class="select2 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                data-placeholder="Selecciona tu módulo de atención">
                <option value="">Selecciona tu módulo de atención</option>
            </select>
        </div>
        <!-- Barra de resumen -->
        <div id="resumen-bar" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 hidden">
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
            <div class="bg-orange-100 text-orange-800 rounded-lg p-4 flex items-center justify-center gap-3">
                <span class="material-symbols-outlined text-4xl md:text-5xl">
                    preliminary
                </span>
                <div class="flex flex-col items-start">
                    <span class="text-2xl font-bold" id="ot-atendidas">0</span>
                    <span class="text-xs font-semibold mt-1">Atendidas</span>
                </div>
            </div>
            <div class="bg-blue-100 text-blue-800 rounded-lg p-4 flex items-center justify-center gap-3">
                <span class="material-symbols-outlined text-4xl md:text-5xl">
                    fact_check
                </span>
                <span class="text-2xl font-bold" id="ot-finalizadas">0</span>
                <span class="text-xs font-semibold mt-1">Finalizadas</span>
            </div>
            <div class="bg-violet-100 text-violet-800 rounded-lg p-4 flex items-center justify-center gap-3">
                <span class="material-symbols-outlined text-4xl md:text-5xl">
                    smart_toy
                </span>
                <span class="text-2xl font-bold" id="ot-autonomas">0</span>
                <span class="text-xs font-semibold mt-1">Autonomas</span>
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
        <div id="filtros-bar" class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 hidden">
            <div class="flex gap-2">
                <input type="text" id="search-ot"
                    class="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 px-3 py-2"
                    placeholder="Buscar por folio, módulo, mecánico...">
                <select id="filter-status"
                    class="rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 px-3 py-2">
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="ASIGNADO">Asignado</option>
                    <option value="PROCESO">En Proceso</option>
                    <option value="ATENDIDO">Atendida</option>
                    <option value="AUTONOMO">Autónoma</option>
                    <option value="FINALIZADO">Finalizada</option>
                </select>
            </div>
        </div>
        <!-- Cards de OT -->
        <div id="seguimiento-ot-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
    </div>

    <!-- Scripts -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    @vite(['resources/js/FollowAtention.js'])
</x-guest-layout>
