/**
 * Renderizador de tarjetas de tickets
 * @module ui/cardRenderer
 */

import { ESTADO_CLASSES, DEFAULTS } from '../config/constants.js';
import { clearElement, appendHTML } from '../utils/domHelpers.js';

/**
 * Clase que maneja el renderizado de tarjetas de tickets
 */
export class CardRenderer {
    constructor(container) {
        this.container = container;
    }

    /**
     * Renderiza todas las tarjetas de tickets
     * @param {Array} tickets - Array de objetos de ticket
     */
    renderizarTarjetas(tickets) {
        clearElement(this.container);

        if (tickets.length === 0) {
            this.container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No hay solicitudes para este módulo.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const cardHTML = this.#crearTarjetaHTML(ticket);
            appendHTML(this.container, cardHTML);
        });
    }

    /**
     * Crea el HTML para una tarjeta individual
     * @param {object} ticket - Objeto de ticket
     * @returns {string} HTML de la tarjeta
     * @private
     */
    #crearTarjetaHTML(ticket) {
        const estado = ticket.catalogo_estado?.nombre || 'DESCONOCIDO';
        const asignacion = ticket.asignaciones?.[0];
        const mecanico = asignacion?.nombre_mecanico || 'Sin asignar';
        const numero_mecanico = asignacion?.numero_empleado_mecanico;

        const { colorTexto, ringClass } = this.#obtenerColoresEstado(estado);
        const imgUrl = this.#obtenerImagenMecanico(estado, numero_mecanico);

        return `
            <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col justify-between pt-5 pb-4 px-5">
                
                <!-- Imagen del Mecánico (posicionada absolutamente) -->
                <div class="absolute -top-5 -left-5 z-10">
                    <img class="w-20 h-20 rounded-full ring-4 ${ringClass} shadow-lg object-cover bg-white"
                         src="${imgUrl}" 
                         alt="Foto de ${mecanico}"
                         onerror="this.onerror=null; this.src='${DEFAULTS.IMAGEN_DEFAULT}';">
                </div>

                <!-- Contenido de la tarjeta -->
                <div class="pl-16">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-lg text-gray-900 dark:text-gray-100">${ticket.folio}</h3>
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${colorTexto}">${estado}</span>
                    </div>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 truncate" title="${ticket.descripcion_problema}">
                        ${ticket.descripcion_problema}
                    </p>
                    <div class="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1">
                        <p><strong>Area/Modulo:</strong> <span class="font-medium text-gray-800 dark:text-gray-200">${ticket.modulo}</span></p>
                        <p><strong>Numero Operario:</strong> <span class="font-medium text-gray-800 dark:text-gray-200">${ticket.numero_empleado_operario}</span></p>
                        <p><strong>Operario:</strong> <span class="font-medium text-gray-800 dark:text-gray-200">${ticket.nombre_operario}</span></p>
                        <p><strong>Máquina:</strong> <span class="font-medium text-gray-800 dark:text-gray-200">${ticket.maquina}</span></p>
                        <p><strong>Mecánico:</strong> <span class="font-medium text-gray-800 dark:text-gray-200">${mecanico}</span></p>
                        <p><strong>Supervisor:</strong> <span class="font-medium text-gray-800 dark:text-gray-200">${ticket.nombre_supervisor}</span></p>
                    </div>
                </div>

                <!-- Footer de la tarjeta -->
                <div class="pl-16 mt-4">
                    <div class="text-xs text-gray-500 flex justify-between mb-3">
                        <span>Creado: ${ticket.fecha_creacion_formateada}</span>
                        <span>Actualizado: ${ticket.fecha_actualizacion_formateada}</span>
                    </div>
                </div>
                <div class="pl-16">
                    <div class="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                        ${this.#generarBotonesAccion(ticket)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene los colores CSS según el estado
     * @param {string} estado - Estado del ticket
     * @returns {object} Objeto con colorTexto y ringClass
     * @private
     */
    #obtenerColoresEstado(estado) {
        const colores = ESTADO_CLASSES[estado] || ESTADO_CLASSES.DESCONOCIDO;
        return {
            colorTexto: colores.texto,
            ringClass: colores.ring
        };
    }

    /**
     * Obtiene la URL de la imagen del mecánico
     * @param {string} estado - Estado del ticket
     * @param {string} numeroMecanico - Número de empleado del mecánico
     * @returns {string} URL de la imagen
     * @private
     */
    #obtenerImagenMecanico(estado, numeroMecanico) {
        if (estado === 'AUTONOMO' || !numeroMecanico) {
            return DEFAULTS.IMAGEN_AVATAR;
        }
        return `/fotos-usuarios/${numeroMecanico}.webp`;
    }

    /**
     * Genera los botones de acción según el estado del ticket
     * @param {object} ticket - Objeto de ticket
     * @returns {string} HTML de los botones
     * @private
     */
    #generarBotonesAccion(ticket) {
        const estado = ticket.catalogo_estado?.nombre;

        if (estado === 'ASIGNADO') {
            return `
                <div class="w-full border border-gray-500 rounded-md p-4 text-center shadow-sm">
                    <button class="iniciar-atencion-btn text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            data-ticket-id="${ticket.id}"
                            data-maquina="${ticket.maquina}">
                        Iniciar Atención
                    </button>
                </div>
            `;
        } else if (estado === 'EN PROCESO') {
            let botonesHTML = '';

            if (ticket.estado_bahia == 1) {
                // Estado pausado: solo botón de reanudar
                botonesHTML = `
                    <button class="reanudar-bahia-btn text-xs bg-violet-950 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded"
                            data-ticket-id="${ticket.id}">
                        Reanudar Atención
                    </button>
                `;
            } else {
                // Estado activo: botones de pausar y finalizar
                botonesHTML = `
                    <button class="activar-bahia-btn text-xs bg-violet-400 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded"
                            data-ticket-id="${ticket.id}">
                        Activar Tiempo Bahía
                    </button>
                    <button class="detener-atencion-btn text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            data-ticket-id="${ticket.id}"
                            data-maquina="${ticket.maquina}">
                        Finalizar Atención
                    </button>
                `;
            }

            return `
                <div class="w-full border border-gray-500 rounded-md p-4 text-center shadow-sm">
                    <div class="font-mono text-2xl font-bold">
                        <span class="text-xs text-gray-500">Tiempo estimado: ${ticket.tiempo_estimado_minutos} minutos</span>
                    </div>
                    <h2 class="font-mono text-2xl text-gray-800 dark:text-gray-100 font-bold">
                        <span class="material-symbols-outlined">timer</span> Tiempo Restante: 
                    </h2>
                    <span id="timer-${ticket.id}"
                        class="timer-display font-mono text-xl font-bold text-gray-800 dark:text-gray-100"
                        data-start-time="${ticket.hora_inicio_diagnostico}"
                        data-duration-minutes="${ticket.tiempo_estimado_minutos}"
                        data-estado-bahia="${ticket.estado_bahia}"
                        data-tiempos-bahia='${JSON.stringify(ticket.tiempos_bahia_data || [])}'>
                        --:--
                    </span>
                    
                    <div class="mt-4 flex justify-center items-center gap-x-2">
                        ${botonesHTML}
                    </div>
                </div>
            `;
        } else if (estado === 'AUTONOMO') {
            return `<p>Solucionado</p>`;
        } else if (estado === 'ATENDIDO') {
            return `
                <div class="w-full border border-gray-500 rounded-md p-4 text-center shadow-sm">
                    <h2 class="font-mono text-2xl text-gray-800 dark:text-gray-100 font-bold">
                        <span class="material-symbols-outlined">timer</span> Tiempo total de atención: 
                    </h2>
                    <h1>${ticket.tiempo_real_minutos} Minutos y ${ticket.tiempo_real_segundos} Segundos</h1>
                </div>
            `;
        }

        return '';
    }

    /**
     * Actualiza una tarjeta específica sin re-renderizar todas
     * @param {object} ticket - Objeto de ticket actualizado
     * @returns {boolean} true si se actualizó correctamente
     */
    actualizarTarjetaIndividual(ticket) {
        const tarjetaExistente = this.container.querySelector(`[data-ticket-id="${ticket.id}"]`)?.closest('.relative');

        if (!tarjetaExistente) {
            console.warn(`Tarjeta con ID ${ticket.id} no encontrada`);
            return false;
        }

        // Crear el HTML de la nueva tarjeta
        const nuevoHTML = this.#crearTarjetaHTML(ticket);

        // Crear un elemento temporal para parsear el HTML
        const temp = document.createElement('div');
        temp.innerHTML = nuevoHTML;
        const nuevaTarjeta = temp.firstElementChild;

        // Reemplazar la tarjeta antigua con la nueva
        tarjetaExistente.replaceWith(nuevaTarjeta);

        return true;
    }

    /**
     * Actualiza solo el resumen de una tarjeta (sin cambiar estado)
     * @param {number} ticketId - ID del ticket
     * @param {object} datosActualizados - Datos a actualizar
     */
    actualizarDatosTarjeta(ticketId, datosActualizados) {
        const tarjeta = this.container.querySelector(`[data-ticket-id="${ticketId}"]`)?.closest('.relative');

        if (!tarjeta) {
            console.warn(`Tarjeta con ID ${ticketId} no encontrada`);
            return;
        }

        // Actualizar campos específicos sin re-renderizar toda la tarjeta
        if (datosActualizados.fecha_actualizacion_formateada) {
            const spanActualizacion = tarjeta.querySelector('.text-xs.text-gray-500 span:last-child');
            if (spanActualizacion) {
                spanActualizacion.textContent = `Actualizado: ${datosActualizados.fecha_actualizacion_formateada}`;
            }
        }
    }

    /**
     * Limpia el contenedor de tarjetas
     */
    limpiar() {
        clearElement(this.container);
    }
}