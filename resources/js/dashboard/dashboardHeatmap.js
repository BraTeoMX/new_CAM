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

    function getCellColor(value) { /* ...esta función no cambia... */ }
    function renderCalendarHeatmap(year, month, dayMap, daysInMonth) { /* ...esta función no cambia en su mayoría, solo cómo se llama... */ }

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