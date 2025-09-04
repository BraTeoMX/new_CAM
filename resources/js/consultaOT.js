document.addEventListener('DOMContentLoaded', function () {

    // 1. Seleccionamos los elementos del DOM.
    const container = document.getElementById('seguimiento-ot-container');
    const filtrosBar = document.getElementById('filtros-bar');
    const searchInput = document.getElementById('search-ot');
    const statusFilter = document.getElementById('filter-status');

    // Variable para guardar los datos y poder filtrarlos después sin llamar a la API
    let todosLosTicketsDelModulo = [];

    async function inicializar() {
        // Mostramos la barra de filtros desde el inicio.
        filtrosBar.classList.remove('hidden');

        configurarEventListeners();
        cargarFiltroDeEstados();

        // Cargamos el resumen general y todas las tarjetas de OT al iniciar.
        await actualizarResumen();
        await cargarYRenderizarRegistros();
    }

    // --- CONFIGURACIÓN DE EVENTOS ---
    function configurarEventListeners() {
        // Eventos para los filtros secundarios.
        searchInput.addEventListener('input', aplicarFiltros);
        statusFilter.addEventListener('change', aplicarFiltros);

        // El event listener de click en el contenedor se ha vaciado
        // ya que no hay acciones en las tarjetas.
        container.addEventListener('click', function (e) {
            // No hay acciones que manejar aquí por el momento.
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
            const response = await fetch('/OrdenOT/obtenerAreaModulos');
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
            const response = await fetch('/OrdenOT/obtenerCatalogoEstados');
            if (!response.ok) throw new Error('Error al cargar estados');
            const estados = await response.json();

            estados.forEach(estado => {
                const option = new Option(estado.nombre, estado.nombre);
                statusFilter.appendChild(option);
            });
        } catch (error) {
            console.error("No se pudieron cargar los estados del filtro:", error);
        }
    }

    // --- FUNCIONES DE MANEJO DE DATOS Y RENDERIZADO ---

    async function actualizarResumen(modulo) {
        try {
            const response = await fetch(`/OrdenOT/obtenerResumen`);
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
        document.getElementById('ot-autonomas').textContent = '--';
        document.getElementById('ot-asignadas').textContent = '--';
        document.getElementById('ot-proceso').textContent = '--';
        document.getElementById('ot-pendientes').textContent = '--';
        document.getElementById('ot-atendidas').textContent = '--';
        document.getElementById('ot-total').textContent = '--';
    }

    async function cargarYRenderizarRegistros(modulo) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">Cargando registros...</p>';
        filtrosBar.classList.remove('hidden');

        try {
            const response = await fetch(`/OrdenOT/obtenerRegistros`);
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

            todosLosTicketsDelModulo = await response.json();
            renderizarTarjetas(todosLosTicketsDelModulo);

        } catch (error) {
            console.error("Error al cargar los registros:", error);
            container.innerHTML = '<p class="text-center text-red-500 col-span-full">No se pudieron cargar los registros.</p>';
        }
    }

    let activeTimers = [];

    function clearActiveTimers() {
        activeTimers.forEach(timerId => clearInterval(timerId));
        activeTimers = [];
    }

    function renderizarTarjetas(tickets) {
        clearActiveTimers();
        container.innerHTML = '';

        if (tickets.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No hay solicitudes para este módulo.</p>';
            return;
        }

        tickets.forEach(ticket => {
            const cardHTML = crearTarjetaHTML(ticket);
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        iniciarTemporizadores();
    }

    function crearTarjetaHTML(ticket) {
        const estado = ticket.catalogo_estado?.nombre || 'DESCONOCIDO';
        const asignacion = ticket.asignaciones?.[0];
        const mecanico = asignacion?.nombre_mecanico || 'Sin asignar';
        const numero_mecanico = asignacion?.numero_empleado_mecanico;

        let colorTexto = 'text-gray-800 bg-gray-100';
        let ringClass = 'ring-gray-400';

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

        const imgUrl = (estado === 'AUTONOMO')
            ? '/images/Avatar.webp'
            : `/fotos-usuarios/${numero_mecanico}.webp`;

        return `
            <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col justify-between pt-5 pb-4 px-5">
                
                <div class="absolute -top-5 -left-5 z-10">
                    <img class="w-20 h-20 rounded-full ring-4 ${ringClass} shadow-lg object-cover bg-white"
                         src="${imgUrl}" 
                         alt="Foto de ${mecanico}"
                         onerror="this.onerror=null; this.src='/fotos-usuarios/default-avatar.webp';">
                </div>

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

                <div class="pl-16 mt-4">
                    <div class="text-xs text-gray-500 flex justify-between mb-3">
                        <span>Creado: ${ticket.fecha_creacion_formateada}</span>
                        <span>Actualizado: ${ticket.fecha_actualizacion_formateada}</span>
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

        const ticketsFiltrados = todosLosTicketsDelModulo.filter(ticket => {
            const asignacion = ticket.asignaciones?.[0];
            const coincideEstado = estadoSeleccionado === '' || ticket.catalogo_estado.nombre === estadoSeleccionado;
            const coincideBusqueda = textoBusqueda === '' ||
                ticket.folio.toLowerCase().includes(textoBusqueda) ||
                ticket.descripcion_problema.toLowerCase().includes(textoBusqueda) ||
                ticket.maquina.toLowerCase().includes(textoBusqueda) ||
                ticket.nombre_operario.toLowerCase().includes(textoBusqueda) ||
                (asignacion && asignacion.nombre_mecanico.toLowerCase().includes(textoBusqueda));
            return coincideEstado && coincideBusqueda;
        });

        renderizarTarjetas(ticketsFiltrados);
    }

    /**
     * MODIFICADO: Esta función ahora genera la sección de información del temporizador
     * o un mensaje simple, pero ya no crea botones de acción.
     */
    function generarBotonesAccion(ticket) {
        const estado = ticket.catalogo_estado?.nombre;

        if (estado === 'EN PROCESO') {
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
                    </div>
            `;
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

        // Para cualquier otro estado (ASIGNADO, PENDIENTE, etc.), no se muestra nada.
        return '';
    }

    function iniciarTemporizadores() {
        const timerElements = document.querySelectorAll('.timer-display');

        timerElements.forEach(timerEl => {
            const startTimeStr = timerEl.dataset.startTime;
            const durationMinutes = parseInt(timerEl.dataset.durationMinutes, 10);

            if (!startTimeStr || isNaN(durationMinutes)) {
                timerEl.textContent = "Error";
                console.warn("Faltan datos para el temporizador en el ticket:", timerEl.id);
                return;
            }

            const intervalId = setInterval(() => {
                updateTimer(timerEl, startTimeStr, durationMinutes);
            }, 1000);

            activeTimers.push(intervalId);
            updateTimer(timerEl, startTimeStr, durationMinutes);
        });
    }

    function updateTimer(element, startTimeStr, durationMinutes) {
        const today = new Date();
        const [hours, minutes, seconds] = startTimeStr.split(':');
        const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);

        const now = new Date();
        const totalDurationInSeconds = durationMinutes * 60;
        const elapsedSeconds = Math.round((now - startTime) / 1000);
        const remainingSeconds = totalDurationInSeconds - elapsedSeconds;

        element.classList.remove('text-yellow-500', 'dark:text-yellow-400', 'text-red-600', 'dark:text-red-500', 'text-gray-800', 'dark:text-gray-100');

        if (remainingSeconds < 0) {
            element.classList.add('text-red-600', 'dark:text-red-500');
        } else if (remainingSeconds < 300) {
            element.classList.add('text-yellow-500', 'dark:text-yellow-400');
        } else {
            element.classList.add('text-gray-800', 'dark:text-gray-100');
        }

        const isNegative = remainingSeconds < 0;
        const absRemainingSeconds = Math.abs(remainingSeconds);
        const displayMinutes = Math.floor(absRemainingSeconds / 60);
        const displaySeconds = absRemainingSeconds % 60;

        const formattedTime = `${isNegative ? '-' : ''}${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;

        element.textContent = formattedTime;
    }

    inicializar();
});