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