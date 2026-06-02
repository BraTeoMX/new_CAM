/**
 * Gestor centralizado del estado del chat.
 */
import { MACHINES } from './constants.js';

export const FLOW_STEPS = {
    module: 10,
    operator: 20,
    machine: 30,
    problem: 40,
    summary: 50,
    assistance: 60,
    final: 70,
    submitted: 80
};

const initialState = () => ({
    userProblem: '',
    selectedProblemId: null,
    selectedProblemNeedsSteps: null,
    userModule: '',
    moduleType: null,
    modulePlanta: null,
    nombreSupervisor: null,
    numeroSupervisor: null,
    selectedMachineIndex: null,
    selectedOperario: null,
    nextResponseHandler: null,
    currentStep: null,
    totalEstimatedIATime: 0,
    actualStepTimes: {},
    furthestStep: 0,
    isSubmitting: false
});

export class StateManager {
    constructor() {
        this._state = initialState();
        this._syncGlobals();
    }

    _syncGlobals() {
        window.GLOBAL_CHAT_MODULE = this._state.userModule;
        window.GLOBAL_CHAT_MACHINE_INDEX = this._state.selectedMachineIndex;
        window.GLOBAL_CHAT_PROBLEM = this._state.userProblem;
        window.GLOBAL_CHAT_PROBLEM_ID = this._state.selectedProblemId;
        window.GLOBAL_OPERARIO = this._state.selectedOperario ? {
            nombre: this._state.selectedOperario.text.split(' - ')[0] || '',
            numero: this._state.selectedOperario.text.split(' - ')[1] || ''
        } : undefined;
        window.GLOBAL_CHAT_PLANTA = this._state.modulePlanta;
        window.GLOBAL_SUPERVISOR_NOMBRE = this._state.nombreSupervisor;
        window.GLOBAL_SUPERVISOR_NUMERO = this._state.numeroSupervisor;

        if (typeof window !== 'undefined') {
            window.MACHINES = MACHINES;
        }
    }

    get(key) {
        return this._state[key];
    }

    set(key, value) {
        this._state[key] = value;
        this._syncGlobals();
    }

    update(updates) {
        Object.assign(this._state, updates);
        this._syncGlobals();
    }

    getState() {
        return { ...this._state };
    }

    markStep(stepName) {
        const stepValue = FLOW_STEPS[stepName] || 0;
        this._state.furthestStep = Math.max(this._state.furthestStep, stepValue);
        this._syncGlobals();
    }

    hasProgressAfter(stepName) {
        return this._state.furthestStep > (FLOW_STEPS[stepName] || 0);
    }

    resetAfter(stepName) {
        const keepStep = FLOW_STEPS[stepName] || 0;

        if (keepStep < FLOW_STEPS.operator) {
            this._state.selectedOperario = null;
        }

        if (keepStep < FLOW_STEPS.machine) {
            this._state.selectedMachineIndex = null;
        }

        if (keepStep < FLOW_STEPS.problem) {
            this._state.userProblem = '';
            this._state.selectedProblemId = null;
            this._state.selectedProblemNeedsSteps = null;
        }

        if (keepStep < FLOW_STEPS.assistance) {
            this._state.currentStep = null;
            this._state.totalEstimatedIATime = 0;
            this._state.actualStepTimes = {};
        }

        this._state.isSubmitting = false;
        this._state.furthestStep = keepStep;
        this._syncGlobals();
    }

    reset() {
        this._state = initialState();
        this._syncGlobals();
        window.iaChatStep = 0;
    }

    isValidForSubmission() {
        return (
            this._state.userModule &&
            this._state.userProblem &&
            this._state.selectedMachineIndex !== null &&
            this._state.selectedMachineIndex !== undefined
        );
    }

    getSummary() {
        let operarioNombre = '';
        let operarioNumero = '';
        if (this._state.selectedOperario && this._state.selectedOperario.text) {
            const parts = this._state.selectedOperario.text.split(' - ');
            operarioNombre = parts[0] || '';
            operarioNumero = parts[1] || '';
        }

        let maquinaNombre = '';
        if (
            this._state.selectedMachineIndex !== null &&
            this._state.selectedMachineIndex !== undefined &&
            typeof this._state.selectedMachineIndex === 'number' &&
            MACHINES &&
            MACHINES[this._state.selectedMachineIndex]
        ) {
            maquinaNombre = MACHINES[this._state.selectedMachineIndex];
        }

        return {
            modulo: this._state.userModule,
            operarioNumero,
            operarioNombre,
            maquina: maquinaNombre,
            problema: this._state.userProblem
        };
    }
}

export const chatState = new StateManager();
