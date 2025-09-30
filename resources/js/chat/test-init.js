/**
 * Archivo de prueba para inicializar el chat refactorizado
 * Este archivo permite probar la funcionalidad del sistema refactorizado
 * sin modificar el archivo original chat.js
 */
import { chatManager } from './index.js';

// Inicialización segura del chat refactorizado
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Verificar que los elementos DOM existan
        const chatForm = document.getElementById('chat-form');
        const chatMessages = document.getElementById('chat-messages');
        const messageInput = document.getElementById('message');

        if (!chatForm || !chatMessages || !messageInput) {
            console.warn('Elementos del chat no encontrados. Asegúrate de que el HTML esté cargado correctamente.');
            return;
        }

        console.log('Inicializando chat refactorizado...');
        chatManager.init();
        console.log('Chat refactorizado inicializado exitosamente.');
    } catch (error) {
        console.error('Error fatal al inicializar el chat refactorizado:', error);
    }
});