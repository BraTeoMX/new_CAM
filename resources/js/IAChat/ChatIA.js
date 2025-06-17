// public/js/ChatIA.js

// Asegúrate de que initializeModuloSelect2 esté disponible globalmente
// (cargado en el HTML antes de este script, o usando un sistema de módulos si lo tienes).

class ChatManager {
    constructor() {
        this.elements = {
            chatMessages: null,
            messageInput: null,
            form: null,
            sendButton: null,
        };

        this.activeIntervals = []; // Para los indicadores de "escribiendo"

        // Asegúrate de que los métodos que se pasan como callbacks o se llaman en eventos
        // tengan el contexto correcto de 'this'.
        this.cleanup = this.cleanup.bind(this);
        // Bindear init no es estrictamente necesario, pero no hace daño
        this.init = this.init.bind(this);
    }

    /**
     * Inicializa los elementos DOM que se usarán frecuentemente.
     */
    initializeElements() {
        this.elements = {
            chatMessages: document.getElementById('chat-messages'),
            messageInput: document.getElementById('message'),
            form: document.getElementById('chat-form'),
            sendButton: document.getElementById('send-button')
        };
    }

    /**
     * Punto de entrada principal para inicializar el chat.
     */
    init() {
        try {
            this.initializeElements();

            if (!this.elements.form) {
                throw new Error('Chat form not found');
            }

            this.fetchInitialConversation();

            // Deshabilitar input y botón de envío al inicio para forzar la interacción con botones
            this.elements.messageInput.disabled = true;
            this.elements.sendButton.disabled = true;

        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Error al inicializar el chat: ' + error.message);
        }
    }

    /**
     * Muestra un mensaje de error usando SweetAlert2.
     * @param {string} message - El mensaje de error a mostrar.
     */
    showError(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                customClass: { container: 'z-50' }
            });
        } else {
            alert('Error: ' + message); // Fallback si Swal no está disponible
        }
    }

    /**
     * Hace una petición AJAX al backend para iniciar la conversación.
     */
    async fetchInitialConversation() {
        await this.showTypingIndicator(this.elements.chatMessages); // Muestra el indicador de escritura

        try {
            const response = await fetch('/chatbot/start', { // Ruta definida en web.php
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener la conversación inicial del servidor.');
            }

            const data = await response.json();
            this.removeTypingIndicator(); // Quita el indicador antes de mostrar la respuesta

            // Renderiza la respuesta del backend
            await this.renderChatResponse(data); // Usar await aquí para asegurar que los elementos estén en el DOM

            // El input y botón de enviar ya están deshabilitados desde init()
            // Se habilitarán solo si el flujo del chat lo requiere (por ejemplo, para entrada de texto libre)

        } catch (error) {
            this.removeTypingIndicator();
            console.error('Error al iniciar conversación con el backend:', error);
            this.showError(`Error: ${error.message}`);
        }
    }

    /**
     * Renderiza los mensajes y elementos de UI basados en la respuesta del backend.
     * @param {Object} data - Objeto de respuesta del controlador de Laravel.
     */
    async renderChatResponse(data) {
        const chatMessages = this.elements.chatMessages;

        // Primero, siempre agregamos la burbuja de chat si viene HTML
        if (data.html) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.html;
            chatMessages.appendChild(tempDiv.firstChild);
        } else if (data.message) {
            console.warn('Received a plain message. Consider rendering all chat bubbles via backend HTML.');
            // Fallback si por alguna razón el backend envía solo un mensaje
            // Podrías crear una burbuja aquí manualmente, pero es mejor que venga del backend
        }

        // Luego, gestionamos los elementos de UI adicionales según el 'type'
        if (data.type === 'action_buttons' && data.buttons) {
            await this.appendActionButtons(data.buttons);
        } else if (data.type === 'module_select') { // <-- ¡ESTA ES LA LÓGICA QUE FALTABA O ESTABA MAL EN TU VERSIÓN!
            await this.appendModuleSelect();
        } else if (data.type === 'machine_selection' && data.data && data.data.machines) {
            // Lógica para el selector de máquinas si es necesario (ej. si no está en la burbuja)
            // await this.appendMachineSelectionUI(data.data.machines);
        }

        chatMessages.scrollTop = chatMessages.scrollHeight; // Asegura que el scroll baje
    }

    /**
     * Añade los botones de acción al área de chat (fuera de la burbuja).
     * @param {Array<Object>} buttons - Array de objetos {id: string, text: string, class: string}.
     */
    async appendActionButtons(buttons) {
        const chatMessages = this.elements.chatMessages;
        const buttonsContainer = document.createElement('div');
        // Usamos una clase que permita flex-col en móviles y flex-row en sm: (small screens)
        // Y añadimos margin-bottom para que no se pegue al input si este se habilita.
        buttonsContainer.className = 'flex flex-col sm:flex-row w-full gap-2 mt-3 mb-4';
        buttonsContainer.setAttribute('data-ui-type', 'action-buttons'); // Identificador para removerlo después

        buttons.forEach(btn => {
            const buttonElement = document.createElement('button');
            buttonElement.id = btn.id;
            // Aseguramos que los botones se vean bien
            buttonElement.className = `w-full sm:w-auto ${btn.class} text-white font-bold py-2 px-4 rounded transition-colors`;
            buttonElement.textContent = btn.text;
            buttonElement.onclick = async () => {
                // Deshabilitar todos los botones en este contenedor una vez que uno es clicado
                buttonsContainer.querySelectorAll('button').forEach(b => {
                    b.disabled = true;
                    b.classList.add('opacity-50', 'cursor-not-allowed');
                });

                // Remover el contenedor de botones después de la selección
                buttonsContainer.remove(); // <-- Asegúrate de que esta línea esté aquí

                // Renderizar la burbuja del usuario CON el texto completo de lo que eligió
                const userActionHtml = await this.renderUserActionAsBubble(btn.text);
                if (userActionHtml) {
                    const tempUserDiv = document.createElement('div');
                    tempUserDiv.innerHTML = userActionHtml;
                    chatMessages.appendChild(tempUserDiv.firstChild);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }

                // Luego, llama a la función en el backend según el ID del botón
                if (btn.id === 'btn-crear-ticket') {
                    await this.sendActionToBackend('/chatbot/create-ticket-flow');
                } else if (btn.id === 'btn-seguimiento-ticket') {
                    await this.sendActionToBackend('/chatbot/track-ticket-flow');
                }
            };
            buttonsContainer.appendChild(buttonElement);
        });

        // Asegúrate de que el contenedor de botones se añada directamente a chatMessages
        chatMessages.appendChild(buttonsContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * NUEVO: Añade el elemento <select> para el módulo y lo inicializa con Select2.
     */
    async appendModuleSelect() {
        const chatMessages = this.elements.chatMessages;
        const selectContainer = document.createElement('div');
        // Contenedor para el select, con ancho limitado y márgenes
        selectContainer.className = 'select2-container-wrapper flex flex-col w-full max-w-[320px] mb-4 mt-3';
        selectContainer.innerHTML = `
            <select id="modulo-seguimiento" class="w-full"></select>
        `;
        chatMessages.appendChild(selectContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Llamar a la función de inicialización de Select2 en el elemento creado
        // Asegúrate de que initializeModuloSelect2 esté disponible globalmente.
        if (typeof initializeModuloSelect2 === 'function') {
            // Pasamos 'this' (la instancia de ChatManager) para que Select2 pueda usar
            // renderUserActionAsBubble y otras funciones del ChatManager.
            initializeModuloSelect2(document.getElementById('modulo-seguimiento'), this);
        } else {
            console.error('initializeModuloSelect2 function is not defined. Make sure select2Modulo.js is loaded.');
        }
    }

    /**
     * Genera el HTML para un mensaje de usuario (usando el componente Blade)
     * simulando una llamada al backend.
     * @param {string} messageText - El texto que el usuario "ingresó".
     * @returns {Promise<string>} El HTML de la burbuja de chat del usuario.
     */
    async renderUserActionAsBubble(messageText) {
        try {
            const response = await fetch('/chatbot/render-user-bubble', { // Nuevo endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                // Aseguramos que el mensaje enviado al backend sea claro para la burbuja del usuario
                body: JSON.stringify({ message: `${messageText}` })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al renderizar la burbuja del usuario.');
            }
            const data = await response.json();
            return data.html; // Esperamos que el backend nos dé el HTML
        } catch (error) {
            console.error('Error al obtener la burbuja del usuario desde el backend:', error);
            return null;
        }
    }


    /**
     * Envía una acción o mensaje al backend y renderiza la respuesta.
     * @param {string} endpoint - La URL del endpoint de Laravel a llamar.
     * @param {Object} [payload={}] - Datos adicionales a enviar en el cuerpo de la solicitud.
     */
    async sendActionToBackend(endpoint, payload = {}) {
        await this.showTypingIndicator(this.elements.chatMessages);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al procesar la acción en ${endpoint}.`);
            }

            const data = await response.json();
            this.removeTypingIndicator();
            await this.renderChatResponse(data); // <-- ¡IMPORTANTE!: Usar await aquí
            // Esto asegura que la siguiente respuesta del chatbot se renderice solo después
            // de que la burbuja del usuario (y cualquier otra UI de la respuesta anterior)
            // se haya procesado completamente.

        } catch (error) {
            this.removeTypingIndicator();
            console.error(`Error en la acción ${endpoint}:`, error);
            this.showError(`Error al procesar tu solicitud: ${error.message}`);
        }
    }

    /**
     * Muestra un indicador de que el asistente está escribiendo.
     * @param {HTMLElement} chatMessages - El contenedor de los mensajes del chat.
     */
    async showTypingIndicator(chatMessages) {
        this.removeTypingIndicator(); // Elimina cualquier indicador existente

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'text-left mb-4 flex items-center gap-2 text-gray-500 dark:text-gray-400';
        // Corregido el typo en 'calss' a 'class'
        typingDiv.innerHTML = `
            <div class="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                <img class="w-10 h-10 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500"
                    src="/images/Avatar.webp"
                    alt="AI Avatar">
            </div>
            <span class="bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%] animate-pulse">El asistente está escribiendo<span class="dot-animation">.</span><span class="dot-animation">.</span><span class="dot-animation">.</span></span>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Añadir los estilos de la animación si no existen
        if (!document.getElementById('typing-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'typing-animation-styles';
            style.innerHTML = `
                @keyframes blink {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
                .dot-animation:nth-child(1) { animation: blink 1s infinite; }
                .dot-animation:nth-child(2) { animation: blink 1s infinite 0.2s; }
                .dot-animation:nth-child(3) { animation: blink 1s infinite 0.4s; }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Elimina el indicador de que el asistente está escribiendo.
     */
    removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    /**
     * Método para limpiar los event listeners (útil si la SPA cambia de vista).
     */
    cleanup() {
        // Por ahora no hay listeners en el form, pero lo mantengo por si es necesario
    }
}

// Inicializar el chat cuando el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {
    const chatManager = new ChatManager();
    chatManager.init();
});
