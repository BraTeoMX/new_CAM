import { copyTableToClipboard, saveTableAsExcel, saveTableAsPDF } from './excellPDF';

// =================================================================================
// SECCIÓN 1: VARIABLES GLOBALES Y ELEMENTOS DEL DOM
// =================================================================================

let dataArray = []; // Almacenará los datos de la API (del array 'global')
const tableId = 'ordenTrabajoTable';

// --- PAGINACIÓN ---
const ROWS_PER_PAGE = 100;
let currentPage = 1;
let paginatedData = [];

// --- FILTRO Y ORDENAMIENTO ---
// CORREGIDO: Se ajustan los nombres para coincidir con los IDs únicos del HTML
let filterValues = {
    planta: '',
    folio: '',
    modulo: '',
    supervisor: '',
    op: '',
    nombre: '',
    problema: '',
    hora_paro: '',
    hora_termino: '',
    total_min: '',
    minutos_reales: '', // NUEVO
    minutos_bahia: '',  // NUEVO
    id_maquina: '',
    tipo_maquina: '',
    mecanico: '',
    codigo_falla: '',
    causa: '',
    accion: '',
    encuesta: ''
};
let sortColumn = null;
let sortDirection = 'asc';

// --- ELEMENTOS DEL DOM ---
const fechaInicioInput = document.getElementById('fecha_inicio');
const fechaFinInput = document.getElementById('fecha_fin');
const copyBtn = document.getElementById('copy-table-btn');
const saveBtn = document.getElementById('save-table-btn');
const saveModal = document.getElementById('save-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const downloadExcelBtn = document.getElementById('download-excel-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

// =================================================================================
// SECCIÓN 2: LÓGICA DE FECHAS Y PETICIÓN A LA API (fetchData)
// =================================================================================

/**
 * Realiza una petición a la API con un rango de fechas específico.
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {string} endDate - Fecha de fin en formato YYYY-MM-DD
 */
const fetchData = async (startDate, endDate) => {
    try {
        const url = `/reportesMecanicos/obtenerDetallesTickets?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        dataArray = data.global || [];

        currentPage = 1;
        const filtered = getFilteredSortedData();
        displayDataInTable(filtered);
        renderPagination(filtered.length, currentPage);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('No se pudieron cargar los datos. Por favor, revisa la consola para más detalles.');
        dataArray = [];
        displayDataInTable([]);
        renderPagination(0, 1);
    }
};

/**
 * Devuelve las clases de color de Tailwind CSS según el valor de la encuesta.
 * @param {number} valor - El valor numérico de la encuesta (1, 2, 3, 4).
 * @returns {string} Las clases de CSS para el color del texto.
 */
const getColorForEncuesta = (valor) => {
    switch (valor) {
        case 4:
            return 'text-green-700 dark:text-green-400'; // Excelente
        case 3:
            return 'text-blue-700 dark:text-blue-400';   // Bueno
        case 2:
            return 'text-yellow-700 dark:text-yellow-400';// Regular
        case 1:
            return 'text-red-700 dark:text-red-400';     // Malo
        default:
            return 'text-gray-500 dark:text-gray-300'; // No calificado
    }
};

/**
 * Maneja los eventos de cambio en los inputs de fecha y aplica validaciones.
 */
const handleDateChange = () => {
    const startDate = fechaInicioInput.value;
    const endDate = fechaFinInput.value;

    if (!startDate || !endDate) {
        return;
    }

    if (startDate > endDate) {
        alert('Error: La fecha de inicio no puede ser posterior a la fecha de fin.');
        fechaInicioInput.value = endDate;
        return;
    }

    fetchData(startDate, endDate);
};

const getSortValue = (item, col) => {
    switch (col) {
        case 'planta': return item.planta ?? '';
        case 'folio': return item.folio ?? '';
        case 'modulo': return item.modulo ?? '';
        case 'supervisor': return item.supervisor ?? '';
        case 'op': return item.operario_num_empleado ?? '';
        case 'mecanico': return item.mecanico_nombre ?? '';
        case 'total_min': return item.minutos_totales ?? 0; // Se asume este campo para ordenar
        case 'minutos_reales': return item.minutos_netos ?? 0;
        case 'minutos_bahia': return item.minutos_bahia ?? 0; // Se asume este campo para ordenar
        default:
            return (item[col] ?? '').toString();
    }
};

/**
 * Filtra y ordena los datos basándose en los valores de los filtros y la columna de ordenamiento.
 */
const getFilteredSortedData = () => {
    let filtered = dataArray.filter(item => {
        // SOLUCIÓN PUNTO 1: Filtro de Hora Paro y Hora Término (string includes)
        // Esta lógica permite buscar cualquier parte de la hora, ej: "14:", ":30", o "14:30:15"
        const matchesHoraParo = !filterValues.hora_paro || (item.hora_inicio_diagnostico ?? '').includes(filterValues.hora_paro);
        const matchesHoraTermino = !filterValues.hora_termino || (item.hora_final_diagnostico ?? '').includes(filterValues.hora_termino);

        // SOLUCIÓN PUNTO 2: Filtro numérico para minutos
        // Compara el inicio del valor numérico, permitiendo buscar "1" y encontrar "10", "15", etc.
        const matchesTotalMin = !filterValues.total_min ||
            (item.tiempo_total ?? '').toLowerCase().includes(filterValues.total_min.toLowerCase());

        const matchesMinutosReales = !filterValues.minutos_reales ||
            (item.tiempo_neto_formateado ?? '').toLowerCase().includes(filterValues.minutos_reales.toLowerCase());

        const matchesMinutosBahia = !filterValues.minutos_bahia ||
            (item.tiempo_total_bahia_formateado ?? '').toLowerCase().includes(filterValues.minutos_bahia.toLowerCase());

        // SOLUCIÓN PUNTO 3: La lógica de filtro aquí siempre fue correcta. El problema estaba en el display.
        const matchesIdMaquina = !filterValues.id_maquina || (item.numero_maquina ?? '').toLowerCase().includes(filterValues.id_maquina.toLowerCase());
        const matchesTipoMaquina = !filterValues.tipo_maquina || (item.clase_maquina ?? '').toLowerCase().includes(filterValues.tipo_maquina.toLowerCase());

        // Otros filtros existentes
        const matchesPlanta = !filterValues.planta || (item.planta ?? '').toLowerCase().includes(filterValues.planta.toLowerCase());
        const matchesFolio = !filterValues.folio || (item.folio ?? '').toString().toLowerCase().includes(filterValues.folio.toLowerCase());
        const matchesModulo = !filterValues.modulo || (item.modulo ?? '').toLowerCase().includes(filterValues.modulo.toLowerCase());
        const matchesSupervisor = !filterValues.supervisor || (item.supervisor ?? '').toLowerCase().includes(filterValues.supervisor.toLowerCase());
        const matchesOp = !filterValues.op || (item.operario_num_empleado ?? '').toLowerCase().includes(filterValues.op.toLowerCase());
        const matchesNombre = !filterValues.nombre || (item.nombre_operario ?? '').toLowerCase().includes(filterValues.nombre.toLowerCase());
        const matchesProblema = !filterValues.problema || (item.tipo_problema ?? '').toLowerCase().includes(filterValues.problema.toLowerCase());
        const matchesMecanico = !filterValues.mecanico || (item.mecanico_nombre ?? '').toLowerCase().includes(filterValues.mecanico.toLowerCase());
        const matchesCodigoFalla = !filterValues.codigo_falla || (item.falla ?? '').toLowerCase().includes(filterValues.codigo_falla.toLowerCase());
        const matchesCausa = !filterValues.causa || (item.causa ?? '').toLowerCase().includes(filterValues.causa.toLowerCase());
        const matchesAccion = !filterValues.accion || (item.accion ?? '').toLowerCase().includes(filterValues.accion.toLowerCase());
        const matchesEncuesta = !filterValues.encuesta || (item.encuesta ?? '').toLowerCase().includes(filterValues.encuesta.toLowerCase());

        return matchesPlanta && matchesFolio && matchesModulo && matchesSupervisor &&
            matchesOp && matchesNombre && matchesProblema && matchesHoraParo &&
            matchesHoraTermino && matchesTotalMin && matchesMinutosReales && matchesMinutosBahia &&
            matchesIdMaquina && matchesTipoMaquina && matchesMecanico &&
            matchesCodigoFalla && matchesCausa && matchesAccion && matchesEncuesta;
    });

    if (sortColumn) {
        filtered.sort((a, b) => {
            let va = getSortValue(a, sortColumn);
            let vb = getSortValue(b, sortColumn);

            if (typeof va === 'number' && typeof vb === 'number') {
                return sortDirection === 'asc' ? va - vb : vb - va;
            }

            va = (va ?? '').toString().toLowerCase();
            vb = (vb ?? '').toString().toLowerCase();

            if (va < vb) return sortDirection === 'asc' ? -1 : 1;
            if (va > vb) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return filtered;
};

/**
 * Muestra los datos en la tabla.
 */
const displayDataInTable = (data) => {
    paginatedData = data;
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
    const endIdx = startIdx + ROWS_PER_PAGE;
    const pageData = data.slice(startIdx, endIdx);

    pageData.forEach((item) => {
        const row = document.createElement('tr');
        row.className = "bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors";
        const encuestaColorClass = getColorForEncuesta(item.valor_encuesta);

        // SOLUCIÓN PUNTO 3: Se invirtieron las propiedades 'item.numero_maquina' y 'item.clase_maquina'
        // para que coincidan con el orden de los encabezados de la tabla (ID Máquina, luego Tipo Máquina).
        row.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.planta ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.folio ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.modulo ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.supervisor ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.operario_num_empleado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.nombre_operario ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.tipo_problema ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-bold text-purple-700 dark:text-purple-400">${item.hora_inicio_diagnostico ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-green-700 dark:text-green-400">${item.hora_final_diagnostico ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-300">${item.tiempo_total ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-300">${item.tiempo_neto_formateado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-300">${item.tiempo_total_bahia_formateado ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.numero_maquina ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.clase_maquina ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.mecanico_nombre ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-red-700 dark:text-red-400">${item.falla ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-yellow-700 dark:text-yellow-400">${item.causa ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">${item.accion ?? ''}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-bold ${encuestaColorClass}">
                ${item.encuesta ?? ''}
            </td>
        `;
        tbody.appendChild(row);
    });
};


const setPage = (page) => {
    currentPage = page;
    displayDataInTable(paginatedData);
    renderPagination(paginatedData.length, currentPage);
};

const renderPagination = (totalRows, page) => {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = `px-4 py-2 mx-1 rounded-md text-sm font-medium transition-colors ${i === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`;
        button.onclick = () => setPage(i);
        paginationContainer.appendChild(button);
    }
};

// =================================================================================
// SECCIÓN 5: EVENT LISTENERS
// =================================================================================

if (copyBtn) { copyBtn.addEventListener('click', () => copyTableToClipboard(tableId)); }
if (saveBtn) { saveBtn.addEventListener('click', () => { if (saveModal) saveModal.classList.remove('hidden'); }); }
if (closeModalBtn) { closeModalBtn.addEventListener('click', () => { if (saveModal) saveModal.classList.add('hidden'); }); }
if (downloadExcelBtn) { downloadExcelBtn.addEventListener('click', () => { saveTableAsExcel(tableId, 'Reporte_Mecanicos'); if (saveModal) saveModal.classList.add('hidden'); }); }
if (downloadPdfBtn) { downloadPdfBtn.addEventListener('click', () => { saveTableAsPDF(tableId, 'Reporte_Mecanicos'); if (saveModal) saveModal.classList.add('hidden'); }); }

// CORREGIDO: Se añaden los nuevos IDs de los filtros de minutos
const filterIds = [
    'planta', 'folio', 'modulo', 'supervisor', 'op', 'nombre', 'problema',
    'hora_paro', 'hora_termino', 'total_min', 'minutos_reales', 'minutos_bahia',
    'id_maquina', 'tipo_maquina', 'mecanico', 'codigo_falla', 'causa', 'accion', 'encuesta'
];

filterIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', () => {
            filterValues[id] = input.value;
            currentPage = 1;
            const filtered = getFilteredSortedData();
            displayDataInTable(filtered);
            renderPagination(filtered.length, currentPage);
        });
    }
});

// El mapa de encabezados debe coincidir con el orden real de las columnas en el HTML
const headerMap = [
    { id: 'planta', idx: 0 },
    { id: 'folio', idx: 1 },
    { id: 'modulo', idx: 2 },
    { id: 'supervisor', idx: 3 },
    { id: 'op', idx: 4 },
    { id: 'nombre', idx: 5 },
    { id: 'problema', idx: 6 },
    { id: 'hora_paro', idx: 7 },
    { id: 'hora_termino', idx: 8 },
    { id: 'total_min', idx: 9 },
    { id: 'minutos_reales', idx: 10 },
    { id: 'minutos_bahia', idx: 11 },
    { id: 'id_maquina', idx: 12 },
    { id: 'tipo_maquina', idx: 13 },
    { id: 'mecanico', idx: 14 },
    { id: 'codigo_falla', idx: 15 },
    { id: 'causa', idx: 16 },
    { id: 'accion', idx: 17 },
    { id: 'encuesta', idx: 18 }
];


const addSortEvents = () => {
    const table = document.getElementById(tableId);
    if (!table) return;
    const ths = table.querySelectorAll('thead tr:first-child th');
    
    headerMap.forEach((col) => {
        const th = ths[col.idx];
        if (th) {
            th.classList.add('cursor-pointer', 'select-none');
            th.addEventListener('click', () => {
                if (sortColumn === col.id) {
                    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    sortColumn = col.id;
                    sortDirection = 'asc';
                }
                currentPage = 1;
                const filtered = getFilteredSortedData();
                displayDataInTable(filtered);
                renderPagination(filtered.length, currentPage);
            });
        }
    });
};

// =================================================================================
// SECCIÓN 6: FUNCIÓN PRINCIPAL Y EJECUCIÓN INICIAL
// =================================================================================

const main = () => {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInicioInput.value = hoy;
    fechaFinInput.value = hoy;

    fechaInicioInput.max = hoy;
    fechaFinInput.max = hoy;

    fechaInicioInput.addEventListener('change', handleDateChange);
    fechaFinInput.addEventListener('change', handleDateChange);

    fetchData(hoy, hoy);
    addSortEvents();
};

document.addEventListener('DOMContentLoaded', main);