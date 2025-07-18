document.addEventListener('DOMContentLoaded', function() {

    // 1. Seleccionamos los elementos del DOM.
    const moduloSelect = document.getElementById('modulo-select');
    const container = document.getElementById('seguimiento-ot-container');
    const filtrosBar = document.getElementById('filtros-bar');
    const searchInput = document.getElementById('search-ot');
    const statusFilter = document.getElementById('filter-status');

    // Variable para guardar los datos y poder filtrarlos después sin llamar a la API
    let todosLosTicketsDelModulo = [];
    

    function inicializar() {
        // Inicializamos la librería Select2.
        $(moduloSelect).select2({
            placeholder: 'Selecciona tu módulo de atención',
            allowClear: true
        });

        configurarEventListeners();
        cargarModulos();
        cargarFiltroDeEstados(); 
    }

    // --- CONFIGURACIÓN DE EVENTOS ---
    function configurarEventListeners() {
        // Evento 'change' para el selector de módulo principal.
        $(moduloSelect).on('change', handleModuloChange);

        // Eventos para los filtros secundarios.
        searchInput.addEventListener('input', aplicarFiltros);
        statusFilter.addEventListener('change', aplicarFiltros);

        container.addEventListener('click', function(e) {
            // Verificamos si el elemento clickeado (o su padre) es un botón de "Iniciar Atención"
            const iniciarBtn = e.target.closest('.iniciar-atencion-btn');
            if (iniciarBtn) {
                e.preventDefault(); // Prevenimos cualquier comportamiento por defecto
                const ticketId = iniciarBtn.dataset.ticketId;
                const maquina = iniciarBtn.dataset.maquina;
                // Llamamos a la función que mostrará el modal
                mostrarModalIniciarAtencion(ticketId, maquina);
            }

            const finalizarBtn = e.target.closest('.detener-atencion-btn');
            if (finalizarBtn) {
                e.preventDefault();
                const ticketId = finalizarBtn.dataset.ticketId;

                // 1. Capturamos la hora actual precisa
                const ahora = new Date();
                const horaFinalizacion = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;
                
                // 2. Llamamos a la nueva función que mostrará el modal de finalización
                mostrarModalFinalizarAtencion(ticketId, horaFinalizacion);
            }

            const activarBahiaBtn = e.target.closest('.activar-bahia-btn');
                if (activarBahiaBtn) {
                    e.preventDefault();
                    const ticketId = activarBahiaBtn.dataset.ticketId;
                    handleActivarBahia(ticketId); // Llamamos a la nueva función manejadora
                }

                const reanudarBahiaBtn = e.target.closest('.reanudar-bahia-btn');
            if (reanudarBahiaBtn) {
                e.preventDefault();
                const ticketId = reanudarBahiaBtn.dataset.ticketId;
                enviarFinalizacionBahia(ticketId); // Llamamos directamente a la función de envío
            }
        });
    }

    /**
     * Envía la solicitud al backend para finalizar la pausa activa.
     * @param {string} ticketId - El ID del ticket cuya atención se va a reanudar.
     */
    async function enviarFinalizacionBahia(ticketId) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        try {
            const response = await fetch('/FollowOTV2/finalizarBahia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    ticket_id: ticketId
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'No se pudo reanudar la atención.');
            }

            await Swal.fire({
                title: 'Atención Reanudada',
                text: result.message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb' })
            });

            // Recargamos todo para que la tarjeta refleje el nuevo estado (botones de "Activar" y "Finalizar")
            const moduloSeleccionado = moduloSelect.value;
            if (moduloSeleccionado) {
                actualizarResumen(moduloSeleccionado);
                cargarYRenderizarRegistros(moduloSeleccionado);
            }

        } catch (error) {
            console.error('Error al reanudar la bahía:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#ef4444' })
            });
        }
    }


    /**
     * Maneja la acción de activar el tiempo de bahía.
     * Muestra un modal para que el usuario pueda añadir un motivo.
     * @param {string} ticketId - El ID del ticket que se va a pausar.
     */
    async function handleActivarBahia(ticketId) {
        const isDarkMode = document.documentElement.classList.contains('dark');

        // Preguntamos opcionalmente por un motivo para la pausa
        const { value: motivo } = await Swal.fire({
            title: 'Activar Tiempo Bahía',
            input: 'text',
            inputLabel: 'Motivo de la pausa (opcional)',
            inputPlaceholder: 'Ej: Esperando refacción, consulta con supervisor...',
            showCancelButton: true,
            confirmButtonText: 'Activar Pausa',
            cancelButtonText: 'Cancelar',
            // Estilos para modo oscuro
            ...(isDarkMode && {
                background: '#1f2937',
                color: '#f9fafb',
                confirmButtonColor: '#8b5cf6' // Un color violeta
            })
        });

        // Si el usuario confirma (incluso si el motivo está vacío), procedemos.
        // 'motivo' será undefined si el usuario presiona "Cancelar".
        if (typeof motivo !== 'undefined') {
            await enviarActivacionBahia(ticketId, motivo);
        }
    }

    /**
     * NUEVA: Muestra un modal para la encuesta de satisfacción.
     * @returns {Promise<string|undefined>} El valor numérico de la satisfacción o undefined si se cancela.
     */
    async function mostrarModalEncuesta() {
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // Mapeo de valores: Texto amigable y emojis para el usuario, número para el backend.
        const opciones = [
            { valor: '4', emoji: '🌟', texto: 'Excelente' },
            { valor: '3', emoji: '👍', texto: 'Bueno' },
            { valor: '2', emoji: '😐', texto: 'Regular' },
            { valor: '1', emoji: '👎', texto: 'Malo' },
        ];

        const opcionesHTML = opciones.map(opt => `
            <label style="display:flex; align-items:center; margin-bottom:10px; cursor:pointer; padding: 8px; border-radius: 8px;" class="sw_satisfaccion_label">
                <input type="radio" name="satisfaccion" value="${opt.valor}" style="margin-right:12px; transform: scale(1.2);">
                <span style="font-size:1.5em; margin-right:12px;">${opt.emoji}</span>
                <span>${opt.texto}</span>
            </label>
        `).join('');

        const { value: satisfaccion } = await Swal.fire({
            title: 'Encuesta de Satisfacción',
            html: `
                <p class="mb-4">¿Cómo calificarías el servicio recibido?</p>
                <div>${opcionesHTML}</div>
                <style>
                .sw_satisfaccion_label:has(input:checked) { 
                    background-color: ${isDarkMode ? '#3b82f6' : '#dbeafe'};
                }
                </style>
            `,
            confirmButtonText: 'Finalizar y Enviar',
            focusConfirm: false,
            // Aplicamos estilos de modo oscuro si es necesario
            ...(isDarkMode && {
                background: '#1f2937',
                color: '#f9fafb',
                confirmButtonColor: '#3b82f6'
            }),
            preConfirm: () => {
                const seleccion = document.querySelector('input[name="satisfaccion"]:checked');
                if (!seleccion) {
                    Swal.showValidationMessage('Por favor, selecciona una calificación.');
                    return false;
                }
                return seleccion.value;
            }
        });

        return satisfaccion;
    }

    /**
     * NUEVA: Muestra el modal para finalizar la atención y registrar la causa.
     * @param {number} ticketId - El ID del ticket.
     * @param {string} horaFinalizacion - La hora exacta (HH:MM:SS) en que se hizo clic.
     */
    async function mostrarModalFinalizarAtencion(ticketId, horaFinalizacion) {
        const isDarkMode = document.documentElement.classList.contains('dark');

        try {
            // 1. OBTENER DATOS DE LAS 3 RUTAS SIMULTÁNEAMENTE
            // Usamos Promise.all para que las 3 llamadas se hagan al mismo tiempo y esperamos a que todas terminen.
            const [fallasResponse, causasResponse, accionesResponse] = await Promise.all([
                fetch('/FollowOTV2/obtenerFallas'),
                fetch('/FollowOTV2/obtenerCausas'),
                fetch('/FollowOTV2/obtenerAcciones')
            ]);

            // Verificamos que todas las respuestas sean correctas
            if (!fallasResponse.ok || !causasResponse.ok || !accionesResponse.ok) {
                throw new Error('No se pudieron cargar los catálogos para finalizar la atención.');
            }

            // Extraemos el JSON de cada respuesta
            const fallas = await fallasResponse.json();
            const causas = await causasResponse.json();
            const acciones = await accionesResponse.json();

            // 2. CONSTRUIR EL HTML DE LAS OPCIONES PARA CADA SELECT
            // Usamos map() para convertir cada objeto del array en un string <option>
            // y join('') para unirlos todos en un solo bloque de texto.
            const fallasOptionsHTML = fallas.map(falla => 
                `<option value="${falla.nombre}">${falla.nombre}</option>`
            ).join('');

            const causasOptionsHTML = causas.map(causa => 
                `<option value="${causa.nombre}">${causa.nombre}</option>`
            ).join('');

            const accionesOptionsHTML = acciones.map(accion => 
                `<option value="${accion.nombre}">${accion.nombre}</option>`
            ).join('');

            // 3. ACTUALIZAR LA CONFIGURACIÓN DEL MODAL (SWAL)
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
                    // Inicializamos Select2 en los TRES menús desplegables
                    $('#falla-select').select2({
                        dropdownParent: $('.swal2-popup'),
                        placeholder: 'Selecciona una falla',
                    });
                    $('#causa-falla-select').select2({
                        dropdownParent: $('.swal2-popup'),
                        placeholder: 'Selecciona una causa',
                    });
                    $('#accion-implementada-select').select2({
                        dropdownParent: $('.swal2-popup'),
                        placeholder: 'Selecciona una acción',
                    });
                },
                preConfirm: () => {
                    // Validación de los TRES campos antes de enviar
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

                    // Devolvemos los datos del formulario
                    return {
                        falla: falla,
                        causaFalla: causa,
                        accionImplementada: accion,
                        comentarios: document.getElementById('comentarios-textarea').value.trim()
                    };
                }
            };

            // Aplicamos estilos de modo oscuro si es necesario
            if (isDarkMode) {
                swalOptions.background = '#1f2937';
                swalOptions.color = '#f9fafb';
                swalOptions.confirmButtonColor = '#3b82f6';
            }

            // Mostramos el modal y esperamos la respuesta
            const { value: formValues } = await Swal.fire(swalOptions);

            if (formValues) {
                // ...mostramos el SEGUNDO modal (Encuesta)
                const satisfaccionValue = await mostrarModalEncuesta();
                
                // Si el usuario completó la encuesta...
                if (satisfaccionValue) {
                    // ...AHORA SÍ enviamos TODO al backend.
                    await enviarFinalizacionAtencion(ticketId, horaFinalizacion, formValues, satisfaccionValue);
                }
            }

        } catch (error) {
            console.error("Error al preparar el modal de finalización:", error);
            // Si algo falla, mostramos un modal de error
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#3b82f6' })
            });
        }
    }

    // --- MANEJADORES DE EVENTOS ---
    function handleModuloChange() {
        const moduloSeleccionado = this.value;
        if (moduloSeleccionado) {
            actualizarResumen(moduloSeleccionado);
            cargarYRenderizarRegistros(moduloSeleccionado);
        } else {
            resetearResumen();
            container.innerHTML = '';
            filtrosBar.classList.add('hidden');
            todosLosTicketsDelModulo = [];
            // Reseteamos los filtros al limpiar la selección principal
            searchInput.value = '';
            statusFilter.value = '';
        }
    }

    // --- FUNCIONES ---

    async function cargarModulos() {
        try {
            const response = await fetch('/FollowOTV2/obtenerAreaModulos');
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const modulos = await response.json();
            modulos.forEach(modulo => {
                const option = new Option(modulo, modulo);
                moduloSelect.appendChild(option);
            });
            $(moduloSelect).trigger('change.select2');
        } catch (error) {
            console.error("No se pudieron cargar los módulos:", error);
        }
    }

    async function cargarFiltroDeEstados() {
        try {
            const response = await fetch('/FollowOTV2/obtenerCatalogoEstados');
            if (!response.ok) throw new Error('Error al cargar estados');
            const estados = await response.json();

            estados.forEach(estado => {
                // Usamos estado.nombre para el texto y el valor.
                const option = new Option(estado.nombre, estado.nombre);
                statusFilter.appendChild(option);
            });
        } catch (error) {
            console.error("No se pudieron cargar los estados del filtro:", error);
        }
    }

    // --- FUNCIONES DE MANEJO DE DATOS Y RENDERIZADO ---

    function handleModuloChange() {
        const moduloSeleccionado = this.value;
        if (moduloSeleccionado) {
            actualizarResumen(moduloSeleccionado);
            cargarYRenderizarRegistros(moduloSeleccionado);
        } else {
            resetearResumen();
            container.innerHTML = '';
            filtrosBar.classList.add('hidden');
            todosLosTicketsDelModulo = [];
            // Reseteamos los filtros
            searchInput.value = '';
            statusFilter.value = '';
        }
    }

    async function actualizarResumen(modulo) {
        // ... (esta función se queda igual)
        try {
            const response = await fetch(`/FollowOTV2/obtenerResumen/${modulo}`);
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            const resumen = await response.json();
            document.getElementById('ot-autonomas').textContent = resumen.AUTONOMO ?? 0;
            document.getElementById('ot-asignadas').textContent = resumen.ASIGNADO ?? 0;
            document.getElementById('ot-proceso').textContent = resumen['EN PROCESO'] ?? 0;
            document.getElementById('ot-pendientes').textContent = resumen.PENDIENTE ?? 0;
            document.getElementById('ot-atendidas').textContent = resumen.ATENDIDO ?? 0;
            document.getElementById('ot-total').textContent = resumen.TOTAL ?? 0;
        } catch (error) {
            console.error("Error al cargar el resumen:", error);
        }
    }

    function resetearResumen() {
        // ... (esta función se queda igual)
        document.getElementById('ot-autonomas').textContent = '--';
        document.getElementById('ot-asignadas').textContent = '--';
        document.getElementById('ot-proceso').textContent = '--';
        document.getElementById('ot-pendientes').textContent = '--';
        document.getElementById('ot-atendidas').textContent = '--';
        document.getElementById('ot-total').textContent = '--';
    }

    /**
     * NUEVA: Carga los registros detallados y llama a la función para renderizarlos.
     * @param {string} modulo - El módulo seleccionado.
     */
    async function cargarYRenderizarRegistros(modulo) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Cargando registros...</p>';
        filtrosBar.classList.remove('hidden'); // Mostramos la barra de filtros

        try {
            const response = await fetch(`/FollowOTV2/obtenerRegistros/${modulo}`);
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            
            todosLosTicketsDelModulo = await response.json();
            renderizarTarjetas(todosLosTicketsDelModulo);

        } catch (error) {
            console.error("Error al cargar los registros:", error);
            container.innerHTML = '<p class="text-center text-red-500 col-span-full">No se pudieron cargar los registros.</p>';
        }
    }

    /**
     * NUEVA: Renderiza las tarjetas en el contenedor.
     * @param {Array} tickets - Un array de objetos de ticket.
     */
    let activeTimers = [];

    // NUEVO: Función para limpiar todos los temporizadores activos y evitar fugas de memoria.
    function clearActiveTimers() {
        activeTimers.forEach(timerId => clearInterval(timerId));
        activeTimers = [];
    }

    function renderizarTarjetas(tickets) {
        clearActiveTimers(); // Limpiamos cualquier temporizador que estuviera corriendo.
        container.innerHTML = ''; 

        if (tickets.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No hay solicitudes para este módulo.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const cardHTML = crearTarjetaHTML(ticket);
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        iniciarTemporizadores(); // Buscamos y activamos todos los nuevos temporizadores.
    }

    /**
     * NUEVA: Construye el HTML para una sola tarjeta.
     * @param {Object} ticket - El objeto de un ticket con sus relaciones.
     * @returns {string} - El string HTML de la tarjeta.
     */
    function crearTarjetaHTML(ticket) {
        // 1. Obtenemos los datos de forma segura, con valores por defecto.
        const estado = ticket.catalogo_estado?.nombre || 'DESCONOCIDO';
        const asignacion = ticket.asignaciones?.[0]; // Tomamos la primera asignación
        const mecanico = asignacion?.nombre_mecanico || 'Sin asignar';
        const numero_mecanico = asignacion?.numero_empleado_mecanico; // No necesita '||' aquí

        // 2. Determinamos los colores y la clase del anillo según el estado.
        let colorTexto = 'text-gray-800 bg-gray-100';
        let ringClass = 'ring-gray-400'; // Color del anillo por defecto

        switch (estado) {
            case 'ASIGNADO': 
                colorTexto = 'text-blue-800 bg-blue-100';
                ringClass = 'ring-blue-500';
                break;
            case 'EN PROCESO': 
                colorTexto = 'text-yellow-800 bg-yellow-100';
                ringClass = 'ring-yellow-500';
                break;
            case 'ATENDIDO': 
                colorTexto = 'text-green-800 bg-green-100';
                ringClass = 'ring-green-500';
                break;
            case 'PENDIENTE': 
                colorTexto = 'text-red-500 bg-red-100';
                ringClass = 'ring-red-500';
                break;
            case 'AUTONOMO': 
                colorTexto = 'text-violet-800 bg-violet-100';
                ringClass = 'ring-violet-500';
                break;
        }

        // 3. Determinamos la URL de la imagen.
        // Si el estado es AUTONOMO o no hay número de mecánico, usamos el avatar por defecto.
        const imgUrl = (estado === 'AUTONOMO')
            ? '/images/Avatar.webp'
            : `/fotos-usuarios/${numero_mecanico}.webp`;

        // 4. Construimos el HTML final.
        return `
            <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col justify-between pt-5 pb-4 px-5">
                
                <!-- Imagen del Mecánico (posicionada absolutamente) -->
                <div class="absolute -top-5 -left-5 z-10">
                    <img class="w-20 h-20 rounded-full ring-4 ${ringClass} shadow-lg object-cover bg-white"
                         src="${imgUrl}" 
                         alt="Foto de ${mecanico}"
                         onerror="this.onerror=null; this.src='/fotos-usuarios/default-avatar.webp';">
                </div>

                <!-- Contenido de la tarjeta (con padding a la izquierda para no quedar debajo de la imagen) -->
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
                        <span>Finalizado: ${ticket.fecha_actualizacion_formateada}</span>
                    </div>
                </div>
                <div class="pl-16">
                    <div class="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                        ${generarBotonesAccion(ticket)}
                    </div>
                </div>
            </div>
        `;
    }

    function aplicarFiltros() {
        const textoBusqueda = searchInput.value.toLowerCase().trim();
        const estadoSeleccionado = statusFilter.value;

        // Filtramos el array original que guardamos en memoria.
        const ticketsFiltrados = todosLosTicketsDelModulo.filter(ticket => {
            const asignacion = ticket.asignaciones?.[0];

            // Condición 1: Filtro por estado
            const coincideEstado = estadoSeleccionado === '' || ticket.catalogo_estado.nombre === estadoSeleccionado;

            // Condición 2: Filtro por texto de búsqueda
            const coincideBusqueda = textoBusqueda === '' ||
                ticket.folio.toLowerCase().includes(textoBusqueda) ||
                ticket.descripcion_problema.toLowerCase().includes(textoBusqueda) ||
                ticket.maquina.toLowerCase().includes(textoBusqueda) ||
                ticket.nombre_operario.toLowerCase().includes(textoBusqueda) ||
                (asignacion && asignacion.nombre_mecanico.toLowerCase().includes(textoBusqueda));

            // El ticket se muestra si cumple AMBAS condiciones.
            return coincideEstado && coincideBusqueda;
        });

        // Volvemos a renderizar las tarjetas, pero solo con los resultados filtrados.
        renderizarTarjetas(ticketsFiltrados);
    }

    function generarBotonesAccion(ticket) {
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
            // --- INICIO DE LA NUEVA LÓGICA ---

            let botonesHTML = '';

            // Comprobamos el estado de la bahía que ahora viene en el objeto ticket
            if (ticket.estado_bahia == 1) {
                // ESTADO PAUSADO: Mostramos solo el botón para reanudar
                botonesHTML = `
                    <button class="reanudar-bahia-btn text-xs bg-violet-950 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded"
                            data-ticket-id="${ticket.id}">
                        Reanudar Atención
                    </button>
                `;
            } else {
                // ESTADO ACTIVO (estado_bahia es 0 o null): Mostramos ambos botones
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
            // Si está en proceso, mostramos un botón para ver detalles o continuar la atención
            return `<p>Solucionado</p>`;

        } else if ( estado === 'ATENDIDO')
        // Botón por defecto para los demás casos
        return `<button class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded">
                    aqui se veria el diagnostico
                </button>`;
    }

    /**
     * NUEVA: Muestra el modal de SweetAlert2 para iniciar la atención.
     * @param {number} ticketId - El ID del ticket.
     * @param {string} maquina - El nombre de la máquina.
     */
    async function mostrarModalIniciarAtencion(ticketId, maquina) {
        try {
            const response = await fetch(`/FollowOTV2/obtenerClasesMaquina/${encodeURIComponent(maquina)}`);
            if (!response.ok) throw new Error('No se pudieron cargar los datos de la máquina.');
            
            const data = await response.json();
            const clases = data.clases || [];
            const numerosMaquina = data.numeroMaquina || [];

            // --- MEJORA PARA MODO OSCURO ---

            // 1. Detectamos si el modo oscuro está activo en el tag <html>
            const isDarkMode = document.documentElement.classList.contains('dark');

            // 2. Creamos un objeto de configuración para el modal
            const swalOptions = {
                title: 'Iniciar Atención',
                html: `
                    <div class="text-left">
                        <!-- Se han quitado las clases de color del label para que herede el color del modal -->
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
                    // La inicialización de Select2 se queda igual
                    $('#clase-select').select2({
                        dropdownParent: $('.swal2-popup'),
                        placeholder: 'Selecciona una clase',
                    });
                    $('#numero-maquina-select').select2({
                        dropdownParent: $('.swal2-popup'),
                        placeholder: 'Selecciona el número',
                    });
                },
                preConfirm: () => {
                    // La validación se queda igual
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
                }
            };

            // 3. Si el modo oscuro está activo, añadimos las propiedades de color al objeto de configuración
            if (isDarkMode) {
                swalOptions.background = '#1f2937'; // Color de fondo similar a bg-gray-800
                swalOptions.color = '#f9fafb';      // Color de texto similar a text-gray-100
                swalOptions.confirmButtonColor = '#3b82f6'; // Un color de botón que contraste
            }

            // 4. Mostramos el modal usando la configuración que hemos preparado
            const { value: formValues } = await Swal.fire(swalOptions);

            if (formValues) {
                console.log('Datos del modal:', formValues);
                await enviarInicioAtencion(ticketId, formValues);
            }

        } catch (error) {
            console.error('Error al mostrar el modal:', error);
            const isDarkMode = document.documentElement.classList.contains('dark');
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                // Y al modal de error
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#3b82f6' })
            });
        }
    }

    /**
     * NUEVA: Envía los datos al backend para iniciar la atención.
     * @param {number} ticketId - El ID del ticket a actualizar.
     * @param {object} datosModal - El objeto con { clase, numero_maquina, tiempo_estimado }.
     */
    async function enviarInicioAtencion(ticketId, datosModal) {
        // Obtenemos el token CSRF de la meta etiqueta en el HTML
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const isDarkMode = document.documentElement.classList.contains('dark');

        try {
            const response = await fetch('/FollowOTV2/iniciarAtencion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken // ¡Muy importante para la seguridad de Laravel!
                },
                body: JSON.stringify({
                    ticket_id: ticketId,
                    clase: datosModal.clase,
                    numero_maquina: datosModal.numero_maquina,
                    tiempo_estimado: datosModal.tiempo_estimado
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                // Si la respuesta no es OK o el backend devuelve success:false, lanzamos un error.
                throw new Error(result.message || 'Error en el servidor.');
            }

            // Si todo salió bien, mostramos un mensaje de éxito.
            await Swal.fire({
                title: '¡Éxito!',
                text: result.message,
                icon: 'success',
                timer: 2000, // El modal se cierra solo después de 2 segundos
                showConfirmButton: false,
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb' })
            });

            // Y finalmente, recargamos las tarjetas para que reflejen el nuevo estado.
            const moduloSeleccionado = moduloSelect.value;
            if (moduloSeleccionado) {
                // Hacemos ambas llamadas para que tanto el resumen como las tarjetas se actualicen.
                actualizarResumen(moduloSeleccionado);
                cargarYRenderizarRegistros(moduloSeleccionado);
            }

        } catch (error) {
            console.error('Error al enviar inicio de atención:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#3b82f6' })
            });
        }
    }

    function iniciarTemporizadores() {
        const timerElements = document.querySelectorAll('.timer-display');
        
        timerElements.forEach(timerEl => {
            const startTimeStr = timerEl.dataset.startTime;
            const durationMinutes = parseInt(timerEl.dataset.durationMinutes, 10);

            // Validamos que tengamos la información necesaria
            if (!startTimeStr || isNaN(durationMinutes)) {
                timerEl.textContent = "Error";
                console.warn("Faltan datos para el temporizador en el ticket:", timerEl.id);
                return;
            }

            // Creamos un intervalo que se ejecuta cada segundo para este temporizador.
            const intervalId = setInterval(() => {
                updateTimer(timerEl, startTimeStr, durationMinutes);
            }, 1000);

            // Guardamos el ID del intervalo para poder limpiarlo después.
            activeTimers.push(intervalId);
            
            // Ejecutamos una vez al inicio para que el usuario no vea el "--:--" por un segundo.
            updateTimer(timerEl, startTimeStr, durationMinutes);
        });
    }

    // NUEVO: Función que realiza el cálculo y actualiza el DOM de un temporizador específico.
    function updateTimer(element, startTimeStr, durationMinutes) {
        // 1. Parsear la hora de inicio a un objeto Date válido para hoy.
        const today = new Date();
        const [hours, minutes, seconds] = startTimeStr.split(':');
        const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);

        // 2. Calcular los segundos restantes.
        const now = new Date();
        const totalDurationInSeconds = durationMinutes * 60;
        const elapsedSeconds = Math.round((now - startTime) / 1000);
        const remainingSeconds = totalDurationInSeconds - elapsedSeconds;

        // 3. Determinar el color basado en el tiempo restante.
        // Primero limpiamos las clases de color anteriores para evitar conflictos.
        element.classList.remove('text-yellow-500', 'dark:text-yellow-400', 'text-red-600', 'dark:text-red-500', 'text-gray-800', 'dark:text-gray-100');
        
        if (remainingSeconds < 0) {
            element.classList.add('text-red-600', 'dark:text-red-500'); // Tiempo agotado (rojo)
        } else if (remainingSeconds < 300) { // Menos de 5 minutos (300 segundos)
            element.classList.add('text-yellow-500', 'dark:text-yellow-400'); // Advertencia (amarillo)
        } else {
            element.classList.add('text-gray-800', 'dark:text-gray-100'); // Tiempo normal
        }

        // 4. Formatear la salida a MM:SS.
        const isNegative = remainingSeconds < 0;
        const absRemainingSeconds = Math.abs(remainingSeconds);
        const displayMinutes = Math.floor(absRemainingSeconds / 60);
        const displaySeconds = absRemainingSeconds % 60;

        const formattedTime = `${isNegative ? '-' : ''}${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

        // 5. Actualizar el contenido del elemento.
        element.textContent = formattedTime;
    }

    /**
     * NUEVA: Envía los datos al backend para finalizar la atención.
     * @param {number} ticketId - El ID del ticket.
     * @param {string} horaFinalizacion - La hora en que se detuvo la atención.
     * @param {object} datosModal - El objeto con { falla, causaFalla, accionImplementada, comentarios }.
     * @param {string} satisfaccion - El valor numérico de la encuesta.
     */
    async function enviarFinalizacionAtencion(ticketId, horaFinalizacion, datosModal, satisfaccion) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        // Resumimos los datos que se enviarán al controlador
        const datosParaEnviar = {
            ticket_id: ticketId,
            falla: datosModal.falla,
            causa_falla: datosModal.causaFalla,
            accion_implementada: datosModal.accionImplementada,
            comentarios: datosModal.comentarios,
            hora_finalizacion: horaFinalizacion,
            satisfaccion: satisfaccion
        };

        console.log("✅ Datos listos para enviar al controlador:", datosParaEnviar);

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        try {
            const response = await fetch('/FollowOTV2/finalizarAtencion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(datosParaEnviar)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error al finalizar la atención.');
            }

            await Swal.fire({
                title: '¡Éxito!',
                text: result.message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb' })
            });
            
            // Recargar los datos para reflejar el cambio
            const moduloSeleccionado = moduloSelect.value;
            if (moduloSeleccionado) {
                actualizarResumen(moduloSeleccionado);
                cargarYRenderizarRegistros(moduloSeleccionado);
            }

        } catch (error) {
            console.error('Error al enviar la finalización:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#3b82f6' })
            });
        }
    }

    /**
     * Envía la solicitud al backend para crear el registro de la pausa.
     * @param {string} ticketId - El ID del ticket a pausar.
     * @param {string} motivo - El motivo opcional de la pausa.
     */
    async function enviarActivacionBahia(ticketId, motivo) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        try {
            const response = await fetch('/FollowOTV2/activarBahia', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    ticket_id: ticketId,
                    motivo: motivo
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'No se pudo activar el tiempo de bahía.');
            }

            await Swal.fire({
                title: 'Pausa Activada',
                text: result.message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb' })
            });

            // Recargamos todo para que la tarjeta refleje el nuevo estado (botón "Reanudar")
            const moduloSeleccionado = moduloSelect.value;
            if (moduloSeleccionado) {
                actualizarResumen(moduloSeleccionado);
                cargarYRenderizarRegistros(moduloSeleccionado);
            }

        } catch (error) {
            console.error('Error al activar la bahía:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                ...(isDarkMode && { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#ef4444' })
            });
        }
    }

    inicializar();
});
