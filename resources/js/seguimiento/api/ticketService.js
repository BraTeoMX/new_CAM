/**
 * Servicio para todas las llamadas API relacionadas con tickets
 * @module api/ticketService
 */

import { API_ENDPOINTS, MENSAJES_ERROR } from '../config/constants.js';
import { getCsrfToken } from '../utils/domHelpers.js';

/**
 * Clase que encapsula todas las llamadas a la API
 */
export class TicketService {
    /**
     * Realiza una petición GET a la API
     * @param {string} url - La URL del endpoint
     * @returns {Promise<any>} La respuesta JSON
     * @throws {Error} Si la petición falla
     */
    async #get(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`${MENSAJES_ERROR.SERVIDOR}: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Realiza una petición POST a la API
     * @param {string} url - La URL del endpoint
     * @param {object} data - Los datos a enviar
     * @returns {Promise<any>} La respuesta JSON
     * @throws {Error} Si la petición falla
     */
    async #post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || MENSAJES_ERROR.SERVIDOR);
        }

        return result;
    }

    /**
     * Obtiene la lista de módulos disponibles
     * @returns {Promise<string[]>} Array de nombres de módulos
     */
    async obtenerModulos() {
        try {
            return await this.#get(API_ENDPOINTS.OBTENER_MODULOS);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_MODULOS, error);
            throw new Error(MENSAJES_ERROR.CARGAR_MODULOS);
        }
    }

    /**
     * Obtiene el resumen de tickets por estado para un módulo
     * @param {string} modulo - El nombre del módulo
     * @returns {Promise<object>} Objeto con contadores por estado
     */
    async obtenerResumen(modulo) {
        try {
            return await this.#get(`${API_ENDPOINTS.OBTENER_RESUMEN}/${modulo}`);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_RESUMEN, error);
            throw new Error(MENSAJES_ERROR.CARGAR_RESUMEN);
        }
    }

    /**
     * Obtiene los registros detallados de tickets para un módulo
     * @param {string} modulo - El nombre del módulo
     * @returns {Promise<Array>} Array de objetos de ticket
     */
    async obtenerRegistros(modulo) {
        try {
            return await this.#get(`${API_ENDPOINTS.OBTENER_REGISTROS}/${modulo}`);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_REGISTROS, error);
            throw new Error(MENSAJES_ERROR.CARGAR_REGISTROS);
        }
    }

    /**
     * Obtiene un ticket específico actualizado
     * @param {string} modulo - El nombre del módulo
     * @param {number} ticketId - El ID del ticket
     * @returns {Promise<object>} Objeto de ticket actualizado
     */
    async obtenerTicketActualizado(modulo, ticketId) {
        try {
            // Obtenemos todos los registros y filtramos el específico
            // Esto es temporal hasta que el backend tenga un endpoint específico
            const tickets = await this.#get(`${API_ENDPOINTS.OBTENER_REGISTROS}/${modulo}`);
            const ticket = tickets.find(t => t.id === parseInt(ticketId));

            if (!ticket) {
                throw new Error(`Ticket ${ticketId} no encontrado`);
            }

            return ticket;
        } catch (error) {
            console.error('Error al obtener ticket actualizado:', error);
            throw error;
        }
    }

    /**
     * Obtiene el catálogo de estados disponibles
     * @returns {Promise<Array>} Array de objetos de estado
     */
    async obtenerEstados() {
        try {
            return await this.#get(API_ENDPOINTS.OBTENER_ESTADOS);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_ESTADOS, error);
            throw new Error(MENSAJES_ERROR.CARGAR_ESTADOS);
        }
    }

    /**
     * Obtiene las clases y números de máquina disponibles
     * @param {string} maquina - El nombre de la máquina
     * @returns {Promise<object>} Objeto con clases y números de máquina
     */
    async obtenerClasesMaquina(maquina) {
        try {
            const encodedMaquina = encodeURIComponent(maquina);
            return await this.#get(`${API_ENDPOINTS.OBTENER_CLASES_MAQUINA}/${encodedMaquina}`);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_MAQUINA, error);
            throw new Error(MENSAJES_ERROR.CARGAR_MAQUINA);
        }
    }

    /**
     * Obtiene el catálogo de fallas
     * @returns {Promise<Array>} Array de objetos de falla
     */
    async obtenerFallas() {
        try {
            return await this.#get(API_ENDPOINTS.OBTENER_FALLAS);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_CATALOGOS, error);
            throw new Error(MENSAJES_ERROR.CARGAR_CATALOGOS);
        }
    }

    /**
     * Obtiene el catálogo de causas
     * @returns {Promise<Array>} Array de objetos de causa
     */
    async obtenerCausas() {
        try {
            return await this.#get(API_ENDPOINTS.OBTENER_CAUSAS);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_CATALOGOS, error);
            throw new Error(MENSAJES_ERROR.CARGAR_CATALOGOS);
        }
    }

    /**
     * Obtiene el catálogo de acciones
     * @returns {Promise<Array>} Array de objetos de acción
     */
    async obtenerAcciones() {
        try {
            return await this.#get(API_ENDPOINTS.OBTENER_ACCIONES);
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_CATALOGOS, error);
            throw new Error(MENSAJES_ERROR.CARGAR_CATALOGOS);
        }
    }

    /**
     * Obtiene todos los catálogos necesarios para finalizar atención
     * @returns {Promise<object>} Objeto con fallas, causas y acciones
     */
    async obtenerCatalogosFinalizacion() {
        try {
            const [fallas, causas, acciones] = await Promise.all([
                this.obtenerFallas(),
                this.obtenerCausas(),
                this.obtenerAcciones()
            ]);
            return { fallas, causas, acciones };
        } catch (error) {
            console.error(MENSAJES_ERROR.CARGAR_CATALOGOS, error);
            throw new Error(MENSAJES_ERROR.CARGAR_CATALOGOS);
        }
    }

    /**
     * Inicia la atención de un ticket
     * @param {number} ticketId - El ID del ticket
     * @param {object} datos - Datos de inicio (clase, numero_maquina, tiempo_estimado)
     * @returns {Promise<object>} Resultado de la operación
     */
    async iniciarAtencion(ticketId, datos) {
        try {
            return await this.#post(API_ENDPOINTS.INICIAR_ATENCION, {
                ticket_id: ticketId,
                clase: datos.clase,
                numero_maquina: datos.numero_maquina,
                tiempo_estimado: datos.tiempo_estimado
            });
        } catch (error) {
            console.error(MENSAJES_ERROR.INICIAR_ATENCION, error);
            throw error;
        }
    }

    /**
     * Finaliza la atención de un ticket
     * @param {number} ticketId - El ID del ticket
     * @param {object} datos - Datos de finalización
     * @returns {Promise<object>} Resultado de la operación
     */
    async finalizarAtencion(ticketId, datos) {
        try {
            return await this.#post(API_ENDPOINTS.FINALIZAR_ATENCION, {
                ticket_id: ticketId,
                falla: datos.falla,
                causa_falla: datos.causaFalla,
                accion_implementada: datos.accionImplementada,
                comentarios: datos.comentarios,
                hora_finalizacion: datos.horaFinalizacion,
                satisfaccion: datos.satisfaccion
            });
        } catch (error) {
            console.error(MENSAJES_ERROR.FINALIZAR_ATENCION, error);
            throw error;
        }
    }

    /**
     * Activa el tiempo de bahía (pausa) para un ticket
     * @param {number} ticketId - El ID del ticket
     * @param {string} motivo - Motivo de la pausa (opcional)
     * @returns {Promise<object>} Resultado de la operación
     */
    async activarBahia(ticketId, motivo = '') {
        try {
            return await this.#post(API_ENDPOINTS.ACTIVAR_BAHIA, {
                ticket_id: ticketId,
                motivo: motivo
            });
        } catch (error) {
            console.error(MENSAJES_ERROR.ACTIVAR_BAHIA, error);
            throw error;
        }
    }

    /**
     * Finaliza el tiempo de bahía (reanuda la atención)
     * @param {number} ticketId - El ID del ticket
     * @returns {Promise<object>} Resultado de la operación
     */
    async finalizarBahia(ticketId) {
        try {
            return await this.#post(API_ENDPOINTS.FINALIZAR_BAHIA, {
                ticket_id: ticketId
            });
        } catch (error) {
            console.error(MENSAJES_ERROR.REANUDAR_BAHIA, error);
            throw error;
        }
    }
}

// Exportar una instancia única del servicio
export const ticketService = new TicketService();