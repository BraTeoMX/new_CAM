/**
 * Módulo para el Calendario Heatmap de Actividad de Tickets.
 */
const HeatmapModule = (function () {

    const state = {
        isInitialized: false,
        container: null,
    };
    
    // --- LÓGICA DE DATOS Y RENDERIZADO ---
    
    async function fetchDataForMonth(year, month) {
        // La API espera el mes como 1-12
        const url = `/dashboardV2/calendarioTickets?year=${year}&month=${month}`;
        console.log(`HeatmapModule 🚀: Pidiendo datos a ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        return response.json();
    }
    
    function processApiData(apiData) {
        const dayMap = {};
        apiData.forEach(item => {
            dayMap[item.day] = item.total;
        });
        return dayMap;
    }

    function getCellColor(value) {
        if (value > 14) return 'bg-emerald-600 dark:bg-emerald-800 text-white dark:text-white';
        if (value > 9)  return 'bg-emerald-500 dark:bg-emerald-500 text-white dark:text-white';
        if (value > 4)  return 'bg-emerald-300 dark:bg-emerald-300 text-emerald-800 dark:text-emerald-800';
        if (value > 0)  return 'bg-emerald-200 dark:bg-emerald-200 text-emerald-700 dark:text-emerald-700';
        return 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300';
    }

    function renderCalendarHeatmap(year, month, dayMap) {
        // El mes en JS Date es 0-11
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const componentContainer = document.createElement('div');
        componentContainer.className = "group py-4 px-2 sm:px-4 md:px-6 lg:px-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg relative overflow-hidden flex flex-col w-full";
        
        componentContainer.innerHTML = `
            <div class="flex flex-col w-full">
                <div class="flex items-center gap-4 mb-4">
                    <div class="text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de Tickets</div>
                </div>
                <div class="overflow-x-auto w-full">
                    <div id="calendar-grid" class="grid grid-cols-7 gap-2 min-w-[340px] w-max mx-auto"></div>
                </div>
            </div>`;

        const grid = componentContainer.querySelector('#calendar-grid');
        const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        daysOfWeek.forEach(day => {
            const label = document.createElement('div');
            label.textContent = day;
            label.className = 'text-sm text-center text-gray-500 font-bold';
            grid.appendChild(label);
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < startOffset; i++) {
            grid.appendChild(document.createElement('div'));
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const value = dayMap[d] || 0;
            const cell = document.createElement('div');
            cell.className = `flex flex-col items-center justify-center text-sm font-medium ${getCellColor(value)} rounded-lg transition-transform hover:scale-110 cursor-pointer w-[44px] h-[44px]`;
            cell.title = `${d}/${month + 1}/${year}: ${value} tickets`;
            cell.textContent = d;
            grid.appendChild(cell);
        }

        state.container.innerHTML = '';
        state.container.appendChild(componentContainer);
    }

    /**
     * Función principal que orquesta la carga y renderizado para un mes dado.
     */
    async function updateHeatmap(year, month) { // month es 1-12
        if (!state.isInitialized) return;
        
        state.container.innerHTML = `<div class="w-full min-h-[400px] flex items-center justify-center text-gray-400 animate-pulse">Actualizando Actividad...</div>`;

        try {
            // El mes en JS para cálculos de fechas es 0-11
            const monthJS = month - 1;

            const apiData = await fetchDataForMonth(year, month);
            const dayMap = processApiData(apiData);
            
            renderCalendarHeatmap(year, monthJS, dayMap);

        } catch (e) {
            console.error('Heatmap: Error al actualizar:', e);
            state.container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos de actividad.</div>';
        }
    }

    // --- LÓGICA DE INICIALIZACIÓN ---

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;
        console.log("HeatmapModule: Componente visible, inicializando...");
        
        // 1. Nos suscribimos a futuros cambios de mes.
        window.addEventListener('monthChanged', (e) => {
            const newMonth = e.detail.month; // Mes en formato 1-12
            updateHeatmap(new Date().getFullYear(), newMonth);
        });

        // 2. Buscamos el <select> para obtener el valor inicial de forma segura.
        const monthSelect = document.getElementById('month-select');
        let initialMonth;

        if (monthSelect) {
            initialMonth = monthSelect.value;
        } else {
            // Fallback por si el selector no existe al momento de la inicialización.
            initialMonth = new Date().getMonth() + 1; 
        }

        // 3. Realizamos la primera carga de datos con el valor obtenido.
        await updateHeatmap(new Date().getFullYear(), initialMonth);
    }
    
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
        }, { threshold: 0.05 });
        observer.observe(state.container);
    }

    return {
        init: init
    };
})();

document.addEventListener('DOMContentLoaded', HeatmapModule.init);