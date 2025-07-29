<x-guest-layout>
    <div x-cloak x-data="{ init() {} }">
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                    Menú de Navegación
                </h1>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <a href="{{ route('formGuest.index') }}" class="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <svg class="w-12 h-12 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z"></path></svg>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Iniciar Atención</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Comenzar la guía paso a paso.</p>
            </a>

            <a href="{{ route('FollowOTV2') }}" class="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <svg class="w-12 h-12 mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Seguimiento de OT</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Consultar el estado de una atención.</p>
            </a>

            <a href="{{ route('OrdenOT.index') }}" class="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <svg class="w-12 h-12 mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Opción Pendiente</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Descripción de la futura función.</p>
            </a>

            <a href="#" class="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <svg class="w-12 h-12 mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Otra Opción</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Descripción de la futura función.</p>
            </a>

        </div>
    </div>

    @vite(['resources/js/consultaOT.js'])
</x-guest-layout>