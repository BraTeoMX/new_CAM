/**
 * Gestor principal del chat refactorizado
 * Coordina los módulos separados para mantener la funcionalidad original
 * con mejor organización y mantenibilidad
 */
import { chatState } from './state.js';
import { chatAPI } from './api.js';
import { chatUI } from './ui.js';
import { getTimeBasedGreeting, convertirATiempoEnSegundos } from './utils.js';
import { MACHINES, STEPS } from './constants.js';

export class ChatManager {
    constructor() {
        // Referencias a módulos
        this.state = chatState;
        this.api = chatAPI;
        this.ui = chatUI;

        // Temporizadores
        this.sessionKeepAliveInterval = null;
        this.finalQuestionTimerInterval = null;
        this.finalQuestionTimerActive = false;
    }

    /**
     * Inicializa el chat
     */
    async init() {
        try {
            this.ui.initializeElements();

            // El formulario está oculto, no necesitamos verificarlo
            // this.setupEventListeners(); // No necesitamos event listeners del formulario oculto
            await this.startConversation();
            this.startSessionKeepAlive();
        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.showError('Error al inicializar el chat');
        }
    }

    /**
     * Inicia la conversación mostrando el saludo y opciones iniciales
     */
    async startConversation() {
        // Saludo con avatar y animación
        const greeting = getTimeBasedGreeting();
        await this.ui.appendChatMessage(`${greeting}`, this.ui.elements.chatMessages);

        // Pregunta de acción con botones
        this.ui.appendActionMessage(
            this.ui.elements.chatMessages,
            () => this.handleCreateTicket(),
            () => this.handleFollowTicket()
        );
    }

    /**
     * Maneja la selección de crear ticket
     */
    async handleCreateTicket() {
        // Limpiar el chat y reiniciar flujo
        this.ui.elements.chatMessages.innerHTML = '';
        const greeting = getTimeBasedGreeting();
        await this.ui.appendChatMessage(`${greeting}`, this.ui.elements.chatMessages);
        await this.askModule();
    }

    /**
     * Maneja la selección de seguimiento de ticket
     */
    async handleFollowTicket() {
        // Limpiar el chat y mostrar select de módulos para seguimiento
        this.ui.elements.chatMessages.innerHTML = '';
        await this.askModuleForFollowup();
    }

    /**
     * Pregunta por el módulo al usuario
     */
    askModule() {
        this.ui.showModuleSelect(this.ui.elements.chatMessages, (selectedData) => {
            this.handleModuleSelection(selectedData);
        });
    }

    /**
     * Maneja la selección de un módulo
     */
    handleModuleSelection(selectedData) {
        const newModule = selectedData.text;
        const moduleType = selectedData.type;

        // Actualizar estado
        this.state.update({
            userModule: newModule,
            moduleType: moduleType,
            modulePlanta: selectedData.planta,
            nombreSupervisor: selectedData.nombre_supervisor,
            numeroSupervisor: selectedData.numero_empleado_supervisor
        });

        // Decidir siguiente paso basado en tipo de módulo
        if (moduleType === 'supervisor') {
            this.showOperarioSelect(newModule);
        } else if (moduleType === 'catalogo') {
            this.showMachineSelectForCatalogModule(newModule);
        } else {
            this.ui.showError('Tipo de módulo desconocido. Contacte a soporte.');
        }
    }

    /**
     * Muestra selección de máquina para módulos de catálogo
     */
    async showMachineSelectForCatalogModule(moduleName) {
        await this.ui.appendChatMessage(
            `Excelente, has seleccionado el área "${moduleName}". Como este es un tema de área general, se levantará una orden de trabajo directamente.`,
            this.ui.elements.chatMessages
        );

        this.state.set('userProblem', "Envío directo a mecatrónico para área general.");
        this.state.set('selectedMachineIndex', "N/A");

        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.handleResponse(false);
    }

    /**
     * Muestra el selector de operarios
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
                        url: '/FormGuestV2/obtener-operarios',
                        type: 'GET',
                        dataType: 'json',
                        delay: 250,
                        data: function (params) {
                            return {
                                modulo: modulo,
                                search: params.term || ''
                            };
                        },
                        processResults: function (data, params) {
                            let results = $.map(data, function (item) {
                                return {
                                    id: item.NumOperario,
                                    text: `${item.Nombre} - ${item.NumOperario}`
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

                $('#operario-select').on('select2:open', function () {
                    $('.select2-search__field').focus();
                });

                $('#operario-select').on('select2:select', (e) => {
                    const operarioId = e.params.data.id;
                    const operarioText = e.params.data.text;

                    this.state.set('selectedOperario', { id: operarioId, text: operarioText });
                    this.showMachineSelect();
                });
            }
        }, 100);
    }

    /**
     * Muestra el selector de máquinas
     */
    showMachineSelect() {
        const chatMessages = this.ui.elements.chatMessages;
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

    /**
     * Configura el listener para la selección de máquina
     */
    setupMachineSelectListener() {
        const select = document.getElementById('machine-select');
        if (!select) return;

        select.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            if (isNaN(idx)) return;

            this.state.set('selectedMachineIndex', idx);
            this.askUserProblem(idx);
        });
    }

    /**
     * Pregunta por el problema del usuario
     */
    async askUserProblem(machineIndex) {
        const chatMessages = this.ui.elements.chatMessages;
        const problemDiv = document.createElement('div');
        problemDiv.className = 'text-left mb-4';
        const problemSpan = document.createElement('span');
        problemSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        problemSpan.innerHTML = `Excelente. Ahora, por favor, selecciona el problema:<br>
                            <select id="problema-select" style="width:100%; margin-top: 8px;">
                                    <option></option>
                            </select>`;

        problemDiv.appendChild(problemSpan);
        chatMessages.appendChild(problemDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // El input se mantiene habilitado para permitir interacción del usuario

        try {
            const catalogoCompleto = await this.api.getProblemCatalog();

            const datosParaSelect2 = $.map(catalogoCompleto, function (item) {
                return {
                    id: item.id,
                    text: item.nombre,
                    pasos: item.pasos
                };
            });

            $('#problema-select').select2({
                placeholder: 'Busca o selecciona un problema',
                data: datosParaSelect2,
                allowClear: true,
                minimumResultsForSearch: 0
            });

            $('#problema-select').on('select2:select', async (e) => {
                const selectedProblem = e.params.data;
                if (!selectedProblem.id) return;

                this.state.set('selectedProblemId', selectedProblem.id);
                this.state.set('userProblem', selectedProblem.text);

                await this.ui.showSummary(chatMessages, this.state.getSummary());

                if (selectedProblem.pasos == '0') {
                    console.log('Problema sin pasos de ayuda. Generando ticket directamente.');
                    setTimeout(() => {
                        this.handleResponse(false);
                    }, 1500);
                } else {
                    console.log('Problema con pasos de ayuda. Mostrando guía.');
                    setTimeout(() => {
                        this.showSteps(this.state.get('selectedMachineIndex'));
                    }, 1000);
                }
            });

        } catch (error) {
            console.error("No se pudo inicializar el selector de problemas:", error);
        }
    }

    /**
     * Muestra los pasos de resolución automática
     */
    async showSteps(machineIndex) {
        this.ui.cleanup();

        // El input se mantiene habilitado para permitir interacción del usuario

        await this.ui.appendChatMessage('Por favor sigue estos pasos:', this.ui.elements.chatMessages);

        // Calcular tiempo total estimado
        let totalEstimatedIATime = 0;
        STEPS.forEach(step => {
            const minutes = step.times[machineIndex];
            if (minutes !== null) {
                totalEstimatedIATime += Math.round(minutes * 60);
            }
        });
        this.state.set('totalEstimatedIATime', totalEstimatedIATime);

        console.log(`Tiempo total estimado de pasos de IA para máquina ${MACHINES[machineIndex]}: ${totalEstimatedIATime} segundos`);

        const showStepsSequentially = () => {
            let stepIndex = 0;
            const showNextStep = () => {
                if (stepIndex >= STEPS.length) {
                    // El input está oculto, no necesitamos habilitarlo
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

    /**
     * Muestra un paso individual con temporizador
     */
    async showStep(step, minutes, index, onComplete) {
        const chatMessages = this.ui.elements.chatMessages;
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
                (<span class="timer">${formatTime(seconds)}</span> restante | <span class="timer-num">${tiempoFijo}</span>)
            </span>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 next-step-btn">
                Siguiente paso
            </button>`;

        stepDivWrapper.appendChild(stepDiv);
        chatMessages.appendChild(stepDivWrapper);

        // El input se mantiene habilitado para permitir interacción del usuario

        let completed = false;
        const nextStepBtn = stepDiv.querySelector('.next-step-btn');

        const finishStep = () => {
            if (completed) return;
            completed = true;
            clearInterval(this.state.get('currentStep')?.interval);
            nextStepBtn.disabled = true;

            const elapsedSeconds = initialSeconds - seconds;
            const actualStepTimes = this.state.get('actualStepTimes') || {};
            actualStepTimes[step.key] = elapsedSeconds;
            this.state.set('actualStepTimes', actualStepTimes);

            console.log(`Paso "${step.name}" completado. Tiempo real: ${elapsedSeconds} segundos.`);

            this.state.set('currentStep', null);
            onComplete();
        };

        this.state.set('currentStep', {
            interval: setInterval(() => {
                seconds--;
                stepDiv.querySelector('.timer').textContent = formatTime(seconds);
                if (seconds <= 0) {
                    finishStep();
                }
            }, 1000),
            element: stepDiv
        });

        nextStepBtn.addEventListener('click', finishStep);
    }

    /**
     * Muestra la pregunta final sobre resolución del problema
     */
    showFinalQuestion() {
        const chatMessages = this.ui.elements.chatMessages;
        const questionDiv = document.createElement('div');
        questionDiv.className = 'text-left mb-4';
        const questionSpan = document.createElement('span');
        questionSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        let timerSeconds = 60;
        let timerDiv = document.createElement('div');
        timerDiv.className = 'text-center text-xs font-bold text-red-600 mt-2';
        timerDiv.innerHTML = `Tiempo para responder: <span id="final-question-timer">01:00</span>`;

        function updateTimerDisplay() {
            const min = Math.floor(timerSeconds / 60);
            const sec = timerSeconds % 60;
            timerDiv.querySelector('#final-question-timer').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        }

        questionSpan.innerHTML = `
            <p>¿Pudiste resolver el problema, con los pasos de ayuda?</p>
            <div class="flex flex-col sm:flex-row w-full gap-4 mt-3">
                <button class=" w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" data-response="yes">
                    SI
                </button>
                <button class=" w-full sm:w-auto bg-orange-400 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded" data-response="no">
                    NO
                </button>
                <button class=" w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-response="cancel">
                    Cancelar ticket
                </button>
            </div>
        `;

        questionSpan.appendChild(timerDiv);
        questionDiv.appendChild(questionSpan);
        chatMessages.appendChild(questionDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Agregar event listeners a los botones
        const yesBtn = questionDiv.querySelector('[data-response="yes"]');
        const noBtn = questionDiv.querySelector('[data-response="no"]');
        const cancelBtn = questionDiv.querySelector('[data-response="cancel"]');

        if (yesBtn) yesBtn.addEventListener('click', () => this.handleResponse(true));
        if (noBtn) noBtn.addEventListener('click', () => this.handleResponse(false));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.handleResponse('3'));

        updateTimerDisplay();
        let timerExpired = false;
        this.finalQuestionTimerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                clearInterval(this.finalQuestionTimerInterval);
                timerExpired = true;
                const actualStepTimes = this.state.get('actualStepTimes') || {};
                actualStepTimes['final_wait'] = 60;
                this.state.set('actualStepTimes', actualStepTimes);
                this.handleResponse('3', true);
            }
        }, 1000);

        this.finalQuestionTimerActive = true;
    }

    /**
     * Maneja la respuesta del usuario sobre resolución del problema
     */
    async handleResponse(wasSuccessful, triggeredByTimeout = false) {
        // Limpiar timer si está activo
        if (this.finalQuestionTimerActive && this.finalQuestionTimerInterval) {
            clearInterval(this.finalQuestionTimerInterval);
            this.finalQuestionTimerActive = false;
        }

        const chatMessages = this.ui.elements.chatMessages;

        try {
            if (!this.state.isValidForSubmission()) {
                this.ui.showError('Por favor, selecciona el módulo, la máquina y describe el problema antes de continuar.');
                return;
            }

            // Preparar datos para envío
            const machineToSend = this.state.get('selectedMachineIndex') === "N/A" ?
                "N/A" : MACHINES[this.state.get('selectedMachineIndex')];

            const problemIdToSend = this.state.get('selectedProblemId');

            // Calcular tiempos
            let totalActualTimeSeconds = 0;
            const actualStepTimes = this.state.get('actualStepTimes') || {};
            for (const stepKey in actualStepTimes) {
                if (actualStepTimes.hasOwnProperty(stepKey)) {
                    totalActualTimeSeconds += actualStepTimes[stepKey];
                }
            }
            const tiempo_estimado_ia = this.state.get('totalEstimatedIATime');
            const minutos = Math.floor(totalActualTimeSeconds / 60);
            const segundos = totalActualTimeSeconds % 60;
            const tiempo_real_ia = convertirATiempoEnSegundos(`${minutos}:${segundos}`);

            let statusToSend;
            if (wasSuccessful === true) statusToSend = '1';
            else if (wasSuccessful === false) statusToSend = '2';
            else if (wasSuccessful === '3') statusToSend = '3';

            // Preparar datos del operario
            let operarioNombre = '';
            let operarioNumero = '';
            const selectedOperario = this.state.get('selectedOperario');
            if (selectedOperario && selectedOperario.text) {
                const parts = selectedOperario.text.split(' - ');
                operarioNombre = parts[0] || '';
                operarioNumero = parts[1] || '';
            }
            if ((!operarioNombre || !operarioNumero) && window.GLOBAL_OPERARIO) {
                operarioNombre = window.GLOBAL_OPERARIO.nombre || '';
                operarioNumero = window.GLOBAL_OPERARIO.numero || '';
            }

            const formData = {
                modulo: this.state.get('userModule'),
                planta: this.state.get('modulePlanta') || "1",
                nombre_supervisor: this.state.get('nombreSupervisor') || 'N/A',
                numero_empleado_supervisor: this.state.get('numeroSupervisor') || 'N/A',
                nombre_operario: operarioNombre,
                numero_empleado_operario: operarioNumero,
                problema: this.state.get('userProblem'),
                descripcion: this.state.get('userProblem'),
                problema_id: problemIdToSend,
                status: statusToSend,
                maquina: machineToSend,
                tiempo_estimado_ia: tiempo_estimado_ia,
                tiempo_real_ia: tiempo_real_ia,
                Operario: operarioNumero,
                NombreOperario: operarioNombre
            };

            console.log('Enviando datos al backend:', formData);

            // Mostrar spinner
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

            const data = await this.api.submitTicket(formData);

            if (modalSpinner && modalSpinner.parentNode) {
                modalSpinner.parentNode.removeChild(modalSpinner);
            }

            if (data.success) {
                let swalIcon = 'success';
                let swalTitle = '';
                let swalText = '';
                if (statusToSend === '1') {
                    swalIcon = 'success';
                    swalTitle = 'Excelente trabajo';
                    swalText = 'Gracias por haberlo resuelto de forma autónoma.';
                } else if (statusToSend === '2') {
                    swalIcon = 'success';
                    swalTitle = 'Ticket registrado';
                    swalText = `La Orden de Trabajo fue creada exitosamente con el folio: ${data.folio}`;
                } else if (statusToSend === '3') {
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

                if (statusToSend === '1') {
                    await this.ui.appendChatMessage(
                        'Me alegra 😃 que se haya podido solucionar el problema.<br>Recuerda que estoy para ayudarte 🤖',
                        chatMessages
                    );
                } else if (statusToSend === '2') {
                    await this.ui.appendChatMessage(`<strong>Folio generado:</strong> ${data.folio}`, chatMessages);
                    await this.ui.appendChatMessage(
                        'Se ha generado tu ticket, en breve te atenderá el mecánico.',
                        chatMessages
                    );
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } else if (statusToSend === '3') {
                    await this.ui.appendChatMessage(
                        triggeredByTimeout ?
                            'Por inactividad se ha cancelado tu ticket.<br>Que lastima que hayas cancelado 😥 , recuerda que estoy para ayudarte' :
                            'Que lastima que hayas cancelado 😥 , recuerda que estoy para ayudarte',
                        chatMessages
                    );
                }

                setTimeout(() => this.showFinalResetQuestion(chatMessages), 1000);
            } else {
                let errorTitle = 'Error al procesar';
                let errorMessage = data.message || 'Hubo un error desconocido al registrar el ticket.';
                let errorFooter = '';

                if (data.errors) {
                    errorTitle = 'Error de Validación';
                    errorMessage = 'Por favor, revisa los datos enviados.';
                    const errorList = Object.values(data.errors).flat().join('<br>');
                    errorFooter = `<div style="text-align:left; font-family:monospace; font-size:12px;">${errorList}</div>`;
                }

                console.error('Error desde el backend:', data);
                Swal.fire({
                    icon: 'error',
                    title: errorTitle,
                    html: errorMessage,
                    footer: errorFooter,
                    confirmButtonText: 'Entendido'
                });
            }
        } catch (error) {
            const modalSpinner = document.getElementById('modal-chat-loading-spinner');
            if (modalSpinner && modalSpinner.parentNode) {
                modalSpinner.parentNode.removeChild(modalSpinner);
            }
            console.error('Error en handleResponse:', error);
            this.ui.showError('Hubo un error al procesar la solicitud');
        }
    }

    /**
     * Muestra la pregunta final para resetear o continuar
     */
    async showFinalResetQuestion(chatMessages) {
        await this.ui.showTypingIndicator(chatMessages);

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

        messageDiv.querySelector('#btn-crear-ticket-final').onclick = async () => {
            chatMessages.innerHTML = '';
            this.state.reset();
            await this.startConversation(chatMessages);
        };

        messageDiv.querySelector('#btn-seguimiento-ticket-final').onclick = async () => {
            await this.askModuleForFollowup();
        };
    }

    /**
     * Pregunta módulo para seguimiento
     */
    async askModuleForFollowup() {
        await this.ui.showTypingIndicator(this.ui.elements.chatMessages);

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
        this.ui.elements.chatMessages.appendChild(messageDiv);
        this.ui.elements.chatMessages.scrollTop = this.ui.elements.chatMessages.scrollHeight;

        const select = messageDiv.querySelector('#modulo-seguimiento');
        try {
            const res = await this.api.getModulesForFollowup();
            res.forEach(mod => {
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
                window.location.href = `FollowOT?modulo=${encodeURIComponent(select.value)}`;
            }
        };
    }

    /**
     * Configura los listeners de eventos
     * Nota: El formulario está oculto, no necesitamos event listeners para input/button
     */
    setupEventListeners() {
        // Observador para scroll automático del chat
        const observer = new MutationObserver(() => {
            if (this.ui.elements.chatMessages) {
                this.ui.elements.chatMessages.scrollTop = this.ui.elements.chatMessages.scrollHeight;
            }
        });
        observer.observe(this.ui.elements.chatMessages, { childList: true, subtree: true });
    }

    /**
     * Función handleSubmit eliminada - no se necesita para formulario oculto
     * El chat funciona únicamente con el flujo guiado de botones y selectores
     */

    /**
     * Inicia el mecanismo de keep-alive de sesión
     */
    startSessionKeepAlive() {
        if (this.sessionKeepAliveInterval) {
            clearInterval(this.sessionKeepAliveInterval);
        }

        this.sessionKeepAliveInterval = setInterval(() => {
            console.log('Refrescando token CSRF para evitar conflictos...');
            this.api.refreshCsrfToken().catch(error =>
                console.error('Error al refrescar sesión:', error)
            );
        }, 120000); // Cada 2 minutos
    }

    /**
     * Limpia recursos
     */
    cleanup() {
        this.ui.cleanup();
        if (this.sessionKeepAliveInterval) {
            clearInterval(this.sessionKeepAliveInterval);
        }
    }
}

// Instancia singleton
export const chatManager = new ChatManager();