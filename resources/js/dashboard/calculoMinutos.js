// Archivo: resources/js/dashboard/calculoMinutos.js

// 1. La función principal que se encarga de la lógica de este componente
async function loadCalculoMinutosData(month) {
    console.log(`📊 CalculoMinutos: Cargando datos para el mes ${month}.`);
    
    // Asume que tienes un div principal para este componente
    const mainContainer = document.getElementById('calculo-minutos-container');
    if (!mainContainer) return;

    mainContainer.innerHTML = 'Cargando cálculos...';

    try {
        // Obtén el token CSRF de la etiqueta meta
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        // 2. Llama a la nueva ruta de API
        const response = await fetch(`/dashboardV2/calcularMinutos?month=${month}`, {
            method: 'GET', // Aunque GET es el default, ser explícito ayuda
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken // ¡Esta es la línea clave!
            }
        });
        
        if (!response.ok) {
            // Lanza un error más descriptivo para depurar
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();

        // 3. Pasa los datos ya calculados a tu función de renderizado
        // (Puedes adaptar la función `renderTabs` que ya tienes)
        renderCalculoMinutosTabs(data, mainContainer);

    } catch (error) {
        mainContainer.innerHTML = '<span class="text-red-500">Error al cargar cálculos.</span>';
        console.error('Error en calculoMinutos.js:', error);
    }
}

/**
 * Función que renderiza las pestañas y el contenido con el diseño de Flowbite.
 * @param {object} data - Los datos recibidos de la API.
 * @param {HTMLElement} container - El elemento donde se renderizará todo.
 */
function renderCalculoMinutosTabs(data, container) {
    console.log("Datos recibidos para renderizar:", data);
    container.innerHTML = ''; // Limpia el contenedor

    // Clases base para los botones de las pestañas
    const baseButtonClasses = 'inline-block w-full p-4 focus:outline-none font-medium transition';
    const activeClasses = 'bg-indigo-800 text-white font-bold'; // Clases para la pestaña activa
    const inactiveClasses = 'bg-indigo-600 text-white hover:bg-indigo-700'; // Clases para pestañas inactivas

    // 1. Crear las cabeceras de las pestañas (los botones)
    const tabHeaders = `
        <ul class="text-sm font-medium text-center divide-x divide-gray-200 rounded-lg shadow-lg sm:flex rtl:divide-x-reverse" id="fullWidthTab" role="tablist">
            <li class="w-full">
                <button id="global-tab" data-tabs-target="#global-content" type="button" role="tab"
                        class="tab-btn rounded-ss-lg ${baseButtonClasses} ${activeClasses}">
                    <span class="material-symbols-rounded align-middle text-lg mr-1">dashboard</span>
                    Global
                </button>
            </li>
            ${data.plantas.map((planta, index) => {
                // Lógica para asignar el icono correcto a cada planta
                const icon = planta.planta === 'Ixtlahuaca' ? 'factory' : 'apartment';
                const roundedClass = (index === data.plantas.length - 1) ? 'rounded-se-lg' : ''; // Redondear la última pestaña
                return `
                    <li class="w-full">
                        <button id="planta${index}-tab" data-tabs-target="#planta${index}-content" type="button" role="tab"
                                class="tab-btn ${roundedClass} ${baseButtonClasses} ${inactiveClasses}">
                            <span class="material-symbols-rounded align-middle text-lg mr-1">${icon}</span>
                            ${planta.planta}
                        </button>
                    </li>
                `;
            }).join('')}
        </ul>
    `;

    // 2. Crear los paneles de contenido para cada pestaña
    const tabContents = `
        <div id="fullWidthTabContent" class="border-t-0">
            <div id="global-content" role="tabpanel" class="tab-content p-6">
                ${createDataGrid(data.global)}
            </div>
            ${data.plantas.map((planta, index) => `
                <div id="planta${index}-content" role="tabpanel" class="tab-content hidden p-6">
                    ${createDataGrid(planta)}
                </div>
            `).join('')}
        </div>
    `;

    // 3. Insertar el HTML generado en el contenedor principal
    container.innerHTML = tabHeaders + tabContents;

    // 4. Añadir interactividad
    const tabButtons = container.querySelectorAll('[role="tab"]');
    const tabContentPanels = container.querySelectorAll('[role="tabpanel"]');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todas las pestañas
            tabButtons.forEach(btn => {
                btn.setAttribute('aria-selected', 'false');
                btn.classList.remove(...activeClasses.split(' '));
                btn.classList.add(...inactiveClasses.split(' '));
            });

            // Ocultar todos los paneles
            tabContentPanels.forEach(panel => panel.classList.add('hidden'));

            // Activar la pestaña y panel seleccionados
            button.setAttribute('aria-selected', 'true');
            button.classList.add(...activeClasses.split(' '));
            button.classList.remove(...inactiveClasses.split(' '));
            
            const targetPanelId = button.getAttribute('data-tabs-target');
            document.querySelector(targetPanelId).classList.remove('hidden');
        });
    });

    // Activar el primer tab por defecto (aria-selected)
    if (tabButtons.length > 0) {
        tabButtons[0].setAttribute('aria-selected', 'true');
    }
}

/**
 * 💡 Función auxiliar para no repetir el HTML de las estadísticas.
 * @param {object} stats - Un objeto con {minutos, tickets, promedio_min}.
 * @returns {string} - El HTML de la rejilla de datos.
 */
function createDataGrid(stats) {
    // Este es el mismo helper de la respuesta anterior, se reutiliza.
    return `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div class="flex flex-col items-center justify-center">
                <span class="material-icons-outlined text-4xl text-blue-500 mb-2">timer</span>
                <p class="text-4xl font-bold text-gray-800 dark:text-white">${Math.round(stats.minutos).toLocaleString('es-MX')}</p>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Minutos Totales</p>
            </div>
            <div class="flex flex-col items-center justify-center">
                <span class="material-icons-outlined text-4xl text-green-500 mb-2">confirmation_number</span>
                <p class="text-4xl font-bold text-gray-800 dark:text-white">${stats.tickets.toLocaleString('es-MX')}</p>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets</p>
            </div>
            <div class="flex flex-col items-center justify-center">
                <span class="material-icons-outlined text-4xl text-purple-500 mb-2">functions</span>
                <p class="text-4xl font-bold text-gray-800 dark:text-white">${stats.promedio_min.toFixed(2)}</p>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Promedio Min/Ticket</p>
            </div>
        </div>
    `;
}


// El "suscriptor": escucha el evento 'monthChanged'
window.addEventListener('monthChanged', (event) => {
    const newMonth = event.detail.month;
    loadCalculoMinutosData(newMonth);
});