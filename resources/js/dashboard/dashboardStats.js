// Archivo: resources/js/dashboard/dashboardStats.js

// Objeto para almacenar el estado y las instancias de DataTable
const state = {
    isInitialized: false,
    container: null,
    dataTables: {} // Guardaremos las instancias de las tablas aquí
};

// ================================================================
// SECCIÓN 1: LÓGICA DE DATOS Y ACTUALIZACIÓN DE UI
// ================================================================

/**
 * Carga los datos de AMBAS APIs y luego llama a la función para actualizar la UI.
 */
async function loadDashboardData(month) {
    if (!state.isInitialized) return;
    console.log(`📊 DashboardStats: Cargando datos para el mes ${month}.`);

    // Podríamos añadir una clase de "cargando" al contenedor para dar feedback visual
    state.container.classList.add('opacity-50', 'pointer-events-none');

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken
        };

        const [resumenResponse, detallesResponse] = await Promise.all([
            fetch(`/dashboardV2/calcularMinutos?month=${month}`, { headers }),
            fetch(`/dashboardV2/obtenerDetallesTickets?month=${month}`, { headers })
        ]);

        if (!resumenResponse.ok || !detallesResponse.ok) {
            throw new Error('Una de las peticiones a la API falló.');
        }

        const resumenData = await resumenResponse.json();
        const detallesData = await detallesResponse.json();

        updateUI({ resumen: resumenData, detalles: detallesData });

    } catch (error) {
        // En caso de error, podríamos mostrar un toast o un mensaje más elegante
        console.error('Error en dashboardStats.js:', error);
        alert('Error al cargar las estadísticas.');
    } finally {
        // Quita la clase de "cargando" sin importar si hubo éxito o error
        state.container.classList.remove('opacity-50', 'pointer-events-none');
    }
}

/**
 * TOMA los nuevos datos y ACTUALIZA los elementos del DOM existentes.
 * No reconstruye nada, solo cambia el contenido de texto y los datos de las tablas.
 */
function updateUI(data) {
    console.log("🔄 Actualizando UI con nuevos datos.");

    // 1. Actualizar tarjetas de resumen para cada pestaña
    const tabs = ['global', ...data.resumen.plantas.map((p, i) => `planta_${i+1}`)];

    tabs.forEach((tabKey, index) => {
        const stats = (tabKey === 'global') 
            ? data.resumen.global 
            : data.resumen.plantas[index - 1];
        
        const contentContainer = document.getElementById(`tab-content-${tabKey}`);
        if (contentContainer) {
            contentContainer.querySelector('.stat-minutos').textContent = Math.round(stats.minutos).toLocaleString('es-MX');
            contentContainer.querySelector('.stat-tickets').textContent = stats.tickets.toLocaleString('es-MX');
            contentContainer.querySelector('.stat-promedio').textContent = stats.promedio_min.toFixed(2);
        }
    });

    // 2. Actualizar las DataTables con los nuevos datos
    Object.keys(state.dataTables).forEach(tableId => {
        const dataKey = tableId.replace('table-', '');
        const newData = data.detalles[dataKey] || [];
        const table = state.dataTables[tableId];
        
        table.clear();
        table.rows.add(newData);
        table.draw();
    });

    // Guardamos los nuevos datos de detalles para las tablas que se inicializarán más tarde
    state.detallesData = data.detalles; 
}


// ================================================================
// SECCIÓN 2: CREACIÓN INICIAL DEL "ESQUELETO" DE LA UI
// ================================================================

/**
 * CONSTRUYE el HTML estático del componente UNA SOLA VEZ.
 */
function createDashboardShell() {
    // La data para las cabeceras se puede "falsear" o cargar con una llamada inicial mínima,
    // pero para simplicidad, asumimos que siempre hay una pestaña "Global".
    // Una mejora futura sería cargar solo las plantas y luego construir las pestañas.
    const initialTabsConfig = [{ id: 'global', name: 'Global', icon: 'dashboard' }];

    const baseButtonClasses = 'inline-block w-full p-4 focus:outline-none font-medium transition';
    const activeClasses = 'bg-indigo-800 text-white font-bold';
    const inactiveClasses = 'bg-indigo-600 text-white hover:bg-indigo-700';

    const tabHeaders = `
        <ul class="text-sm font-medium text-center divide-x divide-gray-200 rounded-lg shadow-lg sm:flex">
            <li class="w-full">
                <button id="tab-btn-global" data-tab-content-id="tab-content-global"
                        class="tab-btn ${baseButtonClasses} ${activeClasses}">
                    <span class="material-symbols-rounded align-middle text-lg mr-1">dashboard</span>
                    Global
                </button>
            </li>
        </ul>`;

    const tabContents = `
        <div class="mt-1">
            <div id="tab-content-global" class="tab-content bg-white dark:bg-gray-800 p-6 rounded-b-lg shadow-lg">
                ${createDataGridHTML()} <hr class="my-6 border-gray-200 dark:border-gray-700">
                <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Detalle de Tickets</h3>
                <table id="table-global" class="display" style="width:100%">
                    <thead><tr><th>Planta</th><th>Folio</th><th>Módulo</th><th>Supervisor</th><th>Mecánico</th><th>Tiempo Neto</th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
            </div>`;
    
    state.container.innerHTML = tabHeaders + tabContents;
}

/**
 * Crea el HTML para las tarjetas de resumen con valores por defecto o "placeholders".
 */
function createDataGridHTML() {
    return `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div class="flex flex-col items-center justify-center">
            <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">timer</span>
            <p class="stat-minutos text-4xl font-bold text-gray-800 dark:text-white">-</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Minutos Totales</p>
        </div>
        <div class="flex flex-col items-center justify-center">
            <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
            <p class="stat-tickets text-4xl font-bold text-gray-800 dark:text-white">-</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets</p>
        </div>
        <div class="flex flex-col items-center justify-center">
            <span class="material-symbols-rounded text-4xl text-purple-500 mb-2">functions</span>
            <p class="stat-promedio text-4xl font-bold text-gray-800 dark:text-white">-</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Promedio Min/Ticket</p>
        </div>
    </div>`;
}

/**
 * Inicializa una DataTable y la guarda en el estado.
 */
function initializeDataTable(tableId, tableData = []) {
    const table = $(`#${tableId}`).DataTable({
        data: tableData,
        columns: [
            { data: 'planta' }, { data: 'folio' }, { data: 'modulo' }, 
            { data: 'supervisor' }, { data: 'mecanico_nombre' },
            { data: 'minutos_netos', render: (data, type, row) => row.tiempo_neto_formateado }
        ],
        responsive: true,
        lengthChange: false,
        language: { "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json" },
        destroy: true
    });
    state.dataTables[tableId] = table;
}

// ================================================================
// SECCIÓN 3: PUNTO DE ENTRADA Y LÓGICA DE INICIALIZACIÓN
// ================================================================

/**
 * Se ejecuta UNA SOLA VEZ en la carga de la página.
 */
function init() {
    state.container = document.getElementById('dashboard-stats-container');
    if (!state.container || state.isInitialized) return;

    console.log("🚀 DashboardStats: Inicializando componente...");
    
    // 1. Dibuja el esqueleto de la UI
    createDashboardShell();

    // 2. Inicializa la primera tabla (estará vacía hasta que lleguen los datos)
    initializeDataTable('table-global');

    // 3. Configura los listeners para los botones de las pestañas
    // Esta parte ahora es más compleja porque las pestañas pueden ser dinámicas.
    // Una implementación completa requeriría re-escribir la lógica de pestañas para que sea actualizable.
    // Por simplicidad, este ejemplo se enfoca en la carga de datos.
    
    // 4. Se marca como inicializado para evitar dobles ejecuciones
    state.isInitialized = true;
    
    // 5. Carga proactiva: lee el mes inicial y pide los datos.
    const monthSelect = document.getElementById('month-select');
    const initialMonth = monthSelect ? monthSelect.value : new Date().getMonth() + 1;
    loadDashboardData(initialMonth);
}

// Suscriptor que escucha el cambio de mes
window.addEventListener('monthChanged', (event) => {
    if (!state.isInitialized) return; // No hacer nada si el componente no está listo
    const newMonth = event.detail.month;
    loadDashboardData(newMonth);
});

// Punto de entrada principal
document.addEventListener('DOMContentLoaded', init);