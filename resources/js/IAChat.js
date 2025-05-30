// Importar la biblioteca de Google AI
import { GoogleGenAI } from '@google/genai';

// Variables globales para garantizar persistencia de datos seleccionados
window.GLOBAL_CHAT_MODULE = null;
window.GLOBAL_CHAT_MACHINE_INDEX = null;
window.GLOBAL_CHAT_PROBLEM = null;
window.GLOBAL_OPERARIO = undefined; // Nueva variable global para operario

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
            <select id="modul" style="width:100%"></select>
            <div id="operario-select-container" class="mt-4"></div>`;
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
                        // Mostrar el select de operarios actualizado
                        this.showOperarioSelect(newModule);
                        return;
                    }
                    // Si es la primera vez, sí mostrar el flujo normal
                    this.state.userModule = newModule;
                    window.GLOBAL_CHAT_MODULE = newModule;
                    window.iaChatStep = 3;
                    // Mostrar el select de operarios antes de continuar
                    this.showOperarioSelect(newModule);
                });
            }
        }, 100);
        window.iaChatStep = 99; // Esperar selección de módulo
    }

    /**
     * Muestra el select2 de operarios según el módulo seleccionado
     */
    showOperarioSelect(modulo) {
        // Limpiar contenedor
        const container = document.getElementById('operario-select-container');
        if (!container) return;
        container.innerHTML = `<label class="block mb-2">Selecciona el operario:</label>
            <select id="operario-select" style="width:100%"></select>`;

        setTimeout(() => {
            if (window.$ && $('#operario-select').length) {
                $('#operario-select').select2({
                    placeholder: 'Selecciona un operario',
                    ajax: {
                        url: '/obtener-operarios',
                        type: 'GET',
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return { modulo: modulo };
                        },
                        processResults: function (data) {
                            return {
                                results: $.map(data, function (item) {
                                    return {
                                        id: item.NumOperario,
                                        text: `${item.Nombre} - ${item.NumOperario}`
                                    };
                                })
                            };
                        }
                    }
                });

                $('#operario-select').on('select2:select', (e) => {
                    const operarioId = e.params.data.id;
                    const operarioText = e.params.data.text;
                    // Guardar operario seleccionado en el state si lo necesitas
                    this.state.selectedOperario = { id: operarioId, text: operarioText };
                    // --- Guardar globalmente nombre y número de operario ---
                    const parts = operarioText.split(' - ');
                    window.GLOBAL_OPERARIO = {
                        nombre: parts[0] || '',
                        numero: parts[1] || ''
                    };
                    // Continuar flujo normal
                    this.showMachineSelect();
                });
            }
        }, 100);
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
        // --- Separar nombre y número de operario ---
        let operarioNombre = '';
        let operarioNumero = '';
        if (this.state.selectedOperario && this.state.selectedOperario.text) {
            const parts = this.state.selectedOperario.text.split(' - ');
            operarioNombre = parts[0] || '';
            operarioNumero = parts[1] || '';
        }
        resumenSpan.innerHTML = `<strong>Resumen de la solicitud:</strong><br>
            <b>Módulo:</b> ${this.escapeHtml(this.state.userModule)}<br>
            <b>Operario:</b> ${this.escapeHtml(operarioNumero)}<br>
            <b>Nombre:</b> ${this.escapeHtml(operarioNombre)}<br>
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

        // --- Nuevo: Timer de 1 minuto ---
        let timerSeconds = 60;
        let timerInterval;
        let timerDiv = document.createElement('div');
        timerDiv.className = 'text-center text-xs font-bold text-red-600 mt-2';
        timerDiv.innerHTML = `Tiempo para responder: <span id="final-question-timer">01:00</span>`;

        // Función para actualizar el timer visual
        function updateTimerDisplay() {
            const min = Math.floor(timerSeconds / 60);
            const sec = timerSeconds % 60;
            timerDiv.querySelector('#final-question-timer').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }

        // --- Botones ---
        questionSpan.innerHTML = `
            <p>¿Pudiste resolver el problema, con los pasos de ayuda?</p>
            <div class="flex gap-4 mt-3">
                <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse(true)">
                    SI
                </button>
                <button class="bg-orange-400 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse(false)">
                    NO
                </button>
                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse('CANCELADO')">
                    Cancelar ticket
                </button>
            </div>
        `;

        // --- Agregar el timer visual ---
        questionSpan.appendChild(timerDiv);

        questionDiv.appendChild(questionSpan);
        chatMessages.appendChild(questionDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // --- Iniciar el timer de 1 minuto ---
        updateTimerDisplay();
        let timerExpired = false;
        this.finalQuestionTimerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                clearInterval(this.finalQuestionTimerInterval);
                timerExpired = true;
                // Sumar 60 segundos al tiempo real de IA
                if (!this.state.actualStepTimes) this.state.actualStepTimes = {};
                this.state.actualStepTimes['final_wait'] = 60;
                // Enviar automáticamente como CANCELADO
                this.handleResponse('CANCELADO', true); // true = triggeredByTimeout
            }
        }, 1000);

        // Guardar referencia para limpiar si el usuario responde antes
        this.finalQuestionTimerActive = true;
    }

    async handleResponse(wasSuccessful, triggeredByTimeout = false) {
        // Limpiar el timer si está activo
        if (this.finalQuestionTimerActive && this.finalQuestionTimerInterval) {
            clearInterval(this.finalQuestionTimerInterval);
            this.finalQuestionTimerActive = false;
        }

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
            const minutos = Math.floor(totalActualTimeSeconds / 60);
            const segundos = totalActualTimeSeconds % 60;
            const tiempo_real_ia = `${minutos}:${segundos.toString().padStart(2, '0')}`;

            // Determinar status a enviar
            let statusToSend;
            if (wasSuccessful === true) {
                statusToSend = 'AUTONOMO';
            } else if (wasSuccessful === false) {
                statusToSend = 'SIN_ASIGNAR';
            } else if (wasSuccessful === 'CANCELADO') {
                statusToSend = 'CANCELADO';
            }

            // --- Separar nombre y número de operario para enviar en el formData ---
            let operarioNombre = '';
            let operarioNumero = '';
            if (this.state.selectedOperario && this.state.selectedOperario.text) {
                const parts = this.state.selectedOperario.text.split(' - ');
                operarioNombre = parts[0] || '';
                operarioNumero = parts[1] || '';
            }
            // Si no hay valores locales, usar los globales
            if ((!operarioNombre || !operarioNumero) && window.GLOBAL_OPERARIO) {
                operarioNombre = window.GLOBAL_OPERARIO.nombre || '';
                operarioNumero = window.GLOBAL_OPERARIO.numero || '';
            }

            const formData = {
                modulo: modulo,
                problema: problema,
                descripcion: problema,
                status: statusToSend,
                maquina: MACHINES[selectedMachineIndex],
                tiempo_estimado_ia: tiempo_estimado_ia,
                tiempo_real_ia: tiempo_real_ia,
                Operario: operarioNumero,
                NombreOperario: operarioNombre
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
                // Determinar icono, título y texto según status
                let swalIcon = 'success';
                let swalTitle = '';
                let swalText = '';
                if (statusToSend === 'AUTONOMO') {
                    swalIcon = 'success';
                    swalTitle = 'Excelente trabajo';
                    swalText = 'Gracias por haberlo resuelto de forma autónoma.';
                } else if (statusToSend === 'SIN_ASIGNAR') {
                    swalIcon = 'success';
                    swalTitle = 'Ticket registrado';
                    swalText = `La Orden de Trabajo fue creada exitosamente con el folio: ${data.folio}`;
                } else if (statusToSend === 'CANCELADO') {
                    swalIcon = 'warning';
                    swalTitle = 'El ticket fue cancelado';
                    swalText = triggeredByTimeout ? 'Por inactividad se ha cancelado tu ticket' : '';
                }

                await Swal.fire({
                    icon: swalIcon,
                    title: swalTitle,
                    text: swalText,
                    confirmButtonText: 'OK'
                });

                // Mensajes en el chat según status
                if (statusToSend === 'AUTONOMO') {
                    await this.appendChatMessage(
                        'Me alegra 😃 que se haya podido solucionar el problema.<br>Recuerda que estoy para ayudarte 🤖',
                        chatMessages
                    );
                } else if (statusToSend === 'SIN_ASIGNAR') {
                    await this.appendChatMessage(`<strong>Folio generado:</strong> ${data.folio}`, chatMessages);
                    await this.appendChatMessage(
                        'Se ha generado tu ticket, en breve te atenderá el mecánico.',
                        chatMessages
                    );
                } else if (statusToSend === 'CANCELADO') {
                    await this.appendChatMessage(
                        triggeredByTimeout
                            ? 'Por inactividad se ha cancelado tu ticket.<br>Que lastima que hayas cancelado 😥 , recuerda que estoy para ayudarte'
                            : 'Que lastima que hayas cancelado 😥 , recuerda que estoy para ayudarte',
                        chatMessages
                    );
                }

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
        this.state.selectedOperario = {}; // Mejor que string vacío si esperas un objeto
        this.state.selectedMachineIndex = null;
        this.state.nextResponseHandler = null;
        this.state.totalEstimatedIATime = 0; // Resetear tiempo estimado
        this.state.actualStepTimes = {}; // Resetear tiempos reales
        window.iaChatStep = 0;
        window.GLOBAL_OPERARIO = undefined; // Limpiar variable global al resetear
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
