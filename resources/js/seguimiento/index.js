/**
 * Módulo principal de seguimiento de solicitudes
 * Orquesta todos los componentes y maneja la lógica de la aplicación
 * @module seguimiento/index
 */

import { DOM_IDS, SELECT2_CONFIG, DEFAULTS } from './config/constants.js';
import { ticketService } from './api/ticketService.js';
import { ticketState } from './state/ticketState.js';
import { getElement, setTextContent, disableButton, enableButton, getURLParameter } from './utils/domHelpers.js';
import { timerManager } from './utils/timerManager.js';
import { modalManager } from './ui/modalManager.js';
import { CardRenderer } from './ui/cardRenderer.js';
import { FilterManager } from './ui/filterManager.js';

/**
 * Clase principal de la aplicación
 */
class SeguimientoApp {
    constructor() {
        // Elementos del DOM
        this.moduloSelect = getElement(DOM_IDS.MODULO_SELECT);
        this.container = getElement(DOM_IDS.CONTAINER);
        this.filtrosBar = getElement(DOM_IDS.FILTROS_BAR);
        this.searchInput = getElement(DOM_IDS.SEARCH_INPUT);
        this.statusFilter = getElement(DOM_IDS.STATUS_FILTER);

        // Instancias de gestores
        this.cardRenderer = new CardRenderer(this.container);
        this.filterManager = new FilterManager(this.searchInput, this.statusFilter, this.filtrosBar);
    }

    /**
     * Inicializa la aplicación
     */
    async inicializar() {
        // Inicializar Select2 en el selector de módulos
        $(this.moduloSelect).select2(SELECT2_CONFIG.MODULO);

        // Inyectar modalManager en timerManager para las alertas
        timerManager.setModalManager(modalManager);

        // Configurar event listeners
        this.configurarEventListeners();

        // Cargar filtro de estados
        await this.cargarFiltroDeEstados();

        // Cargar módulos
        await this.cargarModulos();

        // Seleccionar módulo desde URL si existe
        this.seleccionarModuloDesdeURL();
    }

    /**
     * Configura todos los event listeners
     */
    configurarEventListeners() {
        // Evento change del selector de módulo
        $(this.moduloSelect).on('change', () => this.handleModuloChange());

        // Eventos de filtros
        this.searchInput.addEventListener('input', () => this.aplicarFiltros());
        this.statusFilter.addEventListener('change', () => this.aplicarFiltros());

        // Event delegation para botones de acción
        this.container.addEventListener('click', (e) => this.handleContainerClick(e));
    }

    /**
     * Maneja los clicks en el contenedor de tarjetas
     * @param {Event} e - Evento de click
     */
    async handleContainerClick(e) {
        // Botón de iniciar atención
        const iniciarBtn = e.target.closest('.iniciar-atencion-btn');
        if (iniciarBtn) {
            e.preventDefault();
            await this.handleIniciarAtencion(iniciarBtn);
            return;
        }

        // Botón de finalizar atención
        const finalizarBtn = e.target.closest('.detener-atencion-btn');
        if (finalizarBtn) {
            e.preventDefault();
            await this.handleFinalizarAtencion(finalizarBtn);
            return;
        }

        // Botón de activar bahía
        const activarBahiaBtn = e.target.closest('.activar-bahia-btn');
        if (activarBahiaBtn) {
            e.preventDefault();
            await this.handleActivarBahia(activarBahiaBtn);
            return;
        }

        // Botón de reanudar bahía
        const reanudarBahiaBtn = e.target.closest('.reanudar-bahia-btn');
        if (reanudarBahiaBtn) {
            e.preventDefault();
            await this.handleReanudarBahia(reanudarBahiaBtn);
            return;
        }
    }

    /**
     * Maneja el inicio de atención
     * @param {HTMLElement} boton - Botón que disparó la acción
     */
    async handleIniciarAtencion(boton) {
        const ticketId = boton.dataset.ticketId;
        const maquina = boton.dataset.maquina;

        disableButton(boton);
        modalManager.mostrarCargando();

        try {
            if (maquina === 'N/A') {
                // Caso especial: máquina N/A
                const formValuesNA = {
                    clase: 'N/A',
                    numero_maquina: 'N/A',
                    tiempo_estimado: DEFAULTS.TIEMPO_ESTIMADO_NA
                };
                await this.enviarInicioAtencion(ticketId, formValuesNA);
            } else {
                // Mostrar modal para seleccionar clase y número de máquina
                const formValues = await modalManager.mostrarModalIniciarAtencion(ticketId, maquina, boton);
                if (formValues) {
                    await this.enviarInicioAtencion(ticketId, formValues);
                } else {
                    enableButton(boton);
                }
            }
        } catch (error) {
            console.error('Error al iniciar atención:', error);
            modalManager.mostrarError(error.message);
            enableButton(boton);
        }
    }

    /**
     * Envía la solicitud para iniciar atención
     * @param {number} ticketId - ID del ticket
     * @param {object} datos - Datos del formulario
     */
    async enviarInicioAtencion(ticketId, datos) {
        try {
            const result = await ticketService.iniciarAtencion(ticketId, datos);
            await modalManager.mostrarExito(result.message);
            await this.actualizarTarjetaEspecifica(ticketId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Maneja la finalización de atención
     * @param {HTMLElement} boton - Botón que disparó la acción
     */
    async handleFinalizarAtencion(boton) {
        const ticketId = boton.dataset.ticketId;

        disableButton(boton);
        modalManager.mostrarCargando('Cargando datos...');

        try {
            // Capturar hora actual
            const ahora = new Date();
            const horaFinalizacion = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;

            // Mostrar modal de finalización
            const datos = await modalManager.mostrarModalFinalizarAtencion(ticketId, horaFinalizacion, boton);

            if (datos) {
                await this.enviarFinalizacionAtencion(ticketId, datos);
            } else {
                enableButton(boton);
            }
        } catch (error) {
            console.error('Error al finalizar atención:', error);
            modalManager.mostrarError(error.message);
            enableButton(boton);
        }
    }

    /**
     * Envía la solicitud para finalizar atención
     * @param {number} ticketId - ID del ticket
     * @param {object} datos - Datos del formulario
     */
    async enviarFinalizacionAtencion(ticketId, datos) {
        try {
            const result = await ticketService.finalizarAtencion(ticketId, datos);
            await modalManager.mostrarExito(result.message);
            await this.actualizarTarjetaEspecifica(ticketId);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Maneja la activación de bahía
     * @param {HTMLElement} boton - Botón que disparó la acción
     */
    async handleActivarBahia(boton) {
        const ticketId = boton.dataset.ticketId;

        disableButton(boton);
        modalManager.mostrarCargando('Activando Pausa...');

        try {
            const result = await ticketService.activarBahia(ticketId, '');
            await modalManager.mostrarExito(result.message, 'Pausa Activada');
            await this.actualizarTarjetaEspecifica(ticketId);
        } catch (error) {
            console.error('Error al activar bahía:', error);
            modalManager.mostrarError(error.message);
            await this.actualizarTarjetaEspecifica(ticketId);
        }
    }

    /**
     * Maneja la reanudación de bahía
     * @param {HTMLElement} boton - Botón que disparó la acción
     */
    async handleReanudarBahia(boton) {
        const ticketId = boton.dataset.ticketId;

        disableButton(boton);
        modalManager.mostrarCargando('Reanudando...');

        try {
            const result = await ticketService.finalizarBahia(ticketId);
            await modalManager.mostrarExito(result.message, 'Atención Reanudada');
            await this.actualizarTarjetaEspecifica(ticketId);
        } catch (error) {
            console.error('Error al reanudar bahía:', error);
            modalManager.mostrarError(error.message);
            enableButton(boton);
        }
    }

    /**
     * Maneja el cambio de módulo seleccionado
     */
    async handleModuloChange() {
        const moduloSeleccionado = this.moduloSelect.value;

        if (moduloSeleccionado) {
            ticketState.setModulo(moduloSeleccionado);
            await this.actualizarResumen(moduloSeleccionado);
            await this.cargarYRenderizarRegistros(moduloSeleccionado);
        } else {
            this.resetearVista();
        }
    }

    /**
     * Resetea la vista a su estado inicial
     */
    resetearVista() {
        this.resetearResumen();
        this.cardRenderer.limpiar();
        this.filterManager.ocultarBarraFiltros();
        this.filterManager.resetearFiltros();
        ticketState.limpiar();
    }

    /**
     * Carga los módulos disponibles
     */
    async cargarModulos() {
        try {
            const modulos = await ticketService.obtenerModulos();
            modulos.forEach(modulo => {
                const option = new Option(modulo, modulo);
                this.moduloSelect.appendChild(option);
            });
            $(this.moduloSelect).trigger('change.select2');
        } catch (error) {
            console.error("Error al cargar módulos:", error);
        }
    }

    /**
     * Carga el filtro de estados
     */
    async cargarFiltroDeEstados() {
        try {
            const estados = await ticketService.obtenerEstados();
            this.filterManager.cargarOpcionesEstado(estados);
        } catch (error) {
            console.error("Error al cargar estados:", error);
        }
    }

    /**
     * Selecciona un módulo desde parámetro URL
     */
    seleccionarModuloDesdeURL() {
        const moduloDesdeURL = getURLParameter('modulo');

        if (moduloDesdeURL) {
            console.log(`Módulo encontrado en la URL: ${moduloDesdeURL}. Cargando datos...`);
            $(this.moduloSelect).val(moduloDesdeURL).trigger('change');
        }
    }

    /**
     * Actualiza el resumen de tickets
     * @param {string} modulo - Nombre del módulo
     */
    async actualizarResumen(modulo) {
        try {
            const resumen = await ticketService.obtenerResumen(modulo);
            ticketState.actualizarResumen(resumen);

            setTextContent(getElement(DOM_IDS.OT_AUTONOMAS), resumen.AUTONOMO ?? 0);
            setTextContent(getElement(DOM_IDS.OT_ASIGNADAS), resumen.ASIGNADO ?? 0);
            setTextContent(getElement(DOM_IDS.OT_PROCESO), resumen['EN PROCESO'] ?? 0);
            setTextContent(getElement(DOM_IDS.OT_PENDIENTES), resumen.PENDIENTE ?? 0);
            setTextContent(getElement(DOM_IDS.OT_ATENDIDAS), resumen.ATENDIDO ?? 0);
            setTextContent(getElement(DOM_IDS.OT_TOTAL), resumen.TOTAL ?? 0);
        } catch (error) {
            console.error("Error al cargar resumen:", error);
        }
    }

    /**
     * Resetea el resumen a valores por defecto
     */
    resetearResumen() {
        const placeholder = DEFAULTS.TEXTO_PLACEHOLDER;
        setTextContent(getElement(DOM_IDS.OT_AUTONOMAS), placeholder);
        setTextContent(getElement(DOM_IDS.OT_ASIGNADAS), placeholder);
        setTextContent(getElement(DOM_IDS.OT_PROCESO), placeholder);
        setTextContent(getElement(DOM_IDS.OT_PENDIENTES), placeholder);
        setTextContent(getElement(DOM_IDS.OT_ATENDIDAS), placeholder);
        setTextContent(getElement(DOM_IDS.OT_TOTAL), placeholder);
    }

    /**
     * Carga y renderiza los registros de tickets
     * @param {string} modulo - Nombre del módulo
     */
    async cargarYRenderizarRegistros(modulo) {
        this.container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Cargando registros...</p>';
        this.filterManager.mostrarBarraFiltros();

        try {
            const tickets = await ticketService.obtenerRegistros(modulo);
            ticketState.setTickets(tickets);
            this.renderizarTarjetas(ticketState.getTicketsFiltrados());
        } catch (error) {
            console.error("Error al cargar registros:", error);
            this.container.innerHTML = '<p class="text-center text-red-500 col-span-full">No se pudieron cargar los registros.</p>';
        }
    }

    /**
     * Renderiza las tarjetas y activa los temporizadores
     * @param {Array} tickets - Array de tickets a renderizar
     */
    renderizarTarjetas(tickets) {
        timerManager.detenerTemporizadores();
        this.cardRenderer.renderizarTarjetas(tickets);
        timerManager.iniciarTemporizadores();
    }

    /**
     * Aplica los filtros y re-renderiza
     */
    aplicarFiltros() {
        const ticketsFiltrados = this.filterManager.aplicarFiltros();
        this.renderizarTarjetas(ticketsFiltrados);
    }

    /**
     * Recarga los datos del módulo actual
     */
    async recargarDatos() {
        const moduloActual = ticketState.getModulo();
        if (moduloActual) {
            await this.actualizarResumen(moduloActual);
            await this.cargarYRenderizarRegistros(moduloActual);
        }
    }

    /**
     * Actualiza solo una tarjeta específica sin recargar todo
     * @param {number} ticketId - ID del ticket a actualizar
     */
    async actualizarTarjetaEspecifica(ticketId) {
        const moduloActual = ticketState.getModulo();

        if (!moduloActual) {
            console.warn('No hay módulo seleccionado');
            return;
        }

        try {
            // Actualizar el resumen (es rápido y no causa parpadeo)
            await this.actualizarResumen(moduloActual);

            // Obtener solo el ticket actualizado
            const ticketActualizado = await ticketService.obtenerTicketActualizado(moduloActual, ticketId);

            // Actualizar el estado
            ticketState.actualizarTicket(ticketActualizado);

            // Actualizar solo la tarjeta específica en el DOM
            const actualizado = this.cardRenderer.actualizarTarjetaIndividual(ticketActualizado);

            if (actualizado) {
                // Si la tarjeta tiene temporizador, reiniciarlo
                const timerElement = document.querySelector(`#timer-${ticketId}`);
                if (timerElement) {
                    timerManager.reiniciarTemporizadorEspecifico(ticketId);
                }
            } else {
                // Si no se pudo actualizar la tarjeta (por ejemplo, cambió de estado y ya no está visible),
                // recargamos todo
                console.warn('No se pudo actualizar la tarjeta específica, recargando todo...');
                await this.cargarYRenderizarRegistros(moduloActual);
            }
        } catch (error) {
            console.error('Error al actualizar tarjeta específica:', error);
            // En caso de error, recargamos todo como fallback
            await this.cargarYRenderizarRegistros(moduloActual);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new SeguimientoApp();
    app.inicializar();
});