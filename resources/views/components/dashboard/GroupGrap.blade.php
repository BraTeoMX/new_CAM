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