/**
 * Gestor centralizado del estado del chat
 */
import { MACHINES } from './constants.js';

export class StateManager {
    constructor() {
        this._state = {
            userProblem: '',
            selectedProblemId: null,
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
            actualStepTimes: {}
        };
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

    get(key) { return this._state[key]; }
    set(key, value) { this._state[key] = value; this._syncGlobals(); }
    update(updates) { Object.assign(this._state, updates); this._syncGlobals(); }
    getState() { return { ...this._state }; }

    reset() {
        this._state = {
            userProblem: '',
            selectedProblemId: null,
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
            actualStepTimes: {}
        };
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
        if (this._state.selectedMachineIndex !== null &&
            this._state.selectedMachineIndex !== undefined &&
            typeof this._state.selectedMachineIndex === 'number' &&
            MACHINES &&
            MACHINES[this._state.selectedMachineIndex]) {
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
