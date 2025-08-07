// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- Selectores de Elementos ---
    const sinAsignarContainer = document.getElementById('ots-sin-asignar-container');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchForm = document.getElementById('search-form');

    // Modales
    const modalAsignar = document.getElementById('modalAsignar');
    const modalDetalles = document.getElementById('modalDetalles');
    const formAsignar = document.getElementById('formAsignar');
    const mecanicoSelect = document.getElementById('mecanico-select');
    const otIdInput = document.getElementById('ot-id-asignar');

    // --- Inicialización ---

    // Inicializar calendario para búsqueda
    flatpickr("#date-range-search", {
        mode: "range",
        dateFormat: "Y-m-d",
    });
    
    // Cargar datos iniciales
    cargarOtsSinAsignar();
    cargarMecanicos();


    // --- Funciones de Lógica Principal ---

    /**
     * Carga las OTs con estado "Sin Asignar" (estado 6)
     */
    async function cargarOtsSinAsignar() {
        try {
            const response = await fetch('/api/reasignacion/sin-asignar');
            if (!response.ok) throw new Error('Error en la respuesta del servidor.');
            const ots = await response.json();

            sinAsignarContainer.innerHTML = ''; // Limpiar contenedor

            if (ots.length === 0) {
                sinAsignarContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No hay OTs sin asignar.</p>';
                return;
            }

            ots.forEach(ot => {
                const card = createOTCard(ot, 'asignar'); // 'asignar' para el tipo de acción
                sinAsignarContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error al cargar OTs sin asignar:', error);
            sinAsignarContainer.innerHTML = '<p class="text-red-500">No se pudieron cargar las OTs.</p>';
        }
    }

    /**
     * Carga la lista de mecánicos en el select del modal
     */
    async function cargarMecanicos() {
        try {
            const response = await fetch('/api/reasignacion/mecanicos');
            if (!response.ok) throw new Error('Error al cargar mecánicos.');
            const mecanicos = await response.json();

            mecanicoSelect.innerHTML = '<option value="">Seleccione un mecánico...</option>'; // Opción por defecto
            mecanicos.forEach(mecanico => {
                const option = document.createElement('option');
                option.value = mecanico.cvetra;
                option.textContent = mecanico.nombre;
                mecanicoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    /**
     * Maneja el envío del formulario de búsqueda
     */
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        searchResultsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full">Buscando...</p>';

        const formData = new FormData(searchForm);
        const folio = formData.get('folio');
        const dates = formData.get('dates');
        let fecha_inicio = '', fecha_fin = '';

        if (dates) {
            [fecha_inicio, fecha_fin] = dates.split(' to ');
        }
        
        const queryParams = new URLSearchParams({
            folio: folio || '',
            fecha_inicio: fecha_inicio || '',
            fecha_fin: fecha_fin || '',
        });

        try {
            const response = await fetch(`/api/reasignacion/buscar?${queryParams}`);
            if (!response.ok) throw new Error('Error en la búsqueda.');
            const ots = await response.json();

            mostrarResultadosBusqueda(ots);

        } catch (error) {
            console.error('Error en la búsqueda:', error);
            searchResultsContainer.innerHTML = '<p class="text-red-500 col-span-full">Error al realizar la búsqueda.</p>';
        }
    });
    
    /**
     * Clasifica y muestra los resultados de la búsqueda
     */
    function mostrarResultadosBusqueda(ots) {
        searchResultsContainer.innerHTML = ''; // Limpiar

        if (ots.length === 0) {
            searchResultsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full">No se encontraron resultados.</p>';
            return;
        }

        // Clasificar por estado
        const otsPorEstado = ots.reduce((acc, ot) => {
            const status = ot.Status || 'INDEFINIDO';
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(ot);
            return acc;
        }, {});

        // Crear columnas y tarjetas por estado
        for (const estado in otsPorEstado) {
            const columnWrapper = document.createElement('div');
            columnWrapper.innerHTML = `
                <h3 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">${estado}</h3>
                <div class="space-y-4 bg-gray-100 dark:bg-gray-800/50 p-2 md:p-4 rounded-lg shadow-md"></div>
            `;
            const columnContent = columnWrapper.querySelector('.space-y-4');
            
            otsPorEstado[estado].forEach(ot => {
                const card = createOTCard(ot, 'detalles'); // 'detalles' para la acción del modal
                columnContent.appendChild(card);
            });
            searchResultsContainer.appendChild(columnWrapper);
        }
    }

    /**
     * Crea una tarjeta de OT (Tu función adaptada)
     * @param {object} ot - El objeto de datos de la OT.
     * @param {string} actionType - 'asignar' o 'detalles', para definir qué modal abrir.
     */
    function createOTCard(ot, actionType) {
        const card = document.createElement("div");
        card.className = "bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-transparent hover:border-blue-500 transition-all duration-200 cursor-pointer";
        card.setAttribute("data-id", ot.id);
        card.setAttribute("data-folio", ot.Folio);
        
        const statusColor = getStatusColor(ot.Status);
        
        card.innerHTML = `
            <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Folio: ${ot.Folio}</h5>
            <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400">Máquina: ${ot.Maquina}</p>
            <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400">Mecánico: ${ot.Mecanico}</p>
            <p class="mb-3 text-sm font-normal text-gray-600 dark:text-gray-300">Problema: ${ot.Problema}</p>
            <div class="flex justify-between items-center">
                <span class="inline-block px-3 py-1 text-xs font-medium rounded ${statusColor}">${ot.Status}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">${ot.fecha_creacion}</span>
            </div>
        `;

        // Añadir el listener apropiado según el tipo de acción
        card.addEventListener('click', () => {
            if (actionType === 'asignar') {
                otIdInput.value = ot.id; // Guardar el ID en el input oculto
                modalAsignar.classList.remove('hidden');
                modalAsignar.classList.add('flex');
            } else if (actionType === 'detalles') {
                // Aquí podrías poblar el modal de detalles con más info de 'ot' si quisieras
                document.getElementById('modal-detalles-content').innerHTML = `<p class="dark:text-gray-300">Detalles para el folio <b>${ot.Folio}</b>...</p>`;
                modalDetalles.classList.remove('hidden');
                modalDetalles.classList.add('flex');
            }
        });

        return card;
    }

    function getStatusColor(status) {
        // Implementa tu lógica de colores aquí
        switch (status) {
            case 'SIN ASIGNAR': return 'bg-yellow-200 text-yellow-800';
            case 'ASIGNADO': return 'bg-blue-200 text-blue-800';
            case 'PROCESO': return 'bg-purple-200 text-purple-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }


    // --- Manejo de Modales y Formularios ---
    
    // Cerrar modal de asignación
    document.getElementById('cancelar-asignacion').addEventListener('click', () => {
        modalAsignar.classList.add('hidden');
        modalAsignar.classList.remove('flex');
    });

    // Cerrar modal de detalles
    document.getElementById('cerrar-detalles').addEventListener('click', () => {
        modalDetalles.classList.add('hidden');
        modalDetalles.classList.remove('flex');
    });

    // Enviar el formulario para asignar mecánico
    formAsignar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otId = otIdInput.value;
        const mecanicoCvetra = mecanicoSelect.value;
        
        if (!mecanicoCvetra) {
            Swal.fire('Error', 'Debes seleccionar un mecánico.', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/reasignacion/asignar/${otId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ mecanico_cvetra: mecanicoCvetra })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ocurrió un error desconocido.');
            }

            Swal.fire('¡Éxito!', 'Mecánico asignado correctamente.', 'success');
            modalAsignar.classList.add('hidden');
            modalAsignar.classList.remove('flex');
            cargarOtsSinAsignar(); // ¡Actualizar la lista de OTs sin asignar!

        } catch (error) {
            console.error('Error al asignar mecánico:', error);
            Swal.fire('Error', error.message, 'error');
        }
    });

    // Asegúrate de tener el meta tag CSRF en tu layout principal (app.blade.php)
    // <meta name="csrf-token" content="{{ csrf_token() }}">
});