/**
 * Módulo de Interfaz de Usuario para el chat
 * Maneja toda la manipulación del DOM y presentación visual
 */
import { escapeHtml, formatTime } from './utils.js';
import { MACHINES, STEPS } from './constants.js';

export class ChatUI {
    constructor() {
        // Elementos DOM cacheados
        this.elements = {
            chatMessages: null,
            messageInput: null,
            form: null
        };

        // Intervals activos para limpieza
        this.activeIntervals = [];
    }

    /**
     * Inicializa los elementos DOM
     */
    initializeElements() {
        this.elements = {
            chatMessages: document.getElementById('chat-messages'),
            messageInput: document.getElementById('message'),
            form: document.getElementById('chat-form')
        };
    }

    /**
     * Muestra el indicador de escritura del asistente
     * @param {HTMLElement} chatMessages - Contenedor de mensajes
     * @returns {Promise} Promesa que se resuelve después de la animación
     */
    async showTypingIndicator(chatMessages) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4 flex items-start gap-2';

        // Agregar avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0';
        avatarDiv.innerHTML = `
            <img class="w-20 h-20 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500"
                 src="/images/Avatar.webp"
                 alt="AI Avatar">
        `;

        const loadingSpan = document.createElement('span');
        loadingSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%] animate-pulse';
        loadingSpan.textContent = 'Escribiendo...';

        loadingDiv.appendChild(avatarDiv);
        loadingDiv.appendChild(loadingSpan);
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        await new Promise(resolve => setTimeout(resolve, 1500));
        loadingDiv.remove();
    }

    /**
     * Agrega un mensaje del asistente al chat
     * @param {string} message - Contenido del mensaje
     * @param {HTMLElement} chatMessages - Contenedor de mensajes
     */
    async appendChatMessage(message, chatMessages) {
        await this.showTypingIndicator(chatMessages);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-2';

        // Agregar avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0';
        avatarDiv.innerHTML = `
            <img class="w-20 h-20 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500"
                 src="/images/Avatar.webp"
                 alt="AI Avatar">
        `;

        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        responseSpan.innerHTML = message;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(responseSpan);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Agrega un mensaje de acción con botones al chat
     * @param {HTMLElement} chatMessages - Contenedor de mensajes
     * @param {Function} onCreateTicket - Callback para crear ticket
     * @param {Function} onFollowTicket - Callback para seguimiento
     */
    async appendActionMessage(chatMessages, onCreateTicket, onFollowTicket) {
        await this.showTypingIndicator(chatMessages);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-2';

        // Avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0';
        avatarDiv.innerHTML = `
            <img class="w-20 h-20 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500"
                 src="/images/Avatar.webp"
                 alt="AI Avatar">
        `;

        // Contenido con botones
        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%] flex flex-col sm:flex-row w-full gap-2';
        responseSpan.innerHTML = `
            <strong>¿Qué es lo que deseas hacer?</strong><br>
            <div class="flex flex-col sm:flex-row w-full gap-2 mt-3">
                <button id="btn-crear-ticket" class="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Crear ticket</button>
                <button id="btn-seguimiento-ticket" class="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">Dar seguimiento a un ticket</button>
            </div>
        `;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(responseSpan);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Listeners para los botones
        setTimeout(() => {
            document.getElementById('btn-crear-ticket').onclick = onCreateTicket;
            document.getElementById('btn-seguimiento-ticket').onclick = onFollowTicket;
        }, 100);
    }

    /**
     * Muestra un mensaje de error usando Swal
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            customClass: { container: 'z-50' }
        });
    }

    /**
     * Agrega un mensaje del usuario al chat
     * @param {string} message - Mensaje del usuario
     * @param {HTMLElement} chatMessages - Contenedor de mensajes
     */
    appendUserMessage(message, chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-right mb-4';
        messageDiv.innerHTML = `
            <span class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-[70%]">
                ${escapeHtml(message)}
            </span>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Muestra el selector de módulos
     * @param {HTMLElement} chatMessages - Contenedor de mensajes
     * @param {Function} onModuleSelect - Callback cuando se selecciona un módulo
     */
    showModuleSelect(chatMessages, onModuleSelect) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4';
        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        responseSpan.innerHTML = `Por favor selecciona area o modulo que se atendera:<br>
            <select id="modul" style="width:100%"></select>
            <div id="operario-select-container" class="mt-4"></div>`;
        loadingDiv.appendChild(responseSpan);
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Configurar Select2 para módulos
        setTimeout(() => {
            if (window.$ && $('#modul').length) {
                $('#modul').select2({
                    placeholder: 'Selecciona un módulo',
                    ajax: {
                        url: '/FormGuestV2/obtenerAreasModulos',
                        type: 'GET',
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return { search: params.term || '' };
                        },
                        processResults: function (data, params) {
                            let results = $.map(data, function (item) {
                                return {
                                    id: item.modulo,
                                    text: item.modulo,
                                    type: item.tipo,
                                    planta: item.planta || null,
                                    nombre_supervisor: item.nombre_supervisor || 'N/A',
                                    numero_empleado_supervisor: item.numero_empleado_supervisor || 'N/A'
                                };
                            });
                            if (params.term && params.term.length > 0) {
                                const term = params.term.toLowerCase();
                                results = results.filter(r => r.text.toLowerCase().includes(term));
                            }
                            return { results };
                        }
                    },
                    minimumResultsForSearch: 0
                });

                $('#modul').on('select2:open', function () {
                    $('.select2-search__field').focus();
                });

                $('#modul').on('select2:select', (e) => {
                    const selectedData = e.params.data;
                    onModuleSelect(selectedData);
                });
            }
        }, 100);
    }

    /**
     * Muestra el resumen de la solicitud
     * @param {HTMLElement} chatMessages - Contenedor de mensajes
     * @param {object} summary - Datos del resumen
     */
    showSummary(chatMessages, summary) {
        const resumenDiv = document.createElement('div');
        resumenDiv.className = 'text-left mb-4';
        const resumenSpan = document.createElement('span');
        resumenSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        resumenSpan.innerHTML = `<strong>Resumen de la solicitud:</strong><br>
            <b>Módulo:</b> ${escapeHtml(summary.modulo)}<br>
            <b>Operario:</b> ${escapeHtml(summary.operarioNumero)}<br>
            <b>Nombre:</b> ${escapeHtml(summary.operarioNombre)}<br>
            <b>Máquina:</b> ${escapeHtml(summary.maquina)}<br>
            <b>Problema/Descripción:</b> ${escapeHtml(summary.problema)}`;

        resumenDiv.appendChild(resumenSpan);
        chatMessages.appendChild(resumenDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Limpia todos los intervals activos
     */
    cleanup() {
        this.activeIntervals.forEach(interval => clearInterval(interval));
        this.activeIntervals = [];
    }
}

// Instancia singleton de la UI
export const chatUI = new ChatUI();