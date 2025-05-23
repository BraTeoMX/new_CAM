// Variables globales
const heatmapData = [];
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
function processCalendarData(rawData, year, month) {
    // month: 0-based (0=enero)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayMap = {};
    rawData.forEach(row => {
        const dateObj = parseDate(row.created_at);
        if (!dateObj) return;
        if (dateObj.getFullYear() === year && dateObj.getMonth() === month) {
            const day = dateObj.getDate();
            dayMap[day] = (dayMap[day] || 0) + 1;
        }
    });
    return { daysInMonth, dayMap };
}

// Renderizar calendario mensual tipo heatmap con leyenda
function renderCalendarHeatmap(year, month, dayMap) {
    const container = document.createElement('div');
    container.className = 'group py-7 px-9 border border-dotted border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-md relative overflow-hidden lg:col-span-6 flex flex-row gap-8';
    container.innerHTML = `
        <div class="absolute inset-0 z-0 opacity-5"></div>
        <div class="relative z-10 flex flex-row gap-8">
            <div>
                <div class="flex items-center gap-4 mb-4">
                    <div class="text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de tickets</div>
                    <select id="calendar-month" class="ml-4 px-2 py-1 rounded bg-zinc-800 text-white text-sm border border-zinc-700 focus:outline-none"></select>
                    <select id="calendar-year" class="ml-2 px-2 py-1 rounded bg-zinc-800 text-white text-sm border border-zinc-700 focus:outline-none"></select>
                </div>
                <div class="overflow-x-auto">
                    <div id="calendar-grid" class="relative" style="min-width: 270px;"></div>
                </div>
            </div>
            <div class="flex flex-col items-start justify-center ml-6">
                <div class="text-xs text-gray-500 mb-2">Actividad</div>
                <div class="flex items-center gap-2">
                    <span class="inline-block w-6 h-6 rounded bg-gray-100 dark:bg-zinc-800 border"></span>
                    <span class="text-xs text-gray-400">0</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-800 border"></span>
                    <span class="text-xs text-gray-400">1-4</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-200 dark:bg-emerald-600 border"></span>
                    <span class="text-xs text-gray-400">5-9</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-400 dark:bg-emerald-400 border"></span>
                    <span class="text-xs text-gray-400">10-14</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-600 dark:bg-emerald-200 border"></span>
                    <span class="text-xs text-gray-400">15+</span>
                </div>
            </div>
        </div>
    `;

    // Rellenar selects de mes y año
    const monthSelect = container.querySelector('#calendar-month');
    for (let m = 0; m < 12; m++) {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m];
        if (m === month) opt.selected = true;
        monthSelect.appendChild(opt);
    }
    const yearSelect = container.querySelector('#calendar-year');
    const thisYear = new Date().getFullYear();
    for (let y = thisYear - 3; y <= thisYear + 1; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === year) opt.selected = true;
        yearSelect.appendChild(opt);
    }

    // Encabezados de días
    const grid = container.querySelector('#calendar-grid');
    calendarConfig.days.forEach((day, i) => {
        const label = document.createElement('div');
        label.textContent = day;
        label.className = 'text-sm text-center text-gray-500'; // Aumenta el tamaño de fuente
        label.style = `
            position: absolute;
            left: ${(i * (calendarConfig.cellSize + calendarConfig.cellGap))}px;
            top: 0;
            width: ${calendarConfig.cellSize}px;
            height: 28px;
            line-height: 28px;
        `;
        grid.appendChild(label);
    });

    // Primer día del mes (0=domingo, 1=lunes,...)
    const firstDay = new Date(year, month, 1).getDay();
    // Ajustar para que lunes sea 0
    const startDay = (firstDay + 6) % 7;

    // Días del mes
    let row = 0;
    for (let d = 1; d <= dayMap.daysInMonth; d++) {
        const col = (startDay + d - 1) % 7;
        row = Math.floor((startDay + d - 1) / 7);
        const value = dayMap.dayMap[d] || 0;

        // Buscar los módulos y supervisores de ese día
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
        cell.className = `absolute flex flex-col items-center justify-center text-base font-medium ${getCellColor(value)}`;
        cell.style = `
            left: ${(col * (calendarConfig.cellSize + calendarConfig.cellGap))}px;
            top: ${(row * (calendarConfig.cellSize + calendarConfig.cellGap)) + 32}px;
            width: ${calendarConfig.cellSize}px;
            height: ${calendarConfig.cellSize}px;
            border-radius: 8px;
            transition: background 0.2s;
            cursor: pointer;
        `;
        cell.title = tooltip;
        cell.textContent = d;
        if (value > 0) {
            const badge = document.createElement('span');
            badge.textContent = value;
            badge.className = 'block text-[13px] text-emerald-900 dark:text-emerald-100 font-bold';
            cell.appendChild(badge);
        }
        grid.appendChild(cell);
    }
    // Ajustar tamaño del grid
    grid.style.height = `${(row + 1) * (calendarConfig.cellSize + calendarConfig.cellGap) + 40}px`;
    grid.style.width = `${7 * (calendarConfig.cellSize + calendarConfig.cellGap)}px`;

    // Insertar en el DOM
    const target = document.getElementById('dashboard-heatmap');
    if (target) {
        target.innerHTML = '';
        target.appendChild(container);
    }

    // Listeners para cambiar mes/año
    monthSelect.addEventListener('change', () => {
        const newMonth = parseInt(monthSelect.value, 10);
        const newYear = parseInt(yearSelect.value, 10);
        const dayMap = processCalendarData(heatmapData, newYear, newMonth);
        renderCalendarHeatmap(newYear, newMonth, dayMap);
    });
    yearSelect.addEventListener('change', () => {
        const newMonth = parseInt(monthSelect.value, 10);
        const newYear = parseInt(yearSelect.value, 10);
        const dayMap = processCalendarData(heatmapData, newYear, newMonth);
        renderCalendarHeatmap(newYear, newMonth, dayMap);
    });
}

// Obtener datos y renderizar
async function loadHeatmap() {
    try {
        const response = await fetch('/cardsAteOTs');
        const data = await response.json();
        // Guardar la data globalmente para siempre tenerla disponible
        heatmapData.length = 0;
        data.forEach(row => heatmapData.push(row));
        const now = new Date();
        const dayMap = processCalendarData(heatmapData, now.getFullYear(), now.getMonth());
        renderCalendarHeatmap(now.getFullYear(), now.getMonth(), dayMap);
    } catch (e) {
        console.error('Error cargando heatmap:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadHeatmap);
