/**
 * Gestor de modales SweetAlert2
 * @module ui/modalManager
 */

import { SWAL_DARK_MODE_CONFIG, OPCIONES_SATISFACCION, TIEMPOS, SELECT2_CONFIG } from '../config/constants.js';
import { isDarkMode } from '../utils/domHelpers.js';
import { ticketService } from '../api/ticketService.js';

/**
 * Clase que maneja todos los modales de la aplicación
 */
export class ModalManager {
    /**
     * Obtiene la configuración de SweetAlert2 según el modo oscuro
     * @returns {object} Configuración de estilos
     * @private
     */
    #getConfiguracionDarkMode() {
        return isDarkMode() ? SWAL_DARK_MODE_CONFIG : {};
    }

    /**
     * Muestra un modal de carga
     * @param {string} mensaje - Mensaje a mostrar
     */
    mostrarCargando(mensaje = 'Procesando...') {
        Swal.fire({
            title: mensaje,
            text: 'Por favor, espera.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            ...this.#getConfiguracionDarkMode()
        });
    }

    /**
     * Muestra un modal de éxito
     * @param {string} mensaje - Mensaje de éxito
     * @param {string} titulo - Título del modal
     */
    async mostrarExito(mensaje, titulo = '¡Éxito!') {
        await Swal.fire({
            title: titulo,
            text: mensaje,
            icon: 'success',
            timer: TIEMPOS.MENSAJE_EXITO,
            showConfirmButton: false,
            ...this.#getConfiguracionDarkMode()
        });
    }

    /**
     * Muestra un modal de error
     * @param {string} mensaje - Mensaje de error
     * @param {string} titulo - Título del modal
     */
    mostrarError(mensaje, titulo = 'Error') {
        const config = this.#getConfiguracionDarkMode();
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: 'error',
            ...config,
            ...(isDarkMode() && { confirmButtonColor: '#ef4444' })
        });
    }

    /**
     * Muestra el modal para iniciar atención
     * @param {number} ticketId - ID del ticket
     * @param {string} maquina - Nombre de la máquina
     * @param {HTMLElement} boton - Botón que disparó la acción
     * @returns {Promise<object|null>} Datos del formulario o null si se cancela
     */
    async mostrarModalIniciarAtencion(ticketId, maquina, boton) {
        try {
            // Si la máquina es 'N/A', obtener todas las clases y números sin filtro
            const data = maquina === 'N/A'
                ? await ticketService.obtenerTodasClasesMaquina()
                : await ticketService.obtenerClasesMaquina(maquina);
            const clases = data.clases || [];
            const numerosMaquina = data.numeroMaquina || [];

            const swalOptions = {
                title: 'Iniciar Atención',
                html: `
                    <div class="text-left">
                        <label class="block mb-2 text-sm font-medium">Clase de Máquina:</label>
                        <select id="clase-select" class="swal2-select" style="width: 100%">
                            <option value=""></option>
                            ${clases.map(c => `<option value="${c.class}" data-tiempo="${c.TimeEstimado}">${c.class} (${c.TimeEstimado} min)</option>`).join('')}
                        </select>

                        <label class="block mt-4 mb-2 text-sm font-medium">Número de Máquina:</label>
                        <select id="numero-maquina-select" class="swal2-select" style="width: 100%">
                            <option value=""></option>
                            ${numerosMaquina.map(nm => `<option value="${nm.Remplacad}">${nm.Remplacad}</option>`).join('')}
                        </select>
                    </div>`,
                focusConfirm: false,
                didOpen: () => {
                    $('#clase-select').select2({
                        ...SELECT2_CONFIG.MODAL,
                        placeholder: 'Selecciona una clase',
                    });
                    $('#numero-maquina-select').select2({
                        ...SELECT2_CONFIG.MODAL,
                        placeholder: 'Selecciona el número',
                    });
                },
                preConfirm: () => {
                    const claseSelect = document.getElementById('clase-select');
                    const numeroMaquinaSelect = document.getElementById('numero-maquina-select');

                    if (!claseSelect.value) {
                        Swal.showValidationMessage('Debes seleccionar una clase.');
                        return false;
                    }
                    if (!numeroMaquinaSelect.value) {
                        Swal.showValidationMessage('Debes seleccionar un número de máquina.');
                        return false;
                    }

                    const tiempoEstimado = claseSelect.options[claseSelect.selectedIndex].dataset.tiempo;

                    return {
                        clase: claseSelect.value,
                        numero_maquina: numeroMaquinaSelect.value,
                        tiempo_estimado: tiempoEstimado
                    };
                },
                ...this.#getConfiguracionDarkMode()
            };

            const { value: formValues } = await Swal.fire(swalOptions);
            return formValues || null;

        } catch (error) {
            console.error('Error al mostrar el modal:', error);
            this.mostrarError(error.message);
            return null;
        }
    }

    /**
     * Muestra el modal de encuesta de satisfacción
     * @returns {Promise<string|null>} Valor de satisfacción o null si se cancela
     */
    async mostrarModalEncuesta() {
        const opcionesHTML = OPCIONES_SATISFACCION.map(opt => `
            <label style="display:flex; align-items:center; margin-bottom:10px; cursor:pointer; padding: 8px; border-radius: 8px;" class="sw_satisfaccion_label">
                <input type="radio" name="satisfaccion" value="${opt.valor}" style="margin-right:12px; transform: scale(1.2);">
                <span style="font-size:1.5em; margin-right:12px;">${opt.emoji}</span>
                <span>${opt.texto}</span>
            </label>
        `).join('');

        const darkMode = isDarkMode();
        const { value: satisfaccion } = await Swal.fire({
            title: 'Encuesta de Satisfacción',
            html: `
                <p class="mb-4">¿Cómo calificarías el servicio recibido?</p>
                <div>${opcionesHTML}</div>
                <style>
                .sw_satisfaccion_label:has(input:checked) { 
                    background-color: ${darkMode ? '#3b82f6' : '#dbeafe'};
                }
                </style>
            `,
            confirmButtonText: 'Finalizar y Enviar',
            focusConfirm: false,
            ...this.#getConfiguracionDarkMode(),
            preConfirm: () => {
                const seleccion = document.querySelector('input[name="satisfaccion"]:checked');
                if (!seleccion) {
                    Swal.showValidationMessage('Por favor, selecciona una calificación.');
                    return false;
                }
                return seleccion.value;
            }
        });

        return satisfaccion || null;
    }

    /**
     * Muestra el modal para finalizar atención
     * @param {number} ticketId - ID del ticket
     * @param {string} horaFinalizacion - Hora de finalización
     * @param {HTMLElement} boton - Botón que disparó la acción
     * @returns {Promise<object|null>} Datos completos o null si se cancela
     */
    async mostrarModalFinalizarAtencion(ticketId, horaFinalizacion, boton) {
        try {
            // Obtener catálogos
            const { fallas, causas, acciones } = await ticketService.obtenerCatalogosFinalizacion();

            // Construir opciones HTML
            const fallasOptionsHTML = fallas.map(falla =>
                `<option value="${falla.nombre}">${falla.nombre}</option>`
            ).join('');

            const causasOptionsHTML = causas.map(causa =>
                `<option value="${causa.nombre}">${causa.nombre}</option>`
            ).join('');

            const accionesOptionsHTML = acciones.map(accion =>
                `<option value="${accion.nombre}">${accion.nombre}</option>`
            ).join('');

            const swalOptions = {
                title: 'Finalizar Atención',
                html: `
                    <div class="text-left space-y-4">
                        <div>
                            <label for="falla-select" class="block mb-2 text-sm font-medium">Seleccione la falla:</label>
                            <select id="falla-select" class="swal2-select" style="width: 100%;">
                                <option value=""></option> ${fallasOptionsHTML}
                            </select>
                        </div>
                        <div>
                            <label for="causa-falla-select" class="block mb-2 text-sm font-medium">Seleccione la causa de la falla:</label>
                            <select id="causa-falla-select" class="swal2-select" style="width: 100%;">
                                <option value=""></option>
                                ${causasOptionsHTML}
                            </select>
                        </div>
                        <div>
                            <label for="accion-implementada-select" class="block mb-2 text-sm font-medium">Seleccione la acción que implementó:</label>
                            <select id="accion-implementada-select" class="swal2-select" style="width: 100%;">
                                <option value=""></option>
                                <option value="OTRO">OTRO</option>
                                ${accionesOptionsHTML}
                            </select>
                        </div>
                        <div>
                            <label for="comentarios-textarea" class="block mb-2 text-sm font-medium">Comentarios adicionales (opcional):</label>
                            <textarea id="comentarios-textarea" class="swal2-textarea" placeholder="Añade detalles relevantes aquí..."></textarea>
                        </div>
                    </div>`,
                focusConfirm: false,
                didOpen: () => {
                    $('#falla-select').select2({
                        ...SELECT2_CONFIG.MODAL,
                        placeholder: 'Selecciona una falla',
                    });
                    $('#causa-falla-select').select2({
                        ...SELECT2_CONFIG.MODAL,
                        placeholder: 'Selecciona una causa',
                    });
                    $('#accion-implementada-select').select2({
                        ...SELECT2_CONFIG.MODAL,
                        placeholder: 'Selecciona una acción',
                    });
                },
                preConfirm: () => {
                    const falla = document.getElementById('falla-select').value;
                    const causa = document.getElementById('causa-falla-select').value;
                    const accion = document.getElementById('accion-implementada-select').value;

                    if (!falla) {
                        Swal.showValidationMessage('Debes seleccionar la falla.');
                        return false;
                    }
                    if (!causa) {
                        Swal.showValidationMessage('Debes seleccionar la causa de la falla.');
                        return false;
                    }
                    if (!accion) {
                        Swal.showValidationMessage('Debes seleccionar la acción implementada.');
                        return false;
                    }

                    return {
                        falla: falla,
                        causaFalla: causa,
                        accionImplementada: accion,
                        comentarios: document.getElementById('comentarios-textarea').value.trim()
                    };
                },
                ...this.#getConfiguracionDarkMode()
            };

            const { value: formValues } = await Swal.fire(swalOptions);

            if (formValues) {
                // Mostrar encuesta de satisfacción
                const satisfaccionValue = await this.mostrarModalEncuesta();

                if (satisfaccionValue) {
                    return {
                        ...formValues,
                        horaFinalizacion,
                        satisfaccion: satisfaccionValue
                    };
                }
            }

            return null;

        } catch (error) {
            console.error("Error al preparar el modal de finalización:", error);
            this.mostrarError(error.message);
            return null;
        }
    }

    /**
     * Cierra el modal actual de SweetAlert2
     */
    cerrarModal() {
        Swal.close();
    }

    /**
     * Muestra una alerta temporal de advertencia (5 minutos restantes)
     * @param {object} ticketInfo - Información del ticket
     */
    mostrarAlertaAdvertencia(ticketInfo) {
        const { folio, descripcion, tiempoRestante } = ticketInfo;
        const minutos = Math.floor(tiempoRestante / 60);

        Swal.fire({
            title: '⚠️ Advertencia de Tiempo',
            html: `
                <div class="text-left">
                    <p class="mb-2"><strong>Ticket:</strong> ${folio}</p>
                    <p class="mb-2"><strong>Descripción:</strong> ${descripcion}</p>
                    <p class="mb-2 text-yellow-600 dark:text-yellow-400"><strong>Tiempo restante:</strong> ${minutos} minutos</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">El tiempo de atención está por agotarse.</p>
                </div>
            `,
            icon: 'warning',
            timer: TIEMPOS.ALERTA_DURACION,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            ...this.#getConfiguracionDarkMode()
        });
    }

    /**
     * Muestra una alerta temporal crítica (1 minuto restante)
     * @param {object} ticketInfo - Información del ticket
     */
    mostrarAlertaCritica(ticketInfo) {
        const { folio, descripcion, tiempoRestante } = ticketInfo;
        const segundos = tiempoRestante;

        Swal.fire({
            title: '🔥 ¡Tiempo Crítico!',
            html: `
                <div class="text-left">
                    <p class="mb-2"><strong>Ticket:</strong> ${folio}</p>
                    <p class="mb-2"><strong>Descripción:</strong> ${descripcion}</p>
                    <p class="mb-2 text-orange-600 dark:text-orange-400"><strong>Tiempo restante:</strong> ${segundos} segundos</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">¡Finaliza la atención pronto!</p>
                </div>
            `,
            icon: 'warning',
            timer: TIEMPOS.ALERTA_DURACION,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            iconColor: '#f97316',
            ...this.#getConfiguracionDarkMode()
        });
    }

    /**
     * Muestra una alerta temporal de tiempo excedido
     * @param {object} ticketInfo - Información del ticket
     */
    mostrarAlertaExcedido(ticketInfo) {
        const { folio, descripcion, tiempoExcedido } = ticketInfo;
        const minutos = Math.floor(Math.abs(tiempoExcedido) / 60);
        const segundos = Math.abs(tiempoExcedido) % 60;

        Swal.fire({
            title: '🚨 ¡Tiempo Excedido!',
            html: `
                <div class="text-left">
                    <p class="mb-2"><strong>Ticket:</strong> ${folio}</p>
                    <p class="mb-2"><strong>Descripción:</strong> ${descripcion}</p>
                    <p class="mb-2 text-red-600 dark:text-red-400"><strong>Tiempo excedido:</strong> ${minutos}m ${segundos}s</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">El tiempo límite ha sido superado.</p>
                </div>
            `,
            icon: 'error',
            timer: TIEMPOS.ALERTA_DURACION,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            ...this.#getConfiguracionDarkMode()
        });
    }
}

// Exportar una instancia única del gestor
export const modalManager = new ModalManager();