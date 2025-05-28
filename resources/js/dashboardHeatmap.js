// Variables globales
let heatmapData = [];
const calendarConfig = {
    days: ['Lun', 'Mar', 'Mier', 'Juev', 'Vier', 'Sab', 'Dom'],
    cellSize: 44, // Aumenta el tamaño de la celda
    cellGap: 8    // Aumenta el espacio entre celdas
};
const heatmapColumns = [
    'Folio', 'Modulo', 'Mecanico', 'Maquina',
    'Supervisor', 'Problema', 'Status', 'created_at'
];

// Utilidad para obtener color según valor
function getCellColor(value) {
    if (value > 14) return 'bg-emerald-600 dark:bg-emerald-200';
    if (value > 9) return 'bg-emerald-400 dark:bg-emerald-400';
    if (value > 4) return 'bg-emerald-200 dark:bg-emerald-600';
    if (value > 0) return 'bg-emerald-100 dark:bg-emerald-800';
    return 'bg-gray-100 dark:bg-zinc-800';
}

// Utilidad para parsear fecha en formato ISO o con Z
function parseDate(dateStr) {
    if (!dateStr) return null;
    // Soporta formatos: "2025-05-16T19:47:34.000000Z" o "2025-05-16 19:47:34"
    let dateObj = null;
    if (dateStr.includes('T')) {
        // ISO con Z
        dateObj = new Date(dateStr);
    } else if (dateStr.includes(' ')) {
        // "YYYY-MM-DD HH:mm:ss"
        const [datePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        if (!year || !month || !day) return null;
        dateObj = new Date(year, month - 1, day);
    }
    if (!dateObj || isNaN(dateObj.getTime())) return null;
    return dateObj;
}

// Procesar datos para el calendario del mes actual
function processCalendarData(rawData, year, month, day = null) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayMap = {};
    rawData.forEach(row => {
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

// Renderizar calendario mensual tipo heatmap con leyenda
function renderCalendarHeatmap(year, month, dayMap, selectedDay = null) {
    const container = document.createElement('div');
    container.className = `
        group py-2 px-1 sm:py-4 sm:px-2 md:py-6 md:px-4 lg:py-7 lg:px-9
        border border-dotted border-zinc-100 dark:border-zinc-800
        bg-zinc-50 dark:bg-zinc-900 rounded-md relative overflow-hidden
        flex flex-col md:flex-row gap-2 md:gap-6 w-full
        max-w-full
        lg:col-span-6
    `.replace(/\s+/g, ' ');

    container.innerHTML = `
        <div class="relative z-10 flex flex-col md:flex-row gap-2 md:gap-6 w-full">
            <div class="w-full md:w-auto">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                    <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de tickets</div>
                </div>
                <div class="overflow-x-auto w-full">
                    <div id="calendar-grid" class="grid grid-cols-7 gap-2 min-w-[340px] sm:min-w-[420px] md:min-w-[420px] lg:min-w-[420px] w-max mx-auto"></div>
                </div>
            </div>
            <div class="flex flex-row flex-wrap md:flex-col items-center md:items-start justify-center ml-0 md:ml-6 gap-2 md:gap-0 mt-2 md:mt-0">
                <div class="text-xs text-gray-500 mb-2 hidden md:block">Actividad</div>
                <div class="flex items-center gap-1 sm:gap-2">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-gray-100 dark:bg-zinc-800 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">0</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-100 dark:bg-emerald-800 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">1-4</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-200 dark:bg-emerald-600 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">5-9</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-400 dark:bg-emerald-400 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">10-14</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-600 dark:bg-emerald-200 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">15+</span>
                </div>
            </div>
        </div>
    `;

    // Encabezados de días (como grid)
    const grid = container.querySelector('#calendar-grid');
    calendarConfig.days.forEach(day => {
        const label = document.createElement('div');
        label.textContent = day;
        label.className = 'text-xs sm:text-sm text-center text-gray-500 font-bold';
        grid.appendChild(label);
    });

    // Primer día del mes (0=domingo, 1=lunes,...)
    const firstDay = new Date(year, month, 1).getDay();
    const startDay = (firstDay + 6) % 7;

    // Si hay un día seleccionado, solo mostrar ese día
    if (selectedDay !== null) {
        // Calcular en qué columna debe ir el día seleccionado
        const dateObj = new Date(year, month, selectedDay);
        const col = (dateObj.getDay() + 6) % 7;
        // Rellenar celdas vacías antes
        for (let i = 0; i < col; i++) {
            const empty = document.createElement('div');
            empty.className = 'w-full h-[44px] sm:h-[44px]';
            grid.appendChild(empty);
        }
        // Solo ese día
        const value = dayMap.dayMap[selectedDay] || 0;
        let modulos = [];
        let supervisores = [];
        heatmapData.forEach(rowData => {
            const dateObj = parseDate(rowData.created_at);
            if (
                dateObj &&
                dateObj.getFullYear() === year &&
                dateObj.getMonth() === month &&
                dateObj.getDate() === selectedDay
            ) {
                if (rowData.Modulo && !modulos.includes(rowData.Modulo)) modulos.push(rowData.Modulo);
                if (rowData.Supervisor && !supervisores.includes(rowData.Supervisor)) supervisores.push(rowData.Supervisor);
            }
        });

        const tooltip = `${selectedDay}/${month + 1}/${year}: ${value} registros\nMódulos: ${modulos.join(', ') || '-'}\nSupervisores: ${supervisores.join(', ') || '-'}`;

        const cell = document.createElement('div');
        cell.className = `
            flex flex-col items-center justify-center
            text-xs sm:text-base font-medium ${getCellColor(value)}
            rounded-lg transition cursor-pointer
            w-full h-[44px] sm:h-[44px]
            ring-4 ring-emerald-500 ring-offset-2
        `.replace(/\s+/g, ' ');
        cell.title = tooltip;
        cell.textContent = selectedDay;
        if (value > 0) {
            const badge = document.createElement('span');
            badge.textContent = value;
            badge.className = 'block text-[12px] sm:text-[13px] text-emerald-900 dark:text-emerald-100 font-bold';
            cell.appendChild(badge);
        }
        grid.appendChild(cell);
    } else {
        // Rellenar celdas vacías antes del primer día
        for (let i = 0; i < startDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'w-full h-[44px] sm:h-[44px]';
            grid.appendChild(empty);
        }
        // Días del mes
        for (let d = 1; d <= dayMap.daysInMonth; d++) {
            const value = dayMap.dayMap[d] || 0;
            let modulos = [];
            let supervisores = [];
            heatmapData.forEach(rowData => {
                const dateObj = parseDate(rowData.created_at);
                if (
                    dateObj &&
                    dateObj.getFullYear() === year &&
                    dateObj.getMonth() === month &&
                    dateObj.getDate() === d
                ) {
                    if (rowData.Modulo && !modulos.includes(rowData.Modulo)) modulos.push(rowData.Modulo);
                    if (rowData.Supervisor && !supervisores.includes(rowData.Supervisor)) supervisores.push(rowData.Supervisor);
                }
            });

            const tooltip = `${d}/${month + 1}/${year}: ${value} registros\nMódulos: ${modulos.join(', ') || '-'}\nSupervisores: ${supervisores.join(', ') || '-'}`;

            const cell = document.createElement('div');
            cell.className = `
                flex flex-col items-center justify-center
                text-xs sm:text-base font-medium ${getCellColor(value)}
                rounded-lg transition cursor-pointer
                w-full h-[44px] sm:h-[44px]
            `.replace(/\s+/g, ' ');
            cell.title = tooltip;
            cell.textContent = d;
            if (value > 0) {
                const badge = document.createElement('span');
                badge.textContent = value;
                badge.className = 'block text-[12px] sm:text-[13px] text-emerald-900 dark:text-gray-800 font-bold';
                cell.appendChild(badge);
            }
            grid.appendChild(cell);
        }
    }

    // Insertar en el DOM
    const target = document.getElementById('dashboard-heatmap');
    if (target) {
        target.innerHTML = '';
        target.appendChild(container);
    }
}

// NUEVO: Utilidad para obtener mes/año/día seleccionados globalmente
function getSelectedMonthYearDay() {
    const monthSelect = document.getElementById('calendar-month');
    const yearSelect = document.getElementById('calendar-year');
    const daySelect = document.getElementById('calendar-day');
    const month = monthSelect ? parseInt(monthSelect.value, 10) : (new Date()).getMonth();
    const year = yearSelect ? parseInt(yearSelect.value, 10) : (new Date()).getFullYear();
    const day = daySelect && daySelect.value ? parseInt(daySelect.value, 10) : null;
    return { month, year, day };
}

// NUEVO: Escuchar cambios globales de mes/año
window.addEventListener('calendar:change', () => {
    const { month, year, day } = getSelectedMonthYearDay();
    const dayMap = processCalendarData(heatmapData, year, month, day);
    renderCalendarHeatmap(year, month, dayMap, day);
});

// Modificar loadHeatmap para usar la función global
async function loadHeatmap() {
    try {
        heatmapData = await window.getCardsAteOTsData();
        const { month, year, day } = getSelectedMonthYearDay();
        const dayMap = processCalendarData(heatmapData, year, month, day);
        renderCalendarHeatmap(year, month, dayMap, day);
    } catch (e) {
        console.error('Error cargando heatmap:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadHeatmap);

// NUEVO: Inicializar selects globales y emitir evento al cambiar
document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('calendar-month');
    const yearSelect = document.getElementById('calendar-year');
    if (monthSelect && yearSelect) {
        monthSelect.addEventListener('change', () => {
            window.dispatchEvent(new Event('calendar:change'));
        });
        yearSelect.addEventListener('change', () => {
            window.dispatchEvent(new Event('calendar:change'));
        });
    }
});

