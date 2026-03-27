/**
 * Gestor principal del chat V3 refactorizado
 */
import { chatState } from './state.js';
import { chatAPI } from './api.js';
import { chatUI } from './ui.js';
import { getTimeBasedGreeting, convertirATiempoEnSegundos, formatTime } from './utils.js';
import { MACHINES, STEPS } from './constants.js';

export class ChatManager {
    constructor() {
        this.state = chatState;
        this.api = chatAPI;
        this.ui = chatUI;
        this.sessionKeepAliveInterval = null;
        this.finalQuestionTimerInterval = null;
        this.finalQuestionTimerActive = false;
    }

    disableSelect(selector) {
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!element) return;
        element.disabled = true;
        if (window.$ && $(element).data('select2')) {
            $(element).prop('disabled', true).trigger('change.select2');
        }
    }

    async init() {
        try {
            this.ui.initializeElements();
            await this.startConversation();
            this.startSessionKeepAlive();
        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.showError('Error al inicializar el chat');
        }
    }

    async startConversation() {
        const greeting = getTimeBasedGreeting();
        await this.ui.appendChatMessage(`${greeting}`, this.ui.elements.chatMessages);
        this.ui.appendActionMessage(
            this.ui.elements.chatMessages,
            () => this.handleCreateTicket(),
            () => this.handleFollowTicket()
        );
    }

    async handleCreateTicket() {
        this.ui.elements.chatMessages.innerHTML = '';
        const greeting = getTimeBasedGreeting();
        await this.ui.appendChatMessage(`${greeting}`, this.ui.elements.chatMessages);
        await this.askModule();
    }

    async handleFollowTicket() {
        this.ui.elements.chatMessages.innerHTML = '';
        await this.askModuleForFollowup();
    }

    askModule() {
        this.ui.showModuleSelect(this.ui.elements.chatMessages, (selectedData) => {
            this.handleModuleSelection(selectedData);
        });
    }

    handleModuleSelection(selectedData) {
        const newModule = selectedData.text;
        const moduleType = selectedData.type;

        this.disableSelect('#modul');

        this.state.update({
            userModule: newModule,
            moduleType: moduleType,
            modulePlanta: selectedData.planta,
            nombreSupervisor: selectedData.nombre_supervisor,
            numeroSupervisor: selectedData.numero_empleado_supervisor
        });

        if (moduleType === 'supervisor') {
            this.showOperarioSelect(newModule);
        } else if (moduleType === 'catalogo') {
            this.showMachineSelectForCatalogModule(newModule);
        } else {
            this.ui.showError('Tipo de módulo desconocido. Contacte a soporte.');
        }
    }

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

    showOperarioSelect(modulo) {
        const container = document.getElementById('operario-select-container');
        if (!container) return;

        container.innerHTML = `<label class="block mb-2">Selecciona el operario:</label>
            <select id="operario-select" style="width:100%"></select>`;

        setTimeout(() => {
            if (window.$ && $('#operario-select').length) {
                $('#operario-select').select2({
                    placeholder: 'Selecciona un operario',
                    ajax: {
                        url: '/FormGuestV3/obtener-operarios', // IMPORTANTE: V3 API
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
                                    // Adaptación V3: Usa los nombres snake_case de la tabla operarios_locales
                                    id: item.num_operario,
                                    text: `${item.nombre} - ${item.num_operario}`
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
                    this.disableSelect('#operario-select');
                    this.state.set('selectedOperario', { id: operarioId, text: operarioText });
                    this.showMachineSelect();
                });
            }
        }, 100);
    }

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

    setupMachineSelectListener() {
        const select = document.getElementById('machine-select');
        if (!select) return;

        select.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            if (isNaN(idx)) return;
            this.disableSelect('#machine-select');
            this.state.set('selectedMachineIndex', idx);
            this.askUserProblem(idx);
        });
    }

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
                this.disableSelect('#problema-select');
                this.state.set('selectedProblemId', selectedProblem.id);
                this.state.set('userProblem', selectedProblem.text);

                await this.ui.showSummary(chatMessages, this.state.getSummary());

                if (selectedProblem.pasos == '0') {
                    console.log('Problema sin pasos de ayuda. Generando ticket directamente.');
                    setTimeout(() => { this.handleResponse(false); }, 1500);
                } else {
                    console.log('Problema con pasos de ayuda. Mostrando guía.');
                    setTimeout(() => { this.showSteps(this.state.get('selectedMachineIndex')); }, 1000);
                }
            });

        } catch (error) {
            console.error("No se pudo inicializar el selector de problemas:", error);
        }
    }

    async showSteps(machineIndex) {
        this.ui.cleanup();
        await this.ui.appendChatMessage('Por favor sigue estos pasos:', this.ui.elements.chatMessages);

        let totalEstimatedIATime = 0;
        STEPS.forEach(step => {
            const minutes = step.times[machineIndex];
            if (minutes !== null) {
                totalEstimatedIATime += Math.round(minutes * 60);
            }
        });
        this.state.set('totalEstimatedIATime', totalEstimatedIATime);

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

        setTimeout(showStepsSequentially, 500);
    }

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
        chatMessages.scrollTop = chatMessages.scrollHeight;

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
                <button class=" w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" data-response="yes">SI</button>
                <button class=" w-full sm:w-auto bg-orange-400 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded" data-response="no">NO</button>
                <button class=" w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-response="cancel">Cancelar ticket</button>
            </div>
        `;

        questionSpan.appendChild(timerDiv);
        questionDiv.appendChild(questionSpan);
        chatMessages.appendChild(questionDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const yesBtn = questionDiv.querySelector('[data-response="yes"]');
        const noBtn = questionDiv.querySelector('[data-response="no"]');
        const cancelBtn = questionDiv.querySelector('[data-response="cancel"]');

        if (yesBtn) yesBtn.addEventListener('click', () => this.handleResponse(true));
        if (noBtn) noBtn.addEventListener('click', () => this.handleResponse(false));
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.handleResponse('3'));

        updateTimerDisplay();
        this.finalQuestionTimerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                clearInterval(this.finalQuestionTimerInterval);
                const actualStepTimes = this.state.get('actualStepTimes') || {};
                actualStepTimes['final_wait'] = 60;
                this.state.set('actualStepTimes', actualStepTimes);
                this.handleResponse('3', true);
            }
        }, 1000);

        this.finalQuestionTimerActive = true;
    }

    async handleResponse(wasSuccessful, triggeredByTimeout = false) {
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

            const machineToSend = this.state.get('selectedMachineIndex') === "N/A" ?
                "N/A" : MACHINES[this.state.get('selectedMachineIndex')];

            const problemIdToSend = this.state.get('selectedProblemId');

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

            let modalSpinner = document.createElement('div');
            modalSpinner.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
            modalSpinner.innerHTML = `<div class="bg-white rounded p-4">Enviando ticket...</div>`;
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
                    swalText = 'Gracias por resolverlo de forma autónoma.';
                } else if (statusToSend === '2') {
                    swalIcon = 'success';
                    swalTitle = 'Ticket registrado';
                    swalText = `La Orden fue creada exitosamente: ${data.folio}`;
                } else if (statusToSend === '3') {
                    swalIcon = 'warning';
                    swalTitle = 'Cancelado';
                    swalText = triggeredByTimeout ? 'Cancelado por inactividad' : '';
                }

                await Swal.fire({ icon: swalIcon, title: swalTitle, text: swalText, confirmButtonText: 'OK' });

                if (statusToSend === '1') {
                    await this.ui.appendChatMessage('Me alegra que se solucionara.', chatMessages);
                } else if (statusToSend === '2') {
                    await this.ui.appendChatMessage(`<strong>Folio:</strong> ${data.folio}`, chatMessages);
                    // IMPORTANTE: Redireccionando a /FollowOTV2 para seguir flujos existentes (V3 Follow no existe aún)
                    window.location.href = `/FollowOTV2?modulo=${encodeURIComponent(this.state.get('userModule'))}`;
                } else if (statusToSend === '3') {
                    await this.ui.appendChatMessage('Que lástima, espero ayudarte luego.', chatMessages);
                }

                setTimeout(() => this.showFinalResetQuestion(chatMessages), 1000);
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
            }
        } catch (error) {
            console.error('Error in response processing:', error);
            this.ui.showError('Hubo un error.');
        }
    }

    async showFinalResetQuestion(chatMessages) {
        await this.ui.showTypingIndicator(chatMessages);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-3';
        messageDiv.innerHTML = `
            <div class="relative w-20 h-20 bg-gray-100 rounded-full flex-shrink-0"><img class="w-20 h-20 rounded-full" src="/images/Avatar.webp"></div>
            <div class="bg-gray-100 p-3 rounded-lg mb-2">
                <strong>¿Deseas algo más?</strong>
                <div class="flex gap-2 mt-3">
                    <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded" id="btn-restart">Regresar</button>
                    <button class="bg-green-500 text-white font-bold py-2 px-4 rounded" id="btn-follow">Seguimiento</button>
                </div>
            </div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        messageDiv.querySelector('#btn-restart').onclick = async () => {
            chatMessages.innerHTML = '';
            this.state.reset();
            await this.startConversation(chatMessages);
        };
        messageDiv.querySelector('#btn-follow').onclick = async () => { await this.askModuleForFollowup(); };
    }

    async askModuleForFollowup() {
        await this.ui.showTypingIndicator(this.ui.elements.chatMessages);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'text-left mb-4 flex items-start gap-3';
        messageDiv.innerHTML = `
            <div class="relative w-20 h-20 bg-gray-100 rounded-full flex-shrink-0"><img class="w-20 h-20" src="/images/Avatar.webp"></div>
            <div class="bg-gray-100 p-3 rounded-lg mb-2">
                <strong>¿A qué módulo darás seguimiento?</strong>
                <select id="modulo-seguimiento" style="width:100%"></select>
            </div>`;
        this.ui.elements.chatMessages.appendChild(messageDiv);
        this.ui.elements.chatMessages.scrollTop = this.ui.elements.chatMessages.scrollHeight;

        setTimeout(() => {
            if (window.$ && $('#modulo-seguimiento').length) {
                $('#modulo-seguimiento').select2({
                    placeholder: 'Selecciona un módulo',
                    ajax: {
                        url: '/FormGuestV3/obtenerAreasModulosSeguimiento',
                        type: 'GET',
                        dataType: 'json',
                        delay: 250,
                        data: function (params) { return { search: params.term || '' }; },
                        processResults: function (data, params) {
                            let results = $.map(data, function (item) { return { id: item.modulo, text: item.modulo }; });
                            if (params.term && params.term.length > 0) {
                                results = results.filter(r => r.text.toLowerCase().includes(params.term.toLowerCase()));
                            }
                            return { results };
                        }
                    },
                    minimumResultsForSearch: 0
                });
                $('#modulo-seguimiento').on('select2:select', (e) => {
                    const modulo = e.params.data.text;
                    this.disableSelect('#modulo-seguimiento');
                    Swal.fire({ title: 'Cargando', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                    setTimeout(() => {
                        window.location.href = `/FollowOTV2?modulo=${encodeURIComponent(modulo)}`;
                    }, 500);
                });
            }
        }, 100);
    }

    setupEventListeners() {}

    startSessionKeepAlive() {
        if (this.sessionKeepAliveInterval) clearInterval(this.sessionKeepAliveInterval);
        this.sessionKeepAliveInterval = setInterval(() => {
            this.api.refreshCsrfToken().catch(error => console.error(error));
        }, 120000);
    }

    cleanup() {
        this.ui.cleanup();
        if (this.sessionKeepAliveInterval) clearInterval(this.sessionKeepAliveInterval);
    }
}

export const chatManager = new ChatManager();
