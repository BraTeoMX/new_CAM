<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Dashboard actions -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">OTs en Pausa o Pendientes</h1>
            </div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Programar OTs por tiempo determinado</h2>
            <div id="calendar"></div>
        </div>
    </div>
     <!-- Scripts -->
     @vite(['resources/js/calendar.js'])
</x-app-layout>
