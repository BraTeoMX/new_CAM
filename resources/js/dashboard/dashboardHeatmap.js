/**
 * Módulo para el Calendario Heatmap de Actividad de Tickets (Optimizado).
 */
const HeatmapModule = (function () {

    const state = {
        isInitialized: false,
        container: null,
        dayCells: [], // Guardaremos aquí las celdas del calendario para un acceso rápido
    };

    // --- LÓGICA DE DATOS (sin cambios) ---
    async function fetchDataForMonth(year, month) {
        const url = `/dashboardV2/calendarioTickets?year=${year}&month=${month}`;
        console.log(`HeatmapModule 🚀: Pidiendo datos a ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        return response.json();
    }

    function processApiData(apiData) {
        const dayMap = {};
        apiData.forEach(item => { dayMap[item.day] = item.total; });
        return dayMap;
    }

    // --- LÓGICA DE RENDERIZADO (Refactorizada) ---

    function getCellColor(value) {
        if (value > 14) return 'bg-emerald-600 dark:bg-emerald-800 text-white dark:text-white';
        if (value > 9) return 'bg-emerald-500 dark:bg-emerald-500 text-white dark:text-white';
        if (value > 4) return 'bg-emerald-300 dark:bg-emerald-300 text-emerald-800 dark:text-emerald-800';
        if (value > 0) return 'bg-emerald-200 dark:bg-emerald-200 text-emerald-700 dark:text-emerald-700';
        return 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300';
    }

    /**
     * CONSTRUYE el esqueleto del calendario UNA SOLA VEZ.
     */
    function createCalendarShell() {
        state.container.innerHTML = `
            <div class="group py-4 px-2 sm:px-4 md:px-6 lg:px-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg relative overflow-hidden flex flex-col w-full">
                <div class="flex flex-col w-full">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de Tickets</div>
                    </div>
                    <div class="overflow-x-auto w-full">
                        <div id="calendar-grid" class="grid grid-cols-7 gap-2 min-w-[340px] w-max mx-auto"></div>
                    </div>
                </div>
            </div>`;

        const grid = state.container.querySelector('#calendar-grid');
        const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        // Dibuja las cabeceras de los días
        daysOfWeek.forEach(day => {
            grid.innerHTML += `<div class="text-sm text-center text-gray-500 font-bold">${day}</div>`;
        });

        // Crea las 42 celdas (6 semanas) que serán reutilizadas
        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('div');
            // La clase 'calendar-cell' nos permite seleccionarlas todas fácilmente después
            cell.className = 'calendar-cell flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all duration-300 w-[44px] h-[44px]';
            grid.appendChild(cell);
        }
        
        // Guarda las celdas en el estado para no tener que buscarlas en el DOM cada vez
        state.dayCells = Array.from(grid.querySelectorAll('.calendar-cell'));
    }

    /**
     * ACTUALIZA el contenido y estilo de las celdas existentes. No reconstruye el DOM.
     */
    function updateCalendarGrid(year, month, dayMap) { // month aquí es 0-11
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        state.dayCells.forEach((cell, index) => {
            const dayNumber = index - startOffset + 1;

            if (dayNumber > 0 && dayNumber <= daysInMonth) {
                // Esta celda corresponde a un día del mes actual
                const value = dayMap[dayNumber] || 0;
                cell.textContent = dayNumber;
                cell.title = `${dayNumber}/${month + 1}/${year}: ${value} tickets`;
                cell.className = `calendar-cell flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all duration-300 w-[44px] h-[44px] hover:scale-110 cursor-pointer ${getCellColor(value)}`;
                cell.style.visibility = 'visible';
            } else {
                // Esta es una celda de relleno, la ocultamos
                cell.textContent = '';
                cell.title = '';
                cell.className = 'calendar-cell flex flex-col items-center justify-center text-sm font-medium rounded-lg transition-all duration-300 w-[44px] h-[44px]';
                cell.style.visibility = 'hidden';
            }
        });
    }

    async function updateHeatmap(year, month) { // month aquí es 1-12
        if (!state.isInitialized) return;
        
        // Muestra un feedback visual sutil en lugar de borrar todo
        state.container.style.opacity = '0.5';

        try {
            const apiData = await fetchDataForMonth(year, month);
            const dayMap = processApiData(apiData);
            
            // Llama a la función que actualiza las celdas, pasando el mes en formato 0-11
            updateCalendarGrid(year, month - 1, dayMap);

        } catch (e) {
            console.error('Heatmap: Error al actualizar:', e);
            // Aquí podrías mostrar un error más elegante
        } finally {
            state.container.style.opacity = '1';
        }
    }

    // --- LÓGICA DE INICIALIZACIÓN ---

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;
        console.log("HeatmapModule: Componente visible, inicializando...");

        // 1. Crea el esqueleto del calendario UNA SOLA VEZ
        createCalendarShell();

        // 2. Suscríbete a futuros cambios de mes
        window.addEventListener('monthChanged', (e) => {
            const newMonth = e.detail.month; // Mes en formato 1-12
            updateHeatmap(new Date().getFullYear(), newMonth);
        });

        // 3. Carga los datos para el mes inicial de forma proactiva
        const monthSelect = document.getElementById('month-select');
        const initialMonth = monthSelect ? monthSelect.value : new Date().getMonth() + 1;
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

    return { init };
})();

document.addEventListener('DOMContentLoaded', HeatmapModule.init);