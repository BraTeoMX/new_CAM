// Botón flotante de asistente virtual
(function() {
    // Crear el botón flotante
    const btn = document.createElement('button');
    btn.id = 'asis-vir-flo-btn';
    btn.type = 'button';
    btn.className = 'fixed z-50 bottom-6 right-6 flex items-center justify-center shadow-lg bg-white dark:bg-gray-800 rounded-full p-0 ring-2 ring-pink-400 hover:ring-pink-600 transition-all duration-200';
    btn.style.width = '56px';
    btn.style.height = '56px';
    btn.style.boxShadow = '0 4px 24px 0 rgba(0,0,0,0.12)';
    btn.innerHTML = `
        <div class="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
            <img class="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
                 src="/images/Avatar.webp"
                 alt="AI Avatar">
        </div>
    `;
    document.body.appendChild(btn);

    // Crear el contenedor del chat IA (modal flotante)
    const chatModal = document.createElement('div');
    chatModal.id = 'asis-vir-flo-modal';
    chatModal.className = 'fixed z-50 bottom-20 right-6 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300';
    chatModal.style.display = 'none';
    chatModal.style.height = '600px';
    chatModal.innerHTML = `
        <div class="flex items-center justify-between px-4 py-2 bg-pink-500 dark:bg-pink-700 text-white">
            <div class="flex items-center gap-2">
                <img src="/images/Avatar.webp" class="w-8 h-8 rounded-full ring-2 ring-white" alt="AI Avatar">
                <span class="font-bold">Asistente Virtual</span>
            </div>
            <button id="asis-vir-flo-close" class="text-white hover:text-pink-200 text-2xl font-bold focus:outline-none">&times;</button>
        </div>
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
    `;
    document.body.appendChild(chatModal);

    // Mostrar/ocultar el chat IA al hacer clic en el botón flotante
    btn.addEventListener('click', function() {
        if (chatModal.style.display === 'none') {
            chatModal.style.display = 'flex';
            // Inicializar el chat IA si no está ya inicializado
            if (!window.chatManager) {
                if (typeof ChatManager !== 'undefined') {
                    window.chatManager = new ChatManager();
                    // Usar los elementos ya presentes en el modal
                    window.chatManager.elements = {
                        chatMessages: document.getElementById('chat-messages'),
                        messageInput: document.getElementById('message'),
                        form: document.getElementById('chat-form')
                    };
                    window.chatManager.init();
                } else {
                    // Si no está cargado IAChat.js
                    const chatMessages = document.getElementById('chat-messages');
                    if (chatMessages) chatMessages.innerHTML = '<div class="text-center text-red-500 p-4">No se pudo cargar el asistente.</div>';
                }
            }
        } else {
            chatModal.style.display = 'none';
        }
    });
    // Cerrar el chat IA al hacer clic en la X
    chatModal.querySelector('#asis-vir-flo-close').addEventListener('click', function() {
        chatModal.style.display = 'none';
    });
})();