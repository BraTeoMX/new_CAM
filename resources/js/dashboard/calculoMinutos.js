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
 * Función que renderiza las pestañas y el contenido dinámicamente.
 * @param {object} data - Los datos recibidos de la API (con .global y .plantas).
 * @param {HTMLElement} container - El elemento donde se renderizará todo.
 */
function renderCalculoMinutosTabs(data, container) {
    console.log("Datos recibidos para renderizar:", data);

    // Limpia el contenedor (quita el "Cargando...")
    container.innerHTML = ''; 

    // 1. Crear las cabeceras de las pestañas (los botones)
    const tabHeaders = `
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" role="tablist">
                <li class="mr-2" role="presentation">
                    <button class="tab-btn inline-block p-4 border-b-2 rounded-t-lg" type="button" role="tab" data-tab-content-id="global-content">
                        <span class="material-icons-outlined mr-2 align-middle" style="font-size: 1.1em;">apps</span>
                        Global
                    </button>
                </li>
                ${data.plantas.map((planta, index) => `
                    <li class="mr-2" role="presentation">
                        <button class="tab-btn inline-block p-4 border-b-2 rounded-t-lg" type="button" role="tab" data-tab-content-id="planta${index}-content">
                            <span class="material-icons-outlined mr-2 align-middle" style="font-size: 1.1em;">factory</span>
                            ${planta.planta}
                        </button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;

    // 2. Crear los paneles de contenido para cada pestaña
    const tabContents = `
        <div id="myTabContent">
            <div class="tab-content hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="global-content" role="tabpanel">
                ${createDataGrid(data.global)}
            </div>
            ${data.plantas.map((planta, index) => `
                <div class="tab-content hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="planta${index}-content" role="tabpanel">
                    ${createDataGrid(planta)}
                </div>
            `).join('')}
        </div>
    `;

    // 3. Insertar el HTML generado en el contenedor principal
    container.innerHTML = tabHeaders + tabContents;

    // 4. Añadir interactividad a las pestañas
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabContentPanels = container.querySelectorAll('.tab-content');

    // Activar la primera pestaña por defecto
    tabButtons[0].classList.add('active', 'text-blue-600', 'dark:text-blue-500', 'border-blue-600', 'dark:border-blue-500');
    tabContentPanels[0].classList.remove('hidden');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todos los botones y ocultar todos los paneles
            tabButtons.forEach(btn => btn.classList.remove('active', 'text-blue-600', 'dark:text-blue-500', 'border-blue-600', 'dark:border-blue-500'));
            tabContentPanels.forEach(panel => panel.classList.add('hidden'));

            // Activar el botón clickeado
            button.classList.add('active', 'text-blue-600', 'dark:text-blue-500', 'border-blue-600', 'dark:border-blue-500');
            
            // Mostrar el panel de contenido correspondiente
            const contentId = button.getAttribute('data-tab-content-id');
            document.getElementById(contentId).classList.remove('hidden');
        });
    });
}

/**
 * 💡 Función auxiliar para no repetir el HTML de las estadísticas.
 * @param {object} stats - Un objeto con {minutos, tickets, promedio_min}.
 * @returns {string} - El HTML de la rejilla de datos.
 */
function createDataGrid(stats) {
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