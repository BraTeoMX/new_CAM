// Archivo: resources/js/dashboard/dashboardStats.js

// Objeto para almacenar el estado del componente.
const state = {
    isInitialized: false, // ¿Se ha ejecutado init()?
    tabsAreBuilt: false,  // ¿Se ha construido el HTML de las pestañas?
    container: null,
    dataTables: {}        // Almacenará las instancias de DataTable.
};

// ================================================================
// SECCIÓN 1: LÓGICA DE DATOS Y RENDERIZADO
// ================================================================

/**
 * Orquesta la carga de datos desde las APIs. Es el único punto de entrada
 * para obtener nuevos datos del servidor.
 */
async function loadDashboardData(month) {
    if (!state.isInitialized) return;
    console.log(`📊 DashboardStats: Cargando datos para el mes ${month}.`);

    // Proporciona feedback visual de carga.
    if (!state.tabsAreBuilt) {
        state.container.innerHTML = `<div class="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 min-h-[300px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Cargando estadísticas...</div></div>`;
    } else {
        state.container.classList.add('opacity-50', 'pointer-events-none');
    }

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken
        };

        const [resumenResponse, detallesResponse, autonomosResponse] = await Promise.all([
            fetch(`/dashboardV2/calcularMinutos?month=${month}`, { headers }),
            fetch(`/dashboardV2/obtenerDetallesTickets?month=${month}`, { headers }),
            fetch(`/dashboardV2/obtenerDetallesAutonomosCancelados?month=${month}`, { headers })
        ]);

        if (!resumenResponse.ok || !detallesResponse.ok || !autonomosResponse.ok) {
            throw new Error('Una de las peticiones a la API falló.');
        }

        const resumenData = await resumenResponse.json();
        const detallesData = await detallesResponse.json();
        const autonomosData = await autonomosResponse.json();

        // Añadimos el resumen de autónomos a la lista de resúmenes.
        resumenData.autonomos = autonomosData.resumen;

        // Añadimos los detalles de autónomos a la lista de detalles.
        detallesData.autonomos = autonomosData.details;

        const combinedData = { resumen: resumenData, detalles: detallesData };

        // Lógica principal: si las pestañas no existen, las crea.
        // Después, siempre actualiza la UI con los nuevos datos.
        if (!state.tabsAreBuilt) {
            createDynamicShell(combinedData);
            state.tabsAreBuilt = true;
        }

        updateUI(combinedData);

    } catch (error) {
        state.container.innerHTML = '<div class="text-red-500 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">Error al cargar las estadísticas. Por favor, intente de nuevo.</div>';
        console.error('Error en dashboardStats.js:', error);
    } finally {
        state.container.classList.remove('opacity-50', 'pointer-events-none');
    }
}

/**
 * TOMA los nuevos datos y ACTUALIZA los elementos del DOM existentes.
 * No reconstruye el HTML, solo cambia el contenido de texto y los datos de las tablas.
 */
function updateUI(data) {
    console.log("🔄 Actualizando UI con nuevos datos.");

    // 1. Crear la lista de pestañas a partir de los datos recibidos.
    const tabsConfig = [
        { id: 'global', dataKey: 'global' },
        ...data.resumen.plantas.map((p, i) => ({ id: `planta_${i + 1}`, dataKey: `plantas[${i}]` })),
        { id: 'autonomos', dataKey: 'autonomos' }
    ];

    // 2. Actualizar las tarjetas de resumen para cada pestaña.
    tabsConfig.forEach(tab => {
        // Obtenemos los datos de resumen de la ruta correcta
        let stats;
        if (tab.dataKey.includes('plantas')) {
            const index = parseInt(tab.dataKey.match(/\[(\d+)\]/)[1]);
            stats = data.resumen.plantas[index];
        } else {
            stats = data.resumen[tab.dataKey];
        }

        const contentContainer = document.getElementById(`tab-content-${tab.id}`);
        if (contentContainer && stats) {
            contentContainer.querySelector('.stat-minutos').textContent = Math.round(stats.minutos).toLocaleString('es-MX');
            contentContainer.querySelector('.stat-tickets').textContent = stats.tickets.toLocaleString('es-MX');
            contentContainer.querySelector('.stat-promedio').textContent = stats.promedio_min.toFixed(2);
        }
    });

    // 3. Actualizar todas las DataTables con los nuevos datos.
    Object.keys(state.dataTables).forEach(tableId => {
        const dataKey = tableId.replace('table-', ''); // 'global', 'planta_1', 'autonomos'
        const newData = data.detalles[dataKey] || [];
        const table = state.dataTables[tableId];

        table.clear();
        table.rows.add(newData);
        table.draw();
    });
}

// ================================================================
// SECCIÓN 2: CONSTRUCCIÓN INICIAL DE LA UI (EL "ESQUELETO")
// ================================================================

/**
 * CONSTRUYE el HTML dinámico del componente UNA SOLA VEZ, usando los datos
 * de la primera carga.
 */
function createDynamicShell(data) {
    console.log("🏗️ Construyendo el esqueleto dinámico de la UI por primera vez.");
    state.container.innerHTML = ''; // Limpiar el "Cargando..."

    // Configuración de pestañas basada en los datos reales.
    const tabsConfig = [
        { id: 'global', name: 'Global', icon: 'public' },
        ...data.resumen.plantas.map((p, i) => ({
            id: `planta_${i + 1}`,
            name: p.planta,
            icon: p.planta === 'Ixtlahuaca' ? 'factory' : 'apartment'
        }))
    ];

    if (data.resumen.autonomos) {
        tabsConfig.push({
            id: 'autonomos',
            name: 'Autónomos',
            icon: 'task_alt' // Un ícono representativo
        });
    }

    const baseButtonClasses = 'inline-block w-full p-4 focus:outline-none font-medium transition';
    const activeClasses = 'bg-indigo-800 text-white font-bold';
    const inactiveClasses = 'bg-indigo-600 text-white hover:bg-indigo-700';

    // 1. Crear las cabeceras de las pestañas (botones)
    const tabHeaders = `
        <ul class="text-sm font-medium text-center divide-x divide-gray-200 rounded-lg shadow-lg sm:flex">
            ${tabsConfig.map((tab, index) => `
                <li class="w-full">
                    <button id="tab-btn-${tab.id}" data-tab-content-id="tab-content-${tab.id}"
                            class="tab-btn ${baseButtonClasses} ${index === 0 ? activeClasses : inactiveClasses} rounded-t-lg sm:rounded-none ${index === 0 ? 'sm:rounded-l-lg' : ''} ${index === tabsConfig.length - 1 ? 'sm:rounded-r-lg' : ''}">
                        <span class="material-symbols-rounded align-middle text-lg mr-1">${tab.icon}</span>
                        ${tab.name}
                    </button>
                </li>
            `).join('')}
        </ul>
    `;

    // 2. Crear los paneles de contenido para cada pestaña
    const tabContents = `
        <div class="mt-1">
            ${tabsConfig.map((tab, index) => `
                <div id="tab-content-${tab.id}" class="tab-content bg-white dark:bg-gray-800 p-6 rounded-b-lg shadow-lg ${index > 0 ? 'hidden' : ''}">
                    ${createDataGridHTML()}
                    <hr class="my-6 border-gray-200 dark:border-gray-700">
                    <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Detalle de Tickets</h3>
                    
                    ${tab.id === 'autonomos' ? `
                        <table id="table-${tab.id}" class="display responsive" style="width:100%">
                            <thead>
                                <tr>
                                    <th>Planta</th><th>Folio</th><th>Estado</th><th>Supervisor</th><th>Tiempo Estimado</th><th>Tiempo de Uso</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    ` : `
                        <table id="table-${tab.id}" class="display responsive" style="width:100%">
                            <thead>
                                <tr>
                                    <th>Planta</th><th>Folio</th><th>Módulo</th><th>Supervisor</th><th>Mecánico</th><th>Tiempo Bruto</th><th>Tiempo Neto</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    `}
                </div>
            `).join('')}
        </div>
    `;

    state.container.innerHTML = tabHeaders + tabContents;

    // 3. Inicializar TODAS las DataTables (estarán vacías hasta que updateUI las llene)
    tabsConfig.forEach(tab => {
        if (tab.id === 'autonomos') {
            // Usamos una función de inicialización específica para esta tabla
            initializeAutonomosDataTable(`table-${tab.id}`);
        } else {
            // Reutilizamos la función original para las otras tablas
            initializeDataTable(`table-${tab.id}`);
        }
    });

    // 4. Configurar los listeners para los botones de las pestañas UNA SOLA VEZ
    state.container.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Oculta/muestra los paneles de contenido
            state.container.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(button.dataset.tabContentId).classList.remove('hidden');

            // Actualiza los estilos de los botones
            state.container.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove(...activeClasses.split(' '));
                btn.classList.add(...inactiveClasses.split(' '));
            });
            button.classList.add(...activeClasses.split(' '));
            button.classList.remove(...inactiveClasses.split(' '));
        });
    });
}

/**
 * Crea el HTML para las tarjetas de resumen con valores "placeholder".
 * La función updateUI se encargará de llenarlos después.
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
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets Concluidos</p>
        </div>
        <div class="flex flex-col items-center justify-center">
            <span class="material-symbols-rounded text-4xl text-purple-500 mb-2">functions</span>
            <p class="stat-promedio text-4xl font-bold text-gray-800 dark:text-white">-</p>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Promedio Min/Ticket</p>
        </div>
    </div>`;
}

function renderTimeForSorting(data, type, row) {
    if (type === 'sort') {
        if (!data) return 0; // Seguridad por si el dato es nulo o vacío
        const match = data.match(/(\d+)\s*min\s*(\d+)\s*seg/);
        if (match) {
            const minutos = parseInt(match[1], 10);
            const segundos = parseInt(match[2], 10);
            return (minutos * 60) + segundos;
        }
        return 0; // Si el formato no coincide, no se puede ordenar
    }
    // Para 'display' y otros, simplemente muestra el texto original.
    return data;
}

/**
 * Inicializa una DataTable y la guarda en el estado para futuras actualizaciones.
 */
function initializeDataTable(tableId) {
    const table = new DataTable(`#${tableId}`, {
        data: [],
        columns: [
            { data: 'planta' },
            { data: 'folio' },
            { data: 'modulo' },
            { data: 'supervisor' },
            { data: 'mecanico_nombre' },
            {
                data: 'tiempo_bruto_formateado',
                title: 'Tiempo Bruto',
                render: renderTimeForSorting // Usamos nuestro nuevo helper
            },
            {
                data: 'tiempo_neto_formateado',
                title: 'Tiempo Neto',
                render: renderTimeForSorting // Reutilizamos el helper aquí también
            }
        ],

        // --- INICIO DE LA NUEVA INSTRUCCIÓN ---
        // Aquí le decimos a DataTables cómo tratar específicamente a nuestras columnas.
        columnDefs: [
            {
                // `targets: 5` se refiere a la sexta columna (el índice empieza en 0).
                targets: 5,
                // `type: 'num'` FUERZA a DataTables a usar el ordenamiento numérico
                // para esta columna, activando así nuestra lógica en `render`.
                type: 'num'
            }
        ],
        // --- FIN DE LA NUEVA INSTRUCCIÓN ---

        responsive: true,
        lengthChange: false,
        pageLength: 10,
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
    state.dataTables[tableId] = table;
    console.log(`✅ DataTable inicializada para: #${tableId}`);
}

// Coloca esta función junto a initializeDataTable
function initializeAutonomosDataTable(tableId) {
    const table = new DataTable(`#${tableId}`, {
        data: [],
        columns: [
            { data: 'planta' },
            { data: 'folio' },
            { data: 'estado' },
            { data: 'supervisor' },
            { data: 'tiempo_estimado', render: renderTimeForSorting },
            { data: 'tiempo_de_uso', render: renderTimeForSorting }
        ],
        columnDefs: [{ targets: [4, 5], type: 'num' }],
        responsive: true,
        lengthChange: false,
        pageLength: 10,
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
    state.dataTables[tableId] = table;
    console.log(`✅ DataTable de Autónomos inicializada para: #${tableId}`);
}

// ================================================================
// SECCIÓN 3: PUNTO DE ENTRADA Y EVENT LISTENERS
// ================================================================

/**
 * Función principal que se ejecuta UNA SOLA VEZ en la carga de la página.
 * Prepara el componente para la primera carga de datos.
 */
function init() {
    state.container = document.getElementById('dashboard-stats-container');
    if (!state.container || state.isInitialized) {
        return;
    }
    console.log("🚀 DashboardStats: Inicializando componente...");
    state.isInitialized = true;

    // Carga proactiva: lee el mes del selector y pide los datos por primera vez.
    const monthSelect = document.getElementById('month-select');
    // Si el selector no existe o no tiene valor, usa el mes actual como fallback.
    const initialMonth = monthSelect ? monthSelect.value : new Date().getMonth() + 1;
    loadDashboardData(initialMonth);
}

// Suscriptor que escucha el evento global 'monthChanged'.
window.addEventListener('monthChanged', (event) => {
    if (!state.isInitialized) return;
    const newMonth = event.detail.month;
    loadDashboardData(newMonth);
});

// Punto de entrada principal del script.
document.addEventListener('DOMContentLoaded', init);