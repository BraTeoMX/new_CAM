// Importar la biblioteca de Google AI
import { GoogleGenAI } from '@google/genai';

// Variables globales para garantizar persistencia de datos seleccionados
window.GLOBAL_CHAT_MODULE = null;
window.GLOBAL_CHAT_MACHINE_INDEX = null;
window.GLOBAL_CHAT_PROBLEM = null;
window.GLOBAL_OPERARIO = undefined; // Nueva variable global para operario
window.GLOBAL_CHAT_PROBLEM_ID = null; // NUEVA variable global para el ID del problema

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

        this.state = {
            userProblem: '',
            selectedProblemId: null, // NUEVO: Para almacenar el ID del problema
            userModule: '',
            // ... resto de propiedades
        };
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
        // PRIMERO: Saludo con avatar y animación
        const greeting = this.getTimeBasedGreeting();
        await this.appendChatMessage(`${greeting}`, chatMessages);
        // LUEGO: Pregunta de acción con botones, como mensaje del asistente
        await this.appendActionMessage(chatMessages);
    }

    // NUEVO: Mensaje de acción con botones, usando el formato del asistente
    async appendActionMessage(chatMessages) {
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
            document.getElementById('btn-crear-ticket').onclick = async() => {
                // Limpia el chat y sigue el flujo normal
                chatMessages.innerHTML = '';
                const greeting = this.getTimeBasedGreeting();
                await this.appendChatMessage(`${greeting}`, chatMessages);
                await this.askModule(chatMessages);
            };
            document.getElementById('btn-seguimiento-ticket').onclick = async() => {
                // Limpia el chat y muestra el select de módulos
                chatMessages.innerHTML = '';
                await this.askModuloSeguimiento(chatMessages);
            };
        }, 100);
    }

    // NUEVO: Pregunta de módulo para seguimiento
    async askModuloSeguimiento(chatMessages) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-left mb-4';
        const responseSpan = document.createElement('span');
        responseSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        responseSpan.innerHTML = `¿A qué módulo quieres dar seguimiento 🧐? <br><select id="modulo-seguimiento" style="width:100%"></select>`;
        loadingDiv.appendChild(responseSpan);
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            if (window.$ && $('#modulo-seguimiento').length) {
                $('#modulo-seguimiento').select2({
                    placeholder: 'Selecciona un módulo',
                    ajax: {
                        url: '/obtener-modulos',
                        type: 'GET',
                        dataType: 'json',
                        delay: 250,
                        data: function(params) {
                            return { search: params.term || '' };
                        },
                        processResults: function(data, params) {
                            let results = $.map(data, function(item) {
                                return { id: item.Modulo, text: item.Modulo };
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
                $('#modulo-seguimiento').on('select2:select', (e) => {
                    const modulo = e.params.data.text;
                    // Mostrar spinner/modal
                    Swal.fire({
                        title: 'Espera',
                        text: 'Estamos procesando tu petición',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });
                    // Redirigir con el módulo como query param
                    setTimeout(() => {
                        window.location.href = `http://128.150.102.40:8020/FollowOT?modulo=${encodeURIComponent(modulo)}`;
                    }, 1200);
                });
            }
        }, 100);
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
        responseSpan.innerHTML = `Por favor selecciona area o modulo que se atendera:<br>
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
                        data: function(params) {
                            return {
                                search: params.term || ''
                            };
                        },
                        processResults: function(data, params) {
                            let results = $.map(data, function(item) {
                                return {
                                    id: item.Modulo,
                                    text: item.Modulo
                                };
                            });
                            // Filtrar en frontend si hay término de búsqueda y el backend no filtra
                            if (params.term && params.term.length > 0) {
                                const term = params.term.toLowerCase();
                                results = results.filter(r => r.text.toLowerCase().includes(term));
                            }
                            return { results };
                        }
                    },
                    // Eliminar minimumInputLength para mostrar opciones al abrir
                    minimumResultsForSearch: 0 // muestra el buscador siempre
                });

                // Abrir el dropdown automáticamente al hacer focus
                $('#modul').on('select2:open', function() {
                    $('.select2-search__field').focus();
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
                        data: function(params) {
                            // Enviar el término de búsqueda y el módulo
                            return {
                                modulo: modulo,
                                search: params.term || ''
                            };
                        },
                        processResults: function(data, params) {
                            let results = $.map(data, function(item) {
                                return {
                                    id: item.NumOperario,
                                    text: `${item.Nombre} - ${item.NumOperario}`
                                };
                            });
                            // Filtrar en frontend si hay término de búsqueda y el backend no filtra
                            if (params.term && params.term.length > 0) {
                                const term = params.term.toLowerCase();
                                results = results.filter(r => r.text.toLowerCase().includes(term));
                            }
                            return { results };
                        }
                    },
                    minimumResultsForSearch: 0 // muestra el buscador siempre
                });

                // Abrir el dropdown automáticamente al hacer focus
                $('#operario-select').on('select2:open', function() {
                    $('.select2-search__field').focus();
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
        this.state.selectedMachineIndex = machineIndex;
        window.GLOBAL_CHAT_MACHINE_INDEX = machineIndex;

        // Crear y mostrar el mensaje con el contenedor del select
        const problemDiv = document.createElement('div');
        problemDiv.className = 'text-left mb-4';
        const problemSpan = document.createElement('span');
        problemSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';
        problemSpan.innerHTML = `Excelente. Ahora, por favor, selecciona el problema:<br>
                                <select id="problema-select" style="width:100%; margin-top: 8px;"></select>`;
        problemDiv.appendChild(problemSpan);
        chatMessages.appendChild(problemDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Deshabilitar el input de texto, ya que no se usará
        this.elements.messageInput.disabled = true;

        // Inicializar Select2
        setTimeout(() => {
            if (window.$ && $('#problema-select').length) {
                $('#problema-select').select2({
                    placeholder: 'Busca o selecciona un problema',
                    ajax: {
                        url: '/catalogo-problemas', // TU RUTA DEL BACKEND
                        type: 'GET',
                        dataType: 'json',
                        delay: 250,
                        processResults: function(data) {
                            // Mapea la respuesta del backend al formato que Select2 espera
                            const results = $.map(data, function(item) {
                                return {
                                    id: item.id,
                                    text: item.nombre, // El texto que se mostrará en las opciones
                                    pasos: item.pasos 
                                };
                            });
                            return { results };
                        },
                        cache: true
                    },
                    minimumResultsForSearch: 0
                });

                // Manejar la selección del usuario
                $('#problema-select').on('select2:select', async (e) => {
                    const selectedProblem = e.params.data; // Ahora contiene {id, text, pasos}

                    // --- Guardar la información del problema seleccionado (esto es común para ambos flujos) ---
                    this.state.selectedProblemId = selectedProblem.id;
                    this.state.userProblem = selectedProblem.text;
                    window.GLOBAL_CHAT_PROBLEM_ID = selectedProblem.id;
                    window.GLOBAL_CHAT_PROBLEM = selectedProblem.text;
                    
                    // Mostramos el resumen en ambos casos para que el usuario vea su selección.
                    await this.showSummary(chatMessages);

                    // --- ¡NUEVO! Aquí está la lógica condicional ---
                    if (selectedProblem.pasos == '0') {
                        // ---- FLUJO SIN PASOS DE AYUDA ----
                        console.log('Problema sin pasos de ayuda. Generando ticket directamente.');

                        // Añadimos un pequeño delay para que el usuario pueda leer el resumen
                        setTimeout(() => {
                            // Llamamos a handleResponse con 'false', simulando que el usuario presionó "NO"
                            // Esto generará un ticket con estado 'SIN_ASIGNAR'.
                            this.handleResponse(false); 
                        }, 1500); // 1.5 segundos de espera

                    } else {
                        // ---- FLUJO NORMAL (CON PASOS DE AYUDA) ----
                        console.log('Problema con pasos de ayuda. Mostrando guía.');
                        
                        // Continuamos con la secuencia original de mostrar los pasos.
                        setTimeout(() => {
                            this.showSteps(this.state.selectedMachineIndex);
                        }, 1000); // 1 segundo de espera
                    }
                });
            }
        }, 100);
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
            <div class="flex flex-col sm:flex-row w-full gap-4 mt-3">
                <button class=" w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse(true)">
                    SI
                </button>
                <button class=" w-full sm:w-auto bg-orange-400 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse(false)">
                    NO
                </button>
                <button class=" w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onclick="window.chatManager.handleResponse('CANCELADO')">
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
                (typeof this.state.selectedMachineIndex === 'number' && !isNaN(this.state.selectedMachineIndex)) ?
                this.state.selectedMachineIndex :
                window.GLOBAL_CHAT_MACHINE_INDEX;

            console.log('Valores antes de enviar:', {
                modulo,
                problema,
                selectedMachineIndex
            });

            if (!modulo ||
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
                problema_id: this.state.selectedProblemId || window.GLOBAL_CHAT_PROBLEM_ID, // <-- LÍNEA AÑADIDA
                status: statusToSend,
                maquina: MACHINES[selectedMachineIndex],
                tiempo_estimado_ia: tiempo_estimado_ia,
                tiempo_real_ia: tiempo_real_ia,
                Operario: operarioNumero,
                NombreOperario: operarioNombre
            };

            console.log('Enviando datos al backend:', formData);

            // --- Mostrar modal spinner centrado antes de enviar ---
            let modalSpinner = document.createElement('div');
            modalSpinner.id = 'modal-chat-loading-spinner';
            modalSpinner.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
            modalSpinner.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col items-center px-8 py-6">
                    <svg aria-hidden="true" class="w-12 h-12 mb-3 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    <span class="text-lg font-semibold text-gray-700 dark:text-gray-100">Cargando...</span>
                </div>
            `;
            document.body.appendChild(modalSpinner);

            const response = await fetch('/ticketsOT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(formData)
            });

            // --- Remover modal spinner después de la petición ---
            if (modalSpinner && modalSpinner.parentNode) {
                modalSpinner.parentNode.removeChild(modalSpinner);
            }

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

                    // Esperar 2 segundos y luego recargar la página
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } else if (statusToSend === 'CANCELADO') {
                    await this.appendChatMessage(
                        triggeredByTimeout ?
                        'Por inactividad se ha cancelado tu ticket.<br>Que lastima que hayas cancelado 😥 , recuerda que estoy para ayudarte' :
                        'Que lastima que hayas cancelado 😥 , recuerda que estoy para ayudarte',
                        chatMessages
                    );
                }

                setTimeout(() => this.showFinalResetQuestion(chatMessages), 1000);
            } else {
                throw new Error(data.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            // --- Remover modal spinner si hay error ---
            const modalSpinner = document.getElementById('modal-chat-loading-spinner');
            if (modalSpinner && modalSpinner.parentNode) {
                modalSpinner.parentNode.removeChild(modalSpinner);
            }
            console.error('Error en handleResponse:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar la solicitud'
            });
        }
    } 

    // Mostrar pregunta final con ambos botones y flujos correctos
    async showFinalResetQuestion(chatMessages) {
        // Mostrar animación de escribiendo
        await this.showTypingIndicator(chatMessages);

        // Crear el contenedor del mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-3';

        // Avatar del asistente
        messageDiv.innerHTML = `
            <div class="relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                <img class="w-20 h-20 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500"
                     src="/images/Avatar.webp"
                     alt="AI Avatar">
            </div>
            <div>
                <div class="bg-gray-100 dark:bg-gray-700 dark:text-white p-3 rounded-lg mb-2">
                    <strong>¿Qué es lo que deseas hacer ahora?</strong>
                    <div class="flex flex-col sm:flex-row w-full gap-2 mt-3">
                        <button id="btn-crear-ticket-final" class="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">Crear ticket</button>
                        <button id="btn-seguimiento-ticket-final" class="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">Dar seguimiento a un ticket</button>
                    </div>
                </div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Botón "Crear ticket"
        messageDiv.querySelector('#btn-crear-ticket-final').onclick = async() => {
            // Limpiar el chat y reiniciar el flujo
            chatMessages.innerHTML = '';
            this.selectedModulo = null;
            this.selectedOperario = null;
            this.selectedProblema = null;
            this.selectedMaquina = null;
            this.selectedClase = null;
            this.selectedNumeroMaquina = null;
            this.selectedCausa = null;
            this.selectedAccion = null;
            this.selectedComentarios = null;
            this.ticketFolio = null;
            await this.startConversation(chatMessages);
        };

        // Botón "Dar seguimiento a un ticket"
        messageDiv.querySelector('#btn-seguimiento-ticket-final').onclick = async() => {
            // Preguntar el módulo y redirigir
            await this.askModuloForSeguimiento(chatMessages);
        };
    }

    // Nueva función para preguntar el módulo y redirigir
    async askModuloForSeguimiento(chatMessages) {
        await this.showTypingIndicator(chatMessages);

        // Crear el mensaje con el select de módulos
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-3';
        messageDiv.innerHTML = `
            <div class="relative w-20 h-20 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 flex-shrink-0">
                <img class="w-20 h-20 p-1 rounded-full ring-2 ring-blue-300 dark:ring-blue-500"
                     src="/images/Avatar.webp"
                     alt="AI Avatar">
            </div>
            <div>
                <div class="bg-gray-100 dark:bg-gray-700 dark:text-white p-3 rounded-lg mb-2">
                    <strong>¿A qué módulo quieres dar seguimiento 🧐?</strong>
                    <br>
                    <select id="modulo-seguimiento" class="mt-2 w-full rounded border-gray-300 dark:bg-gray-700 dark:text-white"></select>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Llenar el select con los módulos
        const select = messageDiv.querySelector('#modulo-seguimiento');
        try {
            const res = await axios.get('/obtener-modulos');
            res.data.forEach(mod => {
                let value = mod.Modulo || mod.moduleid || mod.MODULEID || mod.value || mod;
                let text = mod.Modulo || mod.moduleid || mod.MODULEID || mod.value || mod;
                if (value && text) {
                    let option = document.createElement('option');
                    option.value = value;
                    option.textContent = text;
                    select.appendChild(option);
                }
            });
        } catch (e) {
            let option = document.createElement('option');
            option.value = '';
            option.textContent = 'Error al cargar módulos';
            select.appendChild(option);
        }

        // Al seleccionar un módulo, mostrar spinner y redirigir
        select.onchange = () => {
            if (select.value) {
                Swal.fire({
                    title: 'Espera',
                    text: 'Estamos procesando tu petición...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                window.location.href = `http://128.150.102.40:8020/FollowOT?modulo=${encodeURIComponent(select.value)}`;
            }
        };
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
        this.state.selectedProblemId = null; // NUEVO: Resetear el ID del problema
        this.state.nextResponseHandler = null;
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
