/**
 * Punto de entrada principal del sistema de chat refactorizado
 * Exporta todos los módulos y la instancia principal del ChatManager
 */

// Exportar módulos individuales
export { MACHINES, STEPS } from './constants.js';
export * from './utils.js';
export { StateManager, chatState } from './state.js';
export { ChatAPI, chatAPI } from './api.js';
export { ChatUI, chatUI } from './ui.js';
export { ChatManager, chatManager } from './chat-manager.js';

// Para compatibilidad con el código existente, asignar a window
window.chatManager = chatManager;