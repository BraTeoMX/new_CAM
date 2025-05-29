<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- NUEVO: Selects globales de mes, año y día -->
        <div class="flex flex-wrap items-center gap-4 mb-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm px-4 py-3">
            <!-- NUEVO: Select de día -->
            <div class="flex items-center gap-2">
                <label for="calendar-day"
                    class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                    <svg class="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 8v4l3 3"></path>
                    </svg>
                    Día:
                </label>
                <select id="calendar-day"
                    class="w-20 flowbite-select bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5 transition">
                    {{-- Opciones generadas por JS --}}
                </select>
            </div>
            <div class="flex items-center gap-2">
                <label for="calendar-month"
                    class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                    <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <path
                            d="M8 7V3M16 7V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                        </path>
                    </svg>
                    Mes:
                </label>
                <select id="calendar-month"
                    class="w-32 flowbite-select bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition">
                    {{-- Opciones generadas por JS --}}
                </select>
            </div>
            <div class="flex items-center gap-2">
                <label for="calendar-year"
                    class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3"></path>
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Año:
                </label>
                <select id="calendar-year"
                    class="w-24 flowbite-select bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition">
                    {{-- Opciones generadas por JS --}}
                </select>
            </div>
        </div>
        <!-- Dashboard actions -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
            </div>
        </div>
        {{-- ...TOPS  code... --}}
        <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
            <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
                <div id="minmachdesc-tabs-container"
                    class="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6
                            transition-all duration-300 ease-in-out
                            hover:shadow-lg dark:hover:shadow-gray-700/50">
                    <div class="minmachdesc-tabs-container overflow-x-auto pb-4">
                        <div class="min-h-[280px] flex items-center justify-center">
                            <div class="animate-pulse text-gray-400">Cargando...</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="min-h-[120px] w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
                <div
                    class="min-h-[120px] w-full bg-white dark:bg-gray-800
                            transition-all duration-300 ease-in-out
                            hover:shadow-lg dark:hover:shadow-gray-700/50
                            p-0 relative inset-0 z-0 rounded-2xl scale-105">
                    <div class="min-h-[120px] overflow-x-auto w-full">
                        <div id="dashboard-topsmeca" class="min-h-[120px] w-full relative z-10">
                            <div class="min-h-[120px] flex items-center justify-center">
                                <div class="animate-pulse text-gray-400">Cargando...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- Nuevo div para tops y heatmap en una sola fila --}}
            <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
                <div
                    class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 border border-gray-200 rounded-lg shadow-xs dark:border-gray-700 md:mb-12 bg-white dark:bg-gray-800 transition-all">
                    <!-- Izquierda: dashboard-tops -->
                    <figure
                        class="flex flex-col items-center justify-center w-full p-4 sm:p-6 md:p-8 text-center bg-white border-b border-gray-200 rounded-t-lg md:rounded-tl-lg md:border-e dark:bg-gray-800 dark:border-gray-700
            transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:border-pink-400 dark:hover:shadow-pink-900/30 dark:hover:border-pink-500 hover:z-10 cursor-pointer">
                        <div id="dashboard-tops" class="w-full">
                            <div class="tops-container">
                                <div
                                    class="min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex items-center justify-center">
                                    <div class="animate-pulse text-gray-400">Cargando...</div>
                                </div>
                            </div>
                        </div>
                    </figure>
                    <!-- Derecha: dashboard-heatmap -->
                    <figure
                        class="flex flex-col items-center justify-center w-full p-4 sm:p-6 md:p-8 text-center bg-white border-b border-gray-200 md:rounded-tr-lg dark:bg-gray-800 dark:border-gray-700
            transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:border-emerald-400 dark:hover:shadow-emerald-900/30 dark:hover:border-emerald-500 hover:z-10 cursor-pointer">
                        <div id="dashboard-heatmap" class="w-full">
                            <div class="heatmap-container">
                                <div
                                    class="min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex items-center justify-center">
                                    <div class="animate-pulse text-gray-400">Cargando...</div>
                                </div>
                            </div>
                        </div>
                    </figure>
                    <!-- Inferior: dashboard-elemento1 (ocupa ambas columnas en md+) -->
                    <figure
                        class="flex flex-col items-center justify-center w-full p-4 sm:p-6 md:p-8 text-center bg-white border-gray-200 rounded-b-lg md:col-span-2 dark:bg-gray-800 dark:border-gray-700
            transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:border-blue-400 dark:hover:shadow-blue-900/30 dark:hover:border-blue-500 hover:z-10 cursor-pointer">
                        <div id="dashboard-elemento1"
                            class="w-full max-w-xl min-h-[180px] sm:min-h-[220px] md:min-h-[360px]">
                            {{-- Aquí va el contenido de dashboard-elemento1 --}}
                        </div>
                    </figure>
                </div>
            </div>
            {{-- Fin de TOPS --}}
            {{-- Nuevo div para creatComplet --}}
            <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
                <div id="creatComplet-container"
                    class="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6
                            transition-all duration-300 ease-in-out
                            hover:shadow-lg dark:hover:shadow-gray-700/50">
                    <div class="creatComplet-container overflow-x-auto pb-4">
                        <div class="min-h-[280px] flex items-center justify-center">
                            <div class="animate-pulse text-gray-400">Cargando...</div>
                        </div>
                    </div>
                </div>
            </div>
            {{-- Nuevo div para la línea de tiempo --}}
            <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
                <div id="timeline-container"
                    class="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6
                            transition-all duration-300 ease-in-out
                            hover:shadow-lg dark:hover:shadow-gray-700/50">
                    <div class="timeline-container overflow-x-auto pb-4">
                        <div class="min-h-[280px] flex items-center justify-center">
                            <div class="animate-pulse text-gray-400">Cargando...</div>
                        </div>
                    </div>
                </div>
            </div>
            @vite(['resources/js/calendarSelects.js', 'resources/js/elemento1dashboard.js', 'resources/js/dashboardHeatmap.js', 'resources/js/linetime.js', 'resources/js/efectividad.js', 'resources/js/tops.js', 'resources/js/creatComplet.js', 'resources/js/minmachdesc.js'])
        </div>
</x-app-layout>
