/**
 * Gestor de filtros y búsqueda
 * @module ui/filterManager
 */

import { showElement, hideElement } from '../utils/domHelpers.js';
import { ticketState } from '../state/ticketState.js';

/**
 * Clase que maneja los filtros de búsqueda y estado
 */
export class FilterManager {
    constructor(searchInput, statusFilter, filtrosBar) {
        this.searchInput = searchInput;
        this.statusFilter = statusFilter;
        this.filtrosBar = filtrosBar;
    }

    /**
     * Aplica los filtros actuales y retorna los tickets filtrados
     * @returns {Array} Array de tickets filtrados
     */
    aplicarFiltros() {
        const textoBusqueda = this.searchInput.value;
        const estadoSeleccionado = this.statusFilter.value;

        ticketState.setFiltroTexto(textoBusqueda);
        ticketState.setFiltroEstado(estadoSeleccionado);

        return ticketState.aplicarFiltros();
    }

    /**
     * Resetea todos los filtros a sus valores por defecto
     */
    resetearFiltros() {
        this.searchInput.value = '';
        this.statusFilter.value = '';
        ticketState.resetearFiltros();
    }

    /**
     * Muestra la barra de filtros
     */
    mostrarBarraFiltros() {
        showElement(this.filtrosBar);
    }

    /**
     * Oculta la barra de filtros
     */
    ocultarBarraFiltros() {
        hideElement(this.filtrosBar);
    }

    /**
     * Carga las opciones del filtro de estados
     * @param {Array} estados - Array de objetos de estado
     */
    cargarOpcionesEstado(estados) {
        // Limpiar opciones existentes excepto la primera (placeholder)
        while (this.statusFilter.options.length > 1) {
            this.statusFilter.remove(1);
        }

        // Agregar nuevas opciones
        estados.forEach(estado => {
            const option = new Option(estado.nombre, estado.nombre);
            this.statusFilter.appendChild(option);
        });
    }

    /**
     * Obtiene el valor actual del filtro de búsqueda
     * @returns {string} Texto de búsqueda
     */
    getTextoBusqueda() {
        return this.searchInput.value;
    }

    /**
     * Obtiene el valor actual del filtro de estado
     * @returns {string} Estado seleccionado
     */
    getEstadoSeleccionado() {
        return this.statusFilter.value;
    }

    /**
     * Verifica si hay filtros activos
     * @returns {boolean} true si hay filtros activos
     */
    hayFiltrosActivos() {
        return this.searchInput.value.trim() !== '' || this.statusFilter.value !== '';
    }
}