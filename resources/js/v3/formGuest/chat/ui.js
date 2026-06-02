/**
 * Modulo de Interfaz de Usuario para el chat V3.
 */
import { escapeHtml } from './utils.js';

export class ChatUI {
    constructor() {
        this.elements = { chatMessages: null, messageInput: null, form: null };
        this.activeIntervals = [];
        this.summaryElement = null;
    }

    initializeElements() {
        this.elements = {
            chatMessages: document.getElementById('chat-messages'),
            messageInput: null,
            form: null
        };
    }

    async showTypingIndicator(chatMessages) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4 flex items-start gap-2';
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0';
        avatarDiv.innerHTML = `<img class="w-20 h-20 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500" src="/images/Avatar.webp" alt="AI Avatar">`;

        const loadingSpan = document.createElement('span');
        loadingSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%] animate-pulse';
        loadingSpan.textContent = 'Escribiendo...';

        loadingDiv.appendChild(avatarDiv);
        loadingDiv.appendChild(loadingSpan);
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        await new Promise((resolve) => setTimeout(resolve, 700));
        loadingDiv.remove();
    }

    createBotMessageWrapper(stepName = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-2';
        if (stepName) {
            messageDiv.dataset.flowStep = stepName;
        }

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0';
        avatarDiv.innerHTML = `<img class="w-20 h-20 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500" src="/images/Avatar.webp" alt="AI Avatar">`;

        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(responseSpan);

        return { messageDiv, responseSpan };
    }

    async appendChatMessage(message, chatMessages, stepName = null) {
        await this.showTypingIndicator(chatMessages);
        const { messageDiv, responseSpan } = this.createBotMessageWrapper(stepName);
        responseSpan.innerHTML = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    async appendActionMessage(chatMessages, onCreateTicket, onFollowTicket) {
        await this.showTypingIndicator(chatMessages);
        const { messageDiv, responseSpan } = this.createBotMessageWrapper('entry');
        responseSpan.className += ' flex flex-col sm:flex-row w-full gap-2';
        responseSpan.innerHTML = `
            <strong>Que es lo que deseas hacer?</strong><br>
            <div class="flex flex-col sm:flex-row w-full gap-2 mt-3">
                <button id="btn-crear-ticket" class="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Crear ticket</button>
                <button id="btn-seguimiento-ticket" class="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">Dar seguimiento a un ticket</button>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        document.getElementById('btn-crear-ticket').onclick = onCreateTicket;
        document.getElementById('btn-seguimiento-ticket').onclick = onFollowTicket;
        return messageDiv;
    }

    showError(message) {
        Swal.fire({ icon: 'error', title: 'Error', text: message, customClass: { container: 'z-50' } });
    }

    appendUserMessage(message, chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-right mb-4';
        messageDiv.innerHTML = `<span class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-[70%]">${escapeHtml(message)}</span>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showModuleSelect(chatMessages, modules, onModuleSelect) {
        const { messageDiv, responseSpan } = this.createBotMessageWrapper('module');
        responseSpan.innerHTML = `Por favor selecciona area o modulo que se atendera:<br>
            <select id="modul" style="width:100%"><option></option></select>
            <div id="operario-select-container" class="mt-4"></div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (window.$ && $('#modul').length) {
            $('#modul').select2({
                placeholder: 'Selecciona un modulo',
                data: modules.map((item) => ({
                    id: item.modulo,
                    text: item.modulo,
                    type: item.tipo,
                    planta: item.planta || null,
                    nombre_supervisor: item.nombre_supervisor || 'N/A',
                    numero_empleado_supervisor: item.numero_empleado_supervisor || 'N/A'
                })),
                minimumResultsForSearch: 0
            });

            $('#modul').on('select2:open', function () { $('.select2-search__field').focus(); });
            $('#modul').on('select2:select', (event) => { onModuleSelect(event.params.data); });
        }

        return messageDiv;
    }

    showSummary(chatMessages, summary) {
        const resumenDiv = document.createElement('div');
        resumenDiv.className = 'text-left mb-4';
        resumenDiv.dataset.flowStep = 'summary';

        const resumenSpan = document.createElement('span');
        resumenSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        resumenDiv.appendChild(resumenSpan);

        chatMessages.appendChild(resumenDiv);
        this.summaryElement = resumenSpan;
        this.updateSummary(summary);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        return new Promise((resolve) => setTimeout(resolve, 500));
    }

    updateSummary(summary) {
        if (!this.summaryElement) return;

        this.summaryElement.innerHTML = `<strong>Resumen de la solicitud:</strong><br>
            <b>Modulo:</b> ${escapeHtml(summary.modulo)}<br>
            <b>Operario:</b> ${escapeHtml(summary.operarioNumero)}<br>
            <b>Nombre:</b> ${escapeHtml(summary.operarioNombre)}<br>
            <b>Maquina:</b> ${escapeHtml(summary.maquina)}<br>
            <b>Problema/Descripcion:</b> ${escapeHtml(summary.problema)}`;
    }

    removeFlowAfter(stepOrder, flowSteps) {
        Object.entries(flowSteps).forEach(([stepName, order]) => {
            if (order > stepOrder) {
                this.elements.chatMessages
                    .querySelectorAll(`[data-flow-step="${stepName}"]`)
                    .forEach((element) => element.remove());
            }
        });

        if (stepOrder < flowSteps.summary) {
            this.summaryElement = null;
        }
    }

    cleanup() {
        this.activeIntervals.forEach((interval) => clearInterval(interval));
        this.activeIntervals = [];
        this.summaryElement = null;
    }
}

export const chatUI = new ChatUI();
