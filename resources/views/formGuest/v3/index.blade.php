<x-guest-layout>
    <div class="px-4 sm:px-6 lg:px-15 py-8 w-full max-w-7xl mx-auto">
        <!-- Título V3 -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Centro de Atención de
                Mantenimiento</h1>

            {{-- Enlace al manual: discreto, fuera del chat, nueva pestaña --}}
            <a href="{{ route('manual.usuario') }}"
               target="_blank"
               rel="noopener noreferrer"
               title="Ver manual de usuario"
               class="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500
                      hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 group">
                {{-- Ícono libro --}}
                <svg class="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                     viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19 2H8.5A3.5 3.5 0 0 0 5 5.5v13A3.5 3.5 0 0 0 8.5 22H19a1 1 0 0 0
                             1-1V3a1 1 0 0 0-1-1zm-1 18H8.5a1.5 1.5 0 0 1 0-3H18v3zm0-5H8.5A3.49
                             3.49 0 0 0 6 16.5V5.5A1.5 1.5 0 0 1 8.5 4H18v11z"/>
                </svg>
                Manual de usuario
            </a>
        </div>

        <!-- Chat Formulario V3 -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full">
            <div id="chat-messages"
                class="mb-4 h-[600px] overflow-y-auto border-b-2 border-gray-200 dark:border-gray-700">
            </div>
            <!-- Input y botón ocultos - el chat funciona solo con botones guiados -->
            <div id="chat-form" style="display: none;">
                <input type="text" id="message" class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
                    placeholder="Escribe tu mensaje...">
                <button type="submit" class="bg-blue-500 text-white font-bold py-2 px-4 rounded
                        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-500">
                    Enviar
                </button>
            </div>
        </div>
    </div>

    {{-- Sistema modularizado V3, cargado mediante Vite para evitar inyecciones directas en el blade --}}
    @vite([
    'resources/js/v3/formGuest/index.js'
    ])
</x-guest-layout>