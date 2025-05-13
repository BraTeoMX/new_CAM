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
            <form id="chat-form" data-gemini-key="{{ config('services.google.gemini_api_key') }}">
                <input type="text" id="message"
                    class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
                    placeholder="Escribe tu mensaje...">
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Enviar
                </button>
            </form>
        </div>
    </div>
    {{-- Agregar SweetAlert2 --}}
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    @vite(['resources/js/IAChat.js'])
</x-guest-layout>
