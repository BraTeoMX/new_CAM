// Importar la biblioteca de Google AI
import { GoogleGenAI } from '@google/genai';

// Variables globales para garantizar persistencia de datos seleccionados
window.GLOBAL_CHAT_MODULE = null;
window.GLOBAL_CHAT_MACHINE_INDEX = null;
window.GLOBAL_CHAT_PROBLEM = null;

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
class ChatManager {
    constructor() {
        // Estado centralizado
        this.state = {
            ai: null,
            modelName: 'gemini-2.5-pro-exp-03-25',
            userProblem: '',
            userModule: '',
            selectedMachineIndex: null,
            nextResponseHandler: null,
            currentStep: null,
            totalEstimatedIATime: 0, // Tiempo total estimado de los pasos de la IA
            actualStepTimes: {} // Nuevo: Para almacenar el tiempo real pasado en cada paso { stepKey: seconds }
        };

        // Cache de elementos DOM
        this.elements = {
            chatMessages: null,
            messageInput: null,
            form: null
        };

        this.activeIntervals = [];

        // Bind de métodos críticos
        this.handleSubmit = this.handleSubmit.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }

    /**
     * Inicializa elementos DOM frecuentemente usados
     */
    initializeElements() {
        this.elements = {
            chatMessages: document.getElementById('chat-messages'),
            messageInput: document.getElementById('message'),
            form: document.getElementById('chat-form')
        };
    }

    init() {
        try {
            this.initializeElements();

            if (!this.elements.form) {
                throw new Error('Chat form not found');
            }

            const apiKey = this.elements.form.getAttribute('data-gemini-key');
            if (!apiKey) {
                throw new Error('Gemini API key not found');
            }

            this.state.ai = new GoogleGenAI({ apiKey });
            this.setupEventListeners();
            this.startConversation(this.elements.chatMessages);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Error al inicializar el chat');
        }
    }

    /**
     * Manejo centralizado de errores
     */
    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            customClass: { container: 'z-50' }
        });
    }

    async startConversation(chatMessages) {
        const greeting = this.getTimeBasedGreeting();
        await this.appendChatMessage(`${greeting}`, chatMessages);
        await this.askModule(chatMessages);
    }

    setupEventListeners() {
        this.elements.form.addEventListener('submit', this.handleSubmit);

        // Observador para el scroll automático
        const observer = new MutationObserver(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        });
        observer.observe(this.elements.chatMessages, { childList: true, subtree: true });
    }

    isGreeting(message) {
        const normalized = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return GREETINGS.some(greeting => normalized.includes(greeting));
    }

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Hola, buenos días ☀ !';
        if (hour >= 12 && hour < 19) return 'Hola, buenas tardes 🌤 !';
        return 'Hola, buenas noches 🌕!';
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

        try {
            const message = this.elements.messageInput.value.trim();
            if (!message) return;

            // Mostrar mensaje del usuario
            this.elements.chatMessages.innerHTML += `
                <div class="text-right mb-4">
                    <span class="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-[70%]">
                    ${this.escapeHtml(message)}
                    </span>
                </div>`;

            this.elements.messageInput.value = '';

            // Si hay un manejador específico para la siguiente respuesta, usarlo
            if (this.state.nextResponseHandler) {
                const handler = this.state.nextResponseHandler;
                this.state.nextResponseHandler = null;
                await handler(message);
            }
        } catch (error) {
            this.showError('Error al procesar el mensaje');
            console.error(error);
        }
    }

    askModule(chatMessages) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4';
        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        responseSpan.innerHTML = `Por favor selecciona el modulo que se atendera:<br>
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
                                        id: item.Modulo,
                                        text: item.Modulo
                                    };
                                })
                            };
                        }
                    }
                });

                // Evitar mensajes duplicados al cambiar de módulo
                $('#modul').on('select2:select', (e) => {
                    const newModule = e.params.data.text || '';
                    // Si ya hay un módulo seleccionado y el usuario cambia, solo actualiza el valor
                    if (this.state.userModule && this.state.userModule !== newModule) {
                        this.state.userModule = newModule;
                        window.GLOBAL_CHAT_MODULE = newModule;
                        // No mostrar mensajes ni reiniciar flujo
                        return;
                    }
                    // Si es la primera vez, sí mostrar el flujo normal
                    this.state.userModule = newModule;
                    window.GLOBAL_CHAT_MODULE = newModule;
                    window.iaChatStep = 3;
                    this.showMachineSelect();
                });
            }
        }, 100);
        window.iaChatStep = 99; // Esperar selección de módulo
    }

    showMachineSelect() {
        const chatMessages = this.elements.chatMessages;
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
            // Si ya hay una máquina seleccionada y el usuario cambia, solo actualiza el valor
            if (
                typeof this.state.selectedMachineIndex === 'number' &&
                this.state.selectedMachineIndex !== null &&
                this.state.selectedMachineIndex !== idx
            ) {
                this.state.selectedMachineIndex = idx;
                window.GLOBAL_CHAT_MACHINE_INDEX = idx;
                // No mostrar mensajes ni reiniciar flujo
                return;
            }
            // Si es la primera vez, sí mostrar el flujo normal
            this.state.selectedMachineIndex = idx;
            window.GLOBAL_CHAT_MACHINE_INDEX = idx;
            this.askUserProblem(idx);
        });
    }

    async askUserProblem(machineIndex) {
        const chatMessages = this.elements.chatMessages;
        await this.appendChatMessage('Por favor, describe el problema que estás teniendo con la máquina:', chatMessages);

        // Habilitar input para la respuesta
        this.elements.messageInput.disabled = false;
        this.elements.messageInput.focus();

        this.state.selectedMachineIndex = machineIndex;
        window.GLOBAL_CHAT_MACHINE_INDEX = machineIndex; // Guardar globalmente

        // Configurar el manejador para la siguiente respuesta
        this.state.nextResponseHandler = async (message) => {
            this.state.userProblem = message || '';
            window.GLOBAL_CHAT_PROBLEM = this.state.userProblem; // Guardar globalmente

            // Mostrar el resumen antes de los pasos
            await this.showSummary(chatMessages);

            // Continuar con los pasos después de un breve delay
            setTimeout(() => {
                this.showSteps(this.state.selectedMachineIndex);
            }, 1000);
        };
    }

    showSummary(chatMessages) {
        const resumenDiv = document.createElement('div');
        resumenDiv.className = 'text-left mb-4';
        const resumenSpan = document.createElement('span');
        resumenSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        resumenSpan.innerHTML = `<strong>Resumen de la solicitud:</strong><br>
            <b>Módulo:</b> ${this.escapeHtml(this.state.userModule)}<br>
            <b>Máquina:</b> ${this.escapeHtml(MACHINES[this.state.selectedMachineIndex])}<br>
            <b>Problema/Descripción:</b> ${this.escapeHtml(this.state.userProblem)}`;
        resumenDiv.appendChild(resumenSpan);
        chatMessages.appendChild(resumenDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    async showSteps(machineIndex) {
        const chatMessages = this.elements.chatMessages;
        this.cleanup();

        // Deshabilitar input durante los pasos
        this.elements.messageInput.disabled = true;

        await this.appendChatMessage('Por favor sigue estos pasos:', chatMessages);

        // Calcular y almacenar el tiempo total estimado de los pasos que se van a mostrar
        this.state.totalEstimatedIATime = 0;
        STEPS.forEach(step => {
            const minutes = step.times[machineIndex];
            if (minutes !== null) {
                this.state.totalEstimatedIATime += minutes;
            }
        });
        console.log(`Tiempo total estimado de pasos de IA para máquina ${MACHINES[machineIndex]}: ${this.state.totalEstimatedIATime} minutos`);


        const showStepsSequentially = () => {
            let stepIndex = 0;
            const showNextStep = () => {
                if (stepIndex >= STEPS.length) {
                    this.elements.messageInput.disabled = false;
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

        setTimeout(showStepsSequentially, 500);
    }

    async showStep(step, minutes, index, onComplete) {
        const chatMessages = this.elements.chatMessages;
        const stepDivWrapper = document.createElement('div');
        stepDivWrapper.className = 'text-left mb-4';
        const stepDiv = document.createElement('span');
        stepDiv.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%] flex flex-col';

        let tiempoFijo = minutes >= 1 ? `${Math.round(minutes)} min` : `${Math.round(minutes * 60)} seg`;
        let initialSeconds = Math.round(minutes * 60);
        let seconds = initialSeconds;

        stepDiv.innerHTML = `
            <strong>Paso ${index + 1}:</strong> ${step.name}
            <span class="ml-2 text-xs text-gray-500">
                (<span class="timer">${this.formatTime(seconds)}</span> restante | <span class="timer-num">${tiempoFijo}</span>)
            </span>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 next-step-btn">
                Siguiente paso
            </button>`;

        stepDivWrapper.appendChild(stepDiv);
        chatMessages.appendChild(stepDivWrapper);

        // Deshabilitar input
        this.elements.messageInput.disabled = true;

        let completed = false;
        const nextStepBtn = stepDiv.querySelector('.next-step-btn');

        // --- CORRECCIÓN: Inicializa actualStepTimes si es null ---
        if (!this.state.actualStepTimes || typeof this.state.actualStepTimes !== 'object') {
            this.state.actualStepTimes = {};
        }

        const finishStep = () => {
            if (completed) return;
            completed = true;
            clearInterval(this.state.currentStep.interval);
            nextStepBtn.disabled = true;

            // Calcular y almacenar el tiempo real pasado en este paso (en segundos)
            const elapsedSeconds = initialSeconds - seconds;
            // --- CORRECCIÓN: Asegura que this.state.actualStepTimes existe y es objeto ---
            if (!this.state.actualStepTimes) this.state.actualStepTimes = {};
            this.state.actualStepTimes[step.key] = elapsedSeconds;

            console.log(`Paso "${step.name}" completado. Tiempo real: ${elapsedSeconds} segundos.`);

            this.state.currentStep = null;
            onComplete();
        };

        this.state.currentStep = {
            interval: setInterval(() => {
                seconds--;
                stepDiv.querySelector('.timer').textContent = this.formatTime(seconds);
                if (seconds <= 0) {
                    finishStep();
                }
            }, 1000),
            element: stepDiv
        };

        nextStepBtn.addEventListener('click', finishStep);
    }

    clearCurrentStep() {
        if (this.state.currentStep) {
            clearInterval(this.state.currentStep.interval);
            this.state.currentStep.element.querySelector('.next-step-btn').disabled = true;
            this.state.currentStep = null;
        }
    }

    showFinalQuestion() {
        const chatMessages = this.elements.chatMessages;
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
        const chatMessages = this.elements.chatMessages;
        try {
            // Usar los valores globales si los del state están vacíos
            const modulo = this.state.userModule || window.GLOBAL_CHAT_MODULE;
            const problema = this.state.userProblem || window.GLOBAL_CHAT_PROBLEM;
            const selectedMachineIndex =
                (typeof this.state.selectedMachineIndex === 'number' && !isNaN(this.state.selectedMachineIndex))
                ? this.state.selectedMachineIndex
                : window.GLOBAL_CHAT_MACHINE_INDEX;

            console.log('Valores antes de enviar:', {
                modulo,
                problema,
                selectedMachineIndex
            });

            if (
                !modulo ||
                !problema ||
                selectedMachineIndex === null ||
                typeof selectedMachineIndex === 'undefined'
            ) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor, selecciona el módulo, la máquina y describe el problema antes de continuar.'
                });
                return;
            }

              // Calcular el tiempo real total pasado en los pasos (en minutos:segundos)
                let totalActualTimeSeconds = 0;
                for (const stepKey in this.state.actualStepTimes) {
                    if (this.state.actualStepTimes.hasOwnProperty(stepKey)) {
                        totalActualTimeSeconds += this.state.actualStepTimes[stepKey];
                    }
                }
                const tiempo_estimado_ia = this.state.totalEstimatedIATime;
                console.log(`Tiempo estimado de IA: ${tiempo_estimado_ia} minutos`);
                // Formato mm:ss
                const minutos = Math.floor(totalActualTimeSeconds / 60);
                const segundos = totalActualTimeSeconds % 60;
                const tiempo_real_ia = `${minutos}:${segundos.toString().padStart(2, '0')}`;
                console.log(`Incluyendo tiempo real de IA: ${tiempo_real_ia} (mm:ss)`);

            const formData = {
                modulo: modulo,
                problema: problema,
                descripcion: problema,
                status: wasSuccessful ? 'AUTONOMO' : 'SIN_ASIGNAR',
                maquina: MACHINES[selectedMachineIndex], // Enviar el nombre de la máquina seleccionada
                tiempo_estimado_ia: tiempo_estimado_ia,
                tiempo_real_ia: tiempo_real_ia,
            };

            console.log('Enviando datos al backend:', formData);

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

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Ticket registrado',
                    text: wasSuccessful
                        ? `Gracias por haberlo resuelto de forma autónoma.`
                        : `La Orden de Trabajo fue creada exitosamente con el folio: ${data.folio}`,
                    confirmButtonText: 'OK'
                });

                await this.appendChatMessage(`<strong>Folio generado:</strong> ${data.folio}`, chatMessages);
                await this.appendChatMessage(
                    wasSuccessful
                        ? 'Me alegra que se haya podido solucionar el problema.<br>Recuerda que estoy para ayudarte'
                        : 'Se ha generado tu ticket, en breve te atenderá el mecánico.',
                    chatMessages
                );

                setTimeout(() => this.showFinalResetQuestion(chatMessages), 1000);
            } else {
                throw new Error(data.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error en handleResponse:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud'
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
        chatMessages.appendChild(questionDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    handleResetResponse(wantsNewChat) {
        const chatMessages = this.elements.chatMessages;
        // Limpiar el chat y reiniciar siempre
        chatMessages.innerHTML = '';
        this.resetChat();
        // Iniciar nueva conversación mostrando el saludo y el flujo inicial
        this.startConversation(chatMessages);
    }

    resetChat() {
        this.state.userProblem = '';
        this.state.userModule = '';
        this.state.selectedMachineIndex = null;
        this.state.nextResponseHandler = null;
        this.state.totalEstimatedIATime = 0; // Resetear tiempo estimado
        this.state.actualStepTimes = {}; // Resetear tiempos reales
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
        try {
            this.activeIntervals.forEach(interval => clearInterval(interval));
            this.activeIntervals = [];

            // Limpiar estado
            Object.keys(this.state).forEach(key => {
                if (typeof this.state[key] !== 'function') {
                    this.state[key] = null;
                }
            });
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.chatManager = new ChatManager();
        window.chatManager.init();
    } catch (error) {
        console.error('Fatal initialization error:', error);
    }
});
