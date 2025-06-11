/**
 * Módulo para el Calendario Heatmap de Actividad de Tickets.
 * Implementa Lazy Loading para no cargar hasta que el componente sea visible.
 */
const HeatmapModule = (function () {

    // --- ESTADO Y CONSTANTES PRIVADAS DEL MÓDULO ---
    const state = {
        isInitialized: false,
        container: null,
        rawData: [], // Única fuente de verdad para los datos
    };

    const calendarConfig = {
        days: ['Lun', 'Mar', 'Mier', 'Jue', 'Vie', 'Sáb', 'Dom'],
        cellSize: 44,
        cellGap: 8
    };

    // --- FUNCIONES DE UTILIDAD (PRIVADAS) ---

    function getCellColor(value) {
        if (value > 14) return 'bg-emerald-600 dark:bg-emerald-200';
        if (value > 9) return 'bg-emerald-400 dark:bg-emerald-400';
        if (value > 4) return 'bg-emerald-200 dark:bg-emerald-600';
        if (value > 0) return 'bg-emerald-100 dark:bg-emerald-800';
        return 'bg-gray-100 dark:bg-zinc-800';
    }

    function parseDate(dateStr) {
        if (!dateStr) return null;
        let dateObj = null;
        if (dateStr.includes('T')) {
            dateObj = new Date(dateStr);
        } else if (dateStr.includes(' ')) {
            const [datePart] = dateStr.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            if (!year || !month || !day) return null;
            dateObj = new Date(year, month - 1, day);
        }
        if (!dateObj || isNaN(dateObj.getTime())) return null;
        return dateObj;
    }

    function processCalendarData(year, month, day = null) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayMap = {};
        state.rawData.forEach(row => {
            const dateObj = parseDate(row.created_at);
            if (!dateObj) return;
            if (dateObj.getFullYear() === year && dateObj.getMonth() === month) {
                const d = dateObj.getDate();
                if (day === null || d === day) {
                    dayMap[d] = (dayMap[d] || 0) + 1;
                }
            }
        });
        return { daysInMonth, dayMap };
    }

    // --- LÓGICA DE RENDERIZADO (PRIVADA) ---

    function renderCalendarHeatmap(year, month, dayMapData, selectedDay = null) {
        const container = document.createElement('div');
        container.className = "group py-4 px-2 sm:px-4 md:px-6 lg:px-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg relative overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6 w-full";
        container.innerHTML = `
            <div class="flex flex-col w-full">
                <div class="flex items-center gap-4 mb-4">
                    <div class="text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de tickets</div>
                </div>
                <div class="overflow-x-auto w-full">
                    <div id="calendar-grid" class="grid grid-cols-7 gap-2 min-w-[340px] w-max mx-auto"></div>
                </div>
            </div>
            <div class="flex flex-row flex-wrap md:flex-col items-center md:items-start justify-center ml-0 md:ml-4 gap-2 md:gap-1 mt-2 md:mt-12 flex-shrink-0">
                <div class="text-xs text-gray-500 w-full text-center md:text-left mb-1 hidden md:block">Actividad</div>
                <div class="flex items-center gap-2"><span class="inline-block w-5 h-5 rounded bg-gray-100 dark:bg-zinc-800 border"></span><span class="text-xs text-gray-400">0</span></div>
                <div class="flex items-center gap-2"><span class="inline-block w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-800 border"></span><span class="text-xs text-gray-400">1-4</span></div>
                <div class="flex items-center gap-2"><span class="inline-block w-5 h-5 rounded bg-emerald-200 dark:bg-emerald-600 border"></span><span class="text-xs text-gray-400">5-9</span></div>
                <div class="flex items-center gap-2"><span class="inline-block w-5 h-5 rounded bg-emerald-400 dark:bg-emerald-400 border"></span><span class="text-xs text-gray-400">10-14</span></div>
                <div class="flex items-center gap-2"><span class="inline-block w-5 h-5 rounded bg-emerald-600 dark:bg-emerald-200 border"></span><span class="text-xs text-gray-400">15+</span></div>
            </div>`;

        const grid = container.querySelector('#calendar-grid');
        calendarConfig.days.forEach(day => {
            const label = document.createElement('div');
            label.textContent = day;
            label.className = 'text-sm text-center text-gray-500 font-bold';
            grid.appendChild(label);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const startDay = (firstDay === 0) ? 6 : firstDay - 1; // Lunes como primer día

        for (let i = 0; i < startDay; i++) {
            grid.appendChild(document.createElement('div'));
        }

        for (let d = 1; d <= dayMapData.daysInMonth; d++) {
            const value = dayMapData.dayMap[d] || 0;
            const isSelected = d === selectedDay;

            const cell = document.createElement('div');
            cell.className = `flex flex-col items-center justify-center text-base font-medium ${getCellColor(value)} rounded-lg transition cursor-pointer w-[${calendarConfig.cellSize}px] h-[${calendarConfig.cellSize}px] ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}`;
            cell.title = `${d}/${month + 1}/${year}: ${value} tickets`;
            cell.textContent = d;

            if (value > 0) {
                const badge = document.createElement('span');
                badge.textContent = value;
                badge.className = 'block text-xs text-black/60 dark:text-white/70 font-bold';
                cell.appendChild(badge);
            }
            grid.appendChild(cell);
        }

        state.container.innerHTML = '';
        state.container.appendChild(container);
    }

    // --- LÓGICA DE DATOS Y EVENTOS ---

    function getSelectedFilters() {
        const monthSelect = document.getElementById('calendar-month');
        const yearSelect = document.getElementById('calendar-year');
        const daySelect = document.getElementById('calendar-day');

        const month = monthSelect ? parseInt(monthSelect.value, 10) : new Date().getMonth();
        const year = yearSelect ? parseInt(yearSelect.value, 10) : new Date().getFullYear();
        const day = daySelect && daySelect.value ? parseInt(daySelect.value, 10) : null;

        return { month, year, day };
    }

    async function fetchAndRender() {
        // Cargar datos solo si no se han cargado antes
        if (state.rawData.length === 0) {
            try {
                // Asumimos que esta función global existe y devuelve todos los datos necesarios
                state.rawData = await window.getCardsAteOTsData();
            } catch (e) {
                console.error('Heatmap: Error fetching data:', e);
                state.container.innerHTML = '<div class="p-4 text-center text-red-500">Error al cargar datos de actividad.</div>';
                return;
            }
        }

        // Con los datos ya en memoria, procesar y renderizar según los filtros actuales
        const { month, year, day } = getSelectedFilters();
        const dayMapData = processCalendarData(year, month, day);
        renderCalendarHeatmap(year, month, dayMapData, day);
    }

    // --- FUNCIÓN DE INICIALIZACIÓN (LAZY) ---

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        console.log("HeatmapModule: Component is visible, initializing...");
        state.container.innerHTML = `<div class="w-full min-h-[400px] flex items-center justify-center text-gray-400 animate-pulse">Cargando Actividad...</div>`;

        // Configurar los listeners de los selectores de fecha
        const monthSelect = document.getElementById('calendar-month');
        const yearSelect = document.getElementById('calendar-year');
        // El 'calendar:change' puede ser disparado por otros componentes.
        window.addEventListener('calendar:change', fetchAndRender);

        // Carga y renderizado inicial
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

// --- PUNTO DE ENTRADA ÚNICO ---
document.addEventListener('DOMContentLoaded', HeatmapModule.init);
