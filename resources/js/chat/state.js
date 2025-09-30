/**
 * Gestor centralizado del estado del chat
 * Maneja todo el estado de la aplicación de manera organizada,
 * sincronizando con variables globales cuando sea necesario
 */
export class StateManager {
    constructor() {
        // Estado interno de la aplicación
        this._state = {
            // Problema seleccionado por el usuario
            userProblem: '',
            selectedProblemId: null,

            // Módulo seleccionado
            userModule: '',
            moduleType: null, // 'supervisor' o 'catalogo'
            modulePlanta: null,
            nombreSupervisor: null,
            numeroSupervisor: null,

            // Máquina seleccionada
            selectedMachineIndex: null,

            // Operario seleccionado
            selectedOperario: null, // { id, text }

            // Control de flujo de conversación
            nextResponseHandler: null,
            currentStep: null,

            // Tiempos de IA
            totalEstimatedIATime: 0, // en segundos
            actualStepTimes: {} // { stepKey: seconds }
        };

        // Variables globales para compatibilidad con otros módulos
        this._syncGlobals();
    }

    /**
     * Sincroniza el estado interno con variables globales
     * Esto mantiene compatibilidad con código existente que usa window.GLOBAL_*
     */
    _syncGlobals() {
        // Sincronizar estado local con globales
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
    }

    /**
     * Obtiene una propiedad del estado
     * @param {string} key - Clave de la propiedad
     * @returns {*} Valor de la propiedad
     */
    get(key) {
        return this._state[key];
    }

    /**
     * Establece una propiedad del estado
     * @param {string} key - Clave de la propiedad
     * @param {*} value - Nuevo valor
     */
    set(key, value) {
        this._state[key] = value;
        this._syncGlobals(); // Sincronizar con globales después de cada cambio
    }

    /**
     * Actualiza múltiples propiedades del estado
     * @param {object} updates - Objeto con las propiedades a actualizar
     */
    update(updates) {
        Object.assign(this._state, updates);
        this._syncGlobals();
    }

    /**
     * Obtiene todo el estado actual
     * @returns {object} Copia del estado completo
     */
    getState() {
        return { ...this._state };
    }

    /**
     * Resetea el estado a valores iniciales
     */
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

        // Limpiar variables globales adicionales
        window.iaChatStep = 0;
    }

    /**
     * Verifica si el estado tiene los valores mínimos para procesar una respuesta
     * @returns {boolean} true si el estado es válido para envío
     */
    isValidForSubmission() {
        return (
            this._state.userModule &&
            this._state.userProblem &&
            this._state.selectedMachineIndex !== null &&
            this._state.selectedMachineIndex !== undefined
        );
    }

    /**
     * Obtiene un resumen del estado actual para mostrar al usuario
     * @returns {object} Resumen formateado del estado
     */
    getSummary() {
        let operarioNombre = '';
        let operarioNumero = '';
        if (this._state.selectedOperario && this._state.selectedOperario.text) {
            const parts = this._state.selectedOperario.text.split(' - ');
            operarioNombre = parts[0] || '';
            operarioNumero = parts[1] || '';
        }

        return {
            modulo: this._state.userModule,
            operarioNumero,
            operarioNombre,
            maquina: this._state.selectedMachineIndex !== null ? window.MACHINES[this._state.selectedMachineIndex] : '',
            problema: this._state.userProblem
        };
    }
}

// Instancia singleton del gestor de estado
export const chatState = new StateManager();