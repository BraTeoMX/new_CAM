/**
 * Gestor de temporizadores de cuenta regresiva
 * @module utils/timerManager
 */

import { SELECTORS, TIEMPOS, TIMER_CLASSES, UMBRALES_ALERTA } from '../config/constants.js';
import { ticketState } from '../state/ticketState.js';

/**
 * Clase que maneja los temporizadores de cuenta regresiva
 */
export class TimerManager {
    constructor() {
        this.activeTimers = [];
        this.alertasActivadas = new Map(); // Rastrea qué alertas ya se mostraron por ticket
        this.modalManager = null; // Se inyectará desde el index
    }

    /**
     * Establece el gestor de modales para mostrar alertas
     * @param {object} modalManager - Instancia del ModalManager
     */
    setModalManager(modalManager) {
        this.modalManager = modalManager;
    }

    /**
     * Inicia todos los temporizadores visibles en el DOM
     */
    iniciarTemporizadores() {
        const timerElements = document.querySelectorAll(SELECTORS.TIMER_DISPLAY);

        timerElements.forEach(timerEl => {
            const startTimeStr = timerEl.dataset.startTime;
            const durationMinutes = parseInt(timerEl.dataset.durationMinutes, 10);

            // Validamos que tengamos la información necesaria
            if (!startTimeStr || isNaN(durationMinutes)) {
                timerEl.textContent = "Error";
                console.warn("Faltan datos para el temporizador en el ticket:", timerEl.id);
                return;
            }

            // Creamos un intervalo que se ejecuta cada segundo para este temporizador
            const intervalId = setInterval(() => {
                this.#updateTimer(timerEl, startTimeStr, durationMinutes);
            }, TIEMPOS.ACTUALIZACION_TIMER);

            // Guardamos el ID del intervalo para poder limpiarlo después
            this.activeTimers.push(intervalId);

            // Ejecutamos una vez al inicio para que el usuario no vea el "--:--" por un segundo
            this.#updateTimer(timerEl, startTimeStr, durationMinutes);
        });
    }

    /**
     * Detiene y limpia todos los temporizadores activos
     */
    detenerTemporizadores() {
        this.activeTimers.forEach(timerId => clearInterval(timerId));
        this.activeTimers = [];
    }

    /**
     * Actualiza un temporizador específico
     * @param {HTMLElement} element - El elemento del temporizador
     * @param {string} startTimeStr - Hora de inicio en formato HH:MM:SS
     * @param {number} durationMinutes - Duración en minutos
     * @private
     */
    #updateTimer(element, startTimeStr, durationMinutes) {
        // 1. Parsear la hora de inicio a un objeto Date válido para hoy
        const today = new Date();
        const [hours, minutes, seconds] = startTimeStr.split(':');
        const startTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            hours,
            minutes,
            seconds
        );

        // 2. Calcular los segundos restantes
        const now = new Date();
        const totalDurationInSeconds = durationMinutes * 60;
        const elapsedSeconds = Math.round((now - startTime) / 1000);
        const remainingSeconds = totalDurationInSeconds - elapsedSeconds;

        // 3. Aplicar estilos según el tiempo restante
        this.#aplicarEstiloSegunTiempo(element, remainingSeconds);

        // 4. Verificar y mostrar alertas si es necesario
        this.#verificarYMostrarAlertas(element, remainingSeconds);

        // 5. Formatear y mostrar el tiempo
        const formattedTime = this.#formatearTiempo(remainingSeconds);
        element.textContent = formattedTime;
    }

    /**
     * Verifica el tiempo restante y muestra alertas según los umbrales
     * @param {HTMLElement} element - El elemento del temporizador
     * @param {number} remainingSeconds - Segundos restantes
     * @private
     */
    #verificarYMostrarAlertas(element, remainingSeconds) {
        if (!this.modalManager) return;

        // Extraer el ID del ticket del elemento
        const ticketId = element.id.replace('timer-', '');

        // Verificar si el ticket está en estado activo (EN PROCESO)
        const ticket = ticketState.obtenerTicketPorId(parseInt(ticketId));
        if (!ticket || ticket.catalogo_estado?.nombre !== 'EN PROCESO') {
            // No mostrar alertas para tickets que no están en proceso activo
            return;
        }

        // Obtener información del ticket desde la tarjeta
        const tarjeta = element.closest('.relative');
        if (!tarjeta) return;

        const folio = tarjeta.querySelector('h3')?.textContent || 'N/A';
        const descripcion = tarjeta.querySelector('.truncate')?.textContent || 'N/A';

        // Inicializar el registro de alertas para este ticket si no existe
        if (!this.alertasActivadas.has(ticketId)) {
            this.alertasActivadas.set(ticketId, {
                advertencia: false,
                critico: false,
                excedido: false,
                ultimoMinutoExcedido: -1
            });
        }

        const alertas = this.alertasActivadas.get(ticketId);

        // ALERTA 1: 5 minutos restantes (advertencia amarilla)
        if (remainingSeconds <= UMBRALES_ALERTA.ADVERTENCIA &&
            remainingSeconds > UMBRALES_ALERTA.CRITICO &&
            !alertas.advertencia) {

            this.modalManager.mostrarAlertaAdvertencia({
                folio,
                descripcion,
                tiempoRestante: remainingSeconds
            });
            alertas.advertencia = true;
        }

        // ALERTA 2: 1 minuto restante (alerta naranja crítica)
        if (remainingSeconds <= UMBRALES_ALERTA.CRITICO &&
            remainingSeconds > UMBRALES_ALERTA.EXCEDIDO &&
            !alertas.critico) {

            this.modalManager.mostrarAlertaCritica({
                folio,
                descripcion,
                tiempoRestante: remainingSeconds
            });
            alertas.critico = true;
        }

        // ALERTA 3: Tiempo excedido (alerta roja cada minuto)
        if (remainingSeconds < UMBRALES_ALERTA.EXCEDIDO) {
            const minutosExcedidos = Math.floor(Math.abs(remainingSeconds) / 60);

            // Mostrar alerta la primera vez que se excede
            if (!alertas.excedido) {
                this.modalManager.mostrarAlertaExcedido({
                    folio,
                    descripcion,
                    tiempoExcedido: remainingSeconds
                });
                alertas.excedido = true;
                alertas.ultimoMinutoExcedido = minutosExcedidos;
            }
            // Mostrar alerta cada minuto adicional excedido
            else if (minutosExcedidos > alertas.ultimoMinutoExcedido) {
                this.modalManager.mostrarAlertaExcedido({
                    folio,
                    descripcion,
                    tiempoExcedido: remainingSeconds
                });
                alertas.ultimoMinutoExcedido = minutosExcedidos;
            }
        }
    }

    /**
     * Aplica estilos CSS según el tiempo restante
     * @param {HTMLElement} element - El elemento del temporizador
     * @param {number} remainingSeconds - Segundos restantes
     * @private
     */
    #aplicarEstiloSegunTiempo(element, remainingSeconds) {
        // Primero limpiamos todas las clases de color
        element.classList.remove(
            ...TIMER_CLASSES.NORMAL,
            ...TIMER_CLASSES.ADVERTENCIA,
            ...TIMER_CLASSES.AGOTADO
        );

        // Aplicamos las clases según el tiempo restante
        if (remainingSeconds < 0) {
            // Tiempo agotado (rojo)
            element.classList.add(...TIMER_CLASSES.AGOTADO);
        } else if (remainingSeconds < TIEMPOS.ADVERTENCIA_TIEMPO) {
            // Menos de 5 minutos (amarillo)
            element.classList.add(...TIMER_CLASSES.ADVERTENCIA);
        } else {
            // Tiempo normal
            element.classList.add(...TIMER_CLASSES.NORMAL);
        }
    }

    /**
     * Formatea segundos a formato MM:SS
     * @param {number} totalSeconds - Total de segundos
     * @returns {string} Tiempo formateado
     * @private
     */
    #formatearTiempo(totalSeconds) {
        const isNegative = totalSeconds < 0;
        const absSeconds = Math.abs(totalSeconds);
        const minutes = Math.floor(absSeconds / 60);
        const seconds = absSeconds % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        return `${isNegative ? '-' : ''}${formattedMinutes}:${formattedSeconds}`;
    }

    /**
     * Calcula el tiempo restante en segundos
     * @param {string} startTimeStr - Hora de inicio en formato HH:MM:SS
     * @param {number} durationMinutes - Duración en minutos
     * @returns {number} Segundos restantes
     */
    calcularTiempoRestante(startTimeStr, durationMinutes) {
        const today = new Date();
        const [hours, minutes, seconds] = startTimeStr.split(':');
        const startTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            hours,
            minutes,
            seconds
        );

        const now = new Date();
        const totalDurationInSeconds = durationMinutes * 60;
        const elapsedSeconds = Math.round((now - startTime) / 1000);

        return totalDurationInSeconds - elapsedSeconds;
    }

    /**
     * Verifica si hay temporizadores activos
     * @returns {boolean} true si hay temporizadores activos
     */
    hayTemporizadoresActivos() {
        return this.activeTimers.length > 0;
    }

    /**
     * Obtiene el número de temporizadores activos
     * @returns {number} Cantidad de temporizadores activos
     */
    getCantidadTemporizadores() {
        return this.activeTimers.length;
    }

    /**
     * Reinicia el temporizador de una tarjeta específica
     * @param {number} ticketId - ID del ticket
     */
    reiniciarTemporizadorEspecifico(ticketId) {
        const timerElement = document.querySelector(`#timer-${ticketId}`);

        if (!timerElement) {
            console.warn(`Temporizador para ticket ${ticketId} no encontrado`);
            return;
        }

        const startTimeStr = timerElement.dataset.startTime;
        const durationMinutes = parseInt(timerElement.dataset.durationMinutes, 10);

        if (!startTimeStr || isNaN(durationMinutes)) {
            console.warn("Faltan datos para el temporizador del ticket:", ticketId);
            return;
        }

        // Resetear las alertas para este ticket
        this.alertasActivadas.delete(ticketId);

        // Crear un nuevo intervalo para este temporizador específico
        const intervalId = setInterval(() => {
            this.#updateTimer(timerElement, startTimeStr, durationMinutes);
        }, TIEMPOS.ACTUALIZACION_TIMER);

        // Guardar el ID del intervalo
        this.activeTimers.push(intervalId);

        // Ejecutar una vez inmediatamente
        this.#updateTimer(timerElement, startTimeStr, durationMinutes);
    }

    /**
     * Limpia las alertas de un ticket específico
     * @param {number} ticketId - ID del ticket
     */
    limpiarAlertasTicket(ticketId) {
        this.alertasActivadas.delete(ticketId);
    }

    /**
     * Limpia todas las alertas
     */
    limpiarTodasLasAlertas() {
        this.alertasActivadas.clear();
    }
}

// Exportar una instancia única del gestor
export const timerManager = new TimerManager();