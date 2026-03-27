/**
 * Punto de entrada principal del sistema de chat V3
 */
import { chatState } from './state.js';
import { chatAPI } from './api.js';
import { chatUI } from './ui.js';

export async function initializeChat() {
    try {
        console.log('Inicializando chat V3...');
        const chatMessages = document.getElementById('chat-messages');

        if (!chatMessages) {
            console.warn('Elementos del chat no encontrados.');
            return false;
        }

        const { chatManager } = await import('./chat-manager.js');
        await chatManager.init();
        window.chatManagerV3 = chatManager;

        return true;
    } catch (error) {
        console.error('Error al inicializar el chat V3:', error);
        return false;
    }
}

// El inicio automático ahora es responsabilidad del importador (v3/formGuest/index.js)

export { chatState, chatAPI, chatUI };
export { MACHINES, STEPS } from './constants.js';
export * from './utils.js';

import { MACHINES } from './constants.js';
if (typeof window !== 'undefined') window.MACHINES = MACHINES;
