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

            <a href="{{ route('formGuest.index') }}" 
               class="flex flex-col items-center justify-center p-6 text-center text-white bg-blue-500 rounded-lg shadow-lg 
                      hover:bg-blue-600 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                
                <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10z"></path></svg>
                <h2 class="text-lg font-semibold">Iniciar Atención</h2>
                <p class="text-sm opacity-90">Comenzar la guía paso a paso.</p>
            </a>

            <a href="{{ route('FollowOTV2') }}"
               class="flex flex-col items-center justify-center p-6 text-center text-white bg-green-500 rounded-lg shadow-lg 
                      hover:bg-green-600 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                
                <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                <h2 class="text-lg font-semibold">Seguimiento de OT</h2>
                <p class="text-sm opacity-90">Consultar el estado de una atención.</p>
            </a>

            <a href="{{ route('OrdenOT.index') }}"
                class="flex flex-col items-center justify-center p-6 text-center text-white bg-yellow-500 rounded-lg shadow-lg 
                    hover:bg-yellow-600 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                
                <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                
                <h2 class="text-lg font-semibold">Consultar Órdenes</h2>
                <p class="text-sm opacity-90">Vista rápida de las órdenes de trabajo.</p>
            </a>

            <a href="#"
               class="flex flex-col items-center justify-center p-6 text-center text-white bg-red-500 rounded-lg shadow-lg 
                      hover:bg-red-600 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                
                <svg class="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h2 class="text-lg font-semibold">Otra Opción</h2>
                <p class="text-sm opacity-90">Descripción de la futura función.</p>
            </a>

        </div>
    </div>

    @vite(['resources/js/consultaOT.js'])
</x-guest-layout>