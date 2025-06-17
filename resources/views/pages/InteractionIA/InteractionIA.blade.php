<x-app-layout>
    {{-- Asegúrate de tener esto en tu layout principal en la sección <head> --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Chat Boot</h1>
        </div>

        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div id="chat-messages" class="mb-4 h-[500px] overflow-y-auto border-b-2 border-gray-200 dark:border-gray-700">
                {{-- Los mensajes del chat se renderizarán aquí --}}
            </div>
            <form id="chat-form" data-gemini-key="{{ config('services.google.gemini_api_key') }}">
                <input type="text" id="message"
                    class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
                    placeholder="Escribe tu mensaje..." disabled> {{-- Deshabilitado inicialmente --}}
                <button type="submit" id="send-button" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled>
                    Enviar
                </button>
            </form>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    @vite(['resources/js/IAChat/ChatIA.js','resources/js/IAChat/select2Modulo.js'])
</x-app-layout>
