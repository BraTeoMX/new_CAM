<x-app-layout>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Título -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Chat Boot</h1>
        </div>

        <!-- Chat Formulario -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <div id="chat-messages" class="mb-4 h-64 overflow-y-auto border-b-2 border-gray-200 dark:border-gray-700">
            </div>
            <form id="chat-form">
                <input type="text" id="message" class="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
                    placeholder="Escribe tu mensaje...">
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Enviar
                </button>
            </form>
        </div>
    </div>

    <script type="module">
        // Importar la biblioteca de Google AI
        import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

        // Inicializar el cliente de Gemini con la API key desde Laravel
        const genAI = new GoogleGenerativeAI('{{ config('services.google.gemini_api_key') }}');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Inicializar el chat
        let chat;

        async function initChat() {
            chat = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 2048,
                }
            });
        }

        // Inicializar el chat al cargar la página
        initChat();

        document.getElementById('chat-form').addEventListener('submit', async function(e) {
            e.preventDefault();

            const messageInput = document.getElementById('message');
            const chatMessages = document.getElementById('chat-messages');
            const message = messageInput.value.trim();

            if (!message) return;

            // Mostrar mensaje del usuario
            chatMessages.innerHTML += `
                <div class="text-right mb-4">
                    <span class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-[70%]">
                        ${escapeHtml(message)}
                    </span>
                </div>`;

            // Limpiar input
            messageInput.value = '';

            // Mostrar indicador de escritura
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'text-left mb-4';
            loadingDiv.innerHTML = `
                <span class="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg inline-block animate-pulse">
                    Escribiendo...
                </span>`;
            chatMessages.appendChild(loadingDiv);

            try {
                // Obtener respuesta de Gemini
                const result = await chat.sendMessage(message);
                const response = await result.response;
                const text = response.text();

                // Eliminar indicador de escritura
                loadingDiv.remove();

                // Mostrar respuesta
                chatMessages.innerHTML += `
                    <div class="text-left mb-4">
                        <span class="bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]">
                            ${escapeHtml(text)}
                        </span>
                    </div>`;

            } catch (error) {
                console.error('Error:', error);
                loadingDiv.remove();

                chatMessages.innerHTML += `
                    <div class="text-left mb-4">
                        <span class="bg-red-100 text-red-600 p-3 rounded-lg inline-block">
                            Error: ${error.message || 'No se pudo obtener una respuesta.'}
                        </span>
                    </div>`;
            }

            // Scroll al final
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        // Función para escapar HTML y prevenir XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</x-app-layout>
