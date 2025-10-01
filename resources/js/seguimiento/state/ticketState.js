/**
 * Gestor centralizado del estado de la aplicación
 * @module state/ticketState
 */

/**
 * Clase que maneja el estado global de los tickets
 */
export class TicketState {
    constructor() {
        this.tickets = [];
        this.ticketsFiltrados = [];
        this.moduloActual = null;
        this.filtros = {
            texto: '',
            estado: ''
        };
        this.resumen = {
            AUTONOMO: 0,
            ASIGNADO: 0,
            'EN PROCESO': 0,
            PENDIENTE: 0,
            ATENDIDO: 0,
            TOTAL: 0
        };
    }

    /**
     * Establece los tickets del módulo actual
     * @param {Array} tickets - Array de objetos de ticket
     */
    setTickets(tickets) {
        this.tickets = tickets || [];
        this.ticketsFiltrados = [...this.tickets];
    }

    /**
     * Obtiene todos los tickets sin filtrar
     * @returns {Array} Array de tickets
     */
    getTickets() {
        return this.tickets;
    }

    /**
     * Obtiene los tickets filtrados
     * @returns {Array} Array de tickets filtrados
     */
    getTicketsFiltrados() {
        return this.ticketsFiltrados;
    }

    /**
     * Establece el módulo actual
     * @param {string} modulo - Nombre del módulo
     */
    setModulo(modulo) {
        this.moduloActual = modulo;
    }

    /**
     * Obtiene el módulo actual
     * @returns {string|null} Nombre del módulo o null
     */
    getModulo() {
        return this.moduloActual;
    }

    /**
     * Establece el filtro de texto
     * @param {string} texto - Texto de búsqueda
     */
    setFiltroTexto(texto) {
        this.filtros.texto = texto.toLowerCase().trim();
    }

    /**
     * Establece el filtro de estado
     * @param {string} estado - Estado seleccionado
     */
    setFiltroEstado(estado) {
        this.filtros.estado = estado;
    }

    /**
     * Aplica los filtros actuales a los tickets
     * @returns {Array} Array de tickets filtrados
     */
    aplicarFiltros() {
        const { texto, estado } = this.filtros;

        this.ticketsFiltrados = this.tickets.filter(ticket => {
            const asignacion = ticket.asignaciones?.[0];

            // Filtro por estado
            const coincideEstado = estado === '' || ticket.catalogo_estado?.nombre === estado;

            // Filtro por texto de búsqueda
            const coincideBusqueda = texto === '' ||
                ticket.folio.toLowerCase().includes(texto) ||
                ticket.descripcion_problema.toLowerCase().includes(texto) ||
                ticket.maquina.toLowerCase().includes(texto) ||
                ticket.nombre_operario.toLowerCase().includes(texto) ||
                (asignacion && asignacion.nombre_mecanico.toLowerCase().includes(texto));

            return coincideEstado && coincideBusqueda;
        });

        return this.ticketsFiltrados;
    }

    /**
     * Resetea los filtros a sus valores por defecto
     */
    resetearFiltros() {
        this.filtros.texto = '';
        this.filtros.estado = '';
        this.ticketsFiltrados = [...this.tickets];
    }

    /**
     * Actualiza el resumen de tickets por estado
     * @param {object} resumen - Objeto con contadores por estado
     */
    actualizarResumen(resumen) {
        this.resumen = {
            AUTONOMO: resumen.AUTONOMO ?? 0,
            ASIGNADO: resumen.ASIGNADO ?? 0,
            'EN PROCESO': resumen['EN PROCESO'] ?? 0,
            PENDIENTE: resumen.PENDIENTE ?? 0,
            ATENDIDO: resumen.ATENDIDO ?? 0,
            TOTAL: resumen.TOTAL ?? 0
        };
    }

    /**
     * Obtiene el resumen actual
     * @returns {object} Objeto con contadores por estado
     */
    getResumen() {
        return this.resumen;
    }

    /**
     * Resetea el resumen a valores por defecto
     */
    resetearResumen() {
        this.resumen = {
            AUTONOMO: 0,
            ASIGNADO: 0,
            'EN PROCESO': 0,
            PENDIENTE: 0,
            ATENDIDO: 0,
            TOTAL: 0
        };
    }

    /**
     * Limpia todo el estado
     */
    limpiar() {
        this.tickets = [];
        this.ticketsFiltrados = [];
        this.moduloActual = null;
        this.resetearFiltros();
        this.resetearResumen();
    }

    /**
     * Busca un ticket por su ID
     * @param {number} ticketId - El ID del ticket
     * @returns {object|null} El ticket encontrado o null
     */
    buscarTicketPorId(ticketId) {
        return this.tickets.find(ticket => ticket.id === ticketId) || null;
    }

    /**
     * Obtiene el número total de tickets
     * @returns {number} Cantidad de tickets
     */
    getTotalTickets() {
        return this.tickets.length;
    }

    /**
     * Obtiene el número de tickets filtrados
     * @returns {number} Cantidad de tickets filtrados
     */
    getTotalTicketsFiltrados() {
        return this.ticketsFiltrados.length;
    }

    /**
     * Actualiza un ticket específico en el estado
     * @param {object} ticketActualizado - Ticket con datos actualizados
     * @returns {boolean} true si se actualizó correctamente
     */
    actualizarTicket(ticketActualizado) {
        const index = this.tickets.findIndex(t => t.id === ticketActualizado.id);

        if (index === -1) {
            console.warn(`Ticket ${ticketActualizado.id} no encontrado en el estado`);
            return false;
        }

        // Actualizar en el array principal
        this.tickets[index] = ticketActualizado;

        // Actualizar en el array filtrado si existe
        const indexFiltrado = this.ticketsFiltrados.findIndex(t => t.id === ticketActualizado.id);
        if (indexFiltrado !== -1) {
            this.ticketsFiltrados[indexFiltrado] = ticketActualizado;
        }

        return true;
    }

    /**
     * Obtiene un ticket por su ID
     * @param {number} ticketId - ID del ticket
     * @returns {object|null} Ticket encontrado o null
     */
    obtenerTicketPorId(ticketId) {
        return this.tickets.find(t => t.id === ticketId) || null;
    }
}

// Exportar una instancia única del estado
export const ticketState = new TicketState();