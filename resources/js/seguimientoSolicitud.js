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
        });
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
    function renderizarTarjetas(tickets) {
        container.innerHTML = ''; // Limpiamos el contenedor

        if (tickets.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No hay solicitudes para este módulo.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const cardHTML = crearTarjetaHTML(ticket);
            container.insertAdjacentHTML('beforeend', cardHTML);
        });
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
                <div class="pl-16 mt-4">
                    <div class="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
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
            // Si está asignado, mostramos el botón "Iniciar Atención"
            return `<button class="iniciar-atencion-btn text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            data-ticket-id="${ticket.id}"
                            data-maquina="${ticket.maquina}">
                        Iniciar Atención
                    </button>`;
        } else if (estado === 'EN PROCESO') {
            // Si está en proceso, mostramos un botón para ver detalles o continuar la atención
            return `<button class="detener-atencion-btn text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            data-ticket-id="${ticket.id}"
                            data-maquina="${ticket.maquina}">
                        Finalizar Atención
                    </button>`;
        // Aquí puedes añadir más lógica para otros estados (ej. 'EN PROCESO')
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
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Atención lista para iniciar.',
                    icon: 'success',
                    // Aplicamos también el tema oscuro al modal de éxito
                    ...(isDarkMode && { background: '#1f2937', color: '#f9fafb', confirmButtonColor: '#3b82f6' })
                });
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

    inicializar();
});
