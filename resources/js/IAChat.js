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

    async showTypingIndicator(chatMessages) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4 flex items-start gap-2';

        // Agregar avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0';
        avatarDiv.innerHTML = `
            <img class="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
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

    async appendChatMessage(message, chatMessages) {
        await this.showTypingIndicator(chatMessages);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-2';

        // Agregar avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0';
        avatarDiv.innerHTML = `
            <img class="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
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

    async handleSubmit(e) {
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
                    await this.appendChatMessage(`${greeting}, ¿en qué puedo ayudarte?`, chatMessages);
                    await this.askProblem(chatMessages);
                } else {
                    await this.askProblem(chatMessages);
                }
                break;
            case 1:
                this.userProblem = message;
                await this.askDescription(chatMessages);
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

    async askProblem(chatMessages) {
        await this.showTypingIndicator(chatMessages);
        this.appendChatMessage('Antes de continuar por favor ayudame con los siguientes datos por favor...<br><strong>Ingresa que problema tienes:</strong>', chatMessages);
        window.iaChatStep = 1;
    }

    async askDescription(chatMessages) {
        await this.showTypingIndicator(chatMessages);
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

    async showSteps(machineIndex) {
        const chatMessages = document.getElementById('chat-messages');
        this.cleanup();

        // Primero mostrar el mensaje y esperar a que termine
        await this.appendChatMessage('Gracias por favor sigue estos pasos antes de que escalemos con la generacion de un ticket de atención', chatMessages);

        // Función para mostrar los pasos secuencialmente
        const showStepsSequentially = () => {
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
        };

        // Empezar a mostrar los pasos después de un pequeño delay
        setTimeout(showStepsSequentially, 500);
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
        const chatMessages = document.getElementById('chat-messages');
        try {
            const formData = {
                modulo: this.userModule,
                problema: this.userProblem,
                descripcion: this.userDescription,
                status: wasSuccessful ? 'Autonomo' : 'SIN_ASIGNAR'
            };

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

            if (!response.ok) {
                throw new Error(data.message || 'Error en la respuesta del servidor');
            }

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Ticket registrado',
                    text: wasSuccessful
                        ? `Gracias por haberlo resulto de forma autonoma, se igual manera se hara llegar una notificacion como historial que hubo una posible falla, folio: ${data.folio}`
                        : `La Orden de Trabajo fue creada exitosamente con el folio: ${data.folio}.`,
                    confirmButtonText: 'OK',
                    buttonsStyling: true,
                    customClass: {
                        confirmButton: 'swal2-confirm'
                    }
                });

                await this.appendChatMessage(`<strong>Folio generado:</strong> ${data.folio}`, chatMessages);

                const message = wasSuccessful
                    ? 'Gracias me alegra mucho que se haya podido solucionar el problema.<br>Recuerda que estoy para ayudarte'
                    : 'Gracias hemos estamos generando tu ticket de atención, en breve te atenderá el mecánico a cargo de tu sector, que tengas un excelente día';

                await this.appendChatMessage(message, chatMessages);

                // Agregar la pregunta final después de un breve delay
                setTimeout(() => this.showFinalResetQuestion(chatMessages), 1000);
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

    showFinalResetQuestion(chatMessages) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'text-left mb-4';
        const questionSpan = document.createElement('span');
        questionSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        questionSpan.innerHTML = `
            <p>¿Quieres generar una nueva asistencia?</p>
            <div class="flex gap-4 mt-3">
                <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResetResponse(true)">
                    SI
                </button>
                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResetResponse(false)">
                    NO
                </button>
            </div>
        `;

        questionDiv.appendChild(questionSpan);
        chatMessages.appendChild(questionSpan);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    handleResetResponse(wantsNewChat) {
        const chatMessages = document.getElementById('chat-messages');
        if (wantsNewChat) {
            // Limpiar el chat y reiniciar
            chatMessages.innerHTML = '';
            this.resetChat();
            // Iniciar nueva conversación mostrando el saludo
            this.appendChatMessage(`${this.getTimeBasedGreeting()}, ¿en qué puedo ayudarte?`, chatMessages);
        } else {
            // Mostrar mensaje de despedida y limpiar
            this.appendChatMessage('Gracias por usar nuestro servicio. ¡Hasta pronto!', chatMessages)
                .then(() => {
                    setTimeout(() => {
                        chatMessages.innerHTML = '';
                        this.resetChat();
                    }, 2000);
                });
        }
    }

    resetChat() {
        this.userProblem = '';
        this.userDescription = '';
        this.userModule = '';
        window.iaChatStep = 0;
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
