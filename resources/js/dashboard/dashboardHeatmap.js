/**
 * Módulo para el Calendario Heatmap de Actividad de Tickets.
 */
const HeatmapModule = (function () {

    const state = {
        isInitialized: false,
        container: null,
        // rawData ya no se necesita, los datos se pedirán por mes.
    };
    
    // --- CAMBIO 1: Nueva función para obtener datos del nuevo endpoint ---
    async function fetchDataForMonth(year, month) {
        // El mes en JS es 0-11, pero nuestro selector y API usan 1-12.
        const monthForAPI = month + 1; 
        const url = `/dashboardV2/calendarioTickets?year=${year}&month=${monthForAPI}`;
        console.log(`HeatmapModule 🚀: Pidiendo datos a ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.json(); // Devuelve ej: [{day: 1, total: 5}, ...]
    }
    
    // --- CAMBIO 2: Simplificar el procesamiento de datos ---
    // Ahora solo convierte el array de la API en un mapa de {día: total}.
    function processApiData(apiData) {
        const dayMap = {};
        apiData.forEach(item => {
            dayMap[item.day] = item.total;
        });
        return dayMap;
    }

    function getCellColor(value) {
        // Escala de color consistente: más tickets = número más alto en la escala de Tailwind
        
        // 15+ tickets: El verde más oscuro y saturado
        if (value > 14) return 'bg-emerald-600 dark:bg-emerald-600 text-white dark:text-emerald-100';
        
        // 10-14 tickets
        if (value > 9)  return 'bg-emerald-500 dark:bg-emerald-700 text-white dark:text-emerald-100';
        
        // 5-9 tickets
        if (value > 4)  return 'bg-emerald-300 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200';
        
        // 1-4 tickets: El verde más claro y sutil
        if (value > 0)  return 'bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300';
        
        // 0 tickets: Sin color
        return 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300';
    }

    function renderCalendarHeatmap(year, month, dayMap, daysInMonth) {
        // 1. Crea el contenedor principal del componente
        const componentContainer = document.createElement('div');
        componentContainer.className = "group py-4 px-2 sm:px-4 md:px-6 lg:px-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg relative overflow-hidden flex flex-col w-full";
        
        // Se ha eliminado el div de la leyenda del siguiente bloque de HTML
        componentContainer.innerHTML = `
            <div class="flex flex-col w-full">
                <div class="flex items-center gap-4 mb-4">
                    <div class="text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de Tickets</div>
                </div>
                <div class="overflow-x-auto w-full">
                    <div id="calendar-grid" class="grid grid-cols-7 gap-2 min-w-[340px] w-max mx-auto"></div>
                </div>
            </div>
            `;

        const grid = componentContainer.querySelector('#calendar-grid');
        const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        // Dibuja las etiquetas de los días de la semana
        daysOfWeek.forEach(day => {
            const label = document.createElement('div');
            label.textContent = day;
            label.className = 'text-sm text-center text-gray-500 font-bold';
            grid.appendChild(label);
        });

        // Calcula el día de inicio para alinear el calendario (Lunes=0)
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // Domingo=0, Lunes=1
        const startOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        // Añade celdas vacías al inicio para la alineación
        for (let i = 0; i < startOffset; i++) {
            grid.appendChild(document.createElement('div'));
        }

        // Dibuja una celda para cada día del mes
        for (let d = 1; d <= daysInMonth; d++) {
            const value = dayMap[d] || 0;
            const cell = document.createElement('div');
            
            cell.className = `flex flex-col items-center justify-center text-sm font-medium ${getCellColor(value)} rounded-lg transition-transform hover:scale-110 cursor-pointer w-[44px] h-[44px]`;
            cell.title = `${d}/${month + 1}/${year}: ${value} tickets`; // El tooltip se mantiene
            cell.textContent = d;

            grid.appendChild(cell);
        }

        // Limpia el contenedor principal y dibuja el nuevo calendario
        state.container.innerHTML = '';
        state.container.appendChild(componentContainer);
    }

    // --- CAMBIO 3: Refactorizar la función principal de renderizado ---
    async function fetchAndRender() {
        if (!state.container) return;
        
        state.container.innerHTML = `<div class="w-full min-h-[400px] flex items-center justify-center text-gray-400 animate-pulse">Actualizando Actividad...</div>`;

        try {
            // Obtener mes y año actual de los selectores (si existieran) o usar la fecha actual
            const monthSelect = document.getElementById('month-select'); // Usamos el selector de los otros módulos
            const currentYear = new Date().getFullYear();
            
            // El selector de mes devuelve 1-12, pero en JS se maneja como 0-11
            const currentMonth = monthSelect ? parseInt(monthSelect.value, 10) - 1 : new Date().getMonth();

            // 1. Pedir los datos ya procesados para el mes actual
            const apiData = await fetchDataForMonth(currentYear, currentMonth);

            // 2. Convertir los datos de la API al formato que necesita el renderizador
            const dayMap = processApiData(apiData);
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            // 3. Renderizar el calendario
            renderCalendarHeatmap(currentYear, currentMonth, dayMap, daysInMonth);

        } catch (e) {
            console.error('Heatmap: Error en fetchAndRender:', e);
            state.container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos de actividad.</div>';
        }
    }

    // --- CAMBIO 4: Simplificar la inicialización y usar el listener correcto ---
    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        console.log("HeatmapModule: Component is visible, initializing...");
        
        // Se suscribe al evento 'monthChanged' que disparan los otros componentes
        window.addEventListener('monthChanged', fetchAndRender);

        // Dispara la primera carga. El evento 'monthChanged' de la carga inicial de la página
        // se encargará de las actualizaciones posteriores.
        await fetchAndRender();
    }
    
    // --- FUNCIÓN PÚBLICA DE INICIALIZACIÓN ---
    function init() {
        state.container = document.getElementById('dashboard-heatmap');
        if (!state.container) return;

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeComponent();
                    observerInstance.unobserve(state.container);
                }
            });
        }, { threshold: 0.05 }); // Activa cuando un 5% del componente sea visible

        observer.observe(state.container);
    }

    return {
        init: init
    };
})();

document.addEventListener('DOMContentLoaded', HeatmapModule.init);