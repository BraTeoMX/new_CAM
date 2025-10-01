<x-guest-layout>
    <div class="px-4 sm:px-6 lg:px-15 py-8 w-full max-w-7xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Centro de Atención de
                Mantenimiento</h1>
        </div>

        <!-- Chat Formulario -->
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

    {{-- Sistema de Chat Modular Refactorizado - Módulos separados para mejor mantenibilidad --}}
    @vite([
    'resources/js/chat/index.js'
    ])
</x-guest-layout>