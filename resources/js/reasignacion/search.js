// resources/js/reasignacion/search.js

// Importamos la función para crear tarjetas
import { createOTCard } from './ui.js';

const searchResultsContainer = document.getElementById('search-results-container');
const searchForm = document.getElementById('search-form');

/**
 * Clasifica y muestra los resultados de la búsqueda en columnas por estado, ordenados por jerarquía.
 * @param {Array} ots - El array de OTs resultado de la búsqueda.
 */
function mostrarResultadosBusqueda(ots) {
    searchResultsContainer.innerHTML = ''; // Limpiar

    const otsFiltradas = ots.filter(ot => ot.Status !== 'SIN ASIGNACION');
    if (otsFiltradas.length === 0) {
        searchResultsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full">No se encontraron resultados (excluyendo "Sin Asignar").</p>';
        return;
    }

    const otsPorEstado = otsFiltradas.reduce((acc, ot) => {
        const status = ot.Status || 'INDEFINIDO';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(ot);
        return acc;
    }, {});

    // Definir el orden jerárquico de los estados
    const statusOrder = ['ASIGNADO', 'EN PROCESO', 'ATENDIDO', 'AUTONOMO', 'CANCELADO'];

    // Obtener las claves y ordenarlas según la jerarquía
    const sortedEstados = Object.keys(otsPorEstado).sort((a, b) => {
        const indexA = statusOrder.indexOf(a);
        const indexB = statusOrder.indexOf(b);

        // Si ambos están en la lista, ordenar por índice
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        // Si solo A está en la lista, A va primero
        if (indexA !== -1) return -1;
        // Si solo B está en la lista, B va primero
        if (indexB !== -1) return 1;
        // Si ninguno está, ordenar alfabéticamente
        return a.localeCompare(b);
    });

    // Iterar sobre los estados ordenados
    sortedEstados.forEach(estado => {
        const columnWrapper = document.createElement('div');
        columnWrapper.innerHTML = `
            <h3 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 md:mb-4">${estado}</h3>
            <div class="space-y-4 bg-gray-100 dark:bg-gray-800/50 p-2 md:p-4 rounded-lg shadow-md"></div>
        `;
        const columnContent = columnWrapper.querySelector('.space-y-4');

        otsPorEstado[estado].forEach(ot => {
            // --- INICIO DE LA MODIFICACIÓN ---
            let actionType = 'detalles'; // Por defecto, abrir detalles

            if (ot.Status === 'ASIGNADO') {
                actionType = 'asignar'; // Para re-asignar
            } else if (ot.Status === 'EN PROCESO') { // Asumiendo que el alias es 'PROCESO' para el estado 3
                actionType = 'revertir'; // Nuestra nueva acción
            }

            const card = createOTCard(ot, actionType);
            // --- FIN DE LA MODIFICACIÓN ---

            columnContent.appendChild(card);
        });
        searchResultsContainer.appendChild(columnWrapper);
    });
}

// ... (El resto del archivo 'initializeSearch' no cambia)
export function initializeSearch() {
    // Inicializar calendario para búsqueda
    flatpickr("#date-range-search", {
        mode: "range",
        dateFormat: "Y-m-d",
    });

    // Manejar el envío del formulario de búsqueda
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
}