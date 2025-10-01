/**
 * Punto de entrada principal del sistema de chat refactorizado
 * Inicializa automáticamente el chat cuando se carga
 */

// Importar módulos necesarios
import { chatState } from './state.js';
import { chatAPI } from './api.js';
import { chatUI } from './ui.js';

// Función de inicialización
async function initializeChat() {
    try {
        console.log('Inicializando sistema de chat refactorizado...');

        // Verificar que los elementos DOM existan
        const chatMessages = document.getElementById('chat-messages');

        if (!chatMessages) {
            console.warn('Elementos del chat no encontrados. Asegúrate de que el HTML esté cargado correctamente.');
            return false;
        }

        // Nota: chatForm y messageInput están ocultos, no necesitamos verificarlos

        // Importar dinámicamente el ChatManager para evitar dependencias circulares
        const { chatManager } = await import('./chat-manager.js');

        // Inicializar el chat
        await chatManager.init();

        // Para compatibilidad con código existente
        window.chatManager = chatManager;

        console.log('Sistema de chat refactorizado inicializado exitosamente.');
        return true;
    } catch (error) {
        console.error('Error fatal al inicializar el sistema de chat refactorizado:', error);
        return false;
    }
}

// Inicialización automática cuando el DOM esté listo
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Pequeño delay para asegurar que todo esté cargado
        setTimeout(() => {
            initializeChat();
        }, 100);
    });
}

// Exportar módulos para uso externo (sin chatManager para evitar conflictos)
export { chatState } from './state.js';
export { chatAPI } from './api.js';
export { chatUI } from './ui.js';
export { MACHINES, STEPS } from './constants.js';
export * from './utils.js';

// Hacer MACHINES disponible globalmente para compatibilidad
import { MACHINES } from './constants.js';
if (typeof window !== 'undefined') {
    window.MACHINES = MACHINES;
}