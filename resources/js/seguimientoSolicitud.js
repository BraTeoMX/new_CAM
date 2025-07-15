document.addEventListener('DOMContentLoaded', function() {

    // 1. Seleccionamos los elementos del DOM.
    const moduloSelect = document.getElementById('modulo-select');
    const container = document.getElementById('seguimiento-ot-container');
    const filtrosBar = document.getElementById('filtros-bar'); // El contenedor de los filtros

    // Variable para guardar los datos y poder filtrarlos después sin llamar a la API
    let todosLosTicketsDelModulo = [];

    // 2. Inicializamos Select2.
    $(moduloSelect).select2({
        placeholder: 'Selecciona tu módulo de atención',
        allowClear: true
    });

    // 3. Evento 'change' para el selector de módulo.
    $(moduloSelect).on('change', function() {
        const moduloSeleccionado = this.value;

        if (moduloSeleccionado) {
            // Llamamos a las dos funciones: una para el resumen y otra para los detalles.
            actualizarResumen(moduloSeleccionado);
            cargarYRenderizarRegistros(moduloSeleccionado);
        } else {
            // Si se deselecciona, limpiamos todo.
            resetearResumen();
            container.innerHTML = '';
            filtrosBar.classList.add('hidden'); // Ocultamos los filtros
            todosLosTicketsDelModulo = [];
        }
    });

    // --- FUNCIONES ---

    async function cargarModulos() {
        // ... (esta función se queda igual)
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
        // Obtenemos los datos de forma segura, con valores por defecto.
        const estado = ticket.catalogo_estado?.nombre || 'DESCONOCIDO';
        const asignacion = ticket.asignaciones?.[0]; // Tomamos la primera asignación
        const mecanico = asignacion?.nombre_mecanico || 'Sin asignar';
        
        // Determinamos el color de la tarjeta según el estado
        let colorClase = 'border-gray-400';
        let colorTexto = 'text-gray-800 bg-gray-100';
        switch (estado) {
            case 'ASIGNADO': 
                colorClase = 'border-blue-500'; 
                colorTexto = 'text-blue-800 bg-blue-100';
                break;
            case 'EN PROCESO': 
                colorClase = 'border-yellow-500'; 
                colorTexto = 'text-yellow-800 bg-yellow-100';
                break;
            case 'ATENDIDO': 
                colorClase = 'border-green-500'; 
                colorTexto = 'text-green-800 bg-green-100';
                break;
            case 'PENDIENTE': 
                colorClase = 'border-red-500'; 
                colorTexto = 'text-red-800 bg-red-100';
                break;
            case 'AUTONOMO': 
                colorClase = 'border-violet-500'; 
                colorTexto = 'text-violet-800 bg-violet-100';
                break;
        }

        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 ${colorClase} flex flex-col justify-between">
                <div>
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
                    <div class="text-xs text-gray-500 flex justify-between">
                        <span>Creado: ${ticket.fecha_creacion_formateada}</span>
                        <span">Actualizado: ${ticket.fecha_actualizacion_formateada}</span>
                    </div>

                </div>
                <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                    <!-- Los botones de acción se añadirán aquí más adelante -->
                    <button class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded">
                        Ver Detalles
                    </button>
                </div>
            </div>
        `;
    }

    // 5. Llamamos a la función inicial para cargar los módulos.
    cargarModulos();
});
