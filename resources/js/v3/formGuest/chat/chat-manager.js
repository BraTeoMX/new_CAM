/**
 * Gestor principal del chat V3 refactorizado.
 */
import { chatState, FLOW_STEPS } from './state.js';
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
        this.workflowTimers = new Set();
        this.finalQuestionTimerActive = false;
        this.silentSelectRollback = false;
    }

    setManagedTimeout(callback, delay) {
        const timer = setTimeout(() => {
            this.workflowTimers.delete(timer);
            callback();
        }, delay);
        this.workflowTimers.add(timer);
        return timer;
    }

    setManagedInterval(callback, delay) {
        const timer = setInterval(callback, delay);
        this.workflowTimers.add(timer);
        return timer;
    }

    clearManagedTimer(timer) {
        if (!timer) return;
        clearTimeout(timer);
        clearInterval(timer);
        this.workflowTimers.delete(timer);
    }

    clearWorkflowTimers() {
        this.workflowTimers.forEach((timer) => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.workflowTimers.clear();
        this.finalQuestionTimerActive = false;
        this.state.set('currentStep', null);
    }

    async init() {
        try {
            this.ui.initializeElements();
            await this.startConversation();
            this.startSessionKeepAlive();
            window.addEventListener('beforeunload', () => this.cleanup());
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
        this.clearWorkflowTimers();
        this.ui.elements.chatMessages.innerHTML = '';
        this.ui.cleanup();
        this.state.reset();

        const greeting = getTimeBasedGreeting();
        await this.ui.appendChatMessage(`${greeting}`, this.ui.elements.chatMessages);
        await this.askModule();
    }

    async handleFollowTicket() {
        this.clearWorkflowTimers();
        this.ui.elements.chatMessages.innerHTML = '';
        await this.askModuleForFollowup();
    }

    async askModule() {
        try {
            const modules = await this.api.getModules();
            this.ui.showModuleSelect(this.ui.elements.chatMessages, modules, (selectedData) => {
                this.handleModuleSelection(selectedData);
            });
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    async confirmDestructiveChange(stepLabel) {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Cambiar esta seleccion?',
            text: `Cambiar ${stepLabel} reiniciara los pasos posteriores ya respondidos.`,
            showCancelButton: true,
            confirmButtonText: 'Si, cambiar',
            cancelButtonText: 'No, conservar',
            reverseButtons: true
        });

        return result.isConfirmed;
    }

    restoreSelectValue(selector, value) {
        this.silentSelectRollback = true;
        $(selector).val(value || null).trigger('change.select2');
        this.silentSelectRollback = false;
    }

    async handleModuleSelection(selectedData) {
        if (this.silentSelectRollback || this.state.get('isSubmitting')) return;

        const previousModule = this.state.get('userModule');
        const newModule = selectedData.text;
        if (previousModule === newModule) return;

        if (previousModule && this.state.hasProgressAfter('module')) {
            const confirmed = await this.confirmDestructiveChange('el area o modulo');
            if (!confirmed) {
                this.restoreSelectValue('#modul', previousModule);
                return;
            }

            this.clearWorkflowTimers();
            this.ui.removeFlowAfter(FLOW_STEPS.module, FLOW_STEPS);
            document.getElementById('operario-select-container')?.replaceChildren();
            this.state.resetAfter('module');
        }

        this.state.update({
            userModule: newModule,
            moduleType: selectedData.type,
            modulePlanta: selectedData.planta,
            nombreSupervisor: selectedData.nombre_supervisor,
            numeroSupervisor: selectedData.numero_empleado_supervisor
        });
        this.state.markStep('module');

        if (selectedData.type === 'supervisor') {
            await this.showOperarioSelect(newModule);
        } else if (selectedData.type === 'catalogo') {
            await this.showMachineSelectForCatalogModule(newModule);
        } else {
            this.ui.showError('Tipo de modulo desconocido. Contacte a soporte.');
        }
    }

    async showMachineSelectForCatalogModule(moduleName) {
        await this.ui.appendChatMessage(
            `Excelente, has seleccionado el area "${moduleName}". Como este es un tema de area general, se levantara una orden de trabajo directamente.`,
            this.ui.elements.chatMessages,
            'machine'
        );

        this.clearWorkflowTimers();
        this.state.set('userProblem', 'Envio directo a mecatronico para area general.');
        this.state.set('selectedMachineIndex', 'N/A');
        this.state.markStep('machine');
        this.state.markStep('problem');

        this.setManagedTimeout(() => { this.handleResponse(false); }, 1000);
    }

    async showOperarioSelect(modulo) {
        const container = document.getElementById('operario-select-container');
        if (!container) return;

        container.innerHTML = `<label class="block mb-2">Selecciona el operario:</label>
            <select id="operario-select" style="width:100%"><option></option></select>`;

        try {
            const operators = await this.api.getOperators(modulo);

            $('#operario-select').select2({
                placeholder: 'Selecciona un operario',
                data: operators.map((item) => ({
                    id: item.num_operario,
                    text: `${item.nombre} - ${item.num_operario}`
                })),
                minimumResultsForSearch: 0
            });

            $('#operario-select').on('select2:open', function () {
                $('.select2-search__field').focus();
            });

            $('#operario-select').on('select2:select', (event) => {
                this.handleOperatorSelection(event.params.data);
            });
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    handleOperatorSelection(selectedData) {
        if (this.silentSelectRollback || this.state.get('isSubmitting')) return;

        const previousOperario = this.state.get('selectedOperario');
        const isFirstSelection = !previousOperario;

        this.state.set('selectedOperario', { id: selectedData.id, text: selectedData.text });
        this.state.markStep('operator');
        this.ui.updateSummary(this.state.getSummary());

        if (isFirstSelection) {
            this.showMachineSelect();
        }
    }

    showMachineSelect() {
        if (document.getElementById('machine-select')) return;

        const chatMessages = this.ui.elements.chatMessages;
        const machineDiv = document.createElement('div');
        machineDiv.className = 'text-left mb-4';
        machineDiv.dataset.flowStep = 'machine';
        const machineSpan = document.createElement('span');
        machineSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        let selectHtml = `<label class="block mb-2">Por favor selecciona el tipo de maquina:</label>
        <select id="machine-select" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
            <option value="">Selecciona una maquina</option>`;
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

        select.addEventListener('change', async (event) => {
            if (this.silentSelectRollback || this.state.get('isSubmitting')) return;

            const idx = parseInt(event.target.value, 10);
            if (Number.isNaN(idx)) return;

            const previousMachine = this.state.get('selectedMachineIndex');
            if (previousMachine === idx) return;

            if (previousMachine !== null && previousMachine !== undefined && this.state.hasProgressAfter('machine')) {
                const confirmed = await this.confirmDestructiveChange('la maquina');
                if (!confirmed) {
                    select.value = previousMachine;
                    return;
                }

                this.clearWorkflowTimers();
                this.ui.removeFlowAfter(FLOW_STEPS.machine, FLOW_STEPS);
                this.state.resetAfter('machine');
            }

            this.state.set('selectedMachineIndex', idx);
            this.state.markStep('machine');
            this.ui.updateSummary(this.state.getSummary());

            if (!this.state.get('selectedProblemId')) {
                await this.askUserProblem(idx);
            }
        });
    }

    async askUserProblem(machineIndex) {
        if (document.getElementById('problema-select')) return;

        const chatMessages = this.ui.elements.chatMessages;
        const problemDiv = document.createElement('div');
        problemDiv.className = 'text-left mb-4';
        problemDiv.dataset.flowStep = 'problem';
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

            $('#problema-select').on('select2:select', async (event) => {
                await this.handleProblemSelection(event.params.data, machineIndex);
            });
        } catch (error) {
            console.error('No se pudo inicializar el selector de problemas:', error);
            this.ui.showError(error.message);
        }
    }

    async handleProblemSelection(selectedProblem) {
        if (this.silentSelectRollback || this.state.get('isSubmitting') || !selectedProblem.id) return;

        const previousProblemId = this.state.get('selectedProblemId');
        if (String(previousProblemId) === String(selectedProblem.id)) return;

        if (previousProblemId && this.state.hasProgressAfter('problem')) {
            const confirmed = await this.confirmDestructiveChange('el problema');
            if (!confirmed) {
                this.restoreSelectValue('#problema-select', previousProblemId);
                return;
            }

            this.clearWorkflowTimers();
            this.ui.removeFlowAfter(FLOW_STEPS.problem, FLOW_STEPS);
            this.state.resetAfter('problem');
        }

        this.state.set('selectedProblemId', selectedProblem.id);
        this.state.set('userProblem', selectedProblem.text);
        this.state.set('selectedProblemNeedsSteps', selectedProblem.pasos !== '0');
        this.state.markStep('problem');
        this.ui.updateSummary(this.state.getSummary());

        await this.ui.showSummary(this.ui.elements.chatMessages, this.state.getSummary());
        this.state.markStep('summary');

        if (selectedProblem.pasos == '0') {
            console.log('Problema sin pasos de ayuda. Generando ticket directamente.');
            this.setManagedTimeout(() => { this.handleResponse(false); }, 1500);
        } else {
            console.log('Problema con pasos de ayuda. Mostrando guia.');
            this.setManagedTimeout(() => {
                this.showSteps(this.state.get('selectedMachineIndex'));
            }, 1000);
        }
    }

    async showSteps(machineIndex) {
        await this.ui.appendChatMessage('Por favor sigue estos pasos:', this.ui.elements.chatMessages, 'assistance');

        let totalEstimatedIATime = 0;
        STEPS.forEach((step) => {
            const minutes = step.times[machineIndex];
            if (minutes !== null) {
                totalEstimatedIATime += Math.round(minutes * 60);
            }
        });
        this.state.set('totalEstimatedIATime', totalEstimatedIATime);
        this.state.markStep('assistance');

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

        this.setManagedTimeout(showNextStep, 500);
    }

    showStep(step, minutes, index, onComplete) {
        const chatMessages = this.ui.elements.chatMessages;
        const stepDivWrapper = document.createElement('div');
        stepDivWrapper.className = 'text-left mb-4';
        stepDivWrapper.dataset.flowStep = 'assistance';
        const stepDiv = document.createElement('span');
        stepDiv.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%] flex flex-col';

        const fixedTime = minutes >= 1 ? `${Math.round(minutes)} min` : `${Math.round(minutes * 60)} seg`;
        const initialSeconds = Math.round(minutes * 60);
        let seconds = initialSeconds;

        stepDiv.innerHTML = `
            <strong>Paso ${index + 1}:</strong> ${step.name}
            <span class="ml-2 text-xs text-gray-500">
                (<span class="timer">${formatTime(seconds)}</span> restante | <span class="timer-num">${fixedTime}</span>)
            </span>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 next-step-btn">
                Siguiente paso
            </button>`;

        stepDivWrapper.appendChild(stepDiv);
        chatMessages.appendChild(stepDivWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        let completed = false;
        const nextStepBtn = stepDiv.querySelector('.next-step-btn');
        let interval = null;

        const finishStep = () => {
            if (completed) return;
            completed = true;
            this.clearManagedTimer(interval);
            nextStepBtn.disabled = true;

            const elapsedSeconds = initialSeconds - seconds;
            const actualStepTimes = this.state.get('actualStepTimes') || {};
            actualStepTimes[step.key] = Math.max(elapsedSeconds, 0);
            this.state.set('actualStepTimes', actualStepTimes);
            this.state.set('currentStep', null);
            onComplete();
        };

        interval = this.setManagedInterval(() => {
            seconds--;
            const timerElement = stepDiv.querySelector('.timer');
            if (timerElement) {
                timerElement.textContent = formatTime(Math.max(seconds, 0));
            }

            if (seconds <= 0) {
                finishStep();
            }
        }, 1000);

        this.state.set('currentStep', { interval, element: stepDiv });
        nextStepBtn.addEventListener('click', finishStep, { once: true });
    }

    showFinalQuestion() {
        const chatMessages = this.ui.elements.chatMessages;
        const questionDiv = document.createElement('div');
        questionDiv.className = 'text-left mb-4';
        questionDiv.dataset.flowStep = 'final';
        const questionSpan = document.createElement('span');
        questionSpan.className = 'bg-gray-200 dark:bg-gray-700 dark:text-white p-3 rounded-lg inline-block max-w-[70%]';

        let timerSeconds = 60;
        const timerDiv = document.createElement('div');
        timerDiv.className = 'text-center text-xs font-bold text-red-600 mt-2';
        timerDiv.innerHTML = `Tiempo para responder: <span id="final-question-timer">01:00</span>`;

        const updateTimerDisplay = () => {
            const min = Math.floor(timerSeconds / 60);
            const sec = timerSeconds % 60;
            timerDiv.querySelector('#final-question-timer').textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        };

        questionSpan.innerHTML = `
            <p>Pudiste resolver el problema con los pasos de ayuda?</p>
            <div class="flex flex-col sm:flex-row w-full gap-4 mt-3">
                <button class="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" data-response="yes">SI</button>
                <button class="w-full sm:w-auto bg-orange-400 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded" data-response="no">NO</button>
                <button class="w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" data-response="cancel">Cancelar ticket</button>
            </div>
        `;

        questionSpan.appendChild(timerDiv);
        questionDiv.appendChild(questionSpan);
        chatMessages.appendChild(questionDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        questionDiv.querySelector('[data-response="yes"]')?.addEventListener('click', () => this.handleResponse(true), { once: true });
        questionDiv.querySelector('[data-response="no"]')?.addEventListener('click', () => this.handleResponse(false), { once: true });
        questionDiv.querySelector('[data-response="cancel"]')?.addEventListener('click', () => this.handleResponse('3'), { once: true });

        updateTimerDisplay();
        const interval = this.setManagedInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                this.clearManagedTimer(interval);
                const actualStepTimes = this.state.get('actualStepTimes') || {};
                actualStepTimes.final_wait = 60;
                this.state.set('actualStepTimes', actualStepTimes);
                this.handleResponse('3', true);
            }
        }, 1000);

        this.finalQuestionTimerActive = true;
        this.state.markStep('final');
    }

    async handleResponse(wasSuccessful, triggeredByTimeout = false) {
        this.clearWorkflowTimers();
        this.state.set('isSubmitting', true);

        const chatMessages = this.ui.elements.chatMessages;
        let modalSpinner = null;

        try {
            if (!this.state.isValidForSubmission()) {
                this.state.set('isSubmitting', false);
                this.ui.showError('Por favor, selecciona el modulo, la maquina y describe el problema antes de continuar.');
                return;
            }

            const machineToSend = this.state.get('selectedMachineIndex') === 'N/A'
                ? 'N/A'
                : MACHINES[this.state.get('selectedMachineIndex')];

            const problemIdToSend = this.state.get('selectedProblemId');

            let totalActualTimeSeconds = 0;
            const actualStepTimes = this.state.get('actualStepTimes') || {};
            for (const stepKey in actualStepTimes) {
                if (Object.prototype.hasOwnProperty.call(actualStepTimes, stepKey)) {
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
                planta: this.state.get('modulePlanta') || '1',
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

            modalSpinner = document.createElement('div');
            modalSpinner.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
            modalSpinner.innerHTML = `<div class="bg-white rounded p-4">Enviando ticket...</div>`;
            document.body.appendChild(modalSpinner);

            const data = await this.api.submitTicket(formData);
            modalSpinner?.remove();

            if (data.success) {
                this.state.markStep('submitted');

                let swalIcon = 'success';
                let swalTitle = '';
                let swalText = '';
                if (statusToSend === '1') {
                    swalIcon = 'success';
                    swalTitle = 'Excelente trabajo';
                    swalText = 'Gracias por resolverlo de forma autonoma.';
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
                    window.location.href = `/FollowOTV2?modulo=${encodeURIComponent(this.state.get('userModule'))}`;
                } else if (statusToSend === '3') {
                    await this.ui.appendChatMessage('Que lastima, espero ayudarte luego.', chatMessages);
                }

                this.setManagedTimeout(() => this.showFinalResetQuestion(chatMessages), 1000);
            } else {
                this.state.set('isSubmitting', false);
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
            }
        } catch (error) {
            modalSpinner?.remove();
            this.state.set('isSubmitting', false);
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
                <strong>Deseas algo mas?</strong>
                <div class="flex gap-2 mt-3">
                    <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded" id="btn-restart">Regresar</button>
                    <button class="bg-green-500 text-white font-bold py-2 px-4 rounded" id="btn-follow">Seguimiento</button>
                </div>
            </div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        messageDiv.querySelector('#btn-restart').onclick = async () => {
            this.clearWorkflowTimers();
            chatMessages.innerHTML = '';
            this.ui.cleanup();
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
                <strong>A que modulo daras seguimiento?</strong>
                <select id="modulo-seguimiento" style="width:100%"><option></option></select>
            </div>`;
        this.ui.elements.chatMessages.appendChild(messageDiv);
        this.ui.elements.chatMessages.scrollTop = this.ui.elements.chatMessages.scrollHeight;

        try {
            const modules = await this.api.getModulesForFollowup();
            $('#modulo-seguimiento').select2({
                placeholder: 'Selecciona un modulo',
                data: modules.map((item) => ({ id: item.modulo, text: item.modulo })),
                minimumResultsForSearch: 0
            });
            $('#modulo-seguimiento').on('select2:select', (event) => {
                const modulo = event.params.data.text;
                Swal.fire({ title: 'Cargando', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                this.setManagedTimeout(() => {
                    window.location.href = `/FollowOTV2?modulo=${encodeURIComponent(modulo)}`;
                }, 500);
            });
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    startSessionKeepAlive() {
        if (this.sessionKeepAliveInterval) clearInterval(this.sessionKeepAliveInterval);
        this.sessionKeepAliveInterval = setInterval(() => {
            this.api.refreshCsrfToken().catch((error) => console.error(error));
        }, 120000);
    }

    cleanup() {
        this.clearWorkflowTimers();
        this.ui.cleanup();
        if (this.sessionKeepAliveInterval) {
            clearInterval(this.sessionKeepAliveInterval);
            this.sessionKeepAliveInterval = null;
        }
    }
}

export const chatManager = new ChatManager();
