<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Dashboard actions -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
            </div>
        </div>
        {{-- ...existing code... --}}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
                <div class="w-full bg-white dark:bg-gray-800 
                            transition-all duration-300 ease-in-out
                            hover:shadow-lg dark:hover:shadow-gray-700/50
                            p-0 relative inset-0 z-0 rounded-2xl scale-105">
                    <div class="overflow-x-auto w-full">
                        <div id="dashboard-heatmap" class="min-w-[420px] w-max mx-auto relative z-10">
                            <div class="heatmap-container">
                                <div class="min-h-[280px] flex items-center justify-center">
                                    <div class="animate-pulse text-gray-400">Cargando...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
                <div class="flex text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Conteo de status de
                    tickets</div>
                <div id="dashboard-elemento1"
                    class="relative w-full max-w-xl min-h-[280px] sm:min-h-[320px] md:min-h-[360px]
                            bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3
                            transition-all duration-300 ease-in-out
                            hover:shadow-lg dark:hover:shadow-gray-700/50">
                </div>
            </div>
        </div>
        {{-- Nuevo div para la línea de tiempo --}}
        <div class="w-full my-1 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col space-y-4">
            <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Línea de tiempo de atención</h2>
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
        {{-- ...existing code... --}}
        @vite(['resources/js/elemento1dashboard.js', 'resources/js/dashboardHeatmap.js', 'resources/js/linetime.js'])
    </div>
</x-app-layout>
