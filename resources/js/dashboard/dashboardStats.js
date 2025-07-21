// Archivo: resources/js/dashboard/dashboardStats.js

// ================================================================
// SECCIÓN 1: FUNCIÓN PRINCIPAL DE CARGA Y RENDERIZADO
// ================================================================

/**
 * Carga los datos de AMBAS APIs (resumen y detalles) y renderiza la UI unificada.
 */
async function loadDashboardData(month) {
    console.log(`📊 DashboardStats: Cargando todos los datos para el mes ${month}.`);
    
    const container = document.getElementById('dashboard-stats-container');
    if (!container) return;

    // Muestra un mensaje de carga general
    container.innerHTML = `<div class="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 min-h-[300px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Cargando estadísticas...</div></div>`;

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken
        };

        // ¡Magia! Hacemos las dos peticiones en paralelo para máxima eficiencia.
        const [resumenResponse, detallesResponse] = await Promise.all([
            fetch(`/dashboardV2/calcularMinutos?month=${month}`, { headers }),
            fetch(`/dashboardV2/obtenerDetallesTickets?month=${month}`, { headers })
        ]);

        if (!resumenResponse.ok || !detallesResponse.ok) {
            throw new Error('Una de las peticiones a la API falló.');
        }

        const resumenData = await resumenResponse.json();
        const detallesData = await detallesResponse.json();
        
        // Unimos los datos en un solo objeto para pasarlo a la función de renderizado
        const combinedData = {
            resumen: resumenData,
            detalles: detallesData
        };

        renderDashboardTabs(combinedData, container);

    } catch (error) {
        container.innerHTML = '<span class="text-red-500 p-6">Error al cargar las estadísticas.</span>';
        console.error('Error en dashboardStats.js:', error);
    }
}

/**
 * Renderiza la interfaz de pestañas COMPLETA, incluyendo resúmenes y tablas.
 */
function renderDashboardTabs(data, container) {
    container.innerHTML = ''; // Limpia el contenedor
    
    // Configuración de las pestañas. Usamos los datos del resumen para los nombres y conteos.
    const tabsConfig = [
        { id: 'global', name: 'Global', icon: 'dashboard' },
        ...data.resumen.plantas.map((p, i) => ({
            id: `planta_${i+1}`, // Corresponde a las llaves de detalles: planta_1, planta_2
            name: p.planta, 
            icon: p.planta === 'Ixtlahuaca' ? 'factory' : 'apartment'
        }))
    ];
    
    // Clases para los botones
    const baseButtonClasses = 'inline-block w-full p-4 focus:outline-none font-medium transition';
    const activeClasses = 'bg-indigo-800 text-white font-bold';
    const inactiveClasses = 'bg-indigo-600 text-white hover:bg-indigo-700';

    // 1. Crear las cabeceras de las pestañas (UNA SOLA VEZ)
    const tabHeaders = `
        <ul class="text-sm font-medium text-center divide-x divide-gray-200 rounded-lg shadow-lg sm:flex">
            ${tabsConfig.map((tab, index) => `
                <li class="w-full">
                    <button id="tab-btn-${tab.id}" data-tab-content-id="tab-content-${tab.id}"
                            class="tab-btn ${baseButtonClasses} ${index === 0 ? activeClasses : inactiveClasses}">
                        <span class="material-symbols-rounded align-middle text-lg mr-1">${tab.icon}</span>
                        ${tab.name}
                    </button>
                </li>
            `).join('')}
        </ul>
    `;

    // 2. Crear los paneles de contenido, cada uno con RESUMEN + TABLA
    const tabContents = `
        <div class="mt-1">
            ${tabsConfig.map((tab, index) => {
                // Obtenemos los datos correctos para esta pestaña
                const stats = (tab.id === 'global') ? data.resumen.global : data.resumen.plantas[index - 1];
                
                return `
                <div id="tab-content-${tab.id}" class="tab-content bg-white dark:bg-gray-800 p-6 rounded-b-lg shadow-lg ${index > 0 ? 'hidden' : ''}">
                    ${createDataGrid(stats)}
                    
                    <hr class="my-6 border-gray-200 dark:border-gray-700">
                    
                    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Detalle de Tickets</h3>
                    <table id="table-${tab.id}" class="display" style="width:100%">
                        <thead>
                            <tr>
                                <th>Planta</th><th>Folio</th><th>Módulo</th><th>Supervisor</th><th>Mecánico</th><th>Tiempo Neto</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `}).join('')}
        </div>
    `;

    container.innerHTML = tabHeaders + tabContents;

    // --- LÓGICA DE INTERACTIVIDAD ---

    // 3. Inicializar la DataTable de la primera pestaña (Global)
    initializeDataTable('table-global', data.detalles.global);

    // 4. Añadir listeners a los botones para cambiar de pestaña e inicializar las otras DataTables
    container.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Lógica para cambiar la pestaña activa (visual)
            container.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove(...activeClasses.split(' '));
                btn.classList.add(...inactiveClasses.split(' '));
            });
            button.classList.add(...activeClasses.split(' '));
            button.classList.remove(...inactiveClasses.split(' '));
            
            container.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(button.dataset.tabContentId).classList.remove('hidden');

            const tableId = `table-${button.dataset.tabContentId.replace('tab-content-', '')}`;
            const dataKey = tableId.replace('table-', ''); // 'global', 'planta_1', etc.
            
            // Inicializa la tabla de la pestaña clickeada solo si no se ha hecho antes
            if (!$.fn.dataTable.isDataTable(`#${tableId}`)) {
                console.log(`Inicializando DataTable para: ${tableId}`);
                initializeDataTable(tableId, data.detalles[dataKey]);
            }
        });
    });
}

// ================================================================
// SECCIÓN 2: FUNCIONES AUXILIARES (Helpers)
// ================================================================

/**
 * Crea el HTML para las tarjetas de resumen (sin cambios).
 */
function createDataGrid(stats) {
    return `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div class="flex flex-col items-center justify-center">
            <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">timer</span>
            <p class="text-4xl font-bold text-gray-800 dark:text-white">${Math.round(stats.minutos).toLocaleString('es-MX')}</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Minutos Totales</p>
        </div>
        <div class="flex flex-col items-center justify-center">
            <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
            <p class="text-4xl font-bold text-gray-800 dark:text-white">${stats.tickets.toLocaleString('es-MX')}</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets</p>
        </div>
        <div class="flex flex-col items-center justify-center">
            <span class="material-symbols-rounded text-4xl text-purple-500 mb-2">functions</span>
            <p class="text-4xl font-bold text-gray-800 dark:text-white">${stats.promedio_min.toFixed(2)}</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Promedio Min/Ticket</p>
        </div>
    </div>
    `;
}

/**
 * Inicializa una DataTable (sin cambios).
 */
function initializeDataTable(tableId, tableData) {
    if (!tableData) {
        console.warn(`No hay datos para la tabla ${tableId}`);
        return;
    }
    $(`#${tableId}`).DataTable({
        data: tableData,
        columns: [
            { data: 'planta' }, { data: 'folio' }, { data: 'modulo' }, 
            { data: 'supervisor' }, { data: 'mecanico_nombre' },
            { data: 'minutos_netos', render: (data, type, row) => row.tiempo_neto_formateado }
        ],
        responsive: true,
        lengthChange: false,
        language: {
            "processing": "Procesando...",
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encontraron resultados",
            "emptyTable": "Ningún dato disponible en esta tabla",
            "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "search": "Buscar:",
            "loadingRecords": "Cargando...",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            },
            "aria": {
                "sortAscending": ": Activar para ordenar la columna de manera ascendente",
                "sortDescending": ": Activar para ordenar la columna de manera descendente"
            }
        },
        destroy: true
    });
}

// ================================================================
// SECCIÓN 3: PUNTO DE ENTRADA / EVENT LISTENER
// ================================================================

/**
 * El "suscriptor" que escucha el cambio de mes e inicia todo el proceso.
 */
window.addEventListener('monthChanged', (event) => {
    const newMonth = event.detail.month;
    loadDashboardData(newMonth);
});
