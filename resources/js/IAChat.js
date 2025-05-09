// Importar la biblioteca de Google AI
import { GoogleGenAI } from '@google/genai';

// Constantes globales
const MACHINES = [
    'RECTA 1 AGUJA',
    'RECTA 2 AGUJAS',
    'OVERLOCK',
    'COVERSTITCH',
    'PRESILLADORA',
    'ZZ',
    'OJAL',
    'BOTON',
    'SCHIPS',
    'ISEW',
    'FLAT SEAMER',
    'SUPREME'
];

const STEPS = [
    { name: 'TENSIÓN', key: 'tension', times: [2, 2, 3, 3, 2, 3, 3, 3, 3, 3, 5, 2] },
    { name: 'TIPO Y POSICIÓN DE AGUJAS', key: 'agujas', times: [1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1] },
    { name: 'ENHEBRADO HILO', key: 'enhebrado', times: [1, 0.5, 2, 2, 1, 1, 1, 1, 2, 2, 4, 4] },
    { name: 'PRESIÓN PRENSATELAS', key: 'prensatelas', times: [0.5, 1, 0.5, 0.5, null, 0.5, null, null, 0.5, 0.5, 1, null] },
    { name: 'PPP', key: 'ppp', times: [1, 1, 1, 1, null, 1, null, null, 1, 1, null, null] }
];

const GREETINGS = [
    'hola', 'buenos dias', 'buenos días', 'buenas tardes',
    'buenas noches', 'hello', 'hi', 'hey', 'saludos'
];

class ChatManager {
    constructor() {
        this.ai = null;
        this.modelName = 'gemini-2.5-pro-exp-03-25';
        this.userProblem = '';
        this.userDescription = '';
        this.userModule = '';
        this.activeIntervals = [];
    }

    init() {
        const chatForm = document.getElementById('chat-form');
        if (!chatForm) {
            console.error('Chat form not found');
            return;
        }

        const apiKey = chatForm.getAttribute('data-gemini-key');
        if (!apiKey) {
            console.error('Gemini API key not found');
            return;
        }

        this.ai = new GoogleGenAI({ apiKey });
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('chat-form').addEventListener('submit', this.handleSubmit.bind(this));
    }

    isGreeting(message) {
        const normalized = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return GREETINGS.some(greeting => normalized.includes(greeting));
    }

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Buenos días';
        if (hour >= 12 && hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    }

    handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        const messageInput = document.getElementById('message');
        const chatMessages = document.getElementById('chat-messages');
        const message = messageInput.value.trim();

        if (!message) return;

        // Estado de la conversación
        if (!window.iaChatStep) window.iaChatStep = 0;

        // Mostrar mensaje del usuario
        chatMessages.innerHTML += `
            <div class="text-right mb-4">
                <span class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-[70%]">
                    ${this.escapeHtml(message)}
                </span>
            </div>`;

        // Limpiar input
        messageInput.value = '';

        switch (window.iaChatStep) {
            case 0:
                if (this.isGreeting(message)) {
                    const greeting = this.getTimeBasedGreeting();
                    this.appendChatMessage(`${greeting}, ¿en qué puedo ayudarte?`, chatMessages);
                    this.askProblem(chatMessages);
                } else {
                    this.askProblem(chatMessages);
                }
                break;
            case 1:
                this.userProblem = message;
                this.askDescription(chatMessages);
                break;
            case 2:
                this.userDescription = message;
                this.askModule(chatMessages);
                break;
            case 3:
                this.showMachineSelect();
                window.iaChatStep = 0; // Resetear para el siguiente ciclo
                break;
        }
    }

    askProblem(chatMessages) {
        setTimeout(() => {
            this.appendChatMessage('Antes de continuar por favor ayudame con los siguientes datos por favor...<br><strong>Ingresa que problema tienes:</strong>', chatMessages);
            window.iaChatStep = 1;
        }, 1000); // Pequeño delay para mejor experiencia de usuario
    }

    askDescription(chatMessages) {
        this.appendChatMessage('Ahora describe muy general que está sucediendo:', chatMessages);
        window.iaChatStep = 2;
    }

    askModule(chatMessages) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4';
        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        responseSpan.innerHTML = `Ahora por último selecciona a qué módulo se refiere:<br>
            <select id="modul" style="width:100%"></select>`;
        loadingDiv.appendChild(responseSpan);
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            if (window.$ && $('#modul').length) {
                $('#modul').select2({
                    placeholder: 'Selecciona un módulo',
                    ajax: {
                        url: '/obtener-modulos',
                        type: 'GET',
                        dataType: 'json',
                        delay: 250,
                        processResults: function (data) {
                            return {
                                results: $.map(data, function (item) {
                                    return {
                                        id: item.MODULEID,
                                        text: item.MODULEID
                                    };
                                })
                            };
                        }
                    }
                });

                $('#modul').on('select2:select', (e) => {
                    this.userModule = e.params.data.text;
                    window.iaChatStep = 3;

                    this.showSummary(chatMessages);
                    this.showMachineSelect();
                });
            }
        }, 100);
        window.iaChatStep = 99; // Esperar selección de módulo
    }

    showSummary(chatMessages) {
        const resumenDiv = document.createElement('div');
        resumenDiv.className = 'text-left mb-4';
        const resumenSpan = document.createElement('span');
        resumenSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        resumenSpan.innerHTML = `<strong>Resumen:</strong><br>
            <b>Problema:</b> ${this.escapeHtml(this.userProblem)}<br>
            <b>Descripción:</b> ${this.escapeHtml(this.userDescription)}<br>
            <b>Módulo:</b> ${this.escapeHtml(this.userModule)}`;
        resumenDiv.appendChild(resumenSpan);
        chatMessages.appendChild(resumenDiv);
    }

    showMachineSelect() {
        const chatMessages = document.getElementById('chat-messages');
        const machineDiv = document.createElement('div');
        machineDiv.className = 'text-left mb-4';
        const machineSpan = document.createElement('span');
        machineSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        let selectHtml = `<label class="block mb-2">Por favor selecciona el tipo de máquina:</label>
        <select id="machine-select" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <option value="">Selecciona una máquina</option>`;
        MACHINES.forEach((machine, idx) => {
            selectHtml += `<option value="${idx}">${machine}</option>`;
        });
        selectHtml += `</select><div id="machine-steps" class="mt-4"></div>`;

        machineSpan.innerHTML = selectHtml;
        machineDiv.appendChild(machineSpan);
        chatMessages.appendChild(machineDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.setupMachineSelectListener();
    }

    setupMachineSelectListener() {
        const select = document.getElementById('machine-select');
        if (!select) return;

        select.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            if (isNaN(idx)) return;

            this.showSteps(idx);
        });
    }

    showSteps(machineIndex) {
        const chatMessages = document.getElementById('chat-messages');

        this.cleanup();

        this.appendChatMessage('Perfecto por favor sigue estos pasos antes de que escalemos con la generacion de una orden', chatMessages);

        let stepIndex = 0;
        const showNextStep = () => {
            if (stepIndex >= STEPS.length) {
                this.showFinalQuestion();
                return;
            }

            const step = STEPS[stepIndex];
            const min = step.times[machineIndex];

            if (min === null) {
                stepIndex++;
                showNextStep();
                return;
            }

            this.showStep(step, min, stepIndex, () => {
                stepIndex++;
                showNextStep();
            });
        };

        showNextStep();
    }

    showStep(step, minutes, index, onComplete) {
        const chatMessages = document.getElementById('chat-messages');
        const stepDivWrapper = document.createElement('div');
        stepDivWrapper.className = 'text-left mb-4';
        const stepDiv = document.createElement('span');
        stepDiv.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%] flex flex-col';
        stepDivWrapper.appendChild(stepDiv);
        chatMessages.appendChild(stepDivWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        let tiempoFijo = minutes >= 1 ? `${Math.round(minutes)} min` : `${Math.round(minutes * 60)} seg`;
        let seconds = Math.round(minutes * 60);

        stepDiv.innerHTML = `<strong>Paso ${index + 1}:</strong> ${step.name}
            <span class="ml-2 text-xs text-gray-500">
                (<span class="timer">${this.formatTime(seconds)}</span> restante | <span class="timer-num">${tiempoFijo}</span>)
            </span>`;

        const timerSpan = stepDiv.querySelector('.timer');
        const interval = setInterval(() => {
            seconds--;
            timerSpan.textContent = this.formatTime(seconds);
            if (seconds <= 0) {
                clearInterval(interval);
                onComplete();
            }
        }, 1000);

        this.activeIntervals.push(interval);
    }

    showFinalQuestion() {
        const chatMessages = document.getElementById('chat-messages');
        const questionDiv = document.createElement('div');
        questionDiv.className = 'text-left mb-4';
        const questionSpan = document.createElement('span');
        questionSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        questionSpan.innerHTML = `
            <p>¿Pudiste resolver el problema, con los pasos de ayuda?</p>
            <div class="flex gap-4 mt-3">
                <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse(true)">
                    SI
                </button>
                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse(false)">
                    NO
                </button>
            </div>
        `;

        questionDiv.appendChild(questionSpan);
        chatMessages.appendChild(questionDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async handleResponse(wasSuccessful) {
        try {
            const formData = {
                modulo: this.userModule,
                problema: this.userProblem,
                descripcion: this.userDescription,
                status: wasSuccessful ? 'Autonomo' : 'SIN_ASIGNAR'
            };

            console.log('Enviando datos:', formData); // Debug

            const response = await fetch('/ticketsOT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Respuesta:', data); // Debug

            if (!response.ok) {
                throw new Error(data.message || 'Error en la respuesta del servidor');
            }

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Ticket registrado',
                    text: `La Orden de Trabajo fue creada exitosamente con el folio: ${data.folio}.`,
                    customClass: {
                        title: 'text-black',
                        content: 'text-black',
                        confirmButton: 'border-black',
                    }
                });

                this.appendChatMessage(`<strong>Folio generado:</strong> ${data.folio}`, document.getElementById('chat-messages'));
                this.resetChat();
            } else {
                throw new Error(data.message || 'Error al registrar el ticket');
            }
        } catch (error) {
            console.error('Error completo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error inesperado. Inténtalo de nuevo.',
                customClass: {
                    title: 'text-black',
                    content: 'text-black',
                    confirmButton: 'border-black',
                }
            });
        }
    }

    resetChat() {
        this.userProblem = '';
        this.userDescription = '';
        this.userModule = '';
        window.iaChatStep = 0;
    }

    appendChatMessage(message, chatMessages) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4';
        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        responseSpan.innerHTML = message;
        loadingDiv.appendChild(responseSpan);
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    cleanup() {
        this.activeIntervals.forEach(interval => clearInterval(interval));
        this.activeIntervals = [];
    }
}

// Modificar la inicialización para tener acceso global al chat manager
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
    window.chatManager.init();

    window.addEventListener('beforeunload', () => window.chatManager.cleanup());
});
